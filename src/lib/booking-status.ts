/**
 * Client-safe booking status helpers & DTO types (no server imports).
 */

export type BookingDisplayStatus =
  | "paid"
  | "completed"
  | "pending"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

export interface MyBookingVehicleDTO {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  imageUrl: string;
}

export interface MyBookingDTO {
  id: string;
  referenceCode: string;
  displayStatus: BookingDisplayStatus;
  paymentStatus: string;
  bookingStatus: string;
  vehicle: MyBookingVehicleDTO | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  totalDays: number;
  pricePerDay: number;
  addOnsTotal: number;
  subtotal: number;
  taxAmount: number;
  totalPrice: number;
  paymentFailureReason?: string;
  /** Present only while the 30-minute payment window is still open. */
  checkoutUrl?: string;
  checkoutExpiresAt?: string;
  createdAt: string;
  paidAt?: string;
  paymentFailedAt?: string;
  expiredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export function deriveDisplayStatus(input: {
  paymentStatus?: string;
  bookingStatus?: string;
  dropoffDate?: string | Date;
}): BookingDisplayStatus {
  switch (input.paymentStatus) {
    case "odendi": {
      const ended =
        input.bookingStatus === "tamamlandi" ||
        (input.dropoffDate ? new Date(input.dropoffDate).getTime() < Date.now() : false);
      return ended ? "completed" : "paid";
    }
    case "basarisiz":
      return "failed";
    case "suresi_doldu":
      return "expired";
    case "iptal_edildi":
      return "cancelled";
    case "iade_edildi":
      return "refunded";
    default:
      return input.bookingStatus === "iptal" ? "cancelled" : "pending";
  }
}

