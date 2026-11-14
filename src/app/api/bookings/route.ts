import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";

/**
 * POST /api/bookings
 * Creates a new vehicle reservation.
 *
 * CRITICAL ARCHITECTURAL NOTE:
 * Stripe payments will be integrated by the developer later.
 * Explicit placeholder handoffs (// TODO: Stripe Integration)
 * are positioned where the Stripe Checkout Session should be created.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Rezervasyon oluşturmak için lütfen giriş yapın." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      vehicleSlug,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      pickupTime = "10:00",
      dropoffTime = "10:00",
      renterName,
      renterEmail,
      renterPhone,
      renterAddress,
      renterCity,
    } = body;

    // 1. Basic Field Validation
    if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
      return NextResponse.json(
        { error: "Lütfen alış/teslim lokasyonu ve tarihlerini eksiksiz doldurun." },
        { status: 400 }
      );
    }

    if (!renterName || !renterEmail || !renterPhone) {
      return NextResponse.json(
        { error: "Lütfen ad soyad, e-posta ve telefon alanlarını eksiksiz doldurun." },
        { status: 400 }
      );
    }

    // 2. Date Sequence Validation
    const pDate = new Date(pickupDate);
    const dDate = new Date(dropoffDate);

    if (isNaN(pDate.getTime()) || isNaN(dDate.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih formatı." },
        { status: 400 }
      );
    }

    if (dDate <= pDate) {
      return NextResponse.json(
        { error: "Teslim tarihi, alış tarihinden sonraki bir tarih olmalıdır." },
        { status: 400 }
      );
    }

    // 3. Find Vehicle
    let vehicle = null;
    if (vehicleSlug) {
      vehicle = await Vehicle.findOne({ slug: vehicleSlug });
    } else if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: "Kiralanmak istenen araç sistemde bulunamadı." },
        { status: 404 }
      );
    }

    if (vehicle.availabilityStatus === "bakimda") {
      return NextResponse.json(
        { error: "Bu araç şu anda serviste / bakımda olduğu için kiralanamaz." },
        { status: 400 }
      );
    }

    // 4. Resolve Authenticated User (No Guest Checkout)
    const userId = session.user.id;

    // 5. Server-side Financial Calculations (Prevent client tampering)
    const diffTime = dDate.getTime() - pDate.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const pricePerDay = vehicle.pricePerDay;
    const subtotal = pricePerDay * totalDays;
    const taxAmount = +(subtotal * 0.1).toFixed(2); // 10% VAT
    const discountAmount = 0;
    const totalPrice = subtotal + taxAmount - discountAmount;

    // 6. Create Booking Document in MongoDB
    const booking = await Booking.create({
      user: userId,
      vehicle: vehicle._id,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      pickupDate: pDate,
      dropoffDate: dDate,
      pickupTime,
      dropoffTime,
      totalDays,
      pricePerDay,
      subtotal,
      taxAmount,
      discountAmount,
      totalPrice,
      renterName: renterName.trim(),
      renterEmail: renterEmail.toLowerCase().trim(),
      renterPhone: renterPhone.trim(),
      renterAddress: renterAddress?.trim() || undefined,
      renterCity: renterCity?.trim() || undefined,
      bookingStatus: "beklemede",
      paymentStatus: "beklemede",

      // =========================================================================
      // TODO: Stripe Integration
      // 1. Initialize Stripe client: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // 2. Create Stripe Checkout Session:
      //    const stripeSession = await stripe.checkout.sessions.create({
      //      customer_email: renterEmail,
      //      line_items: [{
      //        price_data: {
      //          currency: 'usd',
      //          product_data: { name: `${vehicle.brand} ${vehicle.model} Kiralama (${totalDays} Gün)` },
      //          unit_amount: Math.round(totalPrice * 100),
      //        },
      //        quantity: 1,
      //      }],
      //      mode: 'payment',
      //      success_url: `${process.env.NEXTAUTH_URL}/booking/success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
      //      cancel_url: `${process.env.NEXTAUTH_URL}/booking/${vehicle.slug}?canceled=true`,
      //      metadata: { bookingId: booking._id.toString(), vehicleId: vehicle._id.toString() }
      //    });
      // 3. Save stripeSessionId onto booking:
      //    booking.stripeSessionId = stripeSession.id;
      //    await booking.save();
      // 4. Return checkout URL: return NextResponse.json({ url: stripeSession.url });
      // =========================================================================
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: booking._id.toString(),
        booking,
        message: "Rezervasyon kaydı başarıyla oluşturuldu.",
        // Placeholder return payload for future Stripe handoff
        stripeReady: true,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Rezervasyon oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/bookings
 * Retrieves all reservations for the authenticated user session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Rezervasyonlarınızı görüntülemek için lütfen giriş yapın." },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({ user: session.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: unknown) {
    console.error("Bookings fetch error:", error);
    const message = error instanceof Error ? error.message : "Rezervasyonlar alınamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
