import { calculateDistance, CreateListingSchema, formatPrice } from "./index";

// Test validation
const listing = CreateListingSchema.parse({
  title: "Yaesu FT-991A HF/VHF/UHF Transceiver",
  category: "transceiver_hf",
  price: 1200,
  currency: "EUR",
  condition: "excellent",
  images: ["https://example.com/image.jpg"],
  frequency_bands: ["160m", "80m", "40m", "20m"],
  modes: ["SSB", "CW", "Digital"],
});

console.log("✅ Listing validation passed");
console.log("Price:", formatPrice(listing.price, listing.currency));
console.log(
  "Distance BG-NS:",
  calculateDistance(44.787197, 20.457273, 45.267136, 19.833549),
  "km"
);
