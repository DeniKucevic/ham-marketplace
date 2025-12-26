"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

interface Profile {
  id: string;
  callsign: string;
  display_name: string | null;
}

export function MarkAsSoldModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setProfiles([]);
      return;
    }

    const searchProfiles = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, callsign, display_name")
        .or(
          `callsign.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`
        )
        .limit(10);

      setProfiles(data || []);
    };

    const timer = setTimeout(searchProfiles, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("listings")
        .update({
          status: "sold",
          sold_to: selectedBuyer,
        })
        .eq("id", listingId);

      if (error) throw error;

      alert(
        "Listing marked as sold! You and the buyer can now rate each other."
      );
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Mark as sold error:", error);
      alert("Failed to mark as sold. Please try again.");
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
              Mark as Sold
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {listingTitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="buyer"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Who bought this item? *
              </label>
              <input
                type="text"
                id="buyer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by callsign or name..."
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              {profiles.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setSelectedBuyer(profile.id);
                        setSearchQuery(
                          profile.display_name || profile.callsign
                        );
                        setProfiles([]);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {profile.display_name
                        ? `${profile.display_name} (${profile.callsign})`
                        : profile.callsign}
                    </button>
                  ))}
                </div>
              )}
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
                disabled={loading || !selectedBuyer}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Marking..." : "Mark as Sold"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
