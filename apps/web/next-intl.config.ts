// apps/web/next-intl.config.ts
import { locales } from "./i18n";

const nextIntlConfig = {
  locales,
  defaultLocale: "en",
  timeZone: "UTC",
};

export default nextIntlConfig;
