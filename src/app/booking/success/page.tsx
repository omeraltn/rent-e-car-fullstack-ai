import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Vehicle } from "@/models/Vehicle";
import { getVehicleImage } from "@/lib/vehicle-images";
import { verifyAndConfirmStripeBooking } from "@/lib/booking-payments";

interface BookingSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Rezervasyon Onayı - Rent-e-Car",
  description: "Araç kiralama rezervasyonunuz başarıyla tamamlandı.",
};

interface PopulatedBooking {
  _id: string;
  user: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  totalDays: number;
  totalPrice: number;
  renterName: string;
  paymentStatus: string;
  vehicle?: {
    name: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    imageSlug: string;
    location: string;
  } | null;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const query = await searchParams;
  const sessionId = typeof query.session_id === "string" ? query.session_id : null;
  const bookingId = typeof query.bookingId === "string" ? query.bookingId : null;

  const authSession = await auth();
  if (!authSession?.user?.id) {
    const callbackParams = new URLSearchParams();
    if (sessionId) callbackParams.set("session_id", sessionId);
    if (bookingId) callbackParams.set("bookingId", bookingId);
    const qs = callbackParams.toString();
    const callbackUrl = qs ? `/booking/success?${qs}` : "/booking/success";
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let booking: PopulatedBooking | null = null;
  let verificationError: string | null = null;

  if (sessionId) {
    const result = await verifyAndConfirmStripeBooking(sessionId, authSession.user.id);
    if (result.status === "confirmed" && result.booking) {
      booking = result.booking as unknown as PopulatedBooking;
    } else {
      verificationError =
        result.message || "Ödeme oturumu doğrulanamadı veya henüz tamamlanmadı.";
    }
  } else if (bookingId) {
    try {
      await connectDB();
      void Vehicle;
      const found = await Booking.findOne({
        _id: bookingId,
        user: authSession.user.id,
      })
        .populate("vehicle")
        .lean();
      if (found) {
        booking = JSON.parse(JSON.stringify(found)) as PopulatedBooking;
      } else {
        verificationError = "Rezervasyon kaydı bulunamadı.";
      }
    } catch (e) {
      console.error("Error fetching booking confirmation:", e);
      verificationError = "Rezervasyon bilgileri alınırken bir hata oluştu.";
    }
  } else {
    verificationError = "Geçerli bir Stripe ödeme oturumu bulunamadı.";
  }

  if (verificationError || !booking) {
    return (
      <div className="w-full bg-surface py-space-xl min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-8 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-error">
                error_outline
              </span>
            </div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Ödeme Doğrulanamadı
            </h1>
            <p className="text-sm text-on-surface-variant max-w-md">
              {verificationError || "Rezervasyon onaylanamadı."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/bookings"
                className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-bold hover:bg-surface-container-low transition-all"
              >
                Rezervasyonlarım
              </Link>
              <Link
                href="/vehicles"
                className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-bold hover:bg-secondary-container transition-all"
              >
                Araç Filosuna Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vehicle = booking.vehicle || null;
  const vehicleImage = vehicle ? getVehicleImage(vehicle.imageSlug) : null;
  const referenceCode = `MRT-${String(booking._id).slice(-6).toUpperCase()}`;

  return (
    <div className="w-full bg-surface py-space-xl min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Voucher Canvas */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden flex flex-col">
          {/* Top Celebration Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-primary to-primary-container p-6 sm:p-8 text-on-primary flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>

            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-md">
              <span className="material-symbols-outlined text-4xl text-white">
                check_circle
              </span>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-emerald-100 mb-2">
              Ödeme & Rezervasyon Onaylandı
            </span>

            <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-white">
              Tebrikler! Aracınız Adınıza Ayrıldı.
            </h1>
            <p className="font-body-md text-sm text-emerald-100/90 max-w-md mt-1">
              Stripe ödemeniz doğrulandı ve rezervasyonunuz hesabınıza kaydedildi.
            </p>

            <div className="mt-4 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white font-mono text-xs sm:text-sm tracking-wider font-bold">
              Referans Kodu: <span className="text-yellow-300">{referenceCode}</span>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Vehicle Summary Card */}
            {vehicle && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                {vehicleImage && (
                  <div className="relative w-full sm:w-40 h-24 bg-surface-container-lowest rounded-lg p-2 flex items-center justify-center shrink-0">
                    <Image
                      src={vehicleImage}
                      alt={vehicle.name}
                      fill
                      sizes="160px"
                      className="object-contain p-2 filter drop-shadow-sm"
                    />
                  </div>
                )}
                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-xs font-bold uppercase text-primary tracking-wider">
                    {vehicle.category} · {vehicle.year} Model
                  </span>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    {booking.pickupLocation || vehicle.location} Teslimat Noktası
                  </p>
                </div>
              </div>
            )}

            {/* Schedule & Pricing Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 flex flex-col gap-2">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  Kiralama Takvimi
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Alış:</span>
                  <span className="font-bold text-on-surface">
                    {new Date(booking.pickupDate).toLocaleDateString("tr-TR")} (
                    {booking.pickupTime || "10:00"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">İade:</span>
                  <span className="font-bold text-on-surface">
                    {new Date(booking.dropoffDate).toLocaleDateString("tr-TR")} (
                    {booking.dropoffTime || "10:00"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Süre:</span>
                  <span className="font-bold text-primary">
                    {booking.totalDays || 1} Gün
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 flex flex-col gap-2">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  Müşteri & Ödeme
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Sürücü:</span>
                  <span className="font-bold text-on-surface truncate max-w-[160px]">
                    {booking.renterName || "Değerli Müşterimiz"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Ödeme Durumu:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                    Ödendi (Stripe)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-1">
                  <span className="font-bold text-on-surface">Toplam Tutar:</span>
                  <span className="font-extrabold text-primary-container text-base">
                    ${Number(booking.totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Advisory */}
            <div className="p-4 rounded-xl bg-primary-container/5 border border-primary-container/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl shrink-0 mt-0.5">
                info
              </span>
              <div className="flex flex-col text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface text-sm mb-0.5">
                  Aracınızı Teslim Alırken Unutmamanız Gerekenler:
                </span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Geçerli T.C. Kimlik / Pasaport</li>
                  <li>En az 2 yıllık geçerli Sürücü Belgesi</li>
                  <li>
                    Referans Kodu: <strong>{referenceCode}</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-surface-container">
              <Link
                href="/vehicles"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-low text-xs sm:text-sm font-bold text-center transition-colors"
              >
                Araç Filosuna Göz At
              </Link>
              <Link
                href="/bookings"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-secondary-container text-xs sm:text-sm font-bold text-center shadow-md hover:shadow-lg transition-all"
              >
                Rezervasyonlarıma Git
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
