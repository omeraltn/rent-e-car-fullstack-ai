import mongoose, { Schema, Model } from "mongoose";

export type VehicleCategory =
  | "Spor"
  | "SUV"
  | "Sedan"
  | "Coupe"
  | "Hatchback"
  | "MPV"
  | "Elektrik"
  | "Lüks";

export type TransmissionType = "Otomatik" | "Manuel";

export type FuelType = "Benzin" | "Dizel" | "Elektrik" | "Hibrit";

export type AvailabilityStatus = "musait" | "kiralandi" | "bakimda";

export interface IVehicle {
  _id?: string | mongoose.Types.ObjectId;
  name: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  category: VehicleCategory;
  description: string;

  // Technical Specs
  transmission: TransmissionType;
  fuelType: FuelType;
  rangeOrConsumption: string; // e.g. "90L", "80 kWh", "6.2 L/100km"
  seats: number;
  doors: number;
  luggageCapacity: string; // e.g. "3 Bags", "2 Large + 1 Small"
  horsepower: number;

  // Rental & Pricing Info
  pricePerDay: number;
  originalPricePerDay?: number;
  depositAmount: number;
  mileageLimit: string; // e.g. "Unlimited" or "350 km/day"
  minimumDriverAge: number;
  features: string[]; // e.g. ["GPS", "Autopilot", "Bluetooth", "Heated Seats"]
  availabilityStatus: AvailabilityStatus;
  location: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isRecommended: boolean;

  // Frontend Image Mapping Reference (NO backend image storage)
  imageSlug: string;
  gallerySlugs?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: [true, "Araç başlığı zorunludur"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Marka zorunludur"],
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, "Model zorunludur"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Model yılı zorunludur"],
      min: 2000,
      max: 2030,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Slug (URL) tanımlayıcısı zorunludur"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Kategori seçimi zorunludur"],
      enum: [
        "Spor",
        "SUV",
        "Sedan",
        "Coupe",
        "Hatchback",
        "MPV",
        "Elektrik",
        "Lüks",
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Açıklama alanı zorunludur"],
      trim: true,
    },

    // Technical Specs
    transmission: {
      type: String,
      required: [true, "Vites tipi zorunludur"],
      enum: ["Otomatik", "Manuel"],
      index: true,
    },
    fuelType: {
      type: String,
      required: [true, "Yakıt tipi zorunludur"],
      enum: ["Benzin", "Dizel", "Elektrik", "Hibrit"],
      index: true,
    },
    rangeOrConsumption: {
      type: String,
      required: [true, "Menzil veya yakıt deposu bilgisi zorunludur"],
    },
    seats: {
      type: Number,
      required: [true, "Koltuk sayısı zorunludur"],
      min: 1,
      max: 12,
      index: true,
    },
    doors: {
      type: Number,
      default: 4,
    },
    luggageCapacity: {
      type: String,
      default: "2 Valiz",
    },
    horsepower: {
      type: Number,
      required: [true, "Motor beygir gücü zorunludur"],
    },

    // Rental Info
    pricePerDay: {
      type: Number,
      required: [true, "Günlük kiralama ücreti zorunludur"],
      min: 0,
      index: true,
    },
    originalPricePerDay: {
      type: Number,
      min: 0,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    mileageLimit: {
      type: String,
      default: "Sınırsız",
    },
    minimumDriverAge: {
      type: Number,
      default: 21,
    },
    features: {
      type: [String],
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ["musait", "kiralandi", "bakimda"],
      default: "musait",
      index: true,
    },
    location: {
      type: String,
      required: [true, "Lokasyon bilgisi zorunludur"],
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isRecommended: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Image Reference Identifier
    imageSlug: {
      type: String,
      required: [true, "Görsel referansı zorunludur"],
      trim: true,
    },
    gallerySlugs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance catalog queries
VehicleSchema.index({ category: 1, pricePerDay: 1 });
VehicleSchema.index({ brand: 1, category: 1 });
VehicleSchema.index({ availabilityStatus: 1, isFeatured: 1 });
VehicleSchema.index({ availabilityStatus: 1, isRecommended: 1 });

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);

export default Vehicle;
