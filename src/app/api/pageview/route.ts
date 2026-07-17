import { NextResponse, type NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let lat: number | null = null;
  let lng: number | null = null;

  try {
    const body = await req.json();
    if (typeof body.lat === "number" && typeof body.lng === "number") {
      lat = body.lat;
      lng = body.lng;
    }
  } catch {
    // body may be empty — that's fine
  }

  const { error } = await getSupabase().from("page_views").insert({ lat, lng });

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
