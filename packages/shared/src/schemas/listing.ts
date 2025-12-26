import { z } from "zod";

// Enums
export const ListingCategory = z.enum([
  "transceiver_hf",
  "transceiver_vhf_uhf",
  "transceiver_handheld",
  "antenna_hf",
  "antenna_vhf_uhf",
  "antenna_accessories",
  "power_supply",
  "amplifier",
  "tuner",
  "rotator",
  "swr_meter",
  "digital_modes",
  "microphone",
  "cables_connectors",
  "tools",
  "books_manuals",
  "other",
]);

export const ItemCondition = z.enum([
  "new",
  "excellent",
  "good",
  "fair",
  "parts_repair",
]);

export const ListingStatus = z.enum([
  "draft",
  "active",
  "sold",
  "expired",
  "removed",
]);

export const Currency = z.enum(["EUR", "USD", "GBP", "RSD"]);

export const FrequencyBand = z.enum([
  "160m",
  "80m",
  "60m",
  "40m",
  "30m",
  "20m",
  "17m",
  "15m",
  "12m",
  "10m",
  "6m",
  "4m",
  "2m",
  "1.25m",
  "70cm",
  "33cm",
  "23cm",
]);

export const Mode = z.enum([
  "SSB",
  "CW",
  "FM",
  "AM",
  "Digital",
  "FT8",
  "RTTY",
  "PSK31",
  "SSTV",
]);

// Listing schema for creation
export const CreateListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  description: z.string().max(5000).optional(),
  category: z.enum([
    "transceiver_hf",
    "transceiver_vhf_uhf",
    "transceiver_handheld",
    "antenna_hf",
    "antenna_vhf_uhf",
    "antenna_accessories",
    "power_supply",
    "amplifier",
    "tuner",
    "rotator",
    "swr_meter",
    "digital_modes",
    "microphone",
    "cables_connectors",
    "tools",
    "books_manuals",
    "other",
  ]),
  condition: z.enum(["new", "excellent", "good", "fair", "parts_repair"]),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.enum(["EUR", "USD", "GBP", "RSD"]),
  images: z.array(z.string().url()).min(0).max(10),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
  year_manufactured: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  power_output: z.number().int().positive().optional(),
  frequency_bands: z.array(z.string()).optional(),
  modes: z.array(z.string()).optional(),
});

// Listing schema for updates
export const UpdateListingSchema = CreateListingSchema.partial();

// Search/Filter schema
export const ListingFilterSchema = z.object({
  category: ListingCategory.optional(),
  condition: z.array(ItemCondition).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  currency: Currency.optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  frequency_bands: z.array(FrequencyBand).optional(),
  modes: z.array(Mode).optional(),
  search: z.string().optional(),
  status: ListingStatus.optional(),
  // Location-based
  near_lat: z.number().optional(),
  near_lng: z.number().optional(),
  radius_km: z.number().optional(),
});

// Type exports
export type CreateListing = z.infer<typeof CreateListingSchema>;
export type UpdateListing = z.infer<typeof UpdateListingSchema>;
export type ListingFilter = z.infer<typeof ListingFilterSchema>;
