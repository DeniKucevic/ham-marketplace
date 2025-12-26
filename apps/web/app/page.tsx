import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { BrowseListing } from "@/types/listing";
import { redirect } from "next/navigation";
import { BrowseListingsClient } from "./browse-listings-client";

export default async function HomePage() {
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
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Listings
          </h1>
        </div>

        <BrowseListingsClient listings={listings as BrowseListing[]} />
      </main>
    </div>
  );
}
