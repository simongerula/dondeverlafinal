import type { Venue } from "@/lib/types";

export const MOCK_VENUES: Venue[] = [
  {
    id: "mock-1",
    created_at: new Date().toISOString(),
    name: "La Bombonera del Barrio",
    description:
      "Pantalla gigante, cerveza artesanal y fernet. Ambiente familiar para verla con los amigos.",
    address: "Av. San Juan 1234, Buenos Aires",
    lat: -34.6362,
    lng: -58.3997,
    photo_url: "https://picsum.photos/seed/bombonera/400/300",
    link: "https://facebook.com/events/ejemplo-bombonera",
    price: null,
    requires_booking: false,
    status: "approved",
    submitted_by: null,
  },
  {
    id: "mock-2",
    created_at: new Date().toISOString(),
    name: "Cervecería El Gol",
    description:
      "Salón con 6 pantallas 4K, mesas reservadas y combo de picada. Entrada con consumición.",
    address: "Calle Florida 500, CABA",
    lat: -34.6084,
    lng: -58.3731,
    photo_url: "https://picsum.photos/seed/cerveceria/400/300",
    link: "https://instagram.com/cerveceriaelgol",
    price: 5000,
    requires_booking: true,
    status: "approved",
    submitted_by: null,
  },
];
