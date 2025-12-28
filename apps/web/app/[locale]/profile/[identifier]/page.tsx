import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { BrowseListing } from "@/types/listing";
import { notFound } from "next/navigation";
import { PublicProfileClient } from "./public-profile-client";

interface Props {
  params: Promise<{ identifier: string; locale: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { locale, identifier } = await params;
  const supabase = await createClient();

  // Optional auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentUserProfile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  // Try to find by callsign first, then by ID
  let profile = null;

  // Try callsign (if not a UUID)
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

  if (!isUUID) {
    const { data: profileByCallsign } = await supabase
      .from("profiles")
      .select("*")
      .eq("callsign", identifier)
      .single();

    if (profileByCallsign) {
      profile = profileByCallsign;
    }
  }

  // Try by ID if not found by callsign
  if (!profile) {
    const { data: profileById } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", identifier)
      .single();

    profile = profileById;
  }

  if (!profile) {
    notFound();
  }

  // Fetch user's active listings
  const { data: listings } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (
        callsign,
        display_name,
        location_city,
        location_country
      )
    `
    )
    .eq("user_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        user={user}
        profile={currentUserProfile ?? null}
        locale={locale}
      />

      <PublicProfileClient
        profile={profile}
        listings={listings as BrowseListing[]}
        isLoggedIn={!!user}
        isOwnProfile={user?.id === profile.id}
        locale={locale} // ✅ Add locale prop
      />
    </div>
  );
}
