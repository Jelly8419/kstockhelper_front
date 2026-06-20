import { SubscriptionSuccessClient } from "@/components/subscription/SubscriptionSuccessClient";

export const metadata = { title: "Subscription - K-Stock Helper" };

export default function SubscriptionSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <SubscriptionSuccessClient />
    </div>
  );
}
