"use client";

import { useState } from "react";
import { MarkAsSoldModal } from "./mark-as-sold-modal";

interface Props {
  listingId: string;
  listingTitle: string;
}

export function MarkAsSoldButton({ listingId, listingTitle }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
      >
        Mark as Sold
      </button>

      <MarkAsSoldModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
      />
    </>
  );
}
