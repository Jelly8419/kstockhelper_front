import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
      <h1 className="mb-1 text-xl font-semibold text-foreground">관리자 로그인</h1>
      <p className="mb-6 text-sm text-muted">
        K-Stock Helper 관리자 페이지입니다.
      </p>
      <AdminLoginForm />
    </div>
  );
}
