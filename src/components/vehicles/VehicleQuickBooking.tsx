"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IVehicle } from "@/models/Vehicle";

interface VehicleQuickBookingProps {
  vehicle: IVehicle;
  isAuthenticated: boolean;
}

export function VehicleQuickBooking({
  vehicle,
  isAuthenticated,
}: VehicleQuickBookingProps) {
  const router = useRouter();
  const { status } = useSession();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultPickup = tomorrow.toISOString().split("T")[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultDropoff = threeDaysLater.toISOString().split("T")[0];

  const [pickupLocation, setPickupLocation] = useState(vehicle.location);
  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [dropoffDate, setDropoffDate] = useState(defaultDropoff);
  const [errorMessage, setErrorMessage] = useState("");

  const authenticated =
    status === "authenticated" || (status === "loading" && isAuthenticated);

  const pDate = new Date(pickupDate);
  const dDate = new Date(dropoffDate);
  const diffTime =
    !isNaN(pDate.getTime()) && !isNaN(dDate.getTime())
      ? Math.max(0, dDate.getTime() - pDate.getTime())
      : 0;
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = vehicle.pricePerDay * totalDays;
  const tax = +(subtotal * 0.1).toFixed(2);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!pickupLocation.trim() || !pickupDate || !dropoffDate) {
      setErrorMessage("Lütfen teslimat noktası ve tarihleri seçin.");
      return;
    }

    if (new Date(dropoffDate) <= new Date(pickupDate)) {
      setErrorMessage("Teslim tarihi, alış tarihinden sonraki bir gün olmalıdır.");
      return;
    }

    const params = new URLSearchParams({
      pickupLocation: pickupLocation.trim(),
      pickupDate,
      dropoffDate,
    });
    const bookingUrl = `/booking/${vehicle.slug}?${params.toString()}`;

    if (!authenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(bookingUrl)}`);
      return;
    }

    router.push(bookingUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-label-xs uppercase tracking-wider text-outline font-bold">
            Kiralama Bedeli
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-headline-md text-2xl font-bold text-on-surface">
              ${vehicle.pricePerDay.toFixed(2)}/
            </span>
            <span className="font-body-sm text-outline">gün</span>
          </div>
        </div>
        {vehicle.originalPricePerDay && (
          <span className="font-body-sm text-outline line-through">
            ${vehicle.originalPricePerDay.toFixed(2)}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/20">
          <span className="material-symbols-outlined text-base text-error shrink-0">
            error
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3 pt-space-xs border-t border-surface-container">
        <div>
          <label
            htmlFor="quick-pickup-location"
            className="block font-label-sm text-xs font-bold text-on-surface mb-1"
          >
            Teslimat Noktası
          </label>
          <input
            id="quick-pickup-location"
            type="text"
            name="pickupLocation"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:border-primary-container"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="quick-pickup-date"
              className="block font-label-sm text-xs font-bold text-on-surface mb-1"
            >
              Alış Tarihi
            </label>
            <input
              id="quick-pickup-date"
              type="date"
              name="pickupDate"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary-container"
            />
          </div>
          <div>
            <label
              htmlFor="quick-dropoff-date"
              className="block font-label-sm text-xs font-bold text-on-surface mb-1"
            >
              Teslim Tarihi
            </label>
            <input
              id="quick-dropoff-date"
              type="date"
              name="dropoffDate"
              value={dropoffDate}
              onChange={(e) => setDropoffDate(e.target.value)}
              required
              className="w-full h-10 px-2 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary-container"
            />
          </div>
        </div>
      </div>

      {/* Pricing Summary Breakdown */}
      <div className="bg-surface-container-low/70 rounded-lg p-3 space-y-1.5 text-xs border border-surface-container">
        <div className="flex justify-between text-outline">
          <span>
            ${vehicle.pricePerDay.toFixed(2)} x {totalDays} Gün
          </span>
          <span className="font-semibold text-on-surface">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-outline">
          <span>KDV & Hizmet Bedeli (%10)</span>
          <span className="font-semibold text-on-surface">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-on-surface pt-1.5 border-t border-surface-container">
          <span>Tahmini Toplam</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {!authenticated && (
        <div className="p-2.5 rounded-lg bg-primary-container/10 border border-primary-container/25 text-[11px] text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base shrink-0">
            login
          </span>
          <span>
            Rezervasyon için üye girişi gereklidir. Seçtiğiniz tarih ve lokasyon giriş sonrası korunacaktır.
          </span>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3.5 bg-primary-container text-on-primary font-label-md rounded-lg shadow-sm hover:bg-secondary-container hover:shadow-md transition-all font-semibold cursor-pointer active:scale-98 text-center"
      >
        {authenticated ? "Rezervasyon Yap" : "Giriş Yap ve Rezervasyon Yap"}
      </button>

      <p className="text-[11px] text-center text-outline">
        <span className="material-symbols-outlined text-xs align-middle mr-1">
          lock
        </span>
        Stripe güvencesiyle anında ödeme · Depozito araç tesliminde alınır
      </p>
    </form>
  );
}

export default VehicleQuickBooking;
