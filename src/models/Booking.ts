import mongoose, { Schema, Model } from "mongoose";

export type BookingStatus =
  | "beklemede"
  | "onaylandi"
  | "tamamlandi"
  | "iptal";

/**
 * Payment lifecycle (Turkish values kept for backward compatibility with existing data):
 * - beklemede     → pending   (Checkout session created, awaiting payment)
 * - odendi        → paid      (checkout.session.completed / async_payment_succeeded)
 * - basarisiz     → failed    (payment_intent.payment_failed / async_payment_failed)
 * - suresi_doldu  → expired   (30-min payment window elapsed / checkout.session.expired)
 * - iptal_edildi  → cancelled (user cancelled or superseded by a newer checkout)
 * - iade_edildi   → refunded  (charge.refunded)
 */
export const PAYMENT_STATUSES = [
  "beklemede",
  "odendi",
  "basarisiz",
  "suresi_doldu",
  "iptal_edildi",
  "iade_edildi",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IBooking {
  _id?: string | mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;

  // Rental Schedule & Locations
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date;
  dropoffDate: Date;
  pickupTime: string;
  dropoffTime: string;

  // Billing Calculations
  totalDays: number;
  pricePerDay: number;
  addOns?: string[];
  addOnsTotal?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;

  // Customer Contact Information
  renterName: string;
  renterEmail: string;
  renterPhone?: string;
  renterAddress?: string;
  renterCity?: string;

  // Reservation Lifecycle Status
  bookingStatus: BookingStatus;

  // Stripe Payment Integration
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeCheckoutUrl?: string;
  paymentFailureReason?: string;
  lastStripeEventId?: string;

  // Payment lifecycle timestamps
  checkoutExpiresAt?: Date; // 30-minute Stripe Checkout payment window
  paidAt?: Date;
  paymentFailedAt?: Date;
  expiredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Kullanıcı referansı zorunludur"],
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Araç referansı zorunludur"],
      index: true,
    },

    // Rental Schedule & Locations
    pickupLocation: {
      type: String,
      required: [true, "Alış lokasyonu zorunludur"],
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: [true, "Teslim lokasyonu zorunludur"],
      trim: true,
    },
    pickupDate: {
      type: Date,
      required: [true, "Alış tarihi zorunludur"],
    },
    dropoffDate: {
      type: Date,
      required: [true, "Teslim tarihi zorunludur"],
    },
    pickupTime: {
      type: String,
      required: [true, "Alış saati zorunludur"],
      default: "10:00",
    },
    dropoffTime: {
      type: String,
      required: [true, "Teslim saati zorunludur"],
      default: "10:00",
    },

    // Billing Breakdown
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    addOns: {
      type: [String],
      default: [],
    },
    addOnsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Customer Information
    renterName: {
      type: String,
      required: [true, "Kiracı adı zorunludur"],
      trim: true,
    },
    renterEmail: {
      type: String,
      required: [true, "Kiracı e-posta adresi zorunludur"],
      lowercase: true,
      trim: true,
    },
    renterPhone: {
      type: String,
      default: "",
      trim: true,
    },
    renterAddress: {
      type: String,
      trim: true,
    },
    renterCity: {
      type: String,
      trim: true,
    },

    // Booking Status
    bookingStatus: {
      type: String,
      enum: ["beklemede", "onaylandi", "tamamlandi", "iptal"],
      default: "beklemede",
      index: true,
    },

    // Stripe Payment Fields
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "beklemede",
      index: true,
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeCheckoutUrl: {
      type: String,
    },
    paymentFailureReason: {
      type: String,
      trim: true,
    },
    lastStripeEventId: {
      type: String,
    },

    // Payment lifecycle timestamps
    checkoutExpiresAt: { type: Date, index: true },
    paidAt: { type: Date },
    paymentFailedAt: { type: Date },
    expiredAt: { type: Date },
    cancelledAt: { type: Date },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ user: 1, createdAt: -1 });

// In development, HMR keeps a stale compiled model (with the old enum) on the
// mongoose singleton. Re-register so schema changes take effect immediately.
if (process.env.NODE_ENV !== "production" && mongoose.models.Booking) {
  mongoose.deleteModel("Booking");
}

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
