"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!userLoc) {
      setError("Permití la ubicación o buscá una ciudad primero");
      return;
    }
    setSubmitting(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("YOUR_PROJECT")) {
      // Mock mode: no backend yet, just simulate success.
      setSubmitting(false);
      onAdded();
      return;
    }

    const { error } = await getSupabase().from("venues").insert({
      name: name.trim(),
      description: description.trim() || null,
      address: address.trim() || null,
      lat: userLoc.lat,
      lng: userLoc.lng,
      photo_url: photoUrl.trim() || null,
      link: link.trim() || null,
      price: price === "" ? null : Number(price),
      requires_booking: requiresBooking,
      status: "pending",
    });

    setSubmitting(false);
    if (error) {
      setError("No se pudo enviar. Intentá de nuevo.");
      return;
    }
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay">
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl animate-sheet">
        {/* Gradient header band */}
        <div className="relative bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-3xl sm:rounded-t-3xl px-5 pt-6 pb-5">
          <h2 className="text-xl font-bold text-white">Sumar un lugar</h2>
            <p className="text-xs text-sky-100 mt-0.5">
              Tu propuesta será revisada antes de publicarse.
            </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 text-lg leading-none transition"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Nombre del lugar *
            </label>
            <input
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              placeholder="Ej: La Bombonera del Barrio"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Descripción *
            </label>
            <textarea
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition resize-none"
              placeholder="Contanos qué se vive ahí…"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Dirección *
            </label>
            <input
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              placeholder="Calle y ciudad"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Foto (opcional)
            </label>
            <input
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              placeholder="URL de la imagen"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Link del post (opcional)
            </label>
            <input
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              placeholder="Facebook, Instagram, web…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Entrada (OPCIONAL)
            </label>
            <input
              className="border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              placeholder="Precio de entrada? Si es gratis dejá vacío"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2.5 border border-zinc-100">
            <span className="text-sm text-zinc-700">Requiere reserva</span>
            <div className="flex items-center gap-1 bg-zinc-200/70 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setRequiresBooking(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  !requiresBooking
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => setRequiresBooking(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  requiresBooking
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                SI
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3.5 py-2.5">
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
            className="mt-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl py-3 font-semibold shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 active:scale-[0.99] transition disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
