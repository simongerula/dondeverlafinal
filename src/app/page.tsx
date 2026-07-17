"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { getSupabase } from "@/lib/supabase";
import { MOCK_VENUES } from "@/lib/mockVenues";
import { distanceKm } from "@/lib/geo";
import type { Venue } from "@/lib/types";
import VenueCard from "@/components/VenueCard";
import AddVenueForm from "@/components/AddVenueForm";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-100 text-zinc-400 text-sm">
      Cargando mapa…
    </div>
  ),
});

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

type SearchResult = { display_name: string; lat: string; lon: string };

export default function Home() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [venues, setVenues] = useState<Venue[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [radius, setRadius] = useState<number>(10);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadVenues = useCallback(async () => {
    setLoadingVenues(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("YOUR_PROJECT")) {
      // No Supabase configured yet — show mocked venues (filtered client-side).
      setVenues(MOCK_VENUES);
      setLoadingVenues(false);
      return;
    }
    const query = getSupabase()
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .filter(
        "geo",
        "st_dwithin",
        `SRID=4326;POINT(${center.lng} ${center.lat})::geometry,${radius * 1000}`
      );
    const { data } = await query;
    setVenues((data as Venue[]) ?? []);
    setLoadingVenues(false);
  }, [center, radius]);

  const filteredVenues = venues.filter(
    (v) => distanceKm(center, { lat: v.lat, lng: v.lng }) <= radius
  );

  useEffect(() => {
    loadVenues();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLoc(loc);
          setCenter(loc);
        },
        () => {
          /* user denied or unavailable — keep default center */
        }
      );
    }
  }, [loadVenues]);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
        q
      )}`
    );
    const data = (await res.json()) as SearchResult[];
    setResults(data);
    setSearching(false);
  }

  // Auto-search as the user types (debounced) or presses Enter.
  function handleQueryChange(q: string) {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(q), 400);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    runSearch(query);
  }

  function pickResult(r: SearchResult) {
    const loc = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    setCenter(loc);
    setUserLoc(loc);
    setResults([]);
    setQuery(r.display_name.split(",").slice(0, 2).join(","));
  }

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-screen w-full bg-gradient-to-b from-sky-50 to-white">
      {/* Top/left: map + search */}
      <div className="relative h-1/2 lg:h-full lg:w-3/5 lg:max-w-none shrink-0">
        <MapView center={center} venues={venues} radius={radius} />

        {/* Search bar overlay — glassmorphism */}
        <div className="absolute top-0 left-0 right-0 p-3 z-[1000]">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-lg px-4 py-2.5">
              <svg
                className="w-4 h-4 text-sky-700 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-500 outline-none"
                placeholder="Buscar ciudad o barrio…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
            </div>
          </form>
          {results.length > 0 && (
            <div className="mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden max-h-60 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => pickResult(r)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-zinc-900 border-b border-zinc-100 last:border-0 hover:bg-sky-50 transition-colors"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom/right: carousel */}
      <div className="flex-1 flex flex-col min-h-0 lg:w-2/5 lg:h-full lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-sky-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h2 className="font-bold text-zinc-900 text-lg leading-tight">
              Dónde ver la final
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm rounded-full px-4 py-2 font-semibold shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 transition-shadow"
          >
            ¿Tenés data?
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-4 pb-2">
          <span className="text-xs text-zinc-500 mr-1">Rango:</span>
          {([10, 50] as const).map((km) => (
            <button
              key={km}
              onClick={() => setRadius(km)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                radius === km
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {km} km
            </button>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
          {loadingVenues ? (
            <p className="text-sm text-zinc-400">Cargando…</p>
          ) : filteredVenues.length === 0 ? (
            <p className="text-sm text-zinc-400">
              {venues.length === 0
                ? "Todavía no hay lugares aprobados. ¡Sumá el primero!"
                : "No hay lugares en ese rango. Probá ampliarlo."}
            </p>
          ) : (
            filteredVenues.map((v) => (
              <div key={v.id} className="lg:snap-start">
                <VenueCard venue={v} userLoc={center} />
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <AddVenueForm
          userLoc={userLoc}
          onClose={() => setShowForm(false)}
          onAdded={() => {
            setShowForm(false);
            alert("¡Gracias! Tu lugar quedó pendiente de aprobación.");
          }}
        />
      )}
    </div>
  );
}
