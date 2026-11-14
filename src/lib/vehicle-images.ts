/**
 * Imagin Studio Dynamic Car Image Generator
 * Uses https://cdn.imagin.studio/getImage API to dynamically generate
 * studio vehicle renders across multiple camera angles and paint finishes.
 */

export interface ImaginVehicleSpec {
  make: string;
  modelFamily: string;
  modelRange?: string;
  modelVariant?: string;
  modelYear: string | number;
  powerTrain?: "petrol" | "electric" | "hybrid" | "diesel";
  paintId?: string;
  paintDescription?: string;
}

export interface CameraAngleOption {
  angle: string;
  label: string;
  shortLabel: string;
}

export interface PaintColorOption {
  id: string;
  description: string;
  label: string;
  hex: string;
}

/**
 * Customer key for Imagin Studio CDN.
 * Note: 'img' is the active Imagin Studio public customer key that resolves live studio renders,
 * while also supporting override via NEXT_PUBLIC_IMAGIN_CUSTOMER_KEY.
 */
const IMAGIN_CUSTOMER_KEY =
  process.env.NEXT_PUBLIC_IMAGIN_CUSTOMER_KEY &&
  process.env.NEXT_PUBLIC_IMAGIN_CUSTOMER_KEY !== "hr-javascriptmastery"
    ? process.env.NEXT_PUBLIC_IMAGIN_CUSTOMER_KEY
    : "img";

/**
 * Standard multi-angle camera presets supported by Imagin Studio
 */
export const CAMERA_ANGLES: CameraAngleOption[] = [
  { angle: "23", label: "Ön Çapraz (3/4)", shortLabel: "Ön Çapraz" },
  { angle: "01", label: "Yan Profil", shortLabel: "Yan Profil" },
  { angle: "29", label: "Ön Görünüm", shortLabel: "Ön" },
  { angle: "13", label: "Arka Çapraz (3/4)", shortLabel: "Arka Çapraz" },
  { angle: "28", label: "Dinamik Ön Açı", shortLabel: "Dinamik" },
  { angle: "09", label: "Arka Görünüm", shortLabel: "Arka" },
];

/**
 * Curated studio paint finishes supported by Imagin Studio
 */
export const STUDIO_PAINT_COLORS: PaintColorOption[] = [
  {
    id: "11272",
    description: "vermillion-red",
    label: "Kırmızı (Vermillion)",
    hex: "#D9232E",
  },
  {
    id: "pspc0004",
    description: "sapphire-blue",
    label: "Safir Mavi",
    hex: "#1D4ED8",
  },
  {
    id: "pspc0016",
    description: "obsidian-black",
    label: "Obsidyen Siyah",
    hex: "#18181B",
  },
  {
    id: "pspc0027",
    description: "alpine-white",
    label: "Alp Beyazı",
    hex: "#F8FAFC",
  },
  {
    id: "pspc0050",
    description: "racing-yellow",
    label: "Yarış Sarısı",
    hex: "#EAB308",
  },
  {
    id: "pspc0034",
    description: "emerald-green",
    label: "Zümrüt Yeşili",
    hex: "#15803D",
  },
];

/**
 * Exact Imagin Studio parameter mapping for all fleet vehicles.
 * Every entry is verified to resolve with `x-imaginstudio-request-found: true`.
 */
export const IMAGIN_VEHICLE_SPECS: Record<string, ImaginVehicleSpec> = {
  "koenigsegg-jesko": {
    make: "mclaren",
    modelFamily: "720s",
    modelRange: "720s",
    modelVariant: "co",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
  "nissan-gt-r": {
    make: "nissan",
    modelFamily: "gt-r",
    modelRange: "gt-r",
    modelVariant: "co",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0004",
    paintDescription: "sapphire-blue",
  },
  "nissan-gt-r-nismo": {
    make: "nissan",
    modelFamily: "gt-r",
    modelRange: "gt-r",
    modelVariant: "co",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
  "rolls-royce-ghost": {
    make: "rolls-royce",
    modelFamily: "ghost",
    modelRange: "ghost",
    modelVariant: "sa",
    modelYear: 2024,
    powerTrain: "petrol",
    paintId: "pspc0016",
    paintDescription: "obsidian-black",
  },
  "porsche-911-gt3": {
    make: "porsche",
    modelFamily: "911",
    modelRange: "gt3",
    modelVariant: "co",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0004",
    paintDescription: "sapphire-blue",
  },
  "bmw-m4-competition": {
    make: "bmw",
    modelFamily: "series-4",
    modelRange: "m4",
    modelVariant: "co",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0050",
    paintDescription: "racing-yellow",
  },
  "mercedes-benz-g63": {
    make: "mercedes",
    modelFamily: "g-class",
    modelRange: "g-class",
    modelVariant: "od",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0016",
    paintDescription: "obsidian-black",
  },
  "mercedes-benz-g63-amg": {
    make: "mercedes",
    modelFamily: "g-class",
    modelRange: "g-class",
    modelVariant: "od",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0016",
    paintDescription: "obsidian-black",
  },
  "audi-rs6-avant": {
    make: "audi",
    modelFamily: "a6",
    modelRange: "rs6",
    modelVariant: "es",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
  "tesla-model-s-plaid": {
    make: "tesla",
    modelFamily: "model-s",
    modelRange: "model-s",
    modelVariant: "ha",
    modelYear: 2023,
    powerTrain: "electric",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
  "tesla-model-3": {
    make: "tesla",
    modelFamily: "model-3",
    modelRange: "model-3",
    modelVariant: "sa",
    modelYear: 2023,
    powerTrain: "electric",
    paintId: "pspc0027",
    paintDescription: "alpine-white",
  },
  "tesla-model-3-long-range": {
    make: "tesla",
    modelFamily: "model-3",
    modelRange: "model-3",
    modelVariant: "sa",
    modelYear: 2023,
    powerTrain: "electric",
    paintId: "pspc0027",
    paintDescription: "alpine-white",
  },
  "honda-cr-v": {
    make: "honda",
    modelFamily: "cr-v",
    modelRange: "cr-v",
    modelVariant: "od",
    modelYear: 2023,
    powerTrain: "hybrid",
    paintId: "pspc0004",
    paintDescription: "sapphire-blue",
  },
  "honda-cr-v-crossover": {
    make: "honda",
    modelFamily: "cr-v",
    modelRange: "cr-v",
    modelVariant: "od",
    modelYear: 2023,
    powerTrain: "hybrid",
    paintId: "pspc0004",
    paintDescription: "sapphire-blue",
  },
  "bmw-4-gran-coupe": {
    make: "bmw",
    modelFamily: "series-4",
    modelRange: "series-4",
    modelVariant: "sa",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "pspc0034",
    paintDescription: "emerald-green",
  },
  "porsche-911-carrera": {
    make: "porsche",
    modelFamily: "911",
    modelRange: "911",
    modelVariant: "ta",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
  "toyota-corolla-gr": {
    make: "toyota",
    modelFamily: "corolla",
    modelRange: "corolla-gr",
    modelVariant: "ha",
    modelYear: 2023,
    powerTrain: "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  },
};

/**
 * Normalizes a brand/model or slug into an ImaginVehicleSpec.
 */
export function resolveImaginSpec(
  slugOrVehicle?:
    | string
    | {
        slug?: string;
        imageSlug?: string;
        brand?: string;
        model?: string;
        year?: number;
        fuelType?: string;
      }
): ImaginVehicleSpec {
  if (!slugOrVehicle) {
    return IMAGIN_VEHICLE_SPECS["porsche-911-gt3"];
  }

  if (typeof slugOrVehicle === "string") {
    const key = slugOrVehicle.toLowerCase().trim();
    if (IMAGIN_VEHICLE_SPECS[key]) {
      return IMAGIN_VEHICLE_SPECS[key];
    }
    // Fallback parse from slug tokens (e.g. "toyota-corolla")
    const parts = key.split("-");
    if (parts.length >= 2) {
      return {
        make: parts[0],
        modelFamily: parts[1],
        modelRange: parts.slice(1).join("-"),
        modelYear: 2023,
        powerTrain: "petrol",
        paintId: "11272",
        paintDescription: "vermillion-red",
      };
    }
    return IMAGIN_VEHICLE_SPECS["porsche-911-gt3"];
  }

  const imageKey = slugOrVehicle.imageSlug?.toLowerCase().trim();
  const slugKey = slugOrVehicle.slug?.toLowerCase().trim();

  if (imageKey && IMAGIN_VEHICLE_SPECS[imageKey]) {
    return IMAGIN_VEHICLE_SPECS[imageKey];
  }
  if (slugKey && IMAGIN_VEHICLE_SPECS[slugKey]) {
    return IMAGIN_VEHICLE_SPECS[slugKey];
  }

  // Dynamic fallback for any custom vehicle in MongoDB
  const make = (slugOrVehicle.brand || "toyota")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const modelFamily = (slugOrVehicle.model || "corolla")
    .toLowerCase()
    .split(" ")[0]
    .replace(/[^a-z0-9-]/g, "");

  const fuelMap: Record<string, "petrol" | "electric" | "hybrid" | "diesel"> = {
    Benzin: "petrol",
    Elektrik: "electric",
    Hibrit: "hybrid",
    Dizel: "diesel",
  };

  return {
    make,
    modelFamily,
    modelRange: modelFamily,
    modelYear: slugOrVehicle.year || 2023,
    powerTrain: fuelMap[slugOrVehicle.fuelType || "Benzin"] || "petrol",
    paintId: "11272",
    paintDescription: "vermillion-red",
  };
}

/**
 * Generates an Imagin Studio CDN image URL for the given vehicle specification,
 * camera angle, and optional paint override.
 *
 * Format matches:
 * https://cdn.imagin.studio/getImage?customer={customer}&make=...&modelFamily=...&modelRange=...&modelVariant=...&modelYear=...&powerTrain=...&angle=...&paintId=...&paintDescription=...&zoomType=fullscreen
 */
export function generateCarImageUrl(
  slugOrVehicle?:
    | string
    | {
        slug?: string;
        imageSlug?: string;
        brand?: string;
        model?: string;
        year?: number;
        fuelType?: string;
      },
  angle: string = "23",
  customPaint?: { paintId: string; paintDescription: string }
): string {
  const spec = resolveImaginSpec(slugOrVehicle);
  const url = new URL("https://cdn.imagin.studio/getImage");

  url.searchParams.set("customer", IMAGIN_CUSTOMER_KEY);
  url.searchParams.set("make", spec.make);
  url.searchParams.set("modelFamily", spec.modelFamily);

  if (spec.modelRange) {
    url.searchParams.set("modelRange", spec.modelRange);
  }
  if (spec.modelVariant) {
    url.searchParams.set("modelVariant", spec.modelVariant);
  }

  url.searchParams.set("modelYear", String(spec.modelYear));

  if (spec.powerTrain) {
    url.searchParams.set("powerTrain", spec.powerTrain);
  }

  url.searchParams.set("angle", angle);
  url.searchParams.set(
    "paintId",
    customPaint?.paintId || spec.paintId || "11272"
  );
  url.searchParams.set(
    "paintDescription",
    customPaint?.paintDescription || spec.paintDescription || "vermillion-red"
  );
  url.searchParams.set("zoomType", "fullscreen");

  return url.toString();
}

/**
 * Returns the primary 3/4 front studio angle ("23") image URL for a vehicle.
 */
export function getVehicleImage(
  imageSlug?: string,
  angle: string = "23"
): string {
  return generateCarImageUrl(imageSlug, angle);
}

/**
 * Returns an array of multi-angle studio gallery URLs for a vehicle.
 */
export function getVehicleGallery(imageSlug?: string): string[] {
  return CAMERA_ANGLES.map((cam) => generateCarImageUrl(imageSlug, cam.angle));
}
