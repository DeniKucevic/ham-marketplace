"use client";

import { DeleteListingButton } from "@/components/delete-listing-button";
import { DeleteListingModal } from "@/components/delete-listing-modal";
import { MarkAsSoldButton } from "@/components/mark-as-sold-button";
import { RateUserButton } from "@/components/rate-user-button";
import { createClient } from "@/lib/supabase/client";
import { BrowseListing, MyListing } from "@/types/listing";
import { formatPrice } from "@ham-marketplace/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface Props {
  listings: MyListing[];
  userId: string;
}

export function MyListingsClient({ listings, userId }: Props) {
  const router = useRouter();
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
          // Extract file path from URL
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
        .eq("user_id", userId); // Extra safety check

      if (error) throw error;

      // Refresh page to show updated list
      router.refresh();
      setDeleteModalOpen(false);
      setListingToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No listings yet
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create your first listing to get started!
        </p>
        <Link
          href="/listings/new"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Create Listing
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
              All ({listings.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                filter === "active"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter("sold")}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                filter === "sold"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Sold ({soldCount})
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
              <Link href={`/listings/${listing.id}`} className="flex-shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  {listing.images && listing.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/listings/${listing.id}`}
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
                    {/* Mark as Sold - samo za active */}
                    {listing.status === "active" && (
                      <MarkAsSoldButton
                        listingId={listing.id}
                        listingTitle={listing.title}
                      />
                    )}

                    {/* Rate button - samo za sold */}
                    {listing.status === "sold" && listing.sold_to && (
                      <RateUserButton
                        listingId={listing.id}
                        ratedUserId={listing.sold_to}
                        currentUserId={userId}
                      />
                    )}

                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Edit
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

      {/* Delete Modal */}
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
