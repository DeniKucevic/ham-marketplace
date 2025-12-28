"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  initialQuery?: string;
}

const POPULAR_SEARCHES = [
  "FT-991A",
  "IC-7300",
  "Yaesu",
  "HF Antenna",
  "Power Supply",
  "Kenwood",
];

export function HeroSearch({ initialQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    router.push(`/?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            HAM Radio Marketplace
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
            Buy and sell amateur radio equipment with fellow operators
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for radios, antennas, accessories..."
                  className="block w-full rounded-lg border-0 py-4 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-blue-200">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="rounded-full bg-blue-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
