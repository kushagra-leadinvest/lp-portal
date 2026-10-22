import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── /admin/* routes ──────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/mfa")) {
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasTotp = factors?.totp && factors.totp.length > 0;
      return NextResponse.redirect(
        new URL(hasTotp ? "/admin/mfa" : "/admin/mfa/enroll", request.url)
      );
    }

    // Use service role to bypass RLS for the admin_users check
    const adminDb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: adminUser } = await adminDb
      .from("admin_users")
      .select("is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  // ── /dashboard/* routes ──────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: investor } = await supabase
      .from("investors")
      .select("is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (investor && investor.is_active === false) {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
