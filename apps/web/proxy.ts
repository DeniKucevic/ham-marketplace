import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { locales } from "./i18n";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

// CHANGE: Rename function to 'proxy' and use 'export default'
export default async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // If next-intl is handling a redirect, return it immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Pass the intlResponse to Supabase to preserve the i18n rewrites
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
