import { PremiumApplicationsClient } from "@/components/admin/PremiumApplicationsClient";

export const metadata = {
  title: "프리미엄 회원 신청 관리 — K-Stock Helper Admin",
};

export default function PremiumApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">
        프리미엄 회원 신청 관리
      </h1>
      <PremiumApplicationsClient />
    </div>
  );
}
