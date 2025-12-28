"use client";

import { createClient } from "@/lib/supabase/client";
import {
  COUNTRIES,
  Database,
  UpdateProfileSchema,
} from "@ham-marketplace/shared";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZodError } from "zod";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Props {
  profile: Profile;
  userId: string;
  locale: string;
}

export function ProfileSettingsForm({ profile, userId, locale }: Props) {
  const router = useRouter();
  const t = useTranslations("settingsForm");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contactWarning, setContactWarning] = useState(false);
  const [locationCountry, setLocationCountry] = useState(
    profile?.location_country || ""
  );
  const [locationCity, setLocationCity] = useState(
    profile?.location_city || ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setContactWarning(false);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const supabase = createClient();

      const profileData = {
        display_name: formData.get("display_name") as string,
        callsign: (formData.get("callsign") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        location_city: locationCity || "",
        location_country: locationCountry || undefined,
        bio: (formData.get("bio") as string) || undefined,
        show_email: formData.get("show_email") === "on",
        show_phone: formData.get("show_phone") === "on",
      };

      const hasVisibleContact =
        (profileData.show_email && profileData.email) ||
        (profileData.show_phone && profileData.phone);

      if (!hasVisibleContact) {
        setContactWarning(true);
      }

      // Validate
      const validated = UpdateProfileSchema.parse(profileData);

      // Update profile
      const { error: dbError } = await supabase
        .from("profiles")
        .update(validated)
        .eq("id", userId)
        .select();

      if (dbError) throw dbError;

      setSuccess(true);
      router.refresh();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Update profile error:", err);
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || t("validationError"));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("updateError"));
      }
    } finally {
      setLoading(false);
    }
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

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">
            {t("successMessage")}
          </p>
        </div>
      )}

      {contactWarning && (
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t("noVisibleContact")}
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {t("contactWarningText")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("displayName")} *
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={profile?.display_name || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder={t("displayNamePlaceholder")}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("displayNameHelp")}
        </p>
      </div>

      {/* Callsign */}
      <div>
        <label
          htmlFor="callsign"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("callsignOptional")}
        </label>
        <input
          type="text"
          id="callsign"
          name="callsign"
          maxLength={20}
          defaultValue={profile?.callsign || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder={t("callsignPlaceholder")}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t("callsignHelp")}
        </p>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("contactInformation")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("contactVisibility")}
        </p>

        <div className="mt-4 space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("contactEmail")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              maxLength={255}
              defaultValue={profile?.email || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t("emailPlaceholder")}
            />
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show_email"
                  defaultChecked={profile?.show_email || false}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("showEmailOnProfile")}
                </span>
              </label>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("phoneNumber")}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              maxLength={50}
              defaultValue={profile?.phone || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t("phonePlaceholder")}
            />
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show_phone"
                  defaultChecked={profile?.show_phone || false}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("showPhoneOnProfile")}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("location")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("countryRequired")}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="location_country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("country")} *
            </label>
            <select
              id="location_country"
              value={locationCountry}
              onChange={(e) => setLocationCountry(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t("selectCountry")}</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ {t("requiredForListings")}
            </p>
          </div>

          <div>
            <label
              htmlFor="location_city"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("cityOptional")}
            </label>
            <input
              type="text"
              id="location_city"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              maxLength={100}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t("cityPlaceholder")}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("cityHelp")}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("bio")}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile?.bio || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder={t("bioPlaceholder")}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {profile?.bio?.length || 0}/500 {t("characters")}
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {tCommon("cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? t("saving") : t("saveChanges")}
        </button>
      </div>
    </form>
  );
}
