"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-900/40 text-sky-300 hover:bg-sky-900/70 transition"
    >
      Cerrar sesión
    </button>
  );
}
