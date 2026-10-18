import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0F1F3D] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C9A84C]">
                <span className="text-xs font-bold text-[#0F1F3D]">LI</span>
              </div>
              <span className="text-white font-semibold text-sm">
                Lead Invest
              </span>
              <span className="text-blue-300 text-xs hidden sm:block">
                | Investor Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-200 text-xs hidden sm:block truncate max-w-[200px]">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-400 text-center">
            Lead Invest — SEBI Registered AIF Category I &nbsp;|&nbsp;
            Confidential. For registered LPs only.
          </p>
        </div>
      </footer>
    </div>
  );
}
