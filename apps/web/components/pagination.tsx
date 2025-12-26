"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  // Always show first page
  pages.push(1);

  // Show ellipsis or pages near start
  if (showEllipsisStart) {
    pages.push(-1); // -1 = ellipsis
  } else {
    for (let i = 2; i < Math.min(4, totalPages); i++) {
      pages.push(i);
    }
  }

  // Show current page and neighbors (if not already shown)
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Show ellipsis or pages near end
  if (showEllipsisEnd) {
    pages.push(-2); // -2 = ellipsis
  } else {
    for (let i = Math.max(totalPages - 2, end + 1); i < totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
  }

  // Always show last page
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-2">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === -1 || page === -2) {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          );
        }

        if (page === currentPage) {
          return (
            <span
              key={page}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              {page}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={createPageURL(page)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Next
        </span>
      )}
    </nav>
  );
}
