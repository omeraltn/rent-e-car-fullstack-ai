import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IVehicle } from "@/models/Vehicle";
import { generateCarImageUrl } from "@/lib/vehicle-images";

interface VehicleCardProps {
  vehicle: IVehicle;
  priority?: boolean;
}

export function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const imageUrl = generateCarImageUrl(vehicle, "23");

  const hasDiscount =
    typeof vehicle.originalPricePerDay === "number" &&
    vehicle.originalPricePerDay > vehicle.pricePerDay;

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-outline-variant/30 hover:border-primary/30 group">
      {/* 1. Card Header: Category Pill, Title, Brand & Year */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-primary-fixed/70 text-primary">
              {vehicle.category}
            </span>
            {vehicle.year && (
              <span className="text-[11px] font-semibold text-outline">
                {vehicle.year} Model
              </span>
            )}
          </div>
          <Link href={`/vehicles/${vehicle.slug}`} className="block">
            <h3 className="font-title-md text-base sm:text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors truncate">
              {vehicle.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* 2. Studio Showroom Stage & Next.js Optimized Image */}
      <Link
        href={`/vehicles/${vehicle.slug}`}
        className="relative my-3.5 rounded-2xl bg-gradient-to-b from-[#F3F6FC] via-[#EDF2FA] to-surface-container-lowest border border-outline-variant/25 h-44 sm:h-48 flex items-center justify-center overflow-hidden block"
      >
        {/* Top Radial Showroom Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(53,99,233,0.12),_transparent_70%)] pointer-events-none"></div>

        {/* Horsepower Badge (Top Left) */}
        {vehicle.horsepower && (
          <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant/20 text-[10px] font-bold text-on-surface-variant shadow-2xs">
            <span className="material-symbols-outlined text-xs text-primary">
              bolt
            </span>
            <span>{vehicle.horsepower} HP</span>
          </div>
        )}

        {/* Multi-Angle Indicator Badge (Bottom Right) */}
        <div className="absolute bottom-2 right-2.5 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant/20 text-[10px] font-bold text-outline group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-xs">360</span>
          <span>Detaylı Görünüm</span>
        </div>

        {/* Realistic Studio Floor Contact Shadow */}
        <div className="absolute bottom-5 w-3/4 h-4 bg-slate-900/12 rounded-full blur-md pointer-events-none"></div>

        {/* Next.js <Image /> with fill & responsive sizes */}
        <div className="relative z-10 w-[92%] h-[86%]">
          <Image
            src={imageUrl}
            alt={vehicle.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
            priority={priority}
            className="object-contain object-center drop-shadow-[0_12px_16px_rgba(15,23,42,0.18)] group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        </div>
      </Link>

      {/* 3. Specification Pills Row */}
      <div className="grid grid-cols-3 gap-1.5 my-1">
        <div
          className="flex items-center justify-center gap-1 bg-surface-container-low/75 rounded-xl py-2 px-1.5 text-on-surface-variant"
          title="Yakıt / Menzil"
        >
          <span className="material-symbols-outlined text-base text-primary-container shrink-0">
            {vehicle.fuelType === "Elektrik"
              ? "electric_bolt"
              : "local_gas_station"}
          </span>
          <span className="text-[11px] font-semibold truncate">
            {vehicle.rangeOrConsumption}
          </span>
        </div>

        <div
          className="flex items-center justify-center gap-1 bg-surface-container-low/75 rounded-xl py-2 px-1.5 text-on-surface-variant"
          title="Vites Tipi"
        >
          <span className="material-symbols-outlined text-base text-primary-container shrink-0">
            settings
          </span>
          <span className="text-[11px] font-semibold truncate">
            {vehicle.transmission}
          </span>
        </div>

        <div
          className="flex items-center justify-center gap-1 bg-surface-container-low/75 rounded-xl py-2 px-1.5 text-on-surface-variant"
          title="Kişi Kapasitesi"
        >
          <span className="material-symbols-outlined text-base text-primary-container shrink-0">
            group
          </span>
          <span className="text-[11px] font-semibold truncate">
            {vehicle.seats} Kişi
          </span>
        </div>
      </div>

      {/* 4. Footer: Price & Rental Action Button */}
      <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-surface-container">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span className="font-headline-sm text-lg sm:text-xl font-extrabold text-on-surface">
              ${vehicle.pricePerDay.toFixed(2)}
            </span>
            <span className="font-body-sm text-xs font-medium text-outline">
              /gün
            </span>
          </div>
          {hasDiscount && (
            <span className="font-body-xs text-[11px] text-outline line-through">
              ${vehicle.originalPricePerDay!.toFixed(2)}
            </span>
          )}
        </div>

        <Link
          href={`/vehicles/${vehicle.slug}`}
          className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary font-label-md text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs hover:bg-secondary-container hover:shadow-md active:scale-[0.98] transition-all group/btn"
        >
          <span>Hemen Kirala</span>
          <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/btn:translate-x-0.5">
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  );
}

export default VehicleCard;
