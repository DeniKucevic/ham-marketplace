import { CreateListingForm } from "@/components/create-listing-form";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} profile={profile} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Listing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            List your HAM radio equipment for sale
          </p>
        </div>

        <CreateListingForm userId={user.id} />
      </div>
    </div>
  );
}
