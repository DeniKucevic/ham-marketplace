import { ListingForm } from "@/components/listing-form";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("listing");
  const tCommon = await getTranslations("common");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hasContact =
    (profile?.show_email && profile?.email) ||
    (profile?.show_phone && profile?.phone);
  const hasLocation = !!profile?.location_country;

  if (!hasContact || !hasLocation) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mt-8 rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
          <div className="flex">
            <svg
              className="h-6 w-6 text-yellow-400"
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
              <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">
                {t("requiredInfoMissing")}
              </h2>
              <p className="mt-2 text-yellow-800 dark:text-yellow-300">
                {t("beforeCreatingListing")}
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                {!hasContact && <li>{t("requireContact")}</li>}
                {!hasLocation && <li>{t("requireLocation")}</li>}
              </ul>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/${locale}/settings`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {t("completeProfile")}
                </Link>
                <Link
                  href={`/${locale}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tCommon("goBack")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} locale={locale} />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("createListingTitle")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("listYourEquipment")}
          </p>
        </div>

        <ListingForm userId={user.id} locale={locale} />
      </div>
    </div>
  );
}
