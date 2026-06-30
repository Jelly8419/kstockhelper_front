import Link from "next/link";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { RealEstateRequestDetailClient } from "@/components/admin/RealEstateRequestDetailClient";

export const metadata = {
  title: "부동산 구매 요청 상세 — K-Stock Helper Admin",
};

export default function RealEstateRequestDetailPage({
  params,
}: {
  params: { requestId: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`${ADMIN_BASE_PATH}/real-estate-requests`}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← 부동산 구매 요청 목록
        </Link>
        <h1 className="text-xl font-semibold text-foreground">
          부동산 구매 요청 상세
        </h1>
      </div>
      <RealEstateRequestDetailClient requestId={params.requestId} />
    </div>
  );
}
