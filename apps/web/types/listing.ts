export type BrowseListing = {
  id: string;
  title: string;
  price: number;
  currency: string | null;
  category: string;
  condition: string;
  images: string[];
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  created_at: string | null;
  location: { lat: number; lng: number } | null;
  profiles: {
    callsign: string;
    display_name: string | null;
  } | null;
};
