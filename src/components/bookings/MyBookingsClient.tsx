"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingDisplayStatus, MyBookingDTO } from "@/lib/booking-status";

type FilterKey = "all" | BookingDisplayStatus;

const STATUS_META: Record<
  BookingDisplayStatus,
  { label: string; icon: string; badge: string; accent: string }
> = {
  paid: {
    label: "Ödendi",
    icon: "check_circle",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    accent: "bg-emerald-500",
  },
  completed: {
    label: "Tamamlandı",
    icon: "flag",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
    accent: "bg-sky-500",
  },
  pending: {
    label: "Ödeme Bekleniyor",
    icon: "schedule",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    accent: "bg-amber-500",
  },
  failed: {
    label: "Ödeme Başarısız",
    icon: "error",
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    accent: "bg-red-500",
  },
  expired: {
    label: "Süresi Doldu",
    icon: "timer_off",
    badge: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
    accent: "bg-zinc-400",
  },
  cancelled: {
    label: "İptal Edildi",
    icon: "cancel",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
    accent: "bg-slate-400",
  },
  refunded: {
    label: "İade Edildi",
    icon: "currency_exchange",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/20",
    accent: "bg-violet-500",
  },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "paid", label: "Ödendi" },
  { key: "pending", label: "Bekleyen" },
  { key: "completed", label: "Tamamlanan" },
  { key: "failed", label: "Başarısız" },
  { key: "expired", label: "Süresi Dolan" },
  { key: "cancelled", label: "İptal" },
  { key: "refunded", label: "İade" },
];

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export function MyBookingsClient() {
  const router = useRouter();
  const [bookings, setBookings] = useState<MyBookingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async (): Promise<
    { ok: true; bookings: MyBookingDTO[] } | { ok: false; error: string } | null
  > => {
    try {
      const res = await fetch("/api/bookings/my-bookings", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=/bookings");
        return null;
      }
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Rezervasyonlar alınamadı." };
      return { ok: true, bookings: data.bookings as MyBookingDTO[] };
    } catch {
      return { ok: false, error: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin." };
    }
  }, [router]);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof fetchBookings>>) => {
      if (result?.ok) {
        setBookings(result.bookings);
        setError(null);
      } else if (result) {
        setError(result.error);
      }
      setIsLoading(false);
      setIsRefreshing(false);
    },
    []
  );

  const load = useCallback(async () => {
    setIsRefreshing(true);
    applyResult(await fetchBookings());
  }, [fetchBookings, applyResult]);

  useEffect(() => {
    let active = true;
    fetchBookings().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [fetchBookings, applyResult]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const b of bookings) c[b.displayStatus] = (c[b.displayStatus] || 0) + 1;
    return c;
  }, [bookings]);

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.displayStatus === filter)),
    [bookings, filter]
  );

  const totalSpent = useMemo(
    () =>
      bookings
        .filter((b) => b.displayStatus === "paid" || b.displayStatus === "completed")
        .reduce((s, b) => s + b.totalPrice, 0),
    [bookings]
  );

  async function handleCancel(id: string) {
    if (!window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) window.alert(data.error || "İptal işlemi başarısız oldu.");
    } finally {
      setCancellingId(null);
      load();
    }
  }

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-5rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-primary mb-1.5">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span className="text-xs font-bold uppercase tracking-wider">Hesabım</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Rezervasyonlarım
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Tüm kiralama geçmişiniz ve ödeme durumlarınız tek bir yerde.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            disabled={isRefreshing || isLoading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-60 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-lg ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
            Yenile
          </button>
        </div>

        {/* Summary */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <SummaryStat icon="directions_car" label="Toplam Rezervasyon" value={String(bookings.length)} />
            <SummaryStat
              icon="verified"
              label="Aktif / Ödenmiş"
              value={String(counts.paid || 0)}
              tone="text-emerald-600"
            />
            <SummaryStat
              icon="schedule"
              label="Ödeme Bekleyen"
              value={String(counts.pending || 0)}
              tone="text-amber-600"
            />
            <SummaryStat icon="payments" label="Toplam Harcama" value={money(totalSpent)} tone="text-primary" />
          </div>
        )}

        {/* Filters */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" role="tablist">
            {FILTERS.filter((f) => f.key === "all" || counts[f.key]).map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-primary-container text-on-primary shadow-md"
                      : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low"
                  }`}
                >
                  {f.label}
                  <span
                    className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      active ? "bg-white/20" : "bg-surface-container"
                    }`}
                  >
                    {counts[f.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <StateCard
            icon="error_outline"
            iconTone="text-error bg-error-container"
            title="Rezervasyonlar yüklenemedi"
            text={error}
            action={
              <button
                onClick={() => load()}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-bold hover:bg-secondary-container transition-all cursor-pointer"
              >
                Tekrar Dene
              </button>
            }
          />
        ) : bookings.length === 0 ? (
          <StateCard
            icon="car_rental"
            iconTone="text-primary bg-primary-fixed/40"
            title="Henüz bir rezervasyonunuz yok"
            text="Premium filomuzu keşfedin ve ilk kiralamanızı birkaç dakikada tamamlayın."
            action={
              <Link
                href="/vehicles"
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-bold hover:bg-secondary-container transition-all"
              >
                Araç Filosunu Keşfet
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <StateCard
            icon="filter_alt_off"
            iconTone="text-outline bg-surface-container"
            title="Bu filtrede rezervasyon yok"
            text="Farklı bir durum seçmeyi deneyin."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {visible.map((b) => (
              <li key={b.id}>
                <BookingCard
                  booking={b}
                  isCancelling={cancellingId === b.id}
                  onCancel={() => handleCancel(b.id)}
                  onWindowElapsed={() => load()}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  tone = "text-on-surface",
}: {
  icon: string;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 flex items-center gap-3 shadow-xs">
      <span className={`material-symbols-outlined text-2xl ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-bold text-outline truncate">{label}</p>
        <p className={`text-lg font-extrabold ${tone} truncate`}>{value}</p>
      </div>
    </div>
  );
}

function StateCard({
  icon,
  iconTone,
  title,
  text,
  action,
}: {
  icon: string;
  iconTone: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-10 flex flex-col items-center text-center gap-3 shadow-sm">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconTone}`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h2 className="text-lg font-bold text-on-surface">{title}</h2>
      <p className="text-sm text-on-surface-variant max-w-md">{text}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingDisplayStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${meta.badge}`}
    >
      <span className="material-symbols-outlined text-sm leading-none">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

function useCountdown(target?: string, onElapsed?: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const onElapsedRef = useRef(onElapsed);
  useEffect(() => {
    onElapsedRef.current = onElapsed;
  }, [onElapsed]);

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    const t = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= end) {
        window.clearInterval(t);
        onElapsedRef.current?.();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [target]);

  if (!target) return null;
  const s = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function BookingCard({
  booking: b,
  isCancelling,
  onCancel,
  onWindowElapsed,
}: {
  booking: MyBookingDTO;
  isCancelling: boolean;
  onCancel: () => void;
  onWindowElapsed: () => void;
}) {
  const meta = STATUS_META[b.displayStatus];
  const countdown = useCountdown(b.checkoutExpiresAt, onWindowElapsed);
  const isOpen = b.displayStatus === "pending" || (b.displayStatus === "failed" && !!b.checkoutUrl);
  const muted = ["expired", "cancelled", "refunded"].includes(b.displayStatus);

  const statusNote = (() => {
    switch (b.displayStatus) {
      case "paid":
        return b.paidAt ? `Ödeme alındı · ${dateTimeFmt.format(new Date(b.paidAt))}` : null;
      case "failed":
        return b.paymentFailureReason || "Ödeme işlemi başarısız oldu.";
      case "expired":
        return "30 dakikalık ödeme süresi içinde ödeme yapılmadı.";
      case "cancelled":
        return b.cancelledAt ? `İptal tarihi · ${dateTimeFmt.format(new Date(b.cancelledAt))}` : null;
      case "refunded":
        return b.refundedAt ? `İade tarihi · ${dateTimeFmt.format(new Date(b.refundedAt))}` : null;
      default:
        return null;
    }
  })();

  return (
    <article className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta.accent}`} aria-hidden />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5 pl-5 sm:pl-6">
        {/* Vehicle */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div
            className={`relative w-32 h-20 sm:w-36 sm:h-24 shrink-0 rounded-xl bg-surface-container-low overflow-hidden ${
              muted ? "grayscale opacity-70" : ""
            }`}
          >
            {b.vehicle ? (
              <Image
                src={b.vehicle.imageUrl}
                alt={b.vehicle.name}
                fill
                sizes="144px"
                className="object-contain p-1.5"
              />
            ) : (
              <span className="material-symbols-outlined absolute inset-0 m-auto w-fit h-fit text-4xl text-outline">
                directions_car
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">
              {b.vehicle ? `${b.vehicle.category} · ${b.vehicle.year}` : "Araç"}
            </p>
            {b.vehicle ? (
              <Link
                href={`/vehicles/${b.vehicle.slug}`}
                className="block text-base sm:text-lg font-bold text-on-surface hover:text-primary truncate transition-colors"
              >
                {b.vehicle.brand} {b.vehicle.model}
              </Link>
            ) : (
              <p className="text-base font-bold text-on-surface">Araç kaldırılmış</p>
            )}
            {b.vehicle && (
              <p className="text-xs text-outline truncate">
                {b.vehicle.transmission} · {b.vehicle.fuelType} · {b.vehicle.seats} Koltuk
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{b.referenceCode}</p>
          </div>
        </div>

        {/* Rental period */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-container-low/60 p-3">
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-outline">
              <span className="material-symbols-outlined text-sm">flight_takeoff</span>Alış
            </p>
            <p className="font-bold text-on-surface mt-0.5">
              {dateFmt.format(new Date(b.pickupDate))}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {b.pickupTime} · {b.pickupLocation}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low/60 p-3">
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-outline">
              <span className="material-symbols-outlined text-sm">flight_land</span>İade
            </p>
            <p className="font-bold text-on-surface mt-0.5">
              {dateFmt.format(new Date(b.dropoffDate))}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {b.dropoffTime} · {b.dropoffLocation}
            </p>
          </div>
          <p className="col-span-2 text-xs text-on-surface-variant">
            <span className="font-bold text-primary">{b.totalDays} gün</span> ·{" "}
            {money(b.pricePerDay)}/gün · Oluşturulma {dateTimeFmt.format(new Date(b.createdAt))}
          </p>
        </div>

        {/* Status & amount */}
        <div className="md:col-span-3 flex md:flex-col md:items-end justify-between gap-2">
          <StatusBadge status={b.displayStatus} />
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Toplam Tutar</p>
            <p
              className={`text-xl font-extrabold ${
                muted ? "text-outline line-through decoration-1" : "text-primary-container"
              }`}
            >
              {money(b.totalPrice)}
            </p>
            <p className="text-[11px] text-outline">KDV dahil ({money(b.taxAmount)})</p>
          </div>
        </div>
      </div>

      {/* Footer: status note & actions */}
      {(statusNote || isOpen) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t border-surface-container bg-surface-container-low/40">
          <p
            className={`text-xs flex items-center gap-1.5 ${
              b.displayStatus === "failed" ? "text-red-700" : "text-on-surface-variant"
            }`}
          >
            {b.displayStatus === "pending" && countdown ? (
              <>
                <span className="material-symbols-outlined text-sm text-amber-600">timer</span>
                Ödemeyi tamamlamak için kalan süre:
                <span className="font-mono font-bold text-amber-700">{countdown}</span>
              </>
            ) : (
              statusNote && (
                <>
                  <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                  {statusNote}
                </>
              )
            )}
          </p>

          {isOpen && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="px-3.5 h-9 rounded-lg border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isCancelling ? "İptal ediliyor..." : "İptal Et"}
              </button>
              {b.checkoutUrl && (
                <a
                  href={b.checkoutUrl}
                  className="inline-flex items-center gap-1 px-3.5 h-9 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-secondary-container shadow-sm transition-all"
                >
                  {b.displayStatus === "failed" ? "Tekrar Dene" : "Ödemeye Devam Et"}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default MyBookingsClient;
