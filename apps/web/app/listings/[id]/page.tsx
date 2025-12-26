import { CopyIdButton } from "@/components/copy-id-button";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { IncrementViews } from "@/components/increment-views";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { Navbar } from "@/components/navbar";
import { ShareListingButton } from "@/components/share-listing-button";
import { getDisplayName } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@ham-marketplace/shared";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Optional auth - može i bez login-a
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentUserProfile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  // Fetch listing - javno dostupno
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (
        callsign,
        display_name,
        rating,
        total_sales
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <IncrementViews listingId={listing.id} />
      <Navbar user={user} profile={currentUserProfile ?? null} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Images & Info */}
          <div className="lg:col-span-2">
            <ListingImageGallery
              images={listing.images}
              title={listing.title}
            />

            {/* Details */}
            <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {listing.category.replace(/_/g, " ")}
                </span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {listing.condition.replace(/_/g, " ")}
                </span>
              </div>

              {listing.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Description
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Specifications
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {listing.manufacturer && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Manufacturer
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {listing.manufacturer}
                      </dd>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Model
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {listing.model}
                      </dd>
                    </div>
                  )}
                  {listing.power_output && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Power Output
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {listing.power_output}W
                      </dd>
                    </div>
                  )}
                  {listing.year_manufactured && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Year
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {listing.year_manufactured}
                      </dd>
                    </div>
                  )}
                </dl>

                {listing.frequency_bands &&
                  listing.frequency_bands.length > 0 && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Frequency Bands
                      </dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {listing.frequency_bands.map((band: string) => (
                          <span
                            key={band}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {band}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}

                {listing.modes && listing.modes.length > 0 && (
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Modes
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {listing.modes.map((mode: string) => (
                        <span
                          key={mode}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {mode}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(listing.price, listing.currency || "EUR")}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {listing.currency || "EUR"}
              </div>

              {/* Share Button */}
              <div className="mt-4">
                <ShareListingButton
                  listingId={listing.id}
                  title={listing.title}
                />
              </div>

              {/* Contact Seller - samo za ulogovane */}
              {!isOwner && user && (
                <button className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Contact Seller
                </button>
              )}

              {/* Sign in prompt za neulogovane */}
              {!user && (
                <Link
                  href="/sign-in"
                  className="mt-6 block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Sign in to Contact Seller
                </Link>
              )}

              {/* Owner actions */}
              {isOwner && (
                <div className="mt-6 space-y-2">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="block w-full rounded-md bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit Listing
                  </Link>
                  <DeleteListingButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                    images={listing.images}
                    userId={user.id}
                    variant="default"
                  />
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seller
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getDisplayName(listing.profiles ?? null, "Seller")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                      {listing.profiles?.rating || 0}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {listing.profiles?.total_sales || 0} sales
                </p>
              </div>
            </div>

            {/* Listing Info */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Listing Info
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Posted</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {listing.created_at
                      ? new Date(listing.created_at).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Views</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {listing.views || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                  <CopyIdButton id={listing.id} />
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
