import React, { Suspense } from "react";
import Link from "next/link";
import { getVehicles } from "@/lib/vehicles";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { CatalogFilterSidebar } from "@/components/vehicles/CatalogFilterSidebar";
import { CatalogSortDropdown } from "@/components/vehicles/CatalogSortDropdown";

export const dynamic = "force-dynamic";

interface VehiclesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const resolvedParams = await searchParams;

  const category = (resolvedParams.category as string) || undefined;
  const brand = (resolvedParams.brand as string) || undefined;
  const transmission = (resolvedParams.transmission as string) || undefined;
  const fuelType = (resolvedParams.fuelType as string) || undefined;
  const minPrice = resolvedParams.minPrice
    ? Number(resolvedParams.minPrice)
    : undefined;
  const maxPrice = resolvedParams.maxPrice
    ? Number(resolvedParams.maxPrice)
    : undefined;
  const seats = (resolvedParams.seats as string) || undefined;
  const availability = (resolvedParams.availability as string) || undefined;
  const search = (resolvedParams.search as string) || undefined;
  const sort = (resolvedParams.sort as string) || "newest";
  const page = resolvedParams.page ? Number(resolvedParams.page) : 1;
  const limit = resolvedParams.limit ? Number(resolvedParams.limit) : 9;
  const featured = resolvedParams.featured === "true" ? true : undefined;

  const { vehicles, pagination } = await getVehicles({
    category,
    brand,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    seats,
    availability,
    search,
    sort,
    page,
    limit,
    featured,
  });

  return (
    <div className="w-full px-margin-mobile sm:px-margin md:px-gutter lg:px-margin-desktop py-space-xl">
      {/* 1. Breadcrumb & Live Fleet Stat Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm mb-space-lg">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <Link href="/" className="hover:text-primary transition-colors">
            Ana Sayfa
          </Link>
          <span className="material-symbols-outlined text-sm text-outline">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">Araç Filosu</span>
          {category && (
            <>
              <span className="material-symbols-outlined text-sm text-outline">
                chevron_right
              </span>
              <span className="text-primary font-semibold capitalize">{category}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-on-surface">Canlı Filo Durumu:</span>
            <span>{pagination.total} Araç Hazır</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Architecture (Sidebar Filter + Catalog Grid) */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-gutter-lg items-start">
        {/* Left Sticky Sidebar Filter (Desktop) & Slide-Over Filter Drawer (Mobile) */}
        <Suspense
          fallback={
            <div className="w-full h-14 lg:w-72 xl:w-80 lg:h-96 bg-surface-container-lowest animate-pulse rounded-xl" />
          }
        >
          <CatalogFilterSidebar />
        </Suspense>

        {/* Right Main Catalog Content */}
        <div className="flex-1 w-full space-y-space-md">
          {/* Top Results Toolbar & Sorting */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-row items-center justify-between gap-space-sm">
            <div>
              <p className="font-body-sm text-xs sm:text-sm text-outline">
                Toplam <span className="font-bold text-on-surface">{pagination.total}</span> araç bulundu
                {search && (
                  <span>
                    {" "}
                    (&ldquo;<span className="font-semibold text-primary">{search}</span>&rdquo; araması)
                  </span>
                )}
              </p>
            </div>

            <Suspense fallback={<div className="w-36 h-8 bg-surface-container-low animate-pulse rounded" />}>
              <CatalogSortDropdown />
            </Suspense>
          </div>

          {/* Vehicle Grid */}
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.slug} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-space-xl border border-outline-variant/30 text-center py-16 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">
                no_crash
              </span>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
                Aramanıza Uygun Araç Bulunamadı
              </h3>
              <p className="font-body-md text-sm text-outline max-w-md mb-6">
                Seçtiğiniz filtreleme kriterlerine uygun araç şu anda müsait görünmüyor. Filtreleri temizleyerek tüm filoya göz atabilirsiniz.
              </p>
              <Link
                href="/vehicles"
                className="bg-primary-container text-on-primary font-label-md px-6 py-2.5 rounded-lg shadow-sm hover:bg-secondary-container transition-all"
              >
                Filtreleri Temizle
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-space-lg">
              <Link
                href={`/vehicles?page=${Math.max(1, pagination.page - 1)}`}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-label-md text-sm border border-outline-variant/40 ${
                  pagination.hasPrevPage
                    ? "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors"
                    : "opacity-40 pointer-events-none"
                }`}
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                Önceki
              </Link>

              <span className="font-body-sm text-sm text-outline">
                Sayfa <span className="font-bold text-on-surface">{pagination.page}</span> /{" "}
                <span className="font-bold text-on-surface">{pagination.totalPages}</span>
              </span>

              <Link
                href={`/vehicles?page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-label-md text-sm border border-outline-variant/40 ${
                  pagination.hasNextPage
                    ? "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors"
                    : "opacity-40 pointer-events-none"
                }`}
              >
                Sonraki
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

