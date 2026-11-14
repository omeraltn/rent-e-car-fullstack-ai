import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { getStripe } from "@/lib/stripe";
import { Booking, IBooking, PaymentStatus } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";

/**
 * Customers have 30 minutes (Stripe's minimum Checkout `expires_at`) to complete payment.
 *
 * The Stripe session itself expires at the same moment, so Stripe emits
 * `checkout.session.expired` natively. The app-level sweep (`expireStaleCheckouts`)
 * is only a safety net in case a webhook is missed.
 */
export const CHECKOUT_PAYMENT_WINDOW_MS = 30 * 60 * 1000;

/** Statuses from which a booking may still transition to failed / expired / cancelled. */
const OPEN_PAYMENT_STATUSES: PaymentStatus[] = ["beklemede", "basarisiz"];

type LifecycleContext = { eventId?: string };

function getId(ref: string | { id: string } | null | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref.id;
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

/**
 * Builds the immutable booking fields from Checkout Session metadata. Used to create the
 * booking if a webhook arrives for a session that has no pre-created pending record
 * (e.g. sessions created before this flow existed).
 */
export function buildBookingFieldsFromSession(
  checkoutSession: Stripe.Checkout.Session
): Partial<IBooking> | null {
  const meta = checkoutSession.metadata || {};
  if (!meta.userId || !meta.vehicleId || !meta.pickupDate || !meta.dropoffDate) {
    return null;
  }

  const addOns = meta.addOns
    ? meta.addOns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    user: meta.userId as unknown as IBooking["user"],
    vehicle: meta.vehicleId as unknown as IBooking["vehicle"],
    pickupLocation: meta.pickupLocation || "Belirtilen Nokta",
    dropoffLocation: meta.dropoffLocation || meta.pickupLocation || "Belirtilen Nokta",
    pickupDate: new Date(meta.pickupDate),
    dropoffDate: new Date(meta.dropoffDate),
    pickupTime: meta.pickupTime || "10:00",
    dropoffTime: meta.dropoffTime || "10:00",
    totalDays: Number(meta.totalDays) || 1,
    pricePerDay: Number(meta.pricePerDay) || 0,
    addOns,
    addOnsTotal: Number(meta.addOnsTotal) || 0,
    subtotal: Number(meta.subtotal) || 0,
    taxAmount: Number(meta.taxAmount) || 0,
    discountAmount: 0,
    totalPrice: Number(meta.totalPrice) || 0,
    renterName:
      meta.renterName || checkoutSession.customer_details?.name || "Değerli Müşterimiz",
    renterEmail:
      meta.renterEmail ||
      checkoutSession.customer_email ||
      checkoutSession.customer_details?.email ||
      "unknown@example.com",
    renterPhone: checkoutSession.customer_details?.phone || "",
    stripeSessionId: checkoutSession.id,
  };
}

/**
 * Marks a booking as paid. Idempotent and race-safe; creates the booking from session
 * metadata if it does not exist yet. A refunded booking is never moved back to paid.
 */
export async function markBookingPaid(
  checkoutSession: Stripe.Checkout.Session,
  ctx: LifecycleContext = {}
) {
  await connectDB();

  const existing = await Booking.findOne({ stripeSessionId: checkoutSession.id })
    .select("paymentStatus")
    .lean();
  if (existing?.paymentStatus === "iade_edildi") return existing;

  const now = new Date();
  const set: Record<string, unknown> = {
    paymentStatus: "odendi",
    bookingStatus: "onaylandi",
    stripePaymentIntentId: getId(checkoutSession.payment_intent),
    stripeCustomerId: getId(checkoutSession.customer),
  };
  if (ctx.eventId) set.lastStripeEventId = ctx.eventId;
  // Only stamp paidAt the first time we see the payment.
  if (existing?.paymentStatus !== "odendi") set.paidAt = now;

  const insertFields = existing ? {} : buildBookingFieldsFromSession(checkoutSession) || {};
  if (!existing && !("user" in insertFields)) {
    console.error(
      `[booking-payments] Cannot create booking for session ${checkoutSession.id}: missing metadata.`
    );
    return null;
  }

  try {
    return await Booking.findOneAndUpdate(
      { stripeSessionId: checkoutSession.id },
      { $set: set, $setOnInsert: insertFields, $unset: { paymentFailureReason: 1, checkoutExpiresAt: 1, stripeCheckoutUrl: 1 } },
      { upsert: true, new: true }
    ).lean();
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return Booking.findOneAndUpdate(
        { stripeSessionId: checkoutSession.id, paymentStatus: { $ne: "iade_edildi" } },
        { $set: set },
        { new: true }
      ).lean();
    }
    throw err;
  }
}

/** Marks a still-open booking as failed. The customer may retry inside the same session. */
export async function markBookingFailed(
  sessionId: string,
  reason?: string,
  ctx: LifecycleContext & { paymentIntentId?: string } = {}
) {
  await connectDB();
  const set: Record<string, unknown> = {
    paymentStatus: "basarisiz",
    paymentFailedAt: new Date(),
    paymentFailureReason: reason?.slice(0, 500) || "Ödeme işlemi başarısız oldu.",
  };
  if (ctx.paymentIntentId) set.stripePaymentIntentId = ctx.paymentIntentId;
  if (ctx.eventId) set.lastStripeEventId = ctx.eventId;

  return Booking.updateOne(
    {
      stripeSessionId: sessionId,
      paymentStatus: { $in: OPEN_PAYMENT_STATUSES },
      bookingStatus: "beklemede",
    },
    { $set: set }
  );
}

/**
 * Closes the payment window of a booking.
 * - pending → expired (`suresi_doldu`)
 * - failed  → stays failed (more informative), but is closed for further payment
 */
export async function markBookingExpired(sessionId: string, ctx: LifecycleContext = {}) {
  await connectDB();
  const now = new Date();
  const eventSet = ctx.eventId ? { lastStripeEventId: ctx.eventId } : {};

  await Booking.updateOne(
    { stripeSessionId: sessionId, paymentStatus: "beklemede" },
    {
      $set: { paymentStatus: "suresi_doldu", bookingStatus: "iptal", expiredAt: now, ...eventSet },
      $unset: { checkoutExpiresAt: 1, stripeCheckoutUrl: 1 },
    }
  );
  await Booking.updateOne(
    { stripeSessionId: sessionId, paymentStatus: "basarisiz", bookingStatus: "beklemede" },
    {
      $set: { bookingStatus: "iptal", expiredAt: now, ...eventSet },
      $unset: { checkoutExpiresAt: 1, stripeCheckoutUrl: 1 },
    }
  );
}

/** Marks a still-open booking as cancelled (user action or superseded checkout). */
export async function markBookingCancelled(sessionId: string, reason?: string) {
  await connectDB();
  return Booking.updateOne(
    {
      stripeSessionId: sessionId,
      paymentStatus: { $in: OPEN_PAYMENT_STATUSES },
      bookingStatus: "beklemede",
    },
    {
      $set: {
        paymentStatus: "iptal_edildi",
        bookingStatus: "iptal",
        cancelledAt: new Date(),
        ...(reason ? { paymentFailureReason: reason } : {}),
      },
      $unset: { checkoutExpiresAt: 1, stripeCheckoutUrl: 1 },
    }
  );
}

/** Marks a paid booking as refunded. */
export async function markBookingRefunded(paymentIntentId: string, ctx: LifecycleContext = {}) {
  await connectDB();
  const set: Record<string, unknown> = {
    paymentStatus: "iade_edildi",
    bookingStatus: "iptal",
    refundedAt: new Date(),
  };
  if (ctx.eventId) set.lastStripeEventId = ctx.eventId;

  return Booking.updateOne(
    { stripePaymentIntentId: paymentIntentId, paymentStatus: "odendi" },
    { $set: set }
  );
}

/**
 * Closes an open Stripe Checkout Session and reconciles the booking:
 * - If Stripe accepts the expiration → booking is marked expired / cancelled.
 * - If the session was already paid in the meantime → booking is marked paid.
 * - If the session was already expired by Stripe → booking is marked expired.
 */
export async function closeOpenCheckout(
  sessionId: string,
  outcome: "expired" | "cancelled",
  reason?: string
): Promise<PaymentStatus | null> {
  const stripe = getStripe();
  const finalize = async () => {
    if (outcome === "cancelled") {
      await markBookingCancelled(sessionId, reason);
      return "iptal_edildi" as const;
    }
    await markBookingExpired(sessionId);
    return "suresi_doldu" as const;
  };

  try {
    await stripe.checkout.sessions.expire(sessionId);
    return finalize();
  } catch {
    // Session is no longer "open" (completed or already expired) – reconcile with Stripe.
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.status === "complete" && session.payment_status === "paid") {
        await markBookingPaid(session);
        return "odendi";
      }
      if (session.status === "expired") {
        return finalize();
      }
    } catch (err) {
      console.error(`[booking-payments] Failed to reconcile session ${sessionId}:`, err);
    }
    return null;
  }
}

/**
 * Enforces the 30-minute payment window: expires every open booking whose window has
 * elapsed. Optionally scoped to a single user. Safe to call repeatedly.
 */
export async function expireStaleCheckouts(userId?: string, limit = 25) {
  await connectDB();
  const stale = await Booking.find({
    ...(userId ? { user: userId } : {}),
    paymentStatus: { $in: OPEN_PAYMENT_STATUSES },
    bookingStatus: "beklemede",
    checkoutExpiresAt: { $lte: new Date() },
    stripeSessionId: { $exists: true },
  })
    .select("stripeSessionId")
    .limit(limit)
    .lean();

  const results = await Promise.allSettled(
    stale.map((b) => closeOpenCheckout(String(b.stripeSessionId), "expired"))
  );
  return results.filter((r) => r.status === "fulfilled").length;
}

/**
 * Cancels the user's other open checkouts for the same vehicle & dates
 * (e.g. the user went back from Stripe and started a fresh checkout).
 */
export async function supersedeOpenCheckouts(params: {
  userId: string;
  vehicleId: string;
  pickupDate: Date;
  dropoffDate: Date;
  keepSessionId: string;
}) {
  await connectDB();
  const previous = await Booking.find({
    user: params.userId,
    vehicle: params.vehicleId,
    pickupDate: params.pickupDate,
    dropoffDate: params.dropoffDate,
    paymentStatus: { $in: OPEN_PAYMENT_STATUSES },
    bookingStatus: "beklemede",
    stripeSessionId: { $exists: true, $ne: params.keepSessionId },
  })
    .select("stripeSessionId")
    .lean();

  await Promise.allSettled(
    previous.map((b) =>
      closeOpenCheckout(
        String(b.stripeSessionId),
        "cancelled",
        "Yeni bir ödeme oturumu başlatıldığı için iptal edildi."
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Success page verification
// ---------------------------------------------------------------------------

export interface VerifyBookingResult {
  status: "confirmed" | "unpaid" | "unauthorized" | "invalid";
  booking?: Record<string, unknown>;
  paymentStatus?: string;
  message?: string;
}

const UNPAID_MESSAGES: Partial<Record<PaymentStatus, string>> = {
  basarisiz: "Ödemeniz başarısız oldu. Rezervasyonlarım sayfasından tekrar deneyebilirsiniz.",
  suresi_doldu: "30 dakikalık ödeme süresi dolduğu için rezervasyon iptal edildi.",
  iptal_edildi: "Bu rezervasyon iptal edildi.",
  iade_edildi: "Bu rezervasyonun ödemesi iade edildi.",
};

/**
 * Verifies a Checkout Session for the success page. Acts as a fallback in case the
 * webhook has not been delivered yet, using the exact same state transitions.
 */
export async function verifyAndConfirmStripeBooking(
  sessionId: string,
  userId: string
): Promise<VerifyBookingResult> {
  await connectDB();
  void Vehicle;

  const existing = await Booking.findOne({ stripeSessionId: sessionId }).populate("vehicle").lean();

  if (existing && String(existing.user) !== userId) {
    return { status: "unauthorized", message: "Bu rezervasyon oturumuna erişim yetkiniz yok." };
  }

  if (existing?.paymentStatus === "odendi") {
    return { status: "confirmed", booking: JSON.parse(JSON.stringify(existing)), paymentStatus: "paid" };
  }

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("Failed to retrieve Stripe Checkout Session:", err);
    return { status: "invalid", message: "Stripe ödeme oturumu doğrulanamadı." };
  }

  const meta = checkoutSession.metadata || {};
  if (meta.userId && meta.userId !== userId) {
    return { status: "unauthorized", message: "Bu ödeme oturumu mevcut kullanıcı hesabına ait değil." };
  }

  if (checkoutSession.payment_status === "paid") {
    await markBookingPaid(checkoutSession);
    const paid = await Booking.findOne({ stripeSessionId: sessionId }).populate("vehicle").lean();
    if (!paid) {
      return { status: "invalid", message: "Ödeme oturumunda rezervasyon bilgileri eksik." };
    }
    return { status: "confirmed", booking: JSON.parse(JSON.stringify(paid)), paymentStatus: "paid" };
  }

  const current = existing?.paymentStatus;
  return {
    status: "unpaid",
    paymentStatus: current || checkoutSession.payment_status,
    message:
      (current && UNPAID_MESSAGES[current]) ||
      "Ödemeniz henüz onaylanmadı. Onaylandığında Rezervasyonlarım sayfasında görünecektir.",
  };
}
