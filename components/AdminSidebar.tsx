"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Bell,
  BarChart2,
  HelpCircle,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AdminRole = "super_admin" | "editor" | "viewer";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: AdminRole[];
};

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Investors",
    href: "/admin/investors",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Schemes",
    href: "/admin/schemes",
    icon: <BarChart2 className="w-4 h-4" />,
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    label: "Updates",
    href: "/admin/updates",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    label: "Questions",
    href: "/admin/questions",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    label: "Nav Marks",
    href: "/admin/nav-marks",
    icon: <BarChart2 className="w-4 h-4" />,
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: <Shield className="w-4 h-4" />,
    roles: ["super_admin"],
  },
  {
    label: "Admin Users",
    href: "/admin/admin-users",
    icon: <Users className="w-4 h-4" />,
    roles: ["super_admin"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="w-4 h-4" />,
    roles: ["super_admin"],
  },
];

type Props = {
  role: AdminRole;
  fullName: string;
  email: string;
};

export default function AdminSidebar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const visibleNav = NAV.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const roleBadgeColor: Record<AdminRole, string> = {
    super_admin: "bg-[#8B1A1A]/10 text-[#8B1A1A]",
    editor: "bg-blue-50 text-blue-700",
    viewer: "bg-gray-100 text-gray-600",
  };

  const roleLabel: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    editor: "Editor",
    viewer: "Viewer",
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 min-h-screen bg-gray-950 border-r border-gray-800 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-white font-semibold text-sm">Lead Invest</p>
        <p className="text-[10px] tracking-widest text-[#c0392b] uppercase font-bold mt-0.5">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-[#8B1A1A] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{fullName}</p>
            <p className="text-gray-500 text-[11px] truncate">{email}</p>
          </div>
        </div>
        <span
          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 ${roleBadgeColor[role]}`}
        >
          {roleLabel[role]}
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs transition w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
