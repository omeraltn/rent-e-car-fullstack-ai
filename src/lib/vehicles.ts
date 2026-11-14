import { connectDB } from "@/lib/mongodb";
import { Vehicle, IVehicle } from "@/models/Vehicle";

export interface VehicleQueryOptions {
  category?: string | string[];
  brand?: string | string[];
  transmission?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number | number[] | string;
  availability?: string;
  search?: string;
  featured?: boolean;
  recommended?: boolean;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "newest" | string;
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetVehiclesResponse {
  vehicles: IVehicle[];
  pagination: PaginationResult;
}

/**
 * Server-side data fetching utility for vehicles catalog with multi-criteria filtering,
 * sorting, and pagination.
 */
export async function getVehicles(
  options: VehicleQueryOptions = {}
): Promise<GetVehiclesResponse> {
  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  // 1. Category Filter (supports single string or array)
  if (options.category) {
    if (Array.isArray(options.category)) {
      query.category = { $in: options.category };
    } else if (typeof options.category === "string") {
      const categories = options.category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (categories.length > 1) {
        query.category = { $in: categories };
      } else if (categories.length === 1) {
        query.category = categories[0];
      }
    }
  }

  // 2. Brand Filter (supports single string or comma-separated)
  if (options.brand) {
    if (Array.isArray(options.brand)) {
      query.brand = { $in: options.brand };
    } else if (typeof options.brand === "string") {
      const brands = options.brand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (brands.length > 1) {
        query.brand = { $in: brands };
      } else if (brands.length === 1) {
        query.brand = brands[0];
      }
    }
  }

  // 3. Transmission Filter
  if (options.transmission) {
    const trans = options.transmission.trim();
    // Normalize if english was passed
    const normalizedTrans =
      trans.toLowerCase() === "automatic"
        ? "Otomatik"
        : trans.toLowerCase() === "manual"
        ? "Manuel"
        : trans;
    query.transmission = normalizedTrans;
  }

  // 4. Fuel Type Filter
  if (options.fuelType) {
    const fuel = options.fuelType.trim();
    const normalizedFuel =
      fuel.toLowerCase() === "petrol"
        ? "Benzin"
        : fuel.toLowerCase() === "diesel"
        ? "Dizel"
        : fuel.toLowerCase() === "electric"
        ? "Elektrik"
        : fuel.toLowerCase() === "hybrid"
        ? "Hibrit"
        : fuel;
    query.fuelType = normalizedFuel;
  }

  // 5. Price Range Filter
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    query.pricePerDay = {};
    if (options.minPrice !== undefined && !isNaN(options.minPrice)) {
      query.pricePerDay.$gte = Number(options.minPrice);
    }
    if (options.maxPrice !== undefined && !isNaN(options.maxPrice)) {
      query.pricePerDay.$lte = Number(options.maxPrice);
    }
  }

  // 6. Seats Filter
  if (options.seats !== undefined) {
    if (Array.isArray(options.seats)) {
      query.seats = { $in: options.seats.map(Number) };
    } else if (typeof options.seats === "string") {
      const seatNums = options.seats
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));
      if (seatNums.length > 1) {
        query.seats = { $in: seatNums };
      } else if (seatNums.length === 1) {
        query.seats = seatNums[0];
      }
    } else if (typeof options.seats === "number") {
      query.seats = options.seats;
    }
  }

  // 7. Availability Filter
  if (options.availability) {
    query.availabilityStatus = options.availability;
  }

  // 8. Featured / Recommended flags
  if (options.featured !== undefined) {
    query.isFeatured = options.featured;
  }
  if (options.recommended !== undefined) {
    query.isRecommended = options.recommended;
  }

  // 9. Search Term (Brand, Model, Name, or Location)
  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(options.search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { model: searchRegex },
      { location: searchRegex },
      { category: searchRegex },
    ];
  }

  // 10. Sorting Strategy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortObject: Record<string, any> = { createdAt: -1 };

  switch (options.sort) {
    case "price_asc":
      sortObject = { pricePerDay: 1 };
      break;
    case "price_desc":
      sortObject = { pricePerDay: -1 };
      break;
    case "rating_desc":
      sortObject = { rating: -1, reviewCount: -1 };
      break;
    case "newest":
      sortObject = { year: -1, createdAt: -1 };
      break;
    default:
      sortObject = { createdAt: -1 };
  }

  // 11. Pagination or Full Listing
  if (options.all) {
    const vehicles = await Vehicle.find(query).sort(sortObject).lean();
    return {
      vehicles: JSON.parse(JSON.stringify(vehicles)),
      pagination: {
        total: vehicles.length,
        page: 1,
        limit: vehicles.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 9));
  const skip = (page - 1) * limit;

  // Execute query and count in parallel
  const [vehicles, total] = await Promise.all([
    Vehicle.find(query).sort(sortObject).skip(skip).limit(limit).lean(),
    Vehicle.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    vehicles: JSON.parse(JSON.stringify(vehicles)),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Fetch all vehicles without pagination restrictions.
 */
export async function getAllVehicles(): Promise<IVehicle[]> {
  await connectDB();
  const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(vehicles));
}

/**
 * Fetch a single vehicle by its unique slug identifier.
 */
export async function getVehicleBySlug(slug: string): Promise<IVehicle | null> {
  await connectDB();
  const vehicle = await Vehicle.findOne({
    slug: slug.toLowerCase().trim(),
  }).lean();

  if (!vehicle) return null;
  return JSON.parse(JSON.stringify(vehicle));
}

/**
 * Fetch featured popular vehicles (e.g. for Home Hero / Popular section).
 */
export async function getFeaturedVehicles(limit = 4): Promise<IVehicle[]> {
  await connectDB();
  const vehicles = await Vehicle.find({ isFeatured: true, availabilityStatus: "musait" })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(vehicles));
}

/**
 * Fetch recommended vehicles (e.g. for Home Recommended section).
 */
export async function getRecommendedVehicles(limit = 8): Promise<IVehicle[]> {
  await connectDB();
  const vehicles = await Vehicle.find({ isRecommended: true, availabilityStatus: "musait" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(vehicles));
}

/**
 * Fetch metadata for filter sidebar (available categories, brands, price boundaries).
 */
export async function getFilterMetadata() {
  await connectDB();
  const [categories, brands, priceAgg] = await Promise.all([
    Vehicle.distinct("category"),
    Vehicle.distinct("brand"),
    Vehicle.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$pricePerDay" },
          maxPrice: { $max: "$pricePerDay" },
        },
      },
    ]),
  ]);

  return {
    categories,
    brands,
    minPrice: priceAgg[0]?.minPrice || 0,
    maxPrice: priceAgg[0]?.maxPrice || 200,
  };
}

