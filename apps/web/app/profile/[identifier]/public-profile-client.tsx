"use client";

import { ListingGridCard } from "@/components/listing-grid-card";
import { ListingListCard } from "@/components/listing-list-card";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import { getDisplayName } from "@/lib/display-name";
import { BrowseListing } from "@/types/listing";
import type { Database } from "@ham-marketplace/shared";
import Link from "next/link";
import { useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Props {
  profile: Profile;
  listings: BrowseListing[];
  isLoggedIn: boolean;
  isOwnProfile: boolean;
}

export function PublicProfileClient({
  profile,
  listings,
  isLoggedIn,
  isOwnProfile,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getDisplayName(profile, "User")}
            </h1>

            {profile.location_city && profile.location_country && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                📍 {profile.location_city}, {profile.location_country}
              </p>
            )}

            {profile.bio && (
              <p className="mt-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="mt-6 flex gap-8">
              <div>
                <div className="flex items-center gap-1">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.rating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rating
                </p>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile.total_sales || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sales
                </p>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {listings.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active Listings
                </p>
              </div>
            </div>

            {/* Contact Info - Only for logged in users */}
            {isLoggedIn && !isOwnProfile && (
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h3>
                {profile.show_email && profile.email && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📧{" "}
                    <a
                      href={`mailto:${profile.email}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {profile.email}
                    </a>
                  </p>
                )}
                {profile.show_phone && profile.phone && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📞{" "}
                    <a
                      href={`tel:${profile.phone}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {profile.phone}
                    </a>
                  </p>
                )}
                {!profile.show_email && !profile.show_phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No public contact information
                  </p>
                )}
              </div>
            )}

            {!isLoggedIn && !isOwnProfile && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Link
                  href="/sign-in"
                  className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Sign in to see contact info
                </Link>
              </div>
            )}
          </div>

          {isOwnProfile && (
            <Link
              href="/settings"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Listings Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isOwnProfile ? "Your Listings" : "Listings"} ({listings.length})
        </h2>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {listings.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400">
            {isOwnProfile
              ? "You have no active listings"
              : "No active listings"}
          </p>
          {isOwnProfile && (
            <Link
              href="/listings/new"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create Listing
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {listings.length > 0 && viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingGridCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* List View */}
      {listings.length > 0 && viewMode === "list" && (
        <div className="space-y-4">
          {listings.map((listing) => (
            <ListingListCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
