"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IVehicle } from "@/models/Vehicle";
import { getVehicleImage } from "@/lib/vehicle-images";
import { RatingStars } from "@/components/ui/RatingStars";

interface BookingCheckoutFormProps {
  vehicle: IVehicle;
  initialPickupDate?: string;
  initialDropoffDate?: string;
  initialPickupLocation?: string;
  renterName: string;
  renterEmail: string;
  canceled?: boolean;
}

export function BookingCheckoutForm({
  vehicle,
  initialPickupDate,
  initialDropoffDate,
  initialPickupLocation,
  renterName,
  renterEmail,
  canceled = false,
}: BookingCheckoutFormProps) {
  const router = useRouter();
  // Dates & Location carried over from Vehicle Details (or sensible defaults)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pickupDate = initialPickupDate || tomorrow.toISOString().split("T")[0];

  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 4);
  const dropoffDate = initialDropoffDate || threeDays.toISOString().split("T")[0];

  const pickupLocation =
    initialPickupLocation || vehicle.location || "İstanbul, Kadıköy Hub";
  const dropoffLocation = pickupLocation;
  const pickupTime = "10:00";
  const dropoffTime = "10:00";

  // Add-ons & Extra Services
  const [fullInsurance, setFullInsurance] = useState(true);
  const [additionalDriver, setAdditionalDriver] = useState(false);
  const [gpsWifi, setGpsWifi] = useState(false);

  // Terms and Loading State
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isSubmittingRef = useRef(false);

  // Price & Duration Calculations (matches server-side cent arithmetic)
  const pDate = new Date(pickupDate);
  const dDate = new Date(dropoffDate);
  const diffTime = Math.max(0, dDate.getTime() - pDate.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const baseRental = vehicle.pricePerDay * totalDays;
  const insuranceCost = fullInsurance ? 15 * totalDays : 0;
  const driverCost = additionalDriver ? 10 * totalDays : 0;
  const gpsCost = gpsWifi ? 5 * totalDays : 0;
  const addOnsTotal = insuranceCost + driverCost + gpsCost;

  const subtotal = baseRental + addOnsTotal;
  const taxAmount = +(subtotal * 0.1).toFixed(2);
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    setErrorMessage("");

    if (!termsAgreed) {
      setErrorMessage("Lütfen kiralama koşullarını ve sözleşmesini onaylayın.");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    const selectedAddOns: string[] = [];
    if (fullInsurance) selectedAddOns.push("fullInsurance");
    if (additionalDriver) selectedAddOns.push("additionalDriver");
    if (gpsWifi) selectedAddOns.push("gpsWifi");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleSlug: vehicle.slug,
          vehicleId: vehicle._id ? String(vehicle._id) : undefined,
          pickupLocation,
          dropoffLocation,
          pickupDate,
          dropoffDate,
          pickupTime,
          dropoffTime,
          addOns: selectedAddOns,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        const callbackParams = new URLSearchParams({
          pickupLocation,
          pickupDate,
          dropoffDate,
        });
        const callbackUrl = `/booking/${vehicle.slug}?${callbackParams.toString()}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      if (!res.ok || !data.url) {
        setErrorMessage(
          data.error || "Stripe ödeme oturumu başlatılamadı. Lütfen tekrar deneyin."
        );
        isSubmittingRef.current = false;
        setIsLoading(false);
        return;
      }

      // Server-side Stripe Hosted Checkout redirect (keep button locked while navigating)
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout submission error:", err);
      setErrorMessage("Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.");
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const carImage = getVehicleImage(vehicle.imageSlug);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start"
    >
      {/* =========================================================================
          LEFT COLUMN: Streamlined Authenticated Checkout (7 Cols)
      ========================================================================= */}
      <div className="lg:col-span-7 flex flex-col gap-space-lg">
        {canceled && !errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-900 text-sm flex items-center gap-3 border border-amber-200">
            <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">
              info
            </span>
            <span>
              Ödeme işlemi iptal edildi. Seçimleriniz korundu, hazır olduğunuzda tekrar ödeme adımına geçebilirsiniz.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-3 border border-error/20">
            <span className="material-symbols-outlined text-error text-xl shrink-0">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Carried-Over Schedule & Verified Member Summary (Read-Only) */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Doğrulanmış Rezervasyon Bilgileri
              </span>
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                Seçilen Tarih, Lokasyon & Sürücü
              </h2>
            </div>
            <Link
              href={`/vehicles/${vehicle.slug}`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Değiştir
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                location_on
              </span>
              <div>
                <span className="block text-[11px] text-outline font-semibold uppercase">
                  Teslimat & İade Noktası
                </span>
                <span className="font-bold text-on-surface">{pickupLocation}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                calendar_month
              </span>
              <div>
                <span className="block text-[11px] text-outline font-semibold uppercase">
                  Kiralama Takvimi ({totalDays} Gün)
                </span>
                <span className="font-bold text-on-surface">
                  {pickupDate} → {dropoffDate}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-xl">
                  verified_user
                </span>
                <div>
                  <span className="block text-[11px] text-emerald-800 font-semibold uppercase">
                    Oturum Açmış Sürücü
                  </span>
                  <span className="font-bold text-on-surface">
                    {renterName} · {renterEmail}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                Üye Doğrulandı
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Ek Hizmetler & Kasko Paketleri */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                1. Adım
              </span>
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                Ek Güvence ve Hizmetler
              </h2>
            </div>
            <span className="material-symbols-outlined text-primary text-2xl">
              shield
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Full Insurance */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-surface-container-low cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={fullInsurance}
                  onChange={(e) => setFullInsurance(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary accent-primary-container"
                />
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    Tam Kapsamlı Muafiyetsiz Kasko
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Sıfır muafiyetle kaza, çizik ve lastik/cam hasarlarını güvenceye alın.
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">
                +$15.00/gün
              </span>
            </label>

            {/* Additional Driver */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-surface-container-low cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={additionalDriver}
                  onChange={(e) => setAdditionalDriver(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary accent-primary-container"
                />
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    Ek Sürücü İzni
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Yolculuk boyunca direksiyonu ikinci bir sürücüyle paylaşın.
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">
                +$10.00/gün
              </span>
            </label>

            {/* GPS & Wi-Fi */}
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-surface-container-low cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={gpsWifi}
                  onChange={(e) => setGpsWifi(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary accent-primary-container"
                />
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    Yurt İçi Sınırsız 4G Wi-Fi Hotspot & GPS
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Yolculukta kesintisiz internet bağlantısı ve canlı trafik yönlendirmesi.
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">
                +$5.00/gün
              </span>
            </label>
          </div>
        </div>

        {/* Step 2: Stripe Hosted Checkout Ödeme & Onay */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                2. Adım
              </span>
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                Stripe Güvenli Ödeme & Rezervasyon Onayı
              </h2>
            </div>
            <span className="material-symbols-outlined text-primary text-2xl">
              credit_card
            </span>
          </div>

          <div className="p-4 rounded-xl bg-primary-container/10 border border-primary-container/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Stripe Hosted Checkout ile Güvenli Ödeme</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Onayladığınızda 256-bit SSL ve 3D Secure korumalı Stripe ödeme sayfasına yönlendirileceksiniz. E-posta adresiniz (<strong>{renterEmail}</strong>) otomatik olarak doldurulacaktır.
            </p>
          </div>

          {/* Rental Terms Acceptance Checkbox */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="bookingTerms"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              required
              className="mt-1 w-4 h-4 rounded text-primary-container focus:ring-primary accent-primary-container cursor-pointer"
            />
            <label
              htmlFor="bookingTerms"
              className="text-xs text-on-surface-variant leading-normal cursor-pointer select-none"
            >
              Morent kiralama ve sigorta koşullarını, teslim alma standartlarını ve iptal politikasını okudum, kabul ediyorum.
            </label>
          </div>

          {/* Submit Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary-container text-on-primary hover:bg-secondary-container active:scale-[0.99] font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Stripe Ödeme Sayfasına Yönlendiriliyor...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">lock</span>
                <span>Stripe ile Güvenli Öde (${grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Sticky Rental Summary Card (5 Cols)
      ========================================================================= */}
      <div className="lg:col-span-5 sticky top-24 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="border-b border-surface-container pb-space-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">
              Kiralama Özeti
            </span>
            <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface mt-0.5">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs text-outline capitalize mt-0.5">
              {vehicle.category} · {vehicle.year} Model
            </p>
          </div>

          {/* Vehicle Stage Image */}
          <div className="relative w-full h-36 bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl overflow-hidden flex items-center justify-center p-3 border border-outline-variant/20">
            <Image
              src={carImage}
              alt={vehicle.name}
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-contain p-3 filter drop-shadow-md"
            />
          </div>

          {/* Ratings & Perks Summary */}
          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-1.5">
              <RatingStars rating={vehicle.rating} />
              <span className="font-bold text-on-surface">{vehicle.rating.toFixed(1)}</span>
              <span className="text-outline">({vehicle.reviewCount} Değerlendirme)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
              Hemen Müsait
            </span>
          </div>

          {/* Key Schedule Information */}
          <div className="bg-surface-container-low/60 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-outline">Lokasyon:</span>
              <span className="font-bold text-on-surface">{pickupLocation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Alış Tarihi:</span>
              <span className="font-bold text-on-surface">
                {pickupDate} ({pickupTime})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Teslim Tarihi:</span>
              <span className="font-bold text-on-surface">
                {dropoffDate} ({dropoffTime})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Kiralama Süresi:</span>
              <span className="font-bold text-primary-container">{totalDays} Gün</span>
            </div>
          </div>

          {/* Detailed Price Calculation Breakdown */}
          <div className="space-y-2 pt-2 border-t border-surface-container text-xs sm:text-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Günlük Kiralama ({totalDays} gün × ${vehicle.pricePerDay})</span>
              <span className="font-semibold text-on-surface">${baseRental.toFixed(2)}</span>
            </div>

            {addOnsTotal > 0 && (
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Seçilen Ek Güvenceler</span>
                <span className="font-semibold text-on-surface">+${addOnsTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-on-surface-variant">
              <span>KDV & Hizmet Bedeli (%10)</span>
              <span className="font-semibold text-on-surface">+${taxAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-surface-container my-1 pt-2 flex items-baseline justify-between">
              <div>
                <span className="text-base sm:text-lg font-bold text-on-surface">Toplam Tutar</span>
                <p className="text-[10px] text-outline">Vergiler ve seçilen ekstralar dahil</p>
              </div>
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-primary-container">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Security Guarantee Card */}
          <div className="p-3 rounded-xl bg-surface-container-high/40 flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-xl shrink-0">
              verified
            </span>
            <span>
              <strong>%100 Rezervasyon Garantisi:</strong> Teslimat saatine 24 saat kalana kadar ücretsiz iptal hakkı.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
