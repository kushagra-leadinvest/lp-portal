"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const NAV = [
  { label: "Portfolio", href: "/dashboard" },
  { label: "Cash Flows", href: "/dashboard/cash-flows" },
  { label: "Documents", href: "/dashboard/documents" },
  { label: "Updates", href: "/dashboard/updates" },
  { label: "Capital Account", href: "/dashboard/capital-account" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [lpName, setLpName] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("investors")
      .select("name")
      .single()
      .then(({ data }) => {
        if (data?.name) setLpName(data.name);
      });
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = lpName
    ? lpName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "–";

  const firstName = lpName.split(" ")[0] || "";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Image src="/logo.png" alt="Lead Invest" width={110} height={36} priority />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-[#8B1A1A] text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <span className="flex items-center px-3 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed">
            Profile
          </span>
          <Link
            href="/dashboard/support"
            className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Support
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <span className="text-sm text-gray-500">
            Lead Invest LP Portal
          </span>
          <div className="flex items-center gap-3">
            {firstName && (
              <span className="text-sm text-gray-600">
                Hello, {firstName}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
