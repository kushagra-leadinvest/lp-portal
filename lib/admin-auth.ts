import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-server";

export type AdminRole = "super_admin" | "editor" | "viewer";

export type AdminUser = {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    // Check AAL2 (MFA verified)
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") return null;

    // Check admin_users table (uses anon key + RLS self-read policy)
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;

    return data as AdminUser;
  } catch {
    return null;
  }
}

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    const db = createAdminClient();
    await db.from("admin_audit_log").insert({
      admin_user_id: adminUserId,
      action,
      target_table: targetTable ?? null,
      target_id: targetId ?? null,
      details: details ?? null,
    });
  } catch {
    // Audit log failure should never break the main action
  }
}
