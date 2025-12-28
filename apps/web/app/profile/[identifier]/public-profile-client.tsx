"use client";

import { ListingGridCard } from "@/components/listing-grid-card";
import { ListingListCard } from "@/components/listing-list-card";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getDisplayName } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/client";
import { BrowseListing } from "@/types/listing";
import type { Database } from "@ham-marketplace/shared";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SortOption = "newest" | "oldest" | "highest" | "lowest";

type Rating = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  rater_user_id: string;
  listing_id: string;
  listings: {
    title: string;
  } | null;
  profiles: {
    callsign: string;
    display_name: string | null;
  } | null;
};

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
  const [viewMode, setViewMode, viewMounted] = useLocalStorage<ViewMode>(
    "listings-view-mode",
    "grid"
  );
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);
  const [unfilteredCount, setUnfilteredCount] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const RATINGS_PER_PAGE = 5;
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoadingRatings(true);
      const supabase = createClient();
      const offset = (ratingsPage - 1) * RATINGS_PER_PAGE;

      // Prvo fetch total count BEZ filtera
      const { count: totalCount } = await supabase
        .from("ratings")
        .select("*", { count: "exact", head: true })
        .eq("rated_user_id", profile.id);

      setUnfilteredCount(totalCount || 0); // ← DODAJ OVO

      let query = supabase
        .from("ratings")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          rater_user_id,
          listing_id,
          listings!ratings_listing_id_fkey (
            title
          ),
          profiles!ratings_rater_user_id_fkey (
            callsign,
            display_name
          )
        `,
          { count: "exact" }
        )
        .eq("rated_user_id", profile.id);

      // Filter by rating
      if (ratingFilter !== null) {
        query = query.eq("rating", ratingFilter);
      }

      // Sort
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "highest":
          query = query
            .order("rating", { ascending: false })
            .order("created_at", { ascending: false });
          break;
        case "lowest":
          query = query
            .order("rating", { ascending: true })
            .order("created_at", { ascending: false });
          break;
      }

      const { data, count } = await query.range(
        offset,
        offset + RATINGS_PER_PAGE - 1
      );

      setRatings((data as Rating[]) || []);
      setTotalRatings(count || 0);
      setLoadingRatings(false);
    };

    fetchRatings();
  }, [profile.id, ratingsPage, ratingFilter, sortBy]);

  const totalPages = Math.ceil(totalRatings / RATINGS_PER_PAGE);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header - OSTAJE ISTO */}
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

            {/* Contact Info */}
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

      {/* Reviews Section */}
      {unfilteredCount > 0 && (
        <div className="mb-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reviews ({totalRatings})
            </h2>

            {/* Filter & Sort */}
            <div className="flex gap-3">
              <select
                value={ratingFilter || ""}
                onChange={(e) => {
                  setRatingFilter(
                    e.target.value ? parseInt(e.target.value) : null
                  );
                  setRatingsPage(1); // Reset to page 1
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setRatingsPage(1); // Reset to page 1
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>
          </div>

          {loadingRatings ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading reviews...
            </div>
          ) : ratings.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400">
                No reviews match your filter
              </p>
              <button
                onClick={() => {
                  setRatingFilter(null);
                  setSortBy("newest");
                  setRatingsPage(1);
                }}
                className="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border-b border-gray-200 pb-6 last:border-b-0 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Rating stars */}
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {rating.rating}.0
                          </span>
                        </div>

                        {/* Listing title */}
                        {rating.listings?.title && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Regarding:{" "}
                            <Link
                              href={`/listings/${rating.listing_id}`}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {rating.listings.title}
                            </Link>
                          </p>
                        )}

                        {/* Comment */}
                        {rating.comment && (
                          <p className="mt-2 text-gray-700 dark:text-gray-300">
                            {rating.comment}
                          </p>
                        )}

                        {/* Author & Date */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            by{" "}
                            {getDisplayName(
                              rating.profiles ?? null,
                              "Anonymous"
                            )}
                          </span>
                          <span>•</span>
                          <span>
                            {rating.created_at
                              ? new Date(rating.created_at).toLocaleDateString()
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setRatingsPage((p) => Math.max(1, p - 1))}
                    disabled={ratingsPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {ratingsPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setRatingsPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={ratingsPage === totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Listings Section - OSTAJE ISTO */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isOwnProfile ? "Your Listings" : "Listings"} ({listings.length})
        </h2>
        {viewMounted && <ViewToggle value={viewMode} onChange={setViewMode} />}
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

      {listings.length > 0 && viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingGridCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

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
