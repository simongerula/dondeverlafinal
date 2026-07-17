import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const { error } = await getSupabase().from("venues").insert({
    name: body.name,
    description: body.description ?? null,
    address: body.address ?? null,
    lat: body.lat,
    lng: body.lng,
    photo_url: body.photo_url ?? null,
    link: body.link ?? null,
    price: body.price ?? null,
    requires_booking: body.requires_booking ?? false,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
