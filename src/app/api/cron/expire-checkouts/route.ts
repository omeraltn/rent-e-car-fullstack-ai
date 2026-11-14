import { NextRequest, NextResponse } from "next/server";
import { expireStaleCheckouts } from "@/lib/booking-payments";

/**
 * GET /api/cron/expire-checkouts
 * Global sweep that enforces the 30-minute payment window for ALL users.
 * Schedule it every minute (e.g. Vercel Cron / GitHub Actions / system cron) with
 * `Authorization: Bearer $CRON_SECRET`. The /api/bookings/my-bookings endpoint also
 * runs a per-user sweep, so this is a safety net rather than a hard requirement.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await expireStaleCheckouts(undefined, 100);
  return NextResponse.json({ success: true, processed });
}

