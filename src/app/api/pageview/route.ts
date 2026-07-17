import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST() {
  const { error } = await getSupabase().from("page_views").insert({});

  if (error) {
    console.error("Failed to record page view:", error.message);
    return NextResponse.json(
      { error: "Failed to record page view" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { count, error } = await getSupabase()
    .from("page_views")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to fetch page view count:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch page view count" },
      { status: 500 },
    );
  }

  return NextResponse.json({ total: count ?? 0 });
}
