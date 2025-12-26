import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("views")
    .eq("id", id)
    .single();

  if (listing) {
    await supabase
      .from("listings")
      .update({ views: (listing.views || 0) + 1 })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
