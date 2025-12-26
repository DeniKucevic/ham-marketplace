import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import type { MyListing } from "@/types/listing";
import { redirect } from "next/navigation";
import { MyPurchasesClient } from "./my-purchases-client";

export default async function MyPurchasesPage() {
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

  // Fetch items user BOUGHT
  const { data: purchases } = await supabase
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
    .eq("sold_to", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Purchases
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Items you have bought
          </p>
        </div>

        <MyPurchasesClient
          purchases={purchases as MyListing[]}
          userId={user.id}
        />
      </main>
    </div>
  );
}
