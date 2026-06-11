import { SignupForm } from "@/components/auth/SignupForm";
import { getTranslations } from "@/lib/i18n/getTranslations";

export default function SignupPage() {
  const { t } = getTranslations();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("auth.signupHeading")}
      </h1>
      <SignupForm />
    </div>
  );
}
