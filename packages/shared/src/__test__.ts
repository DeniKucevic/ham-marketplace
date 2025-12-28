import { CreateListingSchema } from "./index";

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
