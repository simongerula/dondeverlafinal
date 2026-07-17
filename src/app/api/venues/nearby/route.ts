import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const nearbySchema = z.object({
  p_lat: z.number().min(-90).max(90),
  p_lng: z.number().min(-180).max(180),
  p_radius_m: z.number().min(1).max(50000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = nearbySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { data, error } = await getSupabase().rpc("venues_within_radius", {
    p_lat: result.data.p_lat,
    p_lng: result.data.p_lng,
    p_radius_m: result.data.p_radius_m,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
