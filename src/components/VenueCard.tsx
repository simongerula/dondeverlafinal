"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Venue } from "@/lib/types";
import { distanceKm, formatDistance } from "@/lib/geo";

export default function VenueCard({
  venue,
  userLoc,
}: {
  venue: Venue;
  userLoc: { lat: number; lng: number } | null;
}) {
  const dist = userLoc
    ? formatDistance(distanceKm(userLoc, { lat: venue.lat, lng: venue.lng }))
    : null;
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="snap-center shrink-0 w-[260px] lg:w-full bg-white rounded-2xl shadow-sm hover:shadow-xl shadow-zinc-200/60 ring-1 ring-zinc-100 hover:ring-sky-200 transition-all overflow-hidden group">
      <div className="h-32 bg-gradient-to-br from-sky-100 to-blue-100 relative overflow-hidden">
        {venue.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.photo_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sky-400 text-sm font-medium">
            Sin foto
          </div>
        )}
        {dist && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-zinc-700 text-xs font-semibold shadow">
            {dist}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="font-semibold text-zinc-900 text-base leading-tight">
          {venue.name}
        </h3>
        {venue.description && (
          <p className="text-sm text-zinc-600 line-clamp-2">
            {venue.description}
          </p>
        )}
        {venue.address && (
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            <span className="truncate">{venue.address}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
          <span
            className={`px-2.5 py-0.5 rounded-full font-semibold ${
              venue.price == null
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {venue.price == null ? "Gratis" : `$${venue.price}`}
          </span>
          {venue.requires_booking && (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
              Reserva
            </span>
          )}
          {venue.link && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition"
            >
              Link del post
            </button>
          )}
        </div>
      </div>

      {mounted && showLinkModal && venue.link && venue.link
        ? createPortal(
            <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay">
              <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-sheet">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Salir de la página</h3>
                <p className="text-sm text-zinc-600 mt-0.5">
                  Vas a ser redirigido a la página de la publicación. No tenemos
                  control sobre el contenido externo.
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 break-all bg-zinc-50 rounded-lg px-3 py-2 mb-4">
              {venue.link}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition"
              >
                Cancelar
              </button>
              <a
                href={venue.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 text-center rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-md shadow-sky-500/30 hover:shadow-lg transition"
              >
                Ir al link
              </a>
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </div>
  );
}
