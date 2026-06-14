import { FeatureFlagsClient } from "@/components/admin/FeatureFlagsClient";

export const metadata = {
  title: "Feature Flags 관리 — K-Stock Helper Admin",
};

export default function FeatureFlagsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Feature Flags 관리</h1>
      <FeatureFlagsClient />
    </div>
  );
}
