"use client";

import { ListingGridCard } from "@/components/listing-grid-card";
import { ListingListCard } from "@/components/listing-list-card";
import { ListingsFilters } from "@/components/listings-filters";
import { Pagination } from "@/components/pagination";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import type { BrowseListing } from "@/types/listing";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Props {
  listings: BrowseListing[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function BrowseListingsClient({
  listings,
  currentPage,
  totalPages,
  totalCount,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("listings-view-mode", mode);
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter AND Sort listings (client-side filtering on current page)
  const filteredAndSortedListings = useMemo(() => {
    const result = listings.filter((listing) => {
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

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
        );
        break;
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [
    listings,
    searchQuery,
    selectedCategory,
    selectedCondition,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCondition([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
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
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Header with view toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedListings.length} of {totalCount} listings
          </p>
          <ViewToggle value={viewMode} onChange={handleViewModeChange} />
        </div>

        {/* No results */}
        {filteredAndSortedListings.length === 0 && (
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
        {filteredAndSortedListings.length > 0 && viewMode === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedListings.map((listing) => (
              <ListingGridCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* List View */}
        {filteredAndSortedListings.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredAndSortedListings.map((listing) => (
              <ListingListCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
