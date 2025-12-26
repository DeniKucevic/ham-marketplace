import { getDisplayName } from "@/lib/display-name";
import Link from "next/link";
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
                  href="/favorites"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Favorites
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
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getDisplayName(profile, user.email?.split("@")[0])}
                  </span>
                </div>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
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
