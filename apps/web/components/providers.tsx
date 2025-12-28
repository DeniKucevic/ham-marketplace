// components/providers.tsx

"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";

interface Props {
  children: React.ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

export function Providers({ children, messages, locale }: Props) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
