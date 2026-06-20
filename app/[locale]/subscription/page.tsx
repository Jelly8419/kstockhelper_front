import { SubscriptionClient } from "@/components/subscription/SubscriptionClient";

export const metadata = { title: "Premium Subscription - K-Stock Helper" };

export default function SubscriptionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <SubscriptionClient />
    </div>
  );
}
