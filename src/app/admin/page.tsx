import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminVenueCard from "./AdminVenueCard";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: totalViews } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true });

  const allVenues = venues ?? [];
  const pendingCount = allVenues.filter((v) => v.status === "pending").length;
  const approvedCount = allVenues.filter((v) => v.status === "approved").length;
  const rejectedCount = allVenues.filter((v) => v.status === "rejected").length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-[#0b1a2e]/80 backdrop-blur-md border-b border-sky-900/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">Admin</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-2xl bg-[#0a2540] border border-sky-900/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-yellow-400">{approvedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Aprobados</p>
          </div>
          <div className="rounded-2xl bg-[#0a2540] border border-sky-900/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-amber-400">{pendingCount}</p>
            <p className="text-xs text-slate-400 mt-1">Pendientes</p>
          </div>
          <div className="rounded-2xl bg-[#0a2540] border border-sky-900/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-red-400">{rejectedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Rechazados</p>
          </div>
          <div className="rounded-2xl bg-[#0a2540] border border-sky-900/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-sky-400">{totalViews ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Visitas</p>
          </div>
        </div>

        {allVenues.length === 0 ? (
          <p className="text-center text-slate-400 mt-12">
            No hay venues para mostrar.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allVenues.map((venue) => (
              <AdminVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
