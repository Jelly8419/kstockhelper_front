import Link from "next/link";
import { UserDetailClient } from "@/components/admin/UserDetailClient";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";

export const metadata = { title: "회원 상세 — K-Stock Helper Admin" };

export default function AdminUserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`${ADMIN_BASE_PATH}/users`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← 회원관리
      </Link>
      <UserDetailClient userId={params.userId} />
    </div>
  );
}
