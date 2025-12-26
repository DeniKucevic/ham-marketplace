"use client";

import { useEffect } from "react";

export function IncrementViews({ listingId }: { listingId: string }) {
  useEffect(() => {
    fetch(`/api/listings/${listingId}/increment-views`, { method: "POST" });
  }, [listingId]);

  return null;
}
