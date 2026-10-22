import { createAdminClient } from "@/lib/supabase/admin-server";
import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import {
  Users,
  BarChart2,
  FileText,
  Bell,
} from "lucide-react";

async function getDashboardStats() {
  const db = createAdminClient();

  const [investorsRes, schemesRes, documentsRes, updatesRes] =
    await Promise.all([
      db.from("investors").select("id", { count: "exact", head: true }),
      db.from("schemes").select("id", { count: "exact", head: true }),
      db
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      db
        .from("updates")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  return {
    investors: investorsRes.count ?? 0,
    schemes: schemesRes.count ?? 0,
    documents: documentsRes.count ?? 0,
    updates: updatesRes.count ?? 0,
  };
}

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  sub?: string;
};

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center shrink-0 text-[#8B1A1A]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const stats = await getDashboardStats();

  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {admin.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{now}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total investors"
          value={stats.investors}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Schemes"
          value={stats.schemes}
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatCard
          label="Published documents"
          value={stats.documents}
          icon={<FileText className="w-5 h-5" />}
          sub="Visible to LPs"
        />
        <StatCard
          label="Published updates"
          value={stats.updates}
          icon={<Bell className="w-5 h-5" />}
          sub="Visible to LPs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            Recent investor activity
          </h2>
          <p className="text-xs text-gray-400">
            Available after Step 2 (investor management).
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            Pending LP questions
          </h2>
          <p className="text-xs text-gray-400">
            Available after Step 7 (questions module).
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            Draft documents
          </h2>
          <p className="text-xs text-gray-400">
            Available after Step 4 (document management).
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            Recent audit events
          </h2>
          <p className="text-xs text-gray-400">
            Available after Step 9 (audit log viewer).
          </p>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
