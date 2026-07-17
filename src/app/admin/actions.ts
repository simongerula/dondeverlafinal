"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

export async function approveVenue(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("venues")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
}

export async function rejectVenue(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("venues")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
}
