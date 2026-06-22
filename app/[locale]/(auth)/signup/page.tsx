import { SignupForm } from "@/components/auth/SignupForm";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { PageView } from "@/lib/analytics/PageView";

export default async function SignupPage() {
  const { t } = await getAppTranslations();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <PageView event="signup_viewed" props={{ trigger_page: "signup" }} />
      <h1 className="text-2xl font-semibold text-foreground">
        {t("auth.signupHeading")}
      </h1>
      <SignupForm />
    </div>
  );
}
