import mongoose, { Schema, Model } from "mongoose";

export type BookingStatus =
  | "beklemede"
  | "onaylandi"
  | "tamamlandi"
  | "iptal";

export type PaymentStatus =
  | "beklemede"
  | "odendi"
  | "basarisiz"
  | "iade_edildi";

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

  // =========================================================================
  // Stripe Payment Integration (Placeholders for Future Implementation)
  // TODO: Stripe Integration - Fields populated when Stripe Checkout session is created/completed
  // =========================================================================
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;

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

    // Stripe Payment Fields (Placeholder)
    paymentStatus: {
      type: String,
      enum: ["beklemede", "odendi", "basarisiz", "iade_edildi"],
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
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
