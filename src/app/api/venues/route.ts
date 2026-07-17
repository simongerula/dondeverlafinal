import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { z } from "zod";

const ALLOWED_URL_SCHEMES = ["http:", "https:"];

function isAllowedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ALLOWED_URL_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

const createVenueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .nullable()
    .optional(),
  address: z
    .string()
    .trim()
    .max(500, "Address must be 500 characters or fewer")
    .nullable()
    .optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photo_url: z
    .string()
    .trim()
    .max(2000, "URL must be 2000 characters or fewer")
    .refine((v) => isAllowedUrl(v), "Invalid photo URL")
    .nullable()
    .optional(),
  link: z
    .string()
    .trim()
    .max(2000, "URL must be 2000 characters or fewer")
    .refine((v) => isAllowedUrl(v), "Invalid link URL")
    .nullable()
    .optional(),
  price: z
    .number()
    .min(0, "Price must be non-negative")
    .max(100000, "Price is too large")
    .nullable()
    .optional(),
  requires_booking: z.boolean().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createVenueSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = result.data;

  const { error } = await getSupabase().from("venues").insert({
    name: data.name,
    description: data.description ?? null,
    address: data.address ?? null,
    lat: data.lat,
    lng: data.lng,
    photo_url: data.photo_url ?? null,
    link: data.link ?? null,
    price: data.price ?? null,
    requires_booking: data.requires_booking ?? false,
    status: "pending",
  });

  if (error) {
    console.error("Failed to create venue:", error.message);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
