"use client";

import { DeleteListingButton } from "@/components/delete-listing-button";
import { DeleteListingModal } from "@/components/delete-listing-modal";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { MarkAsSoldButton } from "@/components/mark-as-sold-button";
import { RateUserButton } from "@/components/rate-user-button";
import { createClient } from "@/lib/supabase/client";
import { BrowseListing, MyListing } from "@/types/listing";
import { formatPrice } from "@ham-marketplace/shared";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface Props {
  listings: MyListing[];
  userId: string;
  locale: string;
}

export function MyListingsClient({ listings, userId, locale }: Props) {
  const router = useRouter();
  const t = useTranslations("myListings");
  const tCommon = useTranslations("common");

  const [filter, setFilter] = useState<"all" | "active" | "sold">("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<BrowseListing | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredListings = useMemo(() => {
    if (filter === "all") return listings;
    if (filter === "active")
      return listings.filter((l) => l.status === "active");
    if (filter === "sold") return listings.filter((l) => l.status === "sold");
    return listings;
  }, [listings, filter]);

  const activeCount = listings.filter((l) => l.status === "active").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    setDeleteLoading(true);
    try {
      const supabase = createClient();

      // Delete images from storage first
      if (listingToDelete.images && listingToDelete.images.length > 0) {
        for (const imageUrl of listingToDelete.images) {
          const urlParts = imageUrl.split("/listing-images/");
          if (urlParts.length === 2) {
            const filePath = urlParts[1];
            await supabase.storage.from("listing-images").remove([filePath]);
          }
        }
      }

      // Delete listing from database
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingToDelete.id)
        .eq("user_id", userId);

      if (error) throw error;

      router.refresh();
      setDeleteModalOpen(false);
      setListingToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("noListings")}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("createFirstListing")}
        </p>
        <Link
          href={`/${locale}/listings/new`}
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          {t("createListing")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Filter tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setFilter("all")}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                filter === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {t("all")} ({listings.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                filter === "active"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {t("active")} ({activeCount})
            </button>
            <button
              onClick={() => setFilter("sold")}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                filter === "sold"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {t("sold")} ({soldCount})
            </button>
          </nav>
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="flex gap-4 overflow-hidden rounded-lg bg-white p-4 shadow dark:bg-gray-800"
            >
              {/* Image */}
              <Link
                href={`/${locale}/listings/${listing.id}`}
                className="flex-shrink-0"
              >
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImagePlaceholder size="lg" />
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/${locale}/listings/${listing.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {listing.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {listing.category.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {listing.condition.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(listing.price, listing.currency || "EUR")}
                  </p>
                  <div className="flex gap-2">
                    {listing.status === "active" && (
                      <MarkAsSoldButton
                        listingId={listing.id}
                        listingTitle={listing.title}
                      />
                    )}

                    {listing.status === "sold" && listing.sold_to && (
                      <RateUserButton
                        listingId={listing.id}
                        ratedUserId={listing.sold_to}
                        currentUserId={userId}
                      />
                    )}

                    <Link
                      href={`/${locale}/listings/${listing.id}/edit`}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {tCommon("edit")}
                    </Link>
                    <DeleteListingButton
                      listingId={listing.id}
                      listingTitle={listing.title}
                      images={listing.images}
                      userId={userId}
                      variant="inline"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteListingModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setListingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        listingTitle={listingToDelete?.title || ""}
      />
    </>
  );
}
