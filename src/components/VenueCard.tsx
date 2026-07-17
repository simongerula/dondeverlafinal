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
  const [showImageModal, setShowImageModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="snap-center shrink-0 w-[260px] lg:w-full h-[240px] bg-[#0a2540] rounded-2xl shadow-sm hover:shadow-xl ring-1 ring-sky-900/60 hover:ring-sky-500/70 transition-all overflow-hidden group flex flex-col">
      <div className="h-30 bg-sky-900/40 relative overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
        {venue.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.photo_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/default-image.jpg";
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/default-image.jpg"
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {dist && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#0a2540]/85 backdrop-blur text-sky-100 text-xs font-semibold shadow">
            {dist}
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1.5 min-h-0">
        <h3 className="font-semibold text-white text-base leading-tight">
          {venue.name}
        </h3>
        {venue.description && (
          <p className="text-sm text-slate-300 line-clamp-2 flex-1">
            {venue.description}
          </p>
        )}
        {venue.address && (
          <p className="flex items-center gap-1 text-xs text-slate-400">
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
        <div className="flex flex-wrap items-center gap-2 mt-auto text-xs">
          {venue.price != null && (
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-amber-400/20 text-amber-300">
              ${venue.price}
            </span>
          )}
          {venue.requires_booking && (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold">
              Reserva
            </span>
          )}
          {venue.link && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-[#0a2540] font-semibold hover:bg-yellow-300 transition"
            >
              Link del post
            </button>
          )}
        </div>
      </div>

      {mounted && showLinkModal && venue.link && venue.link
        ? createPortal(
            <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay">
               <div className="bg-[#0a2540] w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl ring-1 ring-sky-900/60 animate-sheet">
             <div className="flex items-start gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
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
                <h3 className="font-bold text-white">Salir de la página</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Vas a ser redirigido a la página de la publicación. Si bien
                  validamos el link, no tenemos control sobre el contenido externo.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 break-all bg-sky-900/40 rounded-lg px-3 py-2 mb-4">
              {venue.link}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-sky-200 bg-sky-900/40 hover:bg-sky-900/70 transition"
              >
                Cancelar
              </button>
              <a
                href={venue.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 text-center rounded-xl py-2.5 text-sm font-semibold text-[#0a2540] bg-yellow-400 shadow-md hover:bg-yellow-300 transition"
              >
                Ir al link
              </a>
            </div>
          </div>
        </div>,
            document.body
          )
        : null}

      {mounted && showImageModal
        ? createPortal(
            <div
              className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay"
              onClick={() => setShowImageModal(false)}
            >
              <div
                className="relative max-w-2xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-10 right-0 text-white/70 hover:text-white transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={venue.photo_url || "/images/default-image.jpg"}
                  alt={venue.name}
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
