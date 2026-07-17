import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { p_lat, p_lng, p_radius_m } = await request.json();

  const { data, error } = await getSupabase().rpc("venues_within_radius", {
    p_lat,
    p_lng,
    p_radius_m,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
