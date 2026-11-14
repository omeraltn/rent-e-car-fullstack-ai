import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Stripe from "stripe";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Vehicle } from "@/models/Vehicle";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import {
  ADDONS_CATALOG,
  AddOnOption,
  getStripe,
  syncVehicleStripeProduct,
} from "@/lib/stripe";
import {
  CHECKOUT_PAYMENT_WINDOW_MS,
  buildBookingFieldsFromSession,
  supersedeOpenCheckouts,
} from "@/lib/booking-payments";

/**
 * POST /api/checkout
 * Authenticated-only endpoint that syncs the vehicle's Stripe Product & Price,
 * prevents duplicate overlapping reservations, computes authoritative server-side totals,
 * and creates an idempotent Stripe Hosted Checkout Session.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Rezervasyon ve ödeme işlemi için lütfen giriş yapın." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı hesabı bulunamadı. Lütfen tekrar giriş yapın." },
        { status: 401 }
      );
    }

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
      addOns = [],
    } = body;

    if (!pickupLocation || !pickupDate || !dropoffDate) {
      return NextResponse.json(
        { error: "Lütfen alış lokasyonu ve kiralama tarihlerini eksiksiz seçin." },
        { status: 400 }
      );
    }

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

    const vehicle = vehicleSlug
      ? await Vehicle.findOne({ slug: vehicleSlug })
      : vehicleId
        ? await Vehicle.findById(vehicleId)
        : null;

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

    // 0. Check for existing confirmed/paid booking for the same user, vehicle, and overlapping dates
    const existingPaidBooking = await Booking.findOne({
      user: session.user.id,
      vehicle: vehicle._id,
      bookingStatus: { $ne: "iptal" },
      paymentStatus: "odendi",
      pickupDate: { $lt: dDate },
      dropoffDate: { $gt: pDate },
    }).lean();

    if (existingPaidBooking) {
      return NextResponse.json(
        {
          error:
            "Bu araç ve seçilen tarih aralığı için zaten onaylanmış bir rezervasyonunuz bulunmaktadır.",
        },
        { status: 409 }
      );
    }

    // 1. Sync Vehicle Product & Daily Rate Price with Stripe Catalog
    const synced = await syncVehicleStripeProduct(vehicle);

    // 2. Authoritative Server-Side Pricing Calculation (integer cents)
    const diffTime = dDate.getTime() - pDate.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const requestedAddOnIds: string[] = Array.isArray(addOns) ? addOns : [];
    const selectedAddOns: AddOnOption[] = requestedAddOnIds
      .filter((id): id is AddOnOption["id"] => id in ADDONS_CATALOG)
      .sort()
      .map((id) => ADDONS_CATALOG[id]);

    const baseRentalCents = synced.unitAmount * totalDays;
    const addOnsTotalCents = selectedAddOns.reduce(
      (sum, addon) => sum + addon.dailyPriceCents * totalDays,
      0
    );
    const subtotalCents = baseRentalCents + addOnsTotalCents;
    const taxCents = Math.round(subtotalCents * 0.1);
    const totalCents = subtotalCents + taxCents;

    // 3. Build Stripe Line Items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: synced.price.id,
        quantity: totalDays,
      },
      ...selectedAddOns.map((addon) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: addon.name,
          },
          unit_amount: addon.dailyPriceCents,
        },
        quantity: totalDays,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "KDV & Hizmet Bedeli (%10)",
          },
          unit_amount: taxCents,
        },
        quantity: 1,
      },
    ];

    const resolvedPickupLocation = String(pickupLocation).trim();
    const resolvedDropoffLocation = String(
      dropoffLocation || pickupLocation
    ).trim();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    const cancelParams = new URLSearchParams({
      pickupLocation: resolvedPickupLocation,
      pickupDate: String(pickupDate),
      dropoffDate: String(dropoffDate),
      canceled: "true",
    });

    // 4. Derive deterministic idempotency key (5-minute bucket + exact reservation parameters)
    const BUCKET_MS = 5 * 60 * 1000;
    const timeBucket = Math.floor(Date.now() / BUCKET_MS);
    const idempotencyPayload = [
      "dynamic_pm_v3",
      session.user.id,
      String(vehicle._id),
      resolvedPickupLocation,
      String(pickupDate),
      String(dropoffDate),
      selectedAddOns.map((a) => a.id).join(","),
      String(totalCents),
      String(timeBucket),
    ].join("|");
    const idempotencyKey = `checkout_${crypto
      .createHash("sha256")
      .update(idempotencyPayload)
      .digest("hex")}`;

    // Stripe requires expires_at >= 30 minutes and deterministic per idempotency bucket.
    const stripeExpiresAt = Math.floor(((timeBucket + 1) * BUCKET_MS) / 1000) + 30 * 60;

    const checkoutMetadata = {
      userId: session.user.id,
      vehicleId: String(vehicle._id),
      vehicleSlug: vehicle.slug,
      pickupLocation: resolvedPickupLocation,
      dropoffLocation: resolvedDropoffLocation,
      pickupDate: String(pickupDate),
      dropoffDate: String(dropoffDate),
      pickupTime: String(pickupTime),
      dropoffTime: String(dropoffTime),
      totalDays: String(totalDays),
      pricePerDay: String(synced.dailyRate),
      addOns: selectedAddOns.map((a) => a.id).join(","),
      addOnsTotal: (addOnsTotalCents / 100).toFixed(2),
      subtotal: (subtotalCents / 100).toFixed(2),
      taxAmount: (taxCents / 100).toFixed(2),
      totalPrice: (totalCents / 100).toFixed(2),
      renterName: user.name || session.user.name || "",
      renterEmail: user.email || session.user.email || "",
    };

    const stripe = getStripe();
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      customer_email: user.email || session.user.email || undefined,
      line_items: lineItems,
      expires_at: stripeExpiresAt,
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking/${vehicle.slug}?${cancelParams.toString()}`,
      metadata: checkoutMetadata,
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
          vehicleId: String(vehicle._id),
        },
      },
    };

    let checkoutSession = await stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey,
    });

    // An idempotent replay may hand back a session we already closed (cancelled / expired /
    // failed-then-expired). In that case, open a brand-new session instead.
    const replayedBooking = await Booking.findOne({ stripeSessionId: checkoutSession.id })
      .select("paymentStatus")
      .lean();
    if (replayedBooking && replayedBooking.paymentStatus !== "beklemede") {
      checkoutSession = await stripe.checkout.sessions.create(sessionParams, {
        idempotencyKey: `${idempotencyKey}_r${Date.now()}`,
      });
    }

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe ödeme oturumu URL'si oluşturulamadı." },
        { status: 500 }
      );
    }

    // 5. Persist a PENDING booking linked to the Stripe session. The webhook moves it to
    //    paid / failed / expired. $setOnInsert keeps idempotent retries from resetting it.
    const bookingFields = buildBookingFieldsFromSession(checkoutSession);
    if (bookingFields) {
      try {
        await Booking.updateOne(
          { stripeSessionId: checkoutSession.id },
          {
            $setOnInsert: {
              ...bookingFields,
              pickupDate: pDate,
              dropoffDate: dDate,
              bookingStatus: "beklemede",
              paymentStatus: "beklemede",
              stripeCheckoutUrl: checkoutSession.url,
              checkoutExpiresAt: new Date(Date.now() + CHECKOUT_PAYMENT_WINDOW_MS),
            },
          },
          { upsert: true }
        );
      } catch (err) {
        // Non-fatal: the webhook can still create the booking from session metadata.
        console.error("Pending booking creation failed:", err);
      }

      // Cancel any older open checkout for the same vehicle & dates.
      supersedeOpenCheckouts({
        userId: session.user.id,
        vehicleId: String(vehicle._id),
        pickupDate: pDate,
        dropoffDate: dDate,
        keepSessionId: checkoutSession.id,
      }).catch((err) => console.error("Superseding open checkouts failed:", err));
    }

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: unknown) {
    console.error("Stripe Checkout creation error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Ödeme oturumu oluşturulurken bir hata oluştu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
