import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import {
  markBookingExpired,
  markBookingFailed,
  markBookingPaid,
  markBookingRefunded,
} from "@/lib/booking-payments";

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe events, verifies the `Stripe-Signature` header against
 * STRIPE_WEBHOOK_SECRET using the *raw* request body, and moves the matching
 * booking through its payment lifecycle.
 *
 * Every handler is idempotent and guarded against out-of-order delivery
 * (e.g. a late `payment_failed` can never downgrade a paid booking).
 *
 * Subscribe this endpoint to:
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   checkout.session.async_payment_failed, checkout.session.expired,
 *   payment_intent.payment_failed, charge.refunded
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  // Signature verification requires the exact raw payload – never JSON.parse first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.warn(`[stripe-webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    // 5xx makes Stripe retry delivery with exponential backoff.
    console.error(`[stripe-webhook] Failed to process ${event.type} (${event.id}):`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  const ctx = { eventId: event.id };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Card payments are "paid" here; delayed methods arrive as "unpaid" and settle
      // later via async_payment_succeeded / async_payment_failed.
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await markBookingPaid(session, ctx);
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      await markBookingPaid(event.data.object, ctx);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      await markBookingFailed(session.id, "Gecikmeli ödeme işlemi başarısız oldu.", {
        ...ctx,
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      });
      break;
    }

    case "checkout.session.expired": {
      await markBookingExpired(event.data.object.id, ctx);
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      const sessionId = await resolveSessionIdForPaymentIntent(intent.id);
      if (!sessionId) {
        console.warn(`[stripe-webhook] No booking found for PaymentIntent ${intent.id}`);
        break;
      }
      await markBookingFailed(sessionId, intent.last_payment_error?.message, {
        ...ctx,
        paymentIntentId: intent.id,
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      // Only mark as refunded when the full amount has been returned.
      if (paymentIntentId && charge.refunded) {
        await markBookingRefunded(paymentIntentId, ctx);
      }
      break;
    }

    default:
      // Acknowledge unhandled event types so Stripe does not retry them.
      break;
  }
}

/**
 * Maps a PaymentIntent back to its Checkout Session: first via our DB, then via Stripe.
 */
async function resolveSessionIdForPaymentIntent(paymentIntentId: string): Promise<string | null> {
  await connectDB();
  const booking = await Booking.findOne({ stripePaymentIntentId: paymentIntentId })
    .select("stripeSessionId")
    .lean();
  if (booking?.stripeSessionId) return booking.stripeSessionId;

  const sessions = await getStripe().checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  return sessions.data[0]?.id ?? null;
}

