import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedVehicles, getRecommendedVehicles } from "@/lib/vehicles";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { PickupDropoffWidget } from "@/components/ui/PickupDropoffWidget";
import { generateCarImageUrl } from "@/lib/vehicle-images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredVehicles, recommendedVehicles] = await Promise.all([
    getFeaturedVehicles(4),
    getRecommendedVehicles(8),
  ]);

  const leftHeroCarUrl = generateCarImageUrl("porsche-911-gt3", "23", {
    paintId: "pspc0027",
    paintDescription: "alpine-white",
  });

  const rightHeroCarUrl = generateCarImageUrl("rolls-royce-ghost", "23", {
    paintId: "11272",
    paintDescription: "vermillion-red",
  });

  return (
    <div className="relative w-full overflow-hidden">
      {/* Top Background Ambient Glows */}
      <div className="absolute -top-40 -left-20 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 -right-20 w-96 h-96 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full px-margin-mobile sm:px-margin md:px-gutter lg:px-margin-desktop py-space-lg flex flex-col gap-space-xl">
        {/* =========================================================================
            1. DUAL HERO PROMOTIONAL BANNERS (Imagin Studio Transparent Renders)
        ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* Left Banner (Royal Blue Supercar Showcase) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3563E9] via-[#2651D4] to-[#13389E] text-white shadow-xl min-h-[360px] sm:min-h-[390px] flex flex-col justify-between p-6 sm:p-8 lg:p-9 group border border-white/15">
            {/* Decorative Concentric Speed Rings */}
            <div className="absolute -right-16 -bottom-24 w-96 h-96 rounded-full border-[18px] border-white/[0.06] pointer-events-none"></div>
            <div className="absolute -right-4 -bottom-12 w-72 h-72 rounded-full border-[14px] border-white/[0.06] pointer-events-none"></div>
            <div className="absolute right-8 bottom-0 w-48 h-48 rounded-full border-[10px] border-white/[0.06] pointer-events-none"></div>

            {/* Content Top Block */}
            <div className="relative z-10 max-w-sm flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                Özel Filo Fırsatı
              </div>

              <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-[1.18]">
                Araç Kiralamanın <br />
                En Kolay Yolu
              </h1>

              <p className="font-body-md text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-2.5">
                Güvenli, şeffaf ve konforlu araç kiralama deneyimi. Üstelik piyasanın en rekabetçi fiyatlarıyla.
              </p>

              <Link
                href="/vehicles"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-[#13389E] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 active:scale-[0.98] transition-all group/btn"
              >
                <span>Hemen Araç Kirala</span>
                <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/btn:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Imagin Studio Transparent Car Render (Bottom Right) */}
            <div className="relative z-10 w-full flex justify-end items-end mt-2 sm:-mt-6 pointer-events-none">
              <div className="relative w-64 sm:w-80 md:w-96 h-36 sm:h-44 flex items-center justify-center">
                <div className="absolute bottom-2 w-4/5 h-5 bg-slate-950/35 rounded-full blur-lg"></div>
                <Image
                  src={leftHeroCarUrl}
                  alt="Porsche 911 GT3 Studio Render"
                  fill
                  priority
                  sizes="(max-width: 768px) 280px, 384px"
                  className="object-contain object-right-bottom drop-shadow-[0_18px_22px_rgba(0,10,40,0.45)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Banner (Deep Midnight Luxury Showcase) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2557] via-[#17377A] to-[#234DB0] text-white shadow-xl min-h-[360px] sm:min-h-[390px] flex flex-col justify-between p-6 sm:p-8 lg:p-9 group border border-white/15">
            {/* Decorative Geometric Chevron Pattern */}
            <div className="absolute -right-16 -bottom-24 w-96 h-96 rounded-3xl rotate-12 border-[18px] border-white/[0.05] pointer-events-none"></div>
            <div className="absolute -right-4 -bottom-12 w-72 h-72 rounded-3xl rotate-12 border-[14px] border-white/[0.05] pointer-events-none"></div>

            {/* Content Top Block */}
            <div className="relative z-10 max-w-sm flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white mb-3">
                <span className="material-symbols-outlined text-sm text-cyan-300">bolt</span>
                Hızlı Rezervasyon
              </div>

              <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-[1.18]">
                Lüks ve Konfor <br />
                Parmaklarınızın Ucunda
              </h2>

              <p className="font-body-md text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-2.5">
                İster iş seyahati, ister hafta sonu kaçamağı. Türkiye genelinde dilediğiniz noktadan teslim alın.
              </p>

              <Link
                href="/vehicles?category=Lüks"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-[#0F2557] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-cyan-50 active:scale-[0.98] transition-all group/btn"
              >
                <span>Lüks Filoyu İncele</span>
                <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/btn:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Imagin Studio Transparent Car Render (Bottom Right) */}
            <div className="relative z-10 w-full flex justify-end items-end mt-2 sm:-mt-6 pointer-events-none">
              <div className="relative w-64 sm:w-80 md:w-96 h-36 sm:h-44 flex items-center justify-center">
                <div className="absolute bottom-2 w-4/5 h-5 bg-slate-950/40 rounded-full blur-lg"></div>
                <Image
                  src={rightHeroCarUrl}
                  alt="Rolls-Royce Ghost Studio Render"
                  fill
                  priority
                  sizes="(max-width: 768px) 280px, 384px"
                  className="object-contain object-right-bottom drop-shadow-[0_18px_22px_rgba(0,10,40,0.45)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. PICK-UP & DROP-OFF BOOKING WIDGET
        ========================================================================= */}
        <PickupDropoffWidget />

        {/* =========================================================================
            3. POPÜLER ARAÇLAR (POPULAR CARS) SECTION
        ========================================================================= */}
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Popüler Araçlar
            </h2>
            <Link
              href="/vehicles?featured=true"
              className="font-label-md text-label-md text-primary hover:text-secondary font-bold transition-colors"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {featuredVehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} priority={index < 2} />
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. ÖNERİLEN ARAÇLAR (RECOMMENDED CARS) GRID
        ========================================================================= */}
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Önerilen Araçlar
            </h2>
            <Link
              href="/vehicles"
              className="font-label-md text-label-md text-primary hover:text-secondary font-bold transition-colors"
            >
              Kataloğu Aç
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {recommendedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>

          {/* Show More CTA */}
          <div className="flex justify-center mt-space-lg">
            <Link
              href="/vehicles"
              className="bg-primary-container text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-lg shadow-sm hover:bg-secondary-container hover:shadow-md transition-all font-semibold inline-flex items-center gap-2"
            >
              <span>Daha Fazla Araç Göster</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            5. MÜŞTERİ DEĞERLENDİRMELERİ (REVIEWS / TESTIMONIALS)
        ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl border border-outline-variant/30 my-space-md">
          <div className="flex items-center justify-between mb-space-lg">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Müşteri Yorumları & Deneyimler
              </h2>
              <p className="font-body-sm text-body-sm text-outline mt-1">
                Türkiye genelinde binlerce mutlu sürücünün deneyimlerini keşfedin
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-label-sm font-bold text-amber-800">4.9 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Review 1 */}
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                    alt="Can Demir"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/20"
                  />
                  <div>
                    <h4 className="font-title-md font-bold text-on-surface">Can Demir</h4>
                    <p className="font-body-sm text-outline">Girişimci · Nissan GT-R Nismo kiraladı</p>
                  </div>
                </div>
                <span className="font-body-sm text-xs text-outline">15 Temmuz 2024</span>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                &ldquo;İstanbul Kadıköy şubesinden aldığım Nissan GT-R kusursuz durumdaydı. Teslimat süreci 5 dakika bile sürmedi. Hem aracın kondisyonu hem de ekibin ilgisi harikaydı. Kesinlikle tavsiye ederim.&rdquo;
              </p>
            </div>

            {/* Review 2 */}
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt="Selin Arslan"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/20"
                  />
                  <div>
                    <h4 className="font-title-md font-bold text-on-surface">Selin Arslan</h4>
                    <p className="font-body-sm text-outline">Tasarım Direktörü · Rolls-Royce Ghost kiraladı</p>
                  </div>
                </div>
                <span className="font-body-sm text-xs text-outline">28 Ağustos 2024</span>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                &ldquo;Beşiktaş ofisinden kiraladığımız Rolls-Royce Ghost iş etkinliğimiz için muazzam bir prestij sağladı. Fiyatlandırma tamamen şeffaftı, gizli hiçbir ücretle karşılaşmadık. Teşekkürler Morent!&rdquo;
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
