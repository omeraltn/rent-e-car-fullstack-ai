import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-16 bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-outline-variant/30 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">
            directions_car
          </span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface">
          Sayfa veya Araç Bulunamadı
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Aradığınız araç filomuzdan kaldırılmış veya sayfa adresi değişmiş olabilir. Güncel araç filomuza göz atarak hemen rezervasyon yapabilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
          <Link
            href="/vehicles"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-secondary-container transition-all shadow-sm"
          >
            Araç Filosunu İncele
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

