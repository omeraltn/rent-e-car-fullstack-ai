import type { Metadata } from "next";
import { MyBookingsClient } from "@/components/bookings/MyBookingsClient";

export const metadata: Metadata = {
  title: "Rezervasyonlarım | MORENT",
  description: "Tüm araç kiralama rezervasyonlarınızı ve ödeme durumlarını görüntüleyin.",
};

// Access is protected by src/proxy.ts (unauthenticated users are sent to /login).
export default function MyBookingsPage() {
  return <MyBookingsClient />;
}

