# DondeVerLaFinal

> **Repo temporal** — se elimina después de la final del Mundial. ¡Gracias!

Para que los argentinos encuentren dónde ver la final de la
Copa del Mundo. Mitad superior: mapa con tu ubicación y buscador de ciudad/barrio.
Mitad inferior: carousel de locales con foto, descripción, precio, si requiere
reserva y la distancia. Cualquiera puede sumar un lugar, que queda `pending`
hasta que lo apruebes en Supabase.

## Stack

- Next.js (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase (Postgres + RLS) para guardar los locales
- Leaflet / react-leaflet para el mapa (tiles de OpenStreetMap, sin API key)
- Nominatim (OpenStreetMap) para el buscador de ubicación (sin API key)

## Notas

- La distancia a cada local se calcula en el cliente con la fórmula de Haversine.
