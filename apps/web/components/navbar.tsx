// components/navbar.tsx

"use client";

import { getDisplayName } from "@/lib/display-name";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

interface Props {
  user?: {
    id: string;
    email?: string;
  } | null;
  profile?: {
    callsign: string;
    display_name: string | null;
  } | null;
  locale: string;
}

export function Navbar({ user, profile, locale }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = useTranslations("nav");
  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-8">
            <Link
              href={`/${locale}`}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              HAM Marketplace
            </Link>
            {user && (
              <div className="hidden md:flex md:gap-6">
                <Link
                  href={`/${locale}`}
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t("browse")}
                </Link>
                <Link
                  href={`/${locale}/my-listings`}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {t("myListings")}
                </Link>
                <Link
                  href={`/${locale}/my-purchases`}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {t("myPurchases")}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  href={`/${locale}/listings/new`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {t("createListing")}
                </Link>
                <ThemeToggle />
                <LanguageSwitcher currentLocale={locale} />
                {/* User Dropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <span>
                      {getDisplayName(
                        profile ?? null,
                        user.email?.split("@")[0]
                      )}
                    </span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />

                      {/* Dropdown menu */}
                      <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                        <Link
                          href={`/${locale}/profile/${
                            profile?.callsign || user.id
                          }`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {t("viewProfile")}
                        </Link>
                        <Link
                          href={`/${locale}/settings`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {t("settings")}
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <form action="/auth/signout" method="post">
                          <button
                            type="submit"
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            {t("signOut")}
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {!user && (
              <>
                <ThemeToggle />
                <LanguageSwitcher currentLocale={locale} />
                <Link
                  href={`/${locale}/sign-in`}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {t("signIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
