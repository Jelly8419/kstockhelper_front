import { AnalyticsClient } from "@/components/admin/AnalyticsClient";

export const metadata = { title: "이벤트 통계 — K-Stock Helper Admin" };

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">이벤트 통계</h1>
      <AnalyticsClient />
    </div>
  );
}
