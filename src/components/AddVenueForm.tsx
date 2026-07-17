"use client";

import { useState, useRef, useCallback } from "react";

type AddressSuggestion = { display_name: string; lat: string; lon: string };

export default function AddVenueForm({
  onClose,
  onAdded,
  userLoc,
}: {
  onClose: () => void;
  onAdded: () => void;
  userLoc: { lat: number; lng: number } | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [requiresBooking, setRequiresBooking] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [geocodedLoc, setGeocodedLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearchingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`
      );
      const data = (await res.json()) as AddressSuggestion[];
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
    setSearchingAddress(false);
  }, []);

  function handleAddressChange(value: string) {
    setAddress(value);
    setAddressConfirmed(false);
    setGeocodedLoc(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSuggestions(value), 400);
  }

  function pickAddress(s: AddressSuggestion) {
    setAddress(s.display_name);
    setGeocodedLoc({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setAddressConfirmed(true);
    setSuggestions([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!address.trim()) {
      setError("La dirección es obligatoria");
      return;
    }
    const finalLoc = geocodedLoc ?? userLoc;
    if (!finalLoc) {
      setError("Buscá una dirección para obtener la ubicación exacta");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          address: address.trim() || null,
          lat: finalLoc.lat,
          lng: finalLoc.lng,
          photo_url: photoUrl.trim() || null,
          link: link.trim() || null,
          price: price === "" ? null : Number(price),
          requires_booking: requiresBooking,
        }),
      });

      setSubmitting(false);
      if (!res.ok) {
        setError("No se pudo enviar. Intentá de nuevo.");
        return;
      }
      onAdded();
    } catch {
      setSubmitting(false);
      setError("No se pudo enviar. Intentá de nuevo.");
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay">
      <div className="relative w-full sm:max-w-md bg-[#0a2540] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl ring-1 ring-sky-900/60 animate-sheet">
        {/* Header band */}
        <div className="relative bg-[#08203a] rounded-t-3xl sm:rounded-t-3xl px-5 pt-6 pb-5 border-b border-sky-900/60">
          <h2 className="text-xl font-bold text-white">Sumar un lugar</h2>
            <p className="text-xs text-sky-200 mt-0.5">
              Tu propuesta será revisada antes de publicarse.
            </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-lg leading-none transition"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Nombre del lugar *
            </label>
            <input
              className="border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition"
              placeholder="Ej: Peña Argentina"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Descripción *
            </label>
            <textarea
              className="border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition resize-none"
              placeholder="Contanos qué se vive ahí…"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Dirección *
            </label>
            <div className="relative">
              <input
                className="w-full border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition"
                placeholder="Escribí la dirección para obtener ubicación exacta"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
              />
              {searchingAddress && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {addressConfirmed && geocodedLoc && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Ubicación confirmada
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#0a2540] border border-sky-500/40 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickAddress(s)}
                    className="block w-full text-left px-3.5 py-2.5 text-xs text-slate-100 border-b border-sky-900/60 last:border-0 hover:bg-sky-900/50 transition-colors"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Foto (opcional)
            </label>
            <input
              className="border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition"
              placeholder="URL de la imagen"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Link del post (opcional)
            </label>
            <input
              className="border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition"
              placeholder="Facebook, Instagram, web…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
              Entrada (OPCIONAL)
            </label>
            <input
              className="border border-sky-900/60 bg-[#0b1a2e] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition"
              placeholder="Precio de entrada? Si es gratis dejá vacío"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#0b1a2e] px-3.5 py-2.5 border border-sky-900/60">
            <span className="text-sm text-slate-200">Requiere reserva</span>
            <div className="flex items-center gap-1 bg-sky-900/40 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setRequiresBooking(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  !requiresBooking
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400"
                }`}
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => setRequiresBooking(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  requiresBooking
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400"
                }`}
              >
                SI
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 bg-yellow-400 text-[#0a2540] rounded-xl py-3 font-semibold shadow-md hover:bg-yellow-300 active:scale-[0.99] transition disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
