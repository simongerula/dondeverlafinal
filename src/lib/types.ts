export type Venue = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  photo_url: string | null;
  link: string | null;
  price: number | null;
  requires_booking: boolean;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
};
