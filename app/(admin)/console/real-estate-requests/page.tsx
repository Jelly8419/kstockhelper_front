import { RealEstateRequestsClient } from "@/components/admin/RealEstateRequestsClient";

export const metadata = {
  title: "부동산 구매 요청 관리 — K-Stock Helper Admin",
};

export default function RealEstateRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">
        부동산 구매 요청 관리
      </h1>
      <RealEstateRequestsClient />
    </div>
  );
}
