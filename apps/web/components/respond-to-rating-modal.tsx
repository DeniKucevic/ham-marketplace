"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ratingId: string;
  ratingComment: string | null;
  raterName: string;
  ratingStars: number;
}

export function RespondToRatingModal({
  isOpen,
  onClose,
  ratingId,
  ratingComment,
  raterName,
  ratingStars,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("ratings")
        .update({
          response,
          response_at: new Date().toISOString(),
        })
        .eq("id", ratingId);

      if (error) throw error;

      alert("Response added successfully!");
      setResponse("");
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Response error:", error);
      alert("Failed to add response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Respond to Review
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              From {raterName}
            </p>
          </div>

          {/* Show original rating */}
          <div className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${
                    star <= ratingStars
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* Comment */}
            {ratingComment && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {ratingComment}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="response"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your Response *
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                required
                maxLength={500}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Thank you for your feedback..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {response.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !response.trim()}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
