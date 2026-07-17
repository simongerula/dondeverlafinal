import { getSupabase } from "@/lib/supabase";
import type { Venue } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Todos los lugares para ver la final del Mundial 2026",
  description:
    "Listado completo de bares, pubs, restaurantes y locales para ver la final del Mundial 2026. Encontrá el más cerca tuyo en Argentina y en todo el mundo.",
  alternates: { canonical: "/lugares" },
};

export const revalidate = 60;

async function getAllVenues(): Promise<Venue[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data as Venue[]) ?? [];
  } catch {
    return [];
  }
}

export default async function LugaresPage() {
  const venues = await getAllVenues();

  return (
    <main className="min-h-screen bg-[#0b1a2e] text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">
            Lugares para ver la final del Mundial 2026
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            La final de la Copa del Mundo FIFA 2026 se juega el{" "}
            <strong>19 de julio de 2026</strong> en el MetLife Stadium, Nueva
            Jersey, Estados Unidos. Estos son todos los bares, pubs,
            restaurantes y locales registrados para transmitir el partido. Si
            conocés un lugar que no está en la lista,{" "}
            <Link href="/" className="text-sky-400 underline hover:text-sky-300">
              sumalo desde la app
            </Link>
            .
          </p>
        </header>

        {venues.length === 0 ? (
          <section className="bg-[#0a2540] rounded-2xl p-8 text-center">
            <p className="text-xl text-slate-300">
              Todavía no hay lugares aprobados. ¡Sé el primero en{" "}
              <Link href="/" className="text-yellow-400 underline">
                sumar uno
              </Link>
              !
            </p>
          </section>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-6">
              {venues.length} lugares registrados
            </p>
            <section className="grid gap-4">
              {venues.map((v) => (
                <article
                  key={v.id}
                  className="bg-[#0a2540] rounded-2xl p-6 ring-1 ring-sky-900/60"
                >
                  <h2 className="text-xl font-bold text-sky-100 mb-1">
                    {v.name}
                  </h2>
                  {v.description && (
                    <p className="text-slate-300 mb-2">{v.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    {v.address && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {v.address}
                      </span>
                    )}
                    {v.price != null && (
                      <span className="bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        ${v.price}
                      </span>
                    )}
                    {v.requires_booking && (
                      <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Requiere reserva
                      </span>
                    )}
                  </div>
                  {v.link && (
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-sky-400 underline hover:text-sky-300"
                    >
                      Ver publicación original
                    </a>
                  )}
                </article>
              ))}
            </section>
          </>
        )}

        <footer className="mt-16 pt-8 border-t border-sky-900/60 text-center text-sm text-slate-500">
          <p>
            Dónde Ver La Final — App gratuita para encontrar dónde ver la final
            del Mundial 2026.
          </p>
          <p className="mt-1">
            <Link href="/" className="text-sky-400 underline hover:text-sky-300">
              Volver al mapa
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
