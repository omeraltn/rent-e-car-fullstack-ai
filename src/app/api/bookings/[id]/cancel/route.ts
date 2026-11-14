import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { closeOpenCheckout } from "@/lib/booking-payments";

/**
 * POST /api/bookings/:id/cancel
 * Lets the owner cancel a booking whose payment is still open (pending / failed).
 * The Stripe Checkout Session is expired so it can no longer be paid.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Geçersiz rezervasyon." }, { status: 400 });
  }

  await connectDB();
  const booking = await Booking.findOne({ _id: id, user: session.user.id })
    .select("paymentStatus bookingStatus stripeSessionId")
    .lean();

  if (!booking) {
    return NextResponse.json({ error: "Rezervasyon bulunamadı." }, { status: 404 });
  }

  if (
    !["beklemede", "basarisiz"].includes(booking.paymentStatus) ||
    booking.bookingStatus !== "beklemede"
  ) {
    return NextResponse.json(
      { error: "Yalnızca ödemesi tamamlanmamış rezervasyonlar iptal edilebilir." },
      { status: 409 }
    );
  }

  let finalStatus: string | null = "iptal_edildi";
  if (booking.stripeSessionId) {
    finalStatus = await closeOpenCheckout(
      booking.stripeSessionId,
      "cancelled",
      "Kullanıcı tarafından iptal edildi."
    );
  } else {
    await Booking.updateOne(
      { _id: id, paymentStatus: { $in: ["beklemede", "basarisiz"] } },
      { $set: { paymentStatus: "iptal_edildi", bookingStatus: "iptal", cancelledAt: new Date() } }
    );
  }

  if (finalStatus === "odendi") {
    return NextResponse.json(
      { error: "Bu rezervasyonun ödemesi az önce tamamlandı, iptal edilemedi." },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, paymentStatus: finalStatus });
}
