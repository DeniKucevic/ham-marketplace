import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { BrowseListing } from "@/types/listing";
import { BrowseListingsClient } from "./browse-listings-client";

const ITEMS_PER_PAGE = 24;

interface SearchParams {
  page?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  // Fetch total count
  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Fetch paginated listings
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
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile ?? null} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Listings
          </h1>
        </div>

        <BrowseListingsClient
          listings={listings as BrowseListing[]}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
        />
      </main>
    </div>
  );
}
