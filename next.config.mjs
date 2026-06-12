import createNextIntlPlugin from "next-intl/plugin";

// Point the plugin at our request config (default location is ./i18n/request.ts).
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
