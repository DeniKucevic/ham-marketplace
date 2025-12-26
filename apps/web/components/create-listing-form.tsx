"use client";

import { createClient } from "@/lib/supabase/client";
import {
    CreateListingSchema,
    POPULAR_MANUFACTURERS,
    getModelsByCategory,
} from "@ham-marketplace/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZodError } from "zod";
import { AutocompleteInput } from "./autocomplete-input";

const CATEGORIES = [
  { value: "transceiver_hf", label: "HF Transceiver" },
  { value: "transceiver_vhf_uhf", label: "VHF/UHF Transceiver" },
  { value: "transceiver_handheld", label: "Handheld Transceiver" },
  { value: "antenna_hf", label: "HF Antenna" },
  { value: "antenna_vhf_uhf", label: "VHF/UHF Antenna" },
  { value: "antenna_accessories", label: "Antenna Accessories" },
  { value: "power_supply", label: "Power Supply" },
  { value: "amplifier", label: "Amplifier" },
  { value: "tuner", label: "Antenna Tuner" },
  { value: "rotator", label: "Rotator" },
  { value: "swr_meter", label: "SWR Meter" },
  { value: "digital_modes", label: "Digital Modes Equipment" },
  { value: "microphone", label: "Microphone" },
  { value: "cables_connectors", label: "Cables & Connectors" },
  { value: "tools", label: "Tools" },
  { value: "books_manuals", label: "Books & Manuals" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "parts_repair", label: "For Parts/Repair" },
];

const CURRENCIES = [
  { value: "EUR", label: "€ EUR" },
  { value: "USD", label: "$ USD" },
  { value: "GBP", label: "£ GBP" },
  { value: "RSD", label: "дин RSD" },
];

const FREQUENCY_BANDS = [
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
];

const MODES = [
  "SSB",
  "CW",
  "FM",
  "AM",
  "Digital",
  "FT8",
  "RTTY",
  "PSK31",
  "SSTV",
];

interface Props {
  userId: string;
}

export function CreateListingForm({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedBands, setSelectedBands] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [manufacturerValue, setManufacturerValue] = useState("");
  const [modelValue, setModelValue] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imageFiles.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setManufacturerValue("");
    setModelValue("");
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const supabase = createClient();
      const imageUrls: string[] = [];

      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("listing-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-images").getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Prepare listing data
      const listingData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        price: parseFloat(formData.get("price") as string),
        currency: formData.get("currency") as string,
        condition: formData.get("condition") as string,
        images: imageUrls,
        manufacturer: (formData.get("manufacturer") as string) || undefined,
        model: (formData.get("model") as string) || undefined,
        power_output: formData.get("power_output")
          ? parseInt(formData.get("power_output") as string)
          : undefined,
        year_manufactured: formData.get("year_manufactured")
          ? parseInt(formData.get("year_manufactured") as string)
          : undefined,
        frequency_bands: selectedBands.length > 0 ? selectedBands : undefined,
        modes: selectedModes.length > 0 ? selectedModes : undefined,
      };

      // Validate with Zod
      const validated = CreateListingSchema.parse(listingData);

      // Insert into database
      const { error: dbError, data: listing } = await supabase
        .from("listings")
        .insert({
          ...validated,
          user_id: userId,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      router.push(`/listings/${listing.id}`);
    } catch (err: unknown) {
      console.error("Create listing error:", err);
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Validation error");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create listing");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilteredModels = () => {
    const categoryModels = getModelsByCategory(selectedCategory);

    if (!manufacturerValue || manufacturerValue.length < 2) {
      return categoryModels;
    }

    // Additional filtering based on manufacturer prefix
    // For example: "Yaesu" manufacturer should show FT-xxx models
    const manufacturerPrefixes: Record<string, string[]> = {
      Yaesu: ["FT", "VX"],
      Icom: ["IC", "ID"],
      Kenwood: ["TS", "TM", "TH"],
      Elecraft: ["K"],
      Xiegu: ["G", "X"],
      FlexRadio: ["6"],
      Baofeng: ["UV", "BF"],
      Anytone: ["AT"],
      MFJ: ["MFJ"],
      Cushcraft: ["A", "R"],
      Diamond: ["X"],
      Comet: ["GP"],
      Hustler: ["6BTV"],
      Ameritron: ["AL"],
      Alpha: ["8", "87"],
      LDG: ["AT"],
    };

    const prefixes = manufacturerPrefixes[manufacturerValue];
    if (!prefixes) {
      return categoryModels;
    }

    return categoryModels.filter((model) =>
      prefixes.some((prefix) => model.startsWith(prefix))
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Images (Optional - max 10)
        </label>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-400"
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          minLength={10}
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Yaesu FT-991A HF/VHF/UHF All Mode Transceiver"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={5000}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Detailed description of the equipment, condition, included accessories, etc."
        />
      </div>

      {/* Category & Condition */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="condition"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select condition</option>
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price & Currency */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="1200.00"
          />
        </div>

        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Currency *
          </label>
          <select
            id="currency"
            name="currency"
            required
            defaultValue="EUR"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manufacturer & Model */}
      <div className="grid gap-6 sm:grid-cols-2">
        <AutocompleteInput
          id="manufacturer"
          name="manufacturer"
          label="Manufacturer"
          placeholder="Yaesu, Icom, Kenwood..."
          suggestions={POPULAR_MANUFACTURERS}
          value={manufacturerValue}
          onChange={setManufacturerValue}
          maxLength={100}
        />

        <AutocompleteInput
          id="model"
          name="model"
          label="Model"
          placeholder="FT-991A, IC-7300..."
          suggestions={getFilteredModels()}
          value={modelValue}
          onChange={setModelValue}
          maxLength={100}
        />
      </div>

      {/* Power Output & Year */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="power_output"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Power Output (Watts)
          </label>
          <input
            type="number"
            id="power_output"
            name="power_output"
            min="1"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="100"
          />
        </div>

        <div>
          <label
            htmlFor="year_manufactured"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Year Manufactured
          </label>
          <input
            type="number"
            id="year_manufactured"
            name="year_manufactured"
            min="1900"
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="2020"
          />
        </div>
      </div>

      {/* Frequency Bands */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Frequency Bands
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {FREQUENCY_BANDS.map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => {
                setSelectedBands((prev) =>
                  prev.includes(band)
                    ? prev.filter((b) => b !== band)
                    : [...prev, band]
                );
              }}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedBands.includes(band)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {band}
            </button>
          ))}
        </div>
      </div>

      {/* Modes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Modes
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setSelectedModes((prev) =>
                  prev.includes(mode)
                    ? prev.filter((m) => m !== mode)
                    : [...prev, mode]
                );
              }}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedModes.includes(mode)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
