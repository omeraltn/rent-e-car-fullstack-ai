import Stripe from "stripe";
import { IVehicle } from "@/models/Vehicle";

let stripeInstance: Stripe | null = null;

/**
 * Returns a server-side Stripe client initialized with STRIPE_SECRET_KEY.
 */
export function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY ortam değişkeni tanımlı değil.");
  }

  stripeInstance = new Stripe(secretKey);
  return stripeInstance;
}

export interface AddOnOption {
  id: "fullInsurance" | "additionalDriver" | "gpsWifi";
  name: string;
  dailyPriceUsd: number;
  dailyPriceCents: number;
}

export const ADDONS_CATALOG: Record<AddOnOption["id"], AddOnOption> = {
  fullInsurance: {
    id: "fullInsurance",
    name: "Tam Kapsamlı Muafiyetsiz Kasko",
    dailyPriceUsd: 15,
    dailyPriceCents: 1500,
  },
  additionalDriver: {
    id: "additionalDriver",
    name: "Ek Sürücü İzni",
    dailyPriceUsd: 10,
    dailyPriceCents: 1000,
  },
  gpsWifi: {
    id: "gpsWifi",
    name: "Yurt İçi Sınırsız 4G Wi-Fi Hotspot & GPS",
    dailyPriceUsd: 5,
    dailyPriceCents: 500,
  },
};

export interface SyncedVehicleStripe {
  product: Stripe.Product;
  price: Stripe.Price;
  unitAmount: number;
  dailyRate: number;
}

/**
 * Finds an existing Stripe Product for a vehicle by single-field metadata search
 * (`vehicleId`, then `vehicleSlug`) or active product list fallback, and ensures
 * its active Price matches the database daily rental rate.
 */
export async function syncVehicleStripeProduct(
  vehicle: IVehicle
): Promise<SyncedVehicleStripe> {
  const stripe = getStripe();
  const vehicleId = vehicle._id ? String(vehicle._id) : "";
  const expectedUnitAmount = Math.round(vehicle.pricePerDay * 100);

  let product: Stripe.Product | null = null;

  // 1a. Search primarily by metadata['vehicleId'] (single-clause query supported by Stripe Search)
  if (vehicleId) {
    try {
      const byIdRes = await stripe.products.search({
        query: `metadata['vehicleId']:'${vehicleId}'`,
        limit: 5,
      });
      product = byIdRes.data.find((p) => p.active) || byIdRes.data[0] || null;
    } catch (err) {
      console.warn("Stripe product search by vehicleId fallback:", err);
    }
  }

  // 1b. If not found by vehicleId, search by metadata['vehicleSlug']
  if (!product && vehicle.slug) {
    try {
      const bySlugRes = await stripe.products.search({
        query: `metadata['vehicleSlug']:'${vehicle.slug}'`,
        limit: 5,
      });
      product =
        bySlugRes.data.find((p) => p.active) || bySlugRes.data[0] || null;
    } catch (err) {
      console.warn("Stripe product search by vehicleSlug fallback:", err);
    }
  }

  // 2. Fallback to list() for strong consistency (e.g. immediately after creation) or name match
  if (!product) {
    const listed = await stripe.products.list({ active: true, limit: 100 });
    product =
      listed.data.find(
        (p) =>
          (vehicleId && p.metadata?.vehicleId === vehicleId) ||
          p.metadata?.vehicleSlug === vehicle.slug ||
          p.name.toLowerCase() === vehicle.name.toLowerCase()
      ) || null;
  }

  // 3. Create Product & Price if vehicle does not exist in Stripe yet
  if (!product) {
    product = await stripe.products.create({
      name: vehicle.name,
      description: `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - ${vehicle.category}`,
      metadata: {
        vehicleId,
        vehicleSlug: vehicle.slug,
      },
    });

    const createdPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: expectedUnitAmount,
      currency: "usd",
      metadata: {
        vehicleId,
        vehicleSlug: vehicle.slug,
        type: "daily_rate",
      },
    });

    product = await stripe.products.update(product.id, {
      default_price: createdPrice.id,
    });

    return {
      product,
      price: createdPrice,
      unitAmount: expectedUnitAmount,
      dailyRate: expectedUnitAmount / 100,
    };
  }

  // Ensure product is active and metadata stays up to date
  if (
    !product.active ||
    (vehicleId && product.metadata?.vehicleId !== vehicleId) ||
    product.metadata?.vehicleSlug !== vehicle.slug
  ) {
    product = await stripe.products.update(product.id, {
      active: true,
      metadata: {
        ...product.metadata,
        vehicleId,
        vehicleSlug: vehicle.slug,
      },
    });
  }

  // 4. Verify active Price matches our database daily rate
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 20,
  });

  const matchingPrice = existingPrices.data.find(
    (p) =>
      p.currency === "usd" &&
      !p.recurring &&
      p.unit_amount === expectedUnitAmount
  );

  if (matchingPrice) {
    if (product.default_price !== matchingPrice.id) {
      await stripe.products.update(product.id, {
        default_price: matchingPrice.id,
      });
    }

    return {
      product,
      price: matchingPrice,
      unitAmount: matchingPrice.unit_amount ?? expectedUnitAmount,
      dailyRate: (matchingPrice.unit_amount ?? expectedUnitAmount) / 100,
    };
  }

  // 5. Price differs or is missing: create a synced Price and deactivate stale prices
  const syncedPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: expectedUnitAmount,
    currency: "usd",
    metadata: {
      vehicleId,
      vehicleSlug: vehicle.slug,
      type: "daily_rate",
    },
  });

  await stripe.products.update(product.id, {
    default_price: syncedPrice.id,
  });

  await Promise.all(
    existingPrices.data
      .filter((p) => p.id !== syncedPrice.id)
      .map((oldPrice) => stripe.prices.update(oldPrice.id, { active: false }))
  );

  return {
    product,
    price: syncedPrice,
    unitAmount: expectedUnitAmount,
    dailyRate: expectedUnitAmount / 100,
  };
}
