"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Venue } from "@/lib/types";

export default function MapView({
  center,
  zoom,
  venues,
  onCenterChange,
  onVenueClick,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  venues: Venue[];
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  onVenueClick?: (venueId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const prevCenter = useRef(center);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([center.lat, center.lng], 13);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);
    mapRef.current = map;

    map.on("moveend", () => {
      if (!onCenterChange) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const newCenter = map.getCenter();
        onCenterChange({ lat: newCenter.lat, lng: newCenter.lng });
      }, 300);
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (
      prevCenter.current.lat === center.lat &&
      prevCenter.current.lng === center.lng
    ) {
      return;
    }
    prevCenter.current = center;
    map.flyTo([center.lat, center.lng], zoom ?? map.getZoom(), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="width:28px;height:28px;background:#ffffff;border:3px solid #3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    venues.forEach((v) => {
      const marker = L.marker([v.lat, v.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<strong>${v.name}</strong>`);
      if (onVenueClick) {
        marker.on("click", () => onVenueClick(v.id));
      }
      markersRef.current.push(marker);
    });
  }, [venues]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: "#e38191" }}
    />
  );
}
