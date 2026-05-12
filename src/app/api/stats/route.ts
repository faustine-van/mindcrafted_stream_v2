import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // cache for 1 hour — no need to hit DB on every request

export async function GET() {
  const supabase = await createClient();

  // Run both counts in parallel
  const [{ count: titlesCount }, { count: usersCount }] = await Promise.all([
    supabase
      .from("watchlist_items")
      .select("*", { count: "exact", head: true }), // head:true = no rows returned, just count
    supabase
      .from("profiles") // or use auth.users if you have a profiles table
      .select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    titlesTracked: titlesCount ?? 0,
    totalUsers: usersCount ?? 0,
  });
}