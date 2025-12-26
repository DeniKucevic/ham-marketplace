import type { Database } from "@ham-marketplace/shared";

export type BrowseListing = Database["public"]["Tables"]["listings"]["Row"] & {
  profiles: {
    callsign: string;
    display_name: string | null;
  } | null;
};

export type MyListing = BrowseListing;
