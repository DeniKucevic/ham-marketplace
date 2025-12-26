"use client";

import { createClient } from "@/lib/supabase/client";
import { Database, UpdateProfileSchema } from "@ham-marketplace/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZodError } from "zod";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Props {
  profile: Profile;
  userId: string;
}

export function ProfileSettingsForm({ profile, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const supabase = createClient();

      const profileData = {
        display_name: formData.get("display_name") as string,
        callsign: (formData.get("callsign") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        location_city: (formData.get("location_city") as string) || undefined,
        location_country:
          (formData.get("location_country") as string) || undefined,
        bio: (formData.get("bio") as string) || undefined,
        show_email: formData.get("show_email") === "on",
        show_phone: formData.get("show_phone") === "on",
      };

      // Validate
      const validated = UpdateProfileSchema.parse(profileData);

      // Update profile
      const { error: dbError } = await supabase
        .from("profiles")
        .update(validated)
        .eq("id", userId);

      if (dbError) throw dbError;

      setSuccess(true);
      router.refresh();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Update profile error:", err);
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Validation error");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
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
            Profile updated successfully!
          </p>
        </div>
      )}

      {/* Display Name */}
      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Display Name *
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
          placeholder="Brixi"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This is how your name will appear on listings
        </p>
      </div>

      {/* Callsign */}
      <div>
        <label
          htmlFor="callsign"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Callsign (Optional)
        </label>
        <input
          type="text"
          id="callsign"
          name="callsign"
          maxLength={20}
          defaultValue={profile?.callsign || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="YU4AIE"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your amateur radio callsign
        </p>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contact Information
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This information will only be visible to logged-in users
        </p>

        <div className="mt-4 space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              maxLength={255}
              defaultValue={profile?.email || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="your.email@example.com"
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
                  Show email on my public profile
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
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              maxLength={50}
              defaultValue={profile?.phone || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="+381 12 345 6789"
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
                  Show phone on my public profile
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Location
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="location_city"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              City
            </label>
            <input
              type="text"
              id="location_city"
              name="location_city"
              maxLength={100}
              defaultValue={profile?.location_city || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Pančevo"
            />
          </div>

          <div>
            <label
              htmlFor="location_country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Country
            </label>
            <input
              type="text"
              id="location_country"
              name="location_country"
              maxLength={100}
              defaultValue={profile?.location_country || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Serbia"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile?.bio || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Tell others about yourself and your experience with amateur radio..."
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {profile?.bio?.length || 0}/500 characters
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
