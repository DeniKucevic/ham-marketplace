import { HeroSearch } from "@/components/hero-search";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { BrowseListing } from "@/types/listing";
import { getTranslations } from "next-intl/server";
import { BrowseListingsClient } from "../../components/browse-listings-client";

const ITEMS_PER_PAGE = 24;

interface SearchParams {
  page?: string;
  search?: string;
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("browse");

  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || "1");
  const searchQuery = searchParamsResolved.search || "";
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  // Build query with search
  let query = supabase
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
    `,
      { count: "exact" }
    )
    .eq("status", "active");

  // Add search filter if present
  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`
    );
  }

  const { count } = await query;

  // Fetch paginated listings
  const { data: listings } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile ?? null} locale={locale} />

      {/* Hero Section */}
      <HeroSearch initialQuery={searchQuery} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("browseListings")}
          </h1>
        </div>

        <BrowseListingsClient
          listings={listings as BrowseListing[]}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
          locale={locale}
        />
      </main>
    </div>
  );
}
