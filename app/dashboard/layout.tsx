"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AS_OF_DATE } from "@/lib/constants";

// ─── Nav definition ───────────────────────────────────────────────────────────

type NavItem =
  | { divider: true }
  | {
      divider?: false;
      label: string;
      href: string;
      disabled?: boolean;
      icon: React.ReactNode;
    };

const NAV: NavItem[] = [
  {
    label: "Portfolio",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    label: "Cash Flows",
    href: "/dashboard/cash-flows",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: "Capital Account",
    href: "/dashboard/capital-account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  { divider: true },
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
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lpName, setLpName] = useState<string>("");
  const [upcomingCallsCount, setUpcomingCallsCount] = useState<number>(0);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch LP name + upcoming capital calls count on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Fetch LP name
      supabase
        .from("investors")
        .select("full_name")
        .eq("auth_user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setLpName(data.full_name);
        });

      // Fetch investor_id, then count upcoming capital calls
      supabase
        .from("investors")
        .select("id")
        .eq("auth_user_id", user.id)
        .single()
        .then(({ data: inv }) => {
          if (!inv?.id) return;
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          supabase
            .from("capital_calls")
            .select("id", { count: "exact", head: true })
            .eq("investor_id", inv.id)
            .gte("due_date", today)
            .neq("status", "paid")
            .then(({ count }) => {
              if (count && count > 0) setUpcomingCallsCount(count);
            });
        });
    });
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close sidebar when route changes (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (item: NavItem) => {
    if ("divider" in item && item.divider) return false;
    const nav = item as { href: string };
    if (nav.href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/portfolio");
    }
    return pathname.startsWith(nav.href);
  };

  // ─── Sidebar content (shared between desktop + mobile) ──────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <img src="/logo.png" alt="Lead Invest" className="h-9 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map((item, i) => {
          if ("divider" in item && item.divider) {
            return <div key={`div-${i}`} className="my-2 border-t border-gray-100" />;
          }
          const nav = item as Exclude<NavItem, { divider: true }>;
          const active = isActive(item);
          return (
            <Link
              key={nav.href}
              href={nav.disabled ? "#" : nav.href}
              onClick={(e) => {
                if (nav.disabled) e.preventDefault();
                setSidebarOpen(false); // close on mobile
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                active
                  ? "bg-[#8B1A1A] text-white font-medium shadow-sm"
                  : nav.disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={
                  active ? "text-white/80" : nav.disabled ? "text-gray-200" : "text-gray-400"
                }
              >
                {nav.icon}
              </span>
              {nav.label}
              {nav.disabled && (
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-[#8B1A1A] hover:bg-red-50 rounded-lg transition-all group"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-gray-400 group-hover:text-[#8B1A1A] transition-colors"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Mobile backdrop ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop (always visible) + mobile (slide-in) ── */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0
          print:hidden
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Right panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (hidden on print) */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 print:hidden">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* As-of date */}
          <span className="text-xs text-gray-400 mr-auto hidden sm:block">
            Data as of{" "}
            <span className="font-medium text-gray-600">{AS_OF_DATE}</span>
          </span>

          {/* Notifications */}
          <button className="relative p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Badge: only shown when there are upcoming calls */}
            {upcomingCallsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#8B1A1A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {upcomingCallsCount > 9 ? "9+" : upcomingCallsCount}
              </span>
            )}
          </button>

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                {lpName ? lpName.charAt(0) : "?"}
              </div>
              <span className="text-xs font-medium text-gray-700 hidden sm:block">
                {lpName ? lpName.split(" ")[0] : "…"}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-800">{lpName || "Loading…"}</p>
                  <p className="text-[11px] text-gray-400">Investor</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-[#8B1A1A] transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
