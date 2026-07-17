import { getSupabase } from "@/lib/supabase";
import type { Venue } from "@/lib/types";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

async function getInitialVenues(): Promise<Venue[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];
    return (data as Venue[]) ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialVenues = await getInitialVenues();

  return (
    <>
      <section className="sr-only" aria-label="Lugares aprobados para ver la final">
        <h1>¿Dónde Ver la Final del Mundial 2026?</h1>
        <p>
          Encontrá dónde ver la final del Mundial en Argentina. Bares, pubs y
          locales cerca tuyo con mapa interactivo.
        </p>
        {initialVenues.length > 0 ? (
          <ul>
            {initialVenues.map((v) => (
              <li key={v.id}>
                <article>
                  <h2>{v.name}</h2>
                  {v.description && <p>{v.description}</p>}
                  {v.address && <p>Dirección: {v.address}</p>}
                  {v.price != null && <p>Precio: ${v.price}</p>}
                  {v.requires_booking && <p>Requiere reserva</p>}
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p>Todavía no hay lugares aprobados. ¡Sé el primero en sumar uno!</p>
        )}
      </section>
      <HomeClient initialVenues={initialVenues} />
    </>
  );
}
