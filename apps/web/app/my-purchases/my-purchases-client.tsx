"use client";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { RateUserButton } from "@/components/rate-user-button";
import { MyListing } from "@/types/listing";
import { formatPrice } from "@ham-marketplace/shared";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Props {
  purchases: MyListing[];
  userId: string;
}

export function MyPurchasesClient({ purchases, userId }: Props) {
  const [filter, setFilter] = useState<"all" | "rated" | "not_rated">("all");

  const filteredPurchases = useMemo(() => {
    if (filter === "all") return purchases;
    // TODO: Filter by rated/not_rated when we track this
    return purchases;
  }, [purchases, filter]);

  if (!purchases || purchases.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No purchases yet
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Items you buy will appear here
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
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
            All ({purchases.length})
          </button>
        </nav>
      </div>

      {/* Purchases */}
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="flex gap-4 overflow-hidden rounded-lg bg-white p-4 shadow dark:bg-gray-800"
          >
            {/* Image */}
            <Link href={`/listings/${purchase.id}`} className="flex-shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {purchase.images && purchase.images.length > 0 ? (
                  <Image
                    src={purchase.images[0]}
                    alt={purchase.title}
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
                  href={`/listings/${purchase.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                >
                  {purchase.title}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {purchase.category.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {purchase.condition.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Purchased
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(purchase.price, purchase.currency || "EUR")}
                </p>
                <div className="flex gap-2">
                  {/* Rate Seller button */}
                  <RateUserButton
                    listingId={purchase.id}
                    ratedUserId={purchase.user_id}
                    currentUserId={userId}
                    buttonText="Rate Seller"
                  />

                  <Link
                    href={`/listings/${purchase.id}`}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
