"use client";

import { getDisplayName } from "@/lib/display-name";
import Link from "next/link";
import { useState } from "react";
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
}

export function Navbar({ user, profile }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              HAM Marketplace
            </Link>
            {user && (
              <div className="hidden md:flex md:gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Browse
                </Link>
                <Link
                  href="/my-listings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  My Listings
                </Link>
                <Link
                  href="/my-purchases"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  My Purchases
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  href="/listings/new"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Create Listing
                </Link>
                <ThemeToggle />

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
                          href={`/profile/${profile?.callsign || user.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <form action="/auth/signout" method="post">
                          <button
                            type="submit"
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Sign Out
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
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
