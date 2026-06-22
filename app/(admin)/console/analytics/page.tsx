import { AnalyticsClient } from "@/components/admin/AnalyticsClient";
import { RawEventsClient } from "@/components/admin/RawEventsClient";

export const metadata = { title: "이벤트 통계 — K-Stock Helper Admin" };

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">이벤트 통계</h1>
        <AnalyticsClient />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">원본 로그</h2>
          <p className="text-sm text-muted">
            영역별 이벤트 원본을 조회하고 CSV로 내려받습니다.
          </p>
        </div>
        <RawEventsClient />
      </section>
    </div>
  );
}
