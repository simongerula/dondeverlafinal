"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { MOCK_VENUES } from "@/lib/mockVenues";
import { distanceKm } from "@/lib/geo";
import type { Venue } from "@/lib/types";
import VenueCard from "@/components/VenueCard";
import AddVenueForm from "@/components/AddVenueForm";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [radius, setRadius] = useState<number>(50);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const TARGET = new Date("2026-07-19T19:00:00Z");
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    function tick() {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("¡Empezó!");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const loadVenues = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingVenues(true);
    try {
      const res = await fetch("/api/venues/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p_lat: center.lat,
          p_lng: center.lng,
          p_radius_m: radius * 1000,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        setVenues(MOCK_VENUES);
      } else {
        const data = await res.json();
        setVenues((data as Venue[]) ?? []);
      }
    } catch {
      if (controller.signal.aborted) return;
      setVenues(MOCK_VENUES);
    } finally {
      if (!controller.signal.aborted) setLoadingVenues(false);
    }
  }, [center, radius]);

  const filteredVenues = venues.filter(
    (v) => distanceKm(center, { lat: v.lat, lng: v.lng }) <= radius
  );

  // Run once on mount: load venues and grab geolocation.
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
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload venues whenever the location or radius changes.
  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  async function runSearch(q: string): Promise<SearchResult[]> {
    if (!q.trim()) {
      setResults([]);
      return [];
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
    return data;
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
    runSearch(query).then((data) => {
      if (data.length > 0) pickResult(data[0]);
    });
  }

  function pickResult(r: SearchResult) {
    const loc = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    setCenter(loc);
    setUserLoc(loc);
    setResults([]);
    setQuery(r.display_name.split(",").slice(0, 2).join(","));
  }

  function goToCurrentLocation() {
    if (!navigator.geolocation) return;
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
        /* user denied or unavailable */
      }
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen w-full bg-[#0b1a2e] text-slate-100">
      <header className="flex items-center justify-center px-4 py-3 bg-[#0a2540] border-b border-sky-900/60">
        <div className="flex items-center gap-2 text-base font-bold text-yellow-400">
          <img src="/images/peepoArgentina.gif" alt="" className="w-7 h-7 object-contain" />
          Faltan: <span className="tabular-nums">{countdown}</span>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Top/left: map + search */}
      <div className="relative h-[40vh] lg:h-full lg:w-3/5 lg:max-w-none shrink-0">
        <MapView center={center} venues={filteredVenues} />

        {/* Search bar overlay — glassmorphism */}
        <div className="absolute top-0 left-0 right-0 p-3 z-[1000]">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-full bg-[#0a2540]/80 backdrop-blur-md border border-sky-500/40 shadow-lg px-4 py-2.5">
              <svg
                className="w-4 h-4 text-sky-300 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder-sky-200/60 outline-none"
                placeholder="Buscar ciudad o barrio…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              <button
                type="button"
                onClick={goToCurrentLocation}
                aria-label="Ir a mi ubicación"
                className="shrink-0 text-sky-300 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </button>
            </div>
          </form>
          {results.length > 0 && (
            <div className="mt-2 bg-[#0a2540]/90 backdrop-blur-md rounded-2xl shadow-xl border border-sky-500/40 overflow-hidden max-h-60 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => pickResult(r)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-slate-100 border-b border-sky-900/60 last:border-0 hover:bg-sky-900/50 transition-colors"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom/right: carousel */}
      <div className="flex-1 flex flex-col min-h-0 lg:w-2/5 lg:h-full lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-sky-900/60 bg-[#0b1a2e]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-extrabold text-sky-100 text-xl tracking-tight">
            ¿Dónde veo la final?
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-[#0a2540] text-sm rounded-full px-4 py-2 font-semibold shadow-md hover:bg-yellow-300 transition-colors"
            >
              ¿Tenés data?
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
          {loadingVenues ? (
            <p className="text-sm text-slate-400">Cargando…</p>
          ) : filteredVenues.length === 0 ? (
            <p className="text-sm text-slate-400">
              {venues.length === 0
                ? "Todavía no hay lugares en el area. ¡Sumá el primero!"
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
            setShowSuccessModal(true);
          }}
        />
      )}

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-[#0a2540] w-full max-w-sm rounded-3xl p-6 shadow-2xl ring-1 ring-sky-900/60 animate-sheet flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/images/messi_cool.png"
              alt="Messi"
              className="w-32 h-32 object-contain"
            />
            <p className="text-white text-lg font-semibold leading-snug">
              ¡Gracias, la revisaremos en un segundo y estara publicada!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-[#0a2540] bg-yellow-400 hover:bg-yellow-300 transition"
            >
              ¡Perfecto!
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
