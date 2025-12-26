"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteListingModal } from "./delete-listing-modal";

interface Props {
  listingId: string;
  listingTitle: string;
  images: string[];
  userId: string;
  redirectPath?: string; // Optional - default to /my-listings
  variant?: "default" | "inline"; // Style variant
}

export function DeleteListingButton({
  listingId,
  listingTitle,
  images,
  userId,
  redirectPath = "/my-listings",
  variant = "default",
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Delete images from storage first
      if (images && images.length > 0) {
        for (const imageUrl of images) {
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
        .eq("id", listingId)
        .eq("user_id", userId);

      if (error) throw error;

      // Redirect
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete listing. Please try again.");
      setLoading(false);
    }
  };

  const buttonClasses =
    variant === "inline"
      ? "rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
      : "w-full rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30";

  return (
    <>
      <button onClick={() => setModalOpen(true)} className={buttonClasses}>
        Delete{variant === "default" ? " Listing" : ""}
      </button>

      <DeleteListingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        listingTitle={listingTitle}
      />
    </>
  );
}
