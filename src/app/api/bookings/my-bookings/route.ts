import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";
import { expireStaleCheckouts } from "@/lib/booking-payments";
import { getVehicleImage } from "@/lib/vehicle-images";
import { deriveDisplayStatus, MyBookingDTO } from "@/lib/booking-status";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

const iso = (d?: Date | string | null) => (d ? new Date(d).toISOString() : undefined);

type PopulatedVehicle = {
  _id: unknown;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  imageSlug: string;
};

/**
 * GET /api/bookings/my-bookings
 * Returns every booking (paid, pending, failed, expired, cancelled, refunded) that belongs
 * to the authenticated user, with populated vehicle details.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Rezervasyonlarınızı görüntülemek için lütfen giriş yapın." },
      { status: 401, headers: NO_STORE }
    );
  }
  const userId = session.user.id;

  try {
    await connectDB();
    void Vehicle; // ensure model registration for populate

    // Enforce the 30-minute payment window before reading (best effort).
    await expireStaleCheckouts(userId).catch((err) =>
      console.error("[my-bookings] expireStaleCheckouts failed:", err)
    );

    const docs = await Booking.find({ user: userId })
      .populate<{ vehicle: PopulatedVehicle | null }>(
        "vehicle",
        "slug name brand model year category transmission fuelType seats imageSlug"
      )
      .sort({ createdAt: -1 })
      .lean();

    const now = Date.now();
    const bookings: MyBookingDTO[] = docs.map((b) => {
      const v = b.vehicle;
      const windowOpen =
        (b.paymentStatus === "beklemede" || b.paymentStatus === "basarisiz") &&
        b.bookingStatus === "beklemede" &&
        !!b.checkoutExpiresAt &&
        new Date(b.checkoutExpiresAt).getTime() > now;

      return {
        id: String(b._id),
        referenceCode: `MRT-${String(b._id).slice(-6).toUpperCase()}`,
        displayStatus: deriveDisplayStatus(b),
        paymentStatus: b.paymentStatus,
        bookingStatus: b.bookingStatus,
        vehicle: v
          ? {
              id: String(v._id),
              slug: v.slug,
              name: v.name,
              brand: v.brand,
              model: v.model,
              year: v.year,
              category: v.category,
              transmission: v.transmission,
              fuelType: v.fuelType,
              seats: v.seats,
              imageUrl: getVehicleImage(v.imageSlug),
            }
          : null,
        pickupLocation: b.pickupLocation,
        dropoffLocation: b.dropoffLocation,
        pickupDate: iso(b.pickupDate)!,
        dropoffDate: iso(b.dropoffDate)!,
        pickupTime: b.pickupTime,
        dropoffTime: b.dropoffTime,
        totalDays: b.totalDays,
        pricePerDay: b.pricePerDay,
        addOnsTotal: b.addOnsTotal ?? 0,
        subtotal: b.subtotal,
        taxAmount: b.taxAmount,
        totalPrice: b.totalPrice,
        paymentFailureReason: b.paymentFailureReason,
        checkoutUrl: windowOpen ? b.stripeCheckoutUrl : undefined,
        checkoutExpiresAt: windowOpen ? iso(b.checkoutExpiresAt) : undefined,
        createdAt: iso(b.createdAt)!,
        paidAt: iso(b.paidAt),
        paymentFailedAt: iso(b.paymentFailedAt),
        expiredAt: iso(b.expiredAt),
        cancelledAt: iso(b.cancelledAt),
        refundedAt: iso(b.refundedAt),
      };
    });

    return NextResponse.json(
      { success: true, count: bookings.length, bookings },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("[my-bookings] fetch error:", error);
    return NextResponse.json(
      { error: "Rezervasyonlar alınırken bir hata oluştu." },
      { status: 500, headers: NO_STORE }
    );
  }
}
