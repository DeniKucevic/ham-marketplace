import { CopyIdButton } from "@/components/copy-id-button";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { IncrementViews } from "@/components/increment-views";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { Navbar } from "@/components/navbar";
import { ReportListingButton } from "@/components/report-listing-button";
import { ShareListingButton } from "@/components/share-listing-button";
import { getDisplayName } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/server";
import {
  formatPrice,
  getCountryFlag,
  getCountryName,
} from "@ham-marketplace/shared";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations("listingDetail");
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
        total_sales,
        location_city,
        location_country,
        email,
        phone,
        show_email,
        show_phone
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
      <Navbar
        user={user}
        profile={currentUserProfile ?? null}
        locale={locale}
      />

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
            {t("backToListings")}
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
                    {t("description")}
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("specifications")}
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {listing.manufacturer && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("manufacturer")}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {listing.manufacturer}
                      </dd>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("model")}
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
                        {t("powerOutput")}
                      </dd>
                    </div>
                  )}
                  {listing.year_manufactured && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("year")}
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
                        {t("frequencyBands")}
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
                      {t("modes")}
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

              {!isOwner && user && (
                <div className="mt-2">
                  <ReportListingButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                  />
                </div>
              )}
              {/* Contact Seller */}
              {!isOwner && (
                <div className="mt-6 space-y-2">
                  {user ? (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("contactSeller")}
                      </h3>

                      {listing.profiles?.show_email &&
                        listing.profiles?.email && (
                          <a
                            href={`mailto:${listing.profiles.email}?subject=Inquiry: ${listing.title}`}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                          >
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
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {listing.profiles.email}
                          </a>
                        )}

                      {listing.profiles?.show_phone &&
                        listing.profiles?.phone && (
                          <a
                            href={`tel:${listing.profiles.phone}`}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                          >
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {listing.profiles.phone}
                          </a>
                        )}

                      {!listing.profiles?.show_email &&
                        !listing.profiles?.show_phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("noContactInfo")}
                          </p>
                        )}
                    </>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                      {t("signInToContact")}
                    </Link>
                  )}
                </div>
              )}
              {/* Owner actions */}
              {isOwner && (
                <div className="mt-6 space-y-2">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="block w-full rounded-md bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("editListing")}
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
                {t("seller")}
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getDisplayName(listing.profiles ?? null, "Seller")}
                    </p>
                    {listing.profiles?.location_country && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>
                          {getCountryFlag(listing.profiles.location_country)}{" "}
                          {listing.profiles.location_city
                            ? `${listing.profiles.location_city}, `
                            : ""}
                          {getCountryName(listing.profiles.location_country)}
                        </span>
                      </div>
                    )}
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
                  {listing.profiles?.total_sales || 0} {t("sales")}
                </p>
              </div>
            </div>

            {/* Listing Info */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("listingInfo")}
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("posted")}
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {listing.created_at
                      ? new Date(listing.created_at).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("views")}
                  </dt>
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
