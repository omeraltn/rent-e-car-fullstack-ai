import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getVehicleBySlug, getRecommendedVehicles } from "@/lib/vehicles";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehicleQuickBooking } from "@/components/vehicles/VehicleQuickBooking";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { auth } from "@/auth";

interface VehiclePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: "Araç Bulunamadı - Rent-e-Car",
    };
  }

  return {
    title: `${vehicle.name} Kiralama - Rent-e-Car`,
    description: vehicle.description,
  };
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const [vehicle, session] = await Promise.all([
    getVehicleBySlug(slug),
    auth(),
  ]);

  if (!vehicle) {
    notFound();
  }

  // Fetch recommended vehicles excluding current vehicle
  const allRecommended = await getRecommendedVehicles(5);
  const relatedVehicles = allRecommended
    .filter((v) => v.slug !== vehicle.slug)
    .slice(0, 4);

  return (
    <div className="w-full bg-surface pb-space-xl">
      <div className="w-full max-w-7xl mx-auto px-margin-mobile sm:px-margin md:px-gutter-lg py-space-md sm:py-space-lg flex flex-col gap-space-lg">
        {/* Top Breadcrumb & Live Availability Tracker */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-space-sm sm:px-space-md rounded-xl border border-outline-variant/20 shadow-xs"
        >
          <ol className="flex items-center gap-space-xs font-body-sm text-body-sm flex-wrap">
            <li>
              <Link
                href="/"
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">home</span>
                Ana Sayfa
              </Link>
            </li>
            <li className="text-outline-variant select-none">/</li>
            <li>
              <Link
                href="/vehicles"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Araç Filosu
              </Link>
            </li>
            <li className="text-outline-variant select-none">/</li>
            <li>
              <Link
                href={`/vehicles?category=${encodeURIComponent(vehicle.category)}`}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {vehicle.category}
              </Link>
            </li>
            <li className="text-outline-variant select-none">/</li>
            <li className="font-label-sm text-label-sm text-primary font-bold">
              {vehicle.name}
            </li>
          </ol>

          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-full self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              Hemen Teslimata Müsait
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              · {vehicle.location}
            </span>
          </div>
        </nav>

        {/* Main Showcase & Specifications 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          {/* 1. Left Top: Media Showcase & Telemetry (Mobile: Order 1 | Desktop: Col 1-7, Row 1) */}
          <div className="order-1 lg:col-span-7 flex flex-col gap-space-lg">
            {/* Interactive Vehicle Gallery */}
            <VehicleGallery
              imageSlug={vehicle.imageSlug}
              vehicleName={vehicle.name}
            />

            {/* Telemetry & Performance Data Highlights Widget */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">
                    query_stats
                  </span>
                  Performans & Teknik Öne Çıkanlar
                </h3>
                <span className="font-label-xs text-label-xs uppercase px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold">
                  Sertifikalı Güç
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col">
                  <span className="font-body-sm text-on-surface-variant">
                    0-100 km/s Hızlanma
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1">
                    3.2 <span className="text-body-sm font-normal">sn</span>
                  </span>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full w-[92%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col">
                  <span className="font-body-sm text-on-surface-variant">
                    Motor Gücü
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                    {vehicle.horsepower} <span className="text-body-sm font-normal">HP</span>
                  </span>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary-container h-full w-[85%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col">
                  <span className="font-body-sm text-on-surface-variant">
                    Yakıt / Menzil
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 truncate">
                    {vehicle.rangeOrConsumption}
                  </span>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary-container h-full w-[80%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col">
                  <span className="font-body-sm text-on-surface-variant">
                    Yıl & Model
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                    {vehicle.year}
                  </span>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary-container h-full w-[100%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Right Column: Vehicle Specification & Instant Pricing Card (Mobile: Order 2 [Above Reviews] | Desktop: Col 8-12, Row Span 2) */}
          <div className="order-2 lg:col-span-5 lg:row-span-2 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
              {/* Card Title & Category Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-xs text-label-xs uppercase px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                      {vehicle.category}
                    </span>
                    <span className="font-label-xs text-label-xs text-outline font-semibold">
                      · {vehicle.year} Model
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold mt-1">
                    {vehicle.name}
                  </h1>
                </div>
              </div>

              {/* Star Ratings & Review Counts */}
              <div className="flex items-center gap-space-sm flex-wrap">
                <RatingStars rating={vehicle.rating} />
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {vehicle.rating.toFixed(1)}
                </span>
                <span className="font-body-md text-body-md text-outline">·</span>
                <a
                  href="#customerReviewsSection"
                  className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors underline decoration-dotted"
                >
                  {vehicle.reviewCount}+ Doğrulanmış Değerlendirme
                </a>
              </div>

              {/* Description */}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {vehicle.description}
              </p>

              {/* Technical Specs Grid: 2 Cols x 4 Rows */}
              <div className="bg-surface-container-low/60 rounded-xl p-space-md grid grid-cols-2 gap-y-space-md gap-x-space-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">directions_car</span>
                    Kategori
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">settings</span>
                    Vites
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.transmission}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person</span>
                    Kapasite
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.seats} Kişi
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">local_gas_station</span>
                    Yakıt Tipi
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.fuelType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">bolt</span>
                    Güç
                  </span>
                  <span className="font-label-md text-label-md text-primary font-bold">
                    {vehicle.horsepower} HP
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">luggage</span>
                    Bagaj
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.luggageCapacity} Çanta
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">payments</span>
                    Depozito
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    ${vehicle.depositAmount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">speed</span>
                    Km Sınırı
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {vehicle.mileageLimit}
                  </span>
                </div>
              </div>

              {/* Features Badges */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {vehicle.features.map((feat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant font-label-xs text-xs px-2.5 py-1 rounded-md"
                    >
                      <span className="material-symbols-outlined text-xs text-primary-container">
                        check
                      </span>
                      {feat}
                    </span>
                  ))}
                </div>
              )}

              {/* Included Perks Badge Row */}
              <div className="flex items-center justify-between py-2 bg-surface rounded-lg px-space-md border border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-base">
                    check_circle
                  </span>
                  {vehicle.mileageLimit === "Sınırsız" ? "Sınırsız Kilometre" : `${vehicle.mileageLimit} Dahil`}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-base">
                    check_circle
                  </span>
                  Dezenfekte Edilmiş Araç
                </span>
              </div>

              {/* Quick Booking Widget / Pricing Action */}
              <VehicleQuickBooking
                vehicle={vehicle}
                isAuthenticated={Boolean(session?.user?.id)}
              />

              {/* Trust Guarantee Micro-Card */}
              <div className="bg-surface-container-high/40 rounded-xl p-space-md flex items-center gap-space-md mt-1">
                <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    %100 Güvenli Rezervasyon
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Teslimat saatinden 24 saat öncesine kadar kesintisiz ücretsiz iptal.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Left Bottom: Customer Reviews & Ratings Section (Mobile: Order 3 [Below Booking] | Desktop: Col 1-7, Row 2) */}
          <div
            className="order-3 lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg"
            id="customerReviewsSection"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Müşteri Değerlendirmeleri
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
                  {vehicle.reviewCount}
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-outline font-body-sm text-body-sm">
                <span>Sıralama:</span>
                <span className="text-on-surface font-semibold cursor-pointer">
                  En İlgili ↓
                </span>
              </div>
            </div>

            {/* Review Card 1 */}
            <div className="flex flex-col gap-space-sm pb-space-lg border-b border-surface-container-high">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-low shrink-0 flex items-center justify-center font-bold text-primary">
                    MK
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-title-md text-title-md text-on-surface font-bold">
                      Murat Karahan
                    </h4>
                    <span className="font-body-sm text-body-sm text-outline">
                      İş İnsanı · İstanbul
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-body-sm text-body-sm text-outline">
                    14 Nisan 2024
                  </span>
                  <RatingStars rating={5} />
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pl-0 md:pl-16">
                Morent ile kiralama deneyimi gerçekten kusursuzdu. Araç tertemiz, yakıt deposu dolu ve tam vaktinde teslim edildi. {vehicle.name} hem konforu hem de hızlanmasıyla yolculuğumuzu unutulmaz kıldı. Kesinlikle tekrar kiralayacağım.
              </p>
            </div>

            {/* Review Card 2 */}
            <div className="flex flex-col gap-space-sm pb-space-lg border-b border-surface-container-high">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container text-on-secondary shrink-0 flex items-center justify-center font-bold">
                    SY
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-title-md text-title-md text-on-surface font-bold">
                      Selin Yılmaz
                    </h4>
                    <span className="font-body-sm text-body-sm text-outline">
                      Girişimci · İzmir
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-body-sm text-body-sm text-outline">
                    8 Mart 2024
                  </span>
                  <RatingStars rating={5} />
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pl-0 md:pl-16">
                {vehicle.location} şubesinden teslim aldım. İşlemler 3 dakika sürdü, hiçbir bekleme yaşamadım. Aracın sürüş hissiyatı ve performansı mükemmeldi. Destek ekibi de her soruma anında yanıt verdi.
              </p>
            </div>

            {/* Expand All Reviews Button */}
            <div className="flex justify-center pt-space-xs">
              <button
                type="button"
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors px-4 py-2 rounded-lg hover:bg-surface-container-low"
              >
                <span>Tüm Değerlendirmeleri Göster ({vehicle.reviewCount})</span>
                <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent & Recommended Vehicles Section */}
        {relatedVehicles.length > 0 && (
          <div className="flex flex-col gap-space-lg pt-space-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Önerilen Benzer Araçlar
                </h3>
                <p className="font-body-sm text-outline mt-0.5">
                  Aynı kategorideki diğer popüler seçeneklerimizi inceleyin
                </p>
              </div>
              <Link
                href="/vehicles"
                className="font-label-md text-label-md text-primary hover:text-primary-container font-bold flex items-center gap-1 transition-colors"
              >
                Tüm Araçları Gör
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md sm:gap-gutter">
              {relatedVehicles.map((relVehicle) => (
                <VehicleCard key={relVehicle._id ? String(relVehicle._id) : relVehicle.slug} vehicle={relVehicle} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

