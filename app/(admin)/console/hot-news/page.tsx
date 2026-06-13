import { HotNewsClient } from "@/components/admin/HotNewsClient";

export const metadata = {
  title: "Korean's Hot News 관리 — K-Stock Helper Admin",
};

export default function HotNewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">
        Korean&apos;s Hot News 관리
      </h1>
      <HotNewsClient />
    </div>
  );
}
