import { LoginForm } from "@/components/auth/LoginForm";
import { getAppTranslations } from "@/lib/i18n/getTranslations";

export default async function LoginPage() {
  const { t } = await getAppTranslations();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("auth.loginHeading")}
      </h1>
      <LoginForm />
    </div>
  );
}
