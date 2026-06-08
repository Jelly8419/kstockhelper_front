import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsentForm } from "@/components/auth/ConsentForm";

export const metadata = { title: "Agree to Terms" };

/** Only allow same-origin relative paths to prevent open-redirect. */
function sanitizeNext(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = sanitizeNext(searchParams.next);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → nothing to consent to.
  if (!user) {
    redirect("/login");
  }

  // Already consented (e.g. a returning user landing here directly) → skip the
  // gate and send them on to their destination.
  const { data: profile } = await supabase
    .from("users")
    .select("terms_agreed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.terms_agreed_at) {
    redirect(next);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">One last step</h1>
      <ConsentForm />
    </div>
  );
}
