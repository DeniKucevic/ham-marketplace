"use client";

import { ListingGridCard } from "@/components/listing-grid-card";
import { ListingListCard } from "@/components/listing-list-card";
import { ListingsFilters } from "@/components/listings-filters";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import type { BrowseListing } from "@/types/listing";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Props {
  listings: BrowseListing[];
}

export function BrowseListingsClient({ listings }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          listing.title.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.manufacturer?.toLowerCase().includes(query) ||
          listing.model?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && listing.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (
        selectedCondition.length > 0 &&
        !selectedCondition.includes(listing.condition)
      ) {
        return false;
      }

      // Price filter
      const price = listing.price;
      if (minPrice && price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && price > parseFloat(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [
    listings,
    searchQuery,
    selectedCategory,
    selectedCondition,
    minPrice,
    maxPrice,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCondition([]);
    setMinPrice("");
    setMaxPrice("");
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No listings yet
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Be the first to create a listing!
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
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
          <ListingsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCondition={selectedCondition}
            onConditionChange={setSelectedCondition}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onClearFilters={clearFilters}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Header with view toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredListings.length} listing
            {filteredListings.length !== 1 ? "s" : ""} found
          </p>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* No results */}
        {filteredListings.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No listings found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* Grid View */}
        {filteredListings.length > 0 && viewMode === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingGridCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* List View */}
        {filteredListings.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <ListingListCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
