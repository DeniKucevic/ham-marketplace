import { ListingForm } from "@/components/listing-form";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
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

  // Fetch listing
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Security check - only owner can edit
  if (listing.user_id !== user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Listing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update your listing information
          </p>
        </div>

        <ListingForm listing={listing} userId={user.id} />
      </div>
    </div>
  );
}
