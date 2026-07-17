"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveVenue, rejectVenue } from "./actions";
import type { Venue } from "@/lib/types";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-300",
  approved: "bg-emerald-400/20 text-emerald-300",
  rejected: "bg-red-400/20 text-red-300",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export default function AdminVenueCard({ venue }: { venue: Venue }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      await approveVenue(venue.id);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectVenue(venue.id);
      router.refresh();
    });
  }

  return (
    <div className="bg-[#0a2540] rounded-2xl shadow-sm ring-1 ring-sky-900/60 overflow-hidden flex flex-col">
      <div className="h-36 bg-sky-900/40 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.photo_url || "/images/default-image.jpg"}
          alt={venue.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/default-image.jpg";
          }}
        />
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[venue.status]}`}
        >
          {statusLabels[venue.status]}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2 min-h-0">
        <h3 className="font-semibold text-white text-base leading-tight">
          {venue.name}
        </h3>

        {venue.description && (
          <p className="text-sm text-slate-300 line-clamp-2">
            {venue.description}
          </p>
        )}

        {venue.address && (
          <p className="text-xs text-slate-400 truncate">{venue.address}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs mt-1">
          {venue.price != null && (
            <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-400/20 text-amber-300">
              ${venue.price}
            </span>
          )}
          {venue.requires_booking && (
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold">
              Reserva
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={handleApprove}
            disabled={isPending || venue.status === "approved"}
            className="flex-1 rounded-xl py-2 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Aprobar
          </button>
          <button
            onClick={handleReject}
            disabled={isPending || venue.status === "rejected"}
            className="flex-1 rounded-xl py-2 text-xs font-semibold text-red-300 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
