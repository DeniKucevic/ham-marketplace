"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { RateUserModal } from "./rate-user-modal";

interface Props {
  listingId: string;
  ratedUserId: string;
  currentUserId: string;
  buttonText?: string;
}

export function RateUserButton({
  listingId,
  ratedUserId,
  currentUserId,
  buttonText = "Rate Buyer", // ← Default text
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const checkRating = async () => {
      const supabase = createClient();

      // Check if already rated
      const { data: existing } = await supabase
        .from("ratings")
        .select("id")
        .eq("listing_id", listingId)
        .eq("rater_user_id", currentUserId)
        .single();

      if (existing) {
        setAlreadyRated(true);
      }

      // Get rated user's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("callsign, display_name")
        .eq("id", ratedUserId)
        .single();

      if (profile) {
        setUserName(profile.display_name || profile.callsign);
      }
    };

    checkRating();
  }, [listingId, ratedUserId, currentUserId]);

  if (alreadyRated) {
    return (
      <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        Rated ✓
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
      >
        {buttonText}
      </button>

      <RateUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        listingId={listingId}
        ratedUserId={ratedUserId}
        ratedUserName={userName}
      />
    </>
  );
}
