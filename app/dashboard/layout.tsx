"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AS_OF_DATE, LP_NAME } from "@/lib/dummy-data";

const NAV = [
  {
    label: "Portfolio",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    label: "Cash Flows",
    href: "/dashboard/cash-flows",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Updates",
    href: "/dashboard/updates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Capital Account",
    href: "/dashboard/capital-account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

const BOTTOM_NAV = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    disabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Support",
    href: "/dashboard/support",
    disabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/portfolio");
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 print:hidden">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900 tracking-tight">Lead Invest</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Investor Portal</p>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-[#8B1A1A]/8 text-[#8B1A1A] font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className={isActive(item.href) ? "text-[#8B1A1A]" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-gray-100" />

          {/* Bottom nav items */}
          {BOTTOM_NAV.map((item) =>
            item.disabled ? (
              <span
                key={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none"
                title="Coming soon"
              >
                <span className="text-gray-300">{item.icon}</span>
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-[#8B1A1A]/8 text-[#8B1A1A] font-medium"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className={isActive(item.href) ? "text-[#8B1A1A]" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-100 print:hidden">
          <p className="text-xs text-gray-400">Data as of <span className="font-medium text-gray-600">{AS_OF_DATE}</span></p>

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <button className="relative p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#8B1A1A] text-white text-[8px] font-bold rounded-full flex items-center justify-center">1</span>
            </button>

            {/* Profile chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-[10px] font-semibold flex items-center justify-center">
                {LP_NAME.charAt(0)}
              </div>
              <span className="text-xs text-gray-600 font-medium hidden sm:block">{LP_NAME.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
