"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Venue } from "@/lib/types";

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const venueIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#dc2626;border:3px solid #fff;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FitToRadius({
  lat,
  lng,
  radius,
}: {
  lat: number;
  lng: number;
  radius: number;
}) {
  const map = useMap();
  const prevRadius = useRef<number | null>(null);
  useEffect(() => {
    // Only re-zoom when the user picks a new range, not on pan/center change.
    if (prevRadius.current === radius) return;
    prevRadius.current = radius;
    map.flyToBounds(L.latLng(lat, lng).toBounds(radius * 2), {
      padding: [20, 20],
      maxZoom: 13,
      duration: 0.5,
    });
  }, [lat, lng, radius, map]);
  return null;
}

export default function MapView({
  center,
  venues,
  radius,
}: {
  center: { lat: number; lng: number };
  venues: Venue[];
  radius: number;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToRadius lat={center.lat} lng={center.lng} radius={radius} />
      <Circle
        center={[center.lat, center.lng]}
        radius={radius * 1000}
        pathOptions={{
          color: "#2563eb",
          weight: 2,
          fillColor: "#2563eb",
          fillOpacity: 0.08,
        }}
      />
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>Tu ubicación</Popup>
      </Marker>
      {venues.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={venueIcon}>
          <Popup>{v.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
