import { createClient } from "@/lib/supabase/server";
import { ConsentForm } from "@/components/auth/ConsentForm";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { redirect } from "@/lib/i18n/navigation";

export const metadata = { title: "Agree to Terms" };

/** Only allow same-origin relative paths to prevent open-redirect. */
function sanitizeNext(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export default async function ConsentPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { next?: string };
}) {
  const { locale } = params;
  const next = sanitizeNext(searchParams.next);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → nothing to consent to.
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  // Already consented (e.g. a returning user landing here directly) → skip the
  // gate and send them on to their destination.
  const { data: profile } = await supabase
    .from("users")
    .select("terms_agreed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.terms_agreed_at) {
    redirect({ href: next, locale });
  }

  const { t } = await getAppTranslations();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("auth.consentHeading")}
      </h1>
      <ConsentForm />
    </div>
  );
}
