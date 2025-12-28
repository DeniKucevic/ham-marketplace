"use client";

import { COUNTRIES } from "@ham-marketplace/shared";

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCondition: string[];
  onConditionChange: (conditions: string[]) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  country: string;
  onCountryChange: (country: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "transceiver_hf", label: "HF Transceiver" },
  { value: "transceiver_vhf_uhf", label: "VHF/UHF Transceiver" },
  { value: "transceiver_handheld", label: "Handheld Transceiver" },
  { value: "antenna_hf", label: "HF Antenna" },
  { value: "antenna_vhf_uhf", label: "VHF/UHF Antenna" },
  { value: "antenna_accessories", label: "Antenna Accessories" },
  { value: "power_supply", label: "Power Supply" },
  { value: "amplifier", label: "Amplifier" },
  { value: "tuner", label: "Antenna Tuner" },
  { value: "rotator", label: "Rotator" },
  { value: "swr_meter", label: "SWR Meter" },
  { value: "digital_modes", label: "Digital Modes Equipment" },
  { value: "microphone", label: "Microphone" },
  { value: "cables_connectors", label: "Cables & Connectors" },
  { value: "tools", label: "Tools" },
  { value: "books_manuals", label: "Books & Manuals" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "parts_repair", label: "For Parts/Repair" },
];

const POPULAR_COUNTRIES = [
  "Serbia",
  "Croatia",
  "Bosnia and Herzegovina",
  "Slovenia",
  "North Macedonia",
  "Montenegro",
  "Germany",
  "Austria",
  "Italy",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Greece",
  "Poland",
];

export function ListingsFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCondition,
  onConditionChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  country,
  onCountryChange,
  city,
  onCityChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: Props) {
  const toggleCondition = (condition: string) => {
    if (selectedCondition.includes(condition)) {
      onConditionChange(selectedCondition.filter((c) => c !== condition));
    } else {
      onConditionChange([...selectedCondition, condition]);
    }
  };

  const hasActiveFilters =
    selectedCategory !== "" ||
    selectedCondition.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    country !== "" ||
    city !== "";

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <label
          htmlFor="sort"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Sort By
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, manufacturer, model..."
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Location Filters */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Country
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          City (Optional)
        </label>
        <input
          type="text"
          id="city"
          placeholder="Belgrade, Zagreb..."
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Condition
        </label>
        <div className="mt-2 space-y-2">
          {CONDITIONS.map((condition) => (
            <label key={condition.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCondition.includes(condition.value)}
                onChange={() => toggleCondition(condition.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {condition.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Price Range
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
