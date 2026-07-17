import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST() {
  const { error } = await getSupabase().from("page_views").insert({});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { count, error } = await getSupabase()
    .from("page_views")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ total: count ?? 0 });
}
