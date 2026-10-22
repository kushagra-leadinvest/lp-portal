import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        role={admin.role}
        fullName={admin.full_name}
        email={admin.email}
      />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
