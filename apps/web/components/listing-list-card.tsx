import { getDisplayName } from "@/lib/display-name";
import { BrowseListing } from "@/types/listing";
import { formatPrice } from "@ham-marketplace/shared";
import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "./image-placeholder";

interface Props {
  listing: BrowseListing;
}

export function ListingListCard({ listing }: Props) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex gap-4 overflow-hidden rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
    >
      {/* Image */}
      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
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

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {listing.title}
          </h3>

          {listing.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {listing.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {listing.category.replace(/_/g, " ")}
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {listing.condition.replace(/_/g, " ")}
            </span>
            {listing.manufacturer && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {listing.manufacturer}
              </span>
            )}
            {listing.model && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {listing.model}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p
            className={`text-xl font-bold ${
              listing.price === 0
                ? "text-green-600 dark:text-green-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {formatPrice(listing.price, listing.currency || "EUR")}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{getDisplayName(listing.profiles, "Seller")}</span>
            {listing.created_at && (
              <span>{new Date(listing.created_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
