import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { MyListing } from "@/types/listing";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MyListingsClient } from "./my-listings-client";

export default async function MyListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch ONLY user's listings (all statuses)
  const { data: listings } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (
        callsign,
        display_name
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Listings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your listings
            </p>
          </div>
          <Link
            href="/listings/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Create Listing
          </Link>
        </div>

        <MyListingsClient listings={listings as MyListing[]} userId={user.id} />
      </main>
    </div>
  );
}
