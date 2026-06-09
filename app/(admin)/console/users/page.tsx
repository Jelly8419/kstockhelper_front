import { UserListClient } from "@/components/admin/UserListClient";

export const metadata = { title: "회원관리 — K-Stock Helper Admin" };

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">회원관리</h1>
      <UserListClient />
    </div>
  );
}
