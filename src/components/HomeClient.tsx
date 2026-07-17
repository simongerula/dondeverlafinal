"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { distanceKm } from "@/lib/geo";
import type { Venue } from "@/lib/types";
import VenueCard from "@/components/VenueCard";
import AddVenueForm from "@/components/AddVenueForm";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

type SearchResult = { display_name: string; lat: string; lon: string };

export default function HomeClient({
  initialVenues,
}: {
  initialVenues: Venue[];
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [radius, setRadius] = useState<number>(50);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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

  useEffect(() => {
    if (!localStorage.getItem("welcome_modal_seen")) {
      setShowWelcomeModal(true);
    }
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
          p_radius_m: 2000000,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        if (res.status === 429) {
          const body = await res.json().catch(() => null);
          setRateLimitMsg(body?.error ?? "Demasiadas requests");
          setTimeout(() => setRateLimitMsg(null), 5000);
        }
        setVenues([]);
      } else {
        const data = await res.json();
        setVenues((data as Venue[]) ?? []);
      }
    } catch {
      if (controller.signal.aborted) return;
      setVenues([]);
    } finally {
      if (!controller.signal.aborted) setLoadingVenues(false);
    }
  }, [center]);

  const filteredVenues = venues.filter(
    (v) => distanceKm(center, { lat: v.lat, lng: v.lng }) <= radius
  );

  useEffect(() => {
    const recordPageView = (loc?: { lat: number; lng: number }) => {
      if (sessionStorage.getItem("pageview_recorded")) return;
      fetch("/api/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loc ?? {}),
      });
      sessionStorage.setItem("pageview_recorded", "1");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLoc(loc);
          setCenter(loc);
          recordPageView(loc);
        },
        () => {
          recordPageView();
        }
      );
    } else {
      recordPageView();
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      () => {}
    );
  }

  function scrollToVenue(venueId: string) {
    const venue = venues.find((v) => v.id === venueId);
    if (venue && distanceKm(center, { lat: venue.lat, lng: venue.lng }) > radius) {
      setCenter({ lat: venue.lat, lng: venue.lng });
      setMapZoom(13);
      setTimeout(() => setMapZoom(undefined), 700);
    } else {
      const el = document.getElementById(`venue-${venueId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen w-full bg-[#0b1a2e] text-slate-100">
      <header className="flex items-center justify-center px-4 py-3 bg-[#0a2540] border-b border-sky-900/60">
        <div className="flex items-center gap-2 text-base font-bold text-yellow-400">
          <img
            src="/images/peepoArgentina.gif"
            alt=""
            className="w-7 h-7 object-contain cursor-pointer"
            onClick={() => setShowWelcomeModal(true)}
          />
          Falta: <span className="tabular-nums">{countdown}</span>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      <div className="relative h-[40vh] lg:h-full lg:w-3/5 lg:max-w-none shrink-0">
        <MapView center={center} zoom={mapZoom} venues={venues} onCenterChange={setCenter} onVenueClick={scrollToVenue} />

        {rateLimitMsg && (
          <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-yellow-400/90 backdrop-blur-md text-[#0a2540] text-sm font-semibold text-center rounded-xl px-4 py-3 shadow-lg">
            {rateLimitMsg}
          </div>
        )}

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
                className="flex-1 bg-transparent text-base text-white placeholder-sky-200/60 outline-none"
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
              <div key={v.id} id={`venue-${v.id}`} className="lg:snap-start">
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

      {showWelcomeModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay"
          onClick={() => {
            localStorage.setItem("welcome_modal_seen", "1");
            setShowWelcomeModal(false);
          }}
        >
          <div
            className="bg-[#0a2540] w-full max-w-sm rounded-3xl p-6 shadow-2xl ring-1 ring-sky-900/60 animate-sheet flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="https://scontent.fwlg3-2.fna.fbcdn.net/v/t39.30808-6/749076836_4581052322140297_8856807534170735628_n.jpg?stp=dst-jpg_tt6&cstp=mx572x1024&ctp=s572x1024&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=XQSbq-WgxqIQ7kNvwG05gaa&_nc_oc=Adoywai7doW2nWuN1wGuO4iElc-qDQ1pRq2_dPf-xr3nFr6_36u3u-ZNL0jL9s5svkcVv0I-Mp1nRR15TqBHjxJu&_nc_zt=23&_nc_ht=scontent.fwlg3-2.fna&_nc_gid=XHa7teIOdvLI5Kdfc7TobA&_nc_ss=7b2a8&oh=00_AQBqyYzl1x-TD1Yge5JgVMXOdMUV9fc4HovqgsRGyVHsDQ&oe=6A60859C"
              alt="Bienvenido"
              className="w-full max-h-[60vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => {
                localStorage.setItem("welcome_modal_seen", "1");
                setShowWelcomeModal(false);
              }}
              className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-[#0a2540] bg-yellow-400 hover:bg-yellow-300 transition"
            >
              ¡Vamos Argentina!
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
