import { HotNewsCreateForm } from "@/components/admin/HotNewsCreateForm";

export const metadata = {
  title: "Korean's Hot News 등록 — K-Stock Helper Admin",
};

export default function HotNewsCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">
        Korean&apos;s Hot News 등록
      </h1>
      <HotNewsCreateForm />
    </div>
  );
}
