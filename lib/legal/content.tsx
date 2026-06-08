import type { ReactNode } from "react";

/**
 * Shared legal content for Privacy Policy and Terms of Service.
 *
 * Stored as structured section data so it can be rendered both on the
 * standalone /privacy and /terms pages and inside the signup consent
 * accordions without duplicating the text.
 */

export type LegalSection = {
  heading: string;
  /** Paragraphs and/or sub-blocks rendered in order. */
  blocks: LegalBlock[];
};

export type LegalBlock =
  | { type: "p"; text: ReactNode }
  | { type: "subheading"; text: string }
  | { type: "ul"; items: ReactNode[] };

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = "kstockhelper@gmail.com";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "June 8, 2026",
  sections: [
    {
      heading: "1. Introduction",
      blocks: [
        {
          type: "p",
          text: "KstockHelper (“KstockHelper,” “we,” “us,” or “our”) respects your privacy.",
        },
        {
          type: "p",
          text: "This Privacy Policy explains how we collect, use, store, and protect personal information when you use KstockHelper.",
        },
        {
          type: "p",
          text: "By using KstockHelper, you agree to the practices described in this Privacy Policy.",
        },
      ],
    },
    {
      heading: "2. Information We Collect",
      blocks: [
        { type: "p", text: "We may collect the following personal information:" },
        { type: "subheading", text: "Account Information" },
        { type: "p", text: "When you create an account or log in, we may collect:" },
        { type: "ul", items: ["Email address", "Login authentication information"] },
        { type: "p", text: "You may sign up or log in using:" },
        { type: "ul", items: ["Email and password", "Google account login"] },
        {
          type: "p",
          text: "If you sign up using email and password, your password is encrypted and securely managed. We do not store your password in plain text.",
        },
        { type: "subheading", text: "Exchange UID Information" },
        {
          type: "p",
          text: "To apply for Premium access, you may submit your exchange UID, including:",
        },
        { type: "ul", items: ["Binance UID", "Bybit UID"] },
        {
          type: "p",
          text: "We do not collect your exchange account password, API key, wallet private key, trading password, deposit information, withdrawal information, or other exchange account credentials.",
        },
      ],
    },
    {
      heading: "3. How We Use Your Information",
      blocks: [
        { type: "p", text: "We use your personal information for the following purposes:" },
        {
          type: "ul",
          items: [
            "To create and manage your account",
            "To authenticate your login",
            "To process your exchange UID submission",
            "To verify eligibility for Premium access",
            "To manage UID application status",
            "To provide and operate KstockHelper",
            "To prevent fraud, abuse, or unauthorized use",
            "To respond to user inquiries",
            "To maintain service security",
            "To comply with applicable legal, regulatory, or operational requirements",
          ],
        },
      ],
    },
    {
      heading: "4. Use of Country or Region Information",
      blocks: [
        {
          type: "p",
          text: "Some features of KstockHelper may be limited depending on your country or region.",
        },
        {
          type: "p",
          text: "We may use information such as your IP address, selected country, or other regional signals to determine whether certain features, including exchange referral banners, referral codes, or trading-related links, should be shown or hidden.",
        },
      ],
    },
    {
      heading: "5. Sharing of Information",
      blocks: [
        { type: "p", text: "We do not sell your personal information." },
        {
          type: "p",
          text: "We may share limited information only when necessary for the following purposes:",
        },
        {
          type: "ul",
          items: [
            "To operate and maintain the service",
            "To verify Premium eligibility",
            "To prevent fraud, abuse, or security incidents",
            "To comply with applicable laws, regulations, or lawful requests",
            "To work with service providers that help us provide KstockHelper",
          ],
        },
        {
          type: "p",
          text: "Service providers are expected to process personal information only as necessary to provide services to us.",
        },
      ],
    },
    {
      heading: "6. Third-Party Login and External Services",
      blocks: [
        {
          type: "p",
          text: "If you use Google login, Google may process your information according to its own privacy policy.",
        },
        {
          type: "p",
          text: "KstockHelper may contain links to third-party websites or partner exchanges. If you leave KstockHelper and use a third-party service, that third party’s own privacy policy and terms will apply.",
        },
      ],
    },
    {
      heading: "7. Data Retention",
      blocks: [
        {
          type: "p",
          text: "We retain your account information for as long as your account remains active.",
        },
        {
          type: "p",
          text: "If you delete your account, we will delete or anonymize your personal information, except where we need to retain limited records for legitimate business purposes, fraud prevention, dispute resolution, compliance, security, or service operation.",
        },
        {
          type: "p",
          text: "Any retained information will be limited to what is reasonably necessary for those purposes.",
        },
      ],
    },
    {
      heading: "8. Account Deletion",
      blocks: [
        {
          type: "p",
          text: "You may request account deletion through the service or by contacting us at:",
        },
        {
          type: "p",
          text: <strong>{CONTACT_EMAIL}</strong>,
        },
        {
          type: "p",
          text: "After account deletion, your access to KstockHelper may be terminated. Certain limited records may be retained where reasonably necessary for fraud prevention, dispute resolution, security, compliance, or service operation.",
        },
      ],
    },
    {
      heading: "9. Security",
      blocks: [
        {
          type: "p",
          text: "We use reasonable technical and organizational measures to protect your personal information.",
        },
        {
          type: "p",
          text: "However, no method of online transmission or storage is completely secure. You are responsible for keeping your login credentials and email account secure.",
        },
      ],
    },
    {
      heading: "10. Children’s Privacy",
      blocks: [
        { type: "p", text: "KstockHelper is not intended for children." },
        {
          type: "p",
          text: "We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we may delete such information.",
        },
      ],
    },
    {
      heading: "11. Changes to This Privacy Policy",
      blocks: [
        { type: "p", text: "We may update this Privacy Policy from time to time." },
        {
          type: "p",
          text: "If we make material changes, we may notify users through the service, by email, or by updating the “Last Updated” date above.",
        },
        {
          type: "p",
          text: "Your continued use of KstockHelper after changes become effective means that you accept the updated Privacy Policy.",
        },
      ],
    },
    {
      heading: "12. Contact",
      blocks: [
        {
          type: "p",
          text: "If you have any questions about this Privacy Policy, please contact us at:",
        },
        { type: "p", text: <strong>KstockHelper</strong> },
        {
          type: "p",
          text: (
            <>
              Email: <strong>{CONTACT_EMAIL}</strong>
            </>
          ),
        },
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "June 8, 2026",
  sections: [
    {
      heading: "1. Introduction",
      blocks: [
        {
          type: "p",
          text: "These Terms of Service (“Terms”) govern your access to and use of KstockHelper (“KstockHelper,” “we,” “us,” or “our”).",
        },
        {
          type: "p",
          text: "By accessing or using KstockHelper, you agree to these Terms. If you do not agree, you should not use the service.",
        },
      ],
    },
    {
      heading: "2. Service Description",
      blocks: [
        {
          type: "p",
          text: "KstockHelper provides information, translated market content, and access-related guidance for users interested in Korean stock markets and Korean stock-linked trading products.",
        },
        {
          type: "p",
          text: "KstockHelper may also provide features that allow eligible users to view partner exchange links, submit exchange UIDs, and apply for free Premium access.",
        },
        {
          type: "p",
          text: "KstockHelper is not a broker, exchange, investment adviser, financial institution, asset manager, or trading platform.",
        },
      ],
    },
    {
      heading: "3. Eligibility",
      blocks: [
        {
          type: "p",
          text: "You may use KstockHelper only if you are legally allowed to use the service in your country or region.",
        },
        {
          type: "p",
          text: "Some features may not be available in certain countries or regions due to applicable laws, regulations, partner exchange policies, compliance requirements, or internal operational decisions.",
        },
        {
          type: "p",
          text: "We may restrict, hide, suspend, or remove certain features based on your country, region, IP address, self-declared residence, or other compliance-related factors.",
        },
      ],
    },
    {
      heading: "4. Account Registration",
      blocks: [
        { type: "p", text: "To use certain features, you may need to create an account." },
        { type: "p", text: "You may register or log in using:" },
        { type: "ul", items: ["Email and password", "Google account login"] },
        {
          type: "p",
          text: "You agree to provide accurate information and to keep your account secure.",
        },
        {
          type: "p",
          text: "You are responsible for all activity that occurs under your account.",
        },
      ],
    },
    {
      heading: "5. Exchange UID Submission",
      blocks: [
        {
          type: "p",
          text: "Users may submit their exchange UID to apply for Premium access.",
        },
        { type: "p", text: "By submitting a UID, you represent and agree that:" },
        {
          type: "ul",
          items: [
            "The UID belongs to your own exchange account",
            "The information you provide is accurate",
            "You are not submitting another person’s UID without authorization",
            "Approval is not guaranteed",
            "KstockHelper may approve, reject, reset, or review your UID application",
          ],
        },
        {
          type: "p",
          text: "KstockHelper may process UID applications based on eligibility conditions, verification results, exchange-related data, fraud prevention, compliance, or operational reasons.",
        },
      ],
    },
    {
      heading: "6. Premium Access",
      blocks: [
        {
          type: "p",
          text: "KstockHelper may provide free Premium access to users who meet certain eligibility conditions.",
        },
        {
          type: "p",
          text: "Premium access may be granted after we verify that the submitted exchange UID meets our eligibility conditions, including qualifying trading activity.",
        },
        {
          type: "p",
          text: "Premium access is not guaranteed and may be changed, suspended, revoked, or discontinued at any time.",
        },
        {
          type: "p",
          text: "If you change a previously approved UID, your Premium access may be disabled, and your new UID may need to be reviewed again.",
        },
      ],
    },
    {
      heading: "7. Partner Exchanges",
      blocks: [
        {
          type: "p",
          text: "KstockHelper may provide links, banners, referral codes, or guidance related to partner exchanges.",
        },
        {
          type: "p",
          text: "However, all exchange-related activities, including account creation, identity verification, deposits, withdrawals, trading, fees, fee discounts, and exchange account management, are handled directly by the relevant exchange.",
        },
        { type: "p", text: "KstockHelper does not control:" },
        {
          type: "ul",
          items: [
            "Exchange account approval",
            "KYC or identity verification",
            "Deposits or withdrawals",
            "Trading execution",
            "Exchange fees or fee discounts",
            "Trading product availability",
            "User assets",
            "Exchange account restrictions or suspensions",
          ],
        },
        {
          type: "p",
          text: "Any benefits, fee discounts, promotions, or trading-related conditions are subject to the terms and policies of the relevant exchange.",
        },
      ],
    },
    {
      heading: "8. Regional Restrictions",
      blocks: [
        {
          type: "p",
          text: "KstockHelper may be available globally, but certain features may be limited or unavailable in some countries or regions.",
        },
        {
          type: "p",
          text: "Users in some countries or regions may be able to access informational content but may not be able to view or use exchange referral links, referral codes, trading-related buttons, or promotional banners.",
        },
        {
          type: "p",
          text: "Feature availability may change at any time due to applicable laws, regulations, partner exchange policies, compliance requirements, or internal operational decisions.",
        },
        {
          type: "p",
          text: "You are responsible for ensuring that your use of KstockHelper, partner exchanges, and any related trading products is permitted in your jurisdiction.",
        },
      ],
    },
    {
      heading: "9. No Investment Advice",
      blocks: [
        {
          type: "p",
          text: "KstockHelper provides information for general informational and educational purposes only.",
        },
        {
          type: "p",
          text: "KstockHelper does not provide investment advice, financial advice, trading advice, legal advice, tax advice, or personalized recommendations.",
        },
        { type: "p", text: "Nothing on KstockHelper should be interpreted as:" },
        {
          type: "ul",
          items: [
            "A recommendation to buy, sell, hold, or trade any asset",
            "A recommendation to use leverage",
            "A recommendation to use derivatives",
            "A recommendation to use a specific exchange",
            "A guarantee of profit, return, or trading outcome",
          ],
        },
        {
          type: "p",
          text: "You are solely responsible for your own financial, investment, and trading decisions.",
        },
        {
          type: "p",
          text: "Trading products, including derivatives and leveraged products, may involve significant risk and may not be suitable for all users.",
        },
      ],
    },
    {
      heading: "10. Translated and Market Information",
      blocks: [
        {
          type: "p",
          text: "KstockHelper may provide translated content and market-related information.",
        },
        {
          type: "p",
          text: "Such information may be incomplete, delayed, inaccurate, or different from the original source.",
        },
        {
          type: "p",
          text: "You should independently verify important information before making any financial, investment, or trading decision.",
        },
        {
          type: "p",
          text: "KstockHelper is not responsible for losses or damages resulting from reliance on information provided through the service.",
        },
      ],
    },
    {
      heading: "11. User Responsibilities",
      blocks: [
        { type: "p", text: "You agree not to:" },
        {
          type: "ul",
          items: [
            "Use KstockHelper for unlawful purposes",
            "Submit false or misleading information",
            "Submit another person’s UID without authorization",
            "Attempt to bypass country or regional restrictions",
            "Abuse referral, Premium, or verification systems",
            "Interfere with the operation or security of the service",
            "Use the service to promote fraud, scams, market manipulation, or illegal financial activity",
          ],
        },
        {
          type: "p",
          text: "We may suspend or terminate accounts that violate these Terms.",
        },
      ],
    },
    {
      heading: "12. Service Changes",
      blocks: [
        {
          type: "p",
          text: "We may modify, suspend, or discontinue any part of KstockHelper at any time.",
        },
        {
          type: "p",
          text: "We may also change Premium eligibility conditions, UID verification processes, supported exchanges, available features, or regional availability.",
        },
        {
          type: "p",
          text: "We are not liable for any loss resulting from service changes, suspension, or discontinuation.",
        },
      ],
    },
    {
      heading: "13. Fees and Paid Features",
      blocks: [
        {
          type: "p",
          text: "KstockHelper currently does not provide paid subscription features.",
        },
        {
          type: "p",
          text: "Users who meet certain eligibility conditions may access Premium features for free.",
        },
        {
          type: "p",
          text: "We may introduce paid features, subscription plans, or additional services in the future. If we do so, applicable terms, pricing, and payment conditions may be provided separately.",
        },
      ],
    },
    {
      heading: "14. Account Deletion and Termination",
      blocks: [
        { type: "p", text: "You may delete your account or request account deletion." },
        { type: "p", text: "We may suspend or terminate your account if:" },
        {
          type: "ul",
          items: [
            "You violate these Terms",
            "You submit false or misleading information",
            "You abuse the UID or Premium application process",
            "Your use of the service creates legal, regulatory, security, or operational risk",
            "We are required to do so by law, regulation, partner policy, or compliance requirements",
          ],
        },
        {
          type: "p",
          text: "After account deletion or termination, your access to KstockHelper and Premium features may end.",
        },
      ],
    },
    {
      heading: "15. Disclaimer",
      blocks: [
        {
          type: "p",
          text: "KstockHelper is provided on an “as is” and “as available” basis.",
        },
        { type: "p", text: "We do not guarantee that:" },
        {
          type: "ul",
          items: [
            "The service will always be available",
            "Information will always be accurate, complete, or current",
            "Premium access will always be available",
            "Exchange links or benefits will always be available",
            "Any trading product will be available in your region",
            "Any user will obtain profit or avoid loss",
          ],
        },
        { type: "p", text: "You use KstockHelper at your own risk." },
      ],
    },
    {
      heading: "16. Limitation of Liability",
      blocks: [
        {
          type: "p",
          text: "To the maximum extent permitted by applicable law, KstockHelper is not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, trading losses, loss of data, loss of access, or losses related to third-party exchanges.",
        },
        {
          type: "p",
          text: "KstockHelper is not responsible for user decisions, exchange account issues, trading outcomes, market movements, exchange restrictions, or third-party service failures.",
        },
      ],
    },
    {
      heading: "17. Changes to These Terms",
      blocks: [
        { type: "p", text: "We may update these Terms from time to time." },
        {
          type: "p",
          text: "If we make material changes, we may notify users through the service, by email, or by updating the “Last Updated” date above.",
        },
        {
          type: "p",
          text: "Your continued use of KstockHelper after changes become effective means that you accept the updated Terms.",
        },
      ],
    },
    {
      heading: "18. Contact",
      blocks: [
        {
          type: "p",
          text: "If you have any questions about these Terms, please contact us at:",
        },
        { type: "p", text: <strong>KstockHelper</strong> },
        {
          type: "p",
          text: (
            <>
              Email: <strong>{CONTACT_EMAIL}</strong>
            </>
          ),
        },
      ],
    },
  ],
};
