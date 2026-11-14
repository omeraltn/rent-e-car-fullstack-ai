"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BRANDS = [
  "Nissan",
  "Porsche",
  "BMW",
  "Mercedes-Benz",
  "Rolls-Royce",
  "Tesla",
  "Audi",
  "Koenigsegg",
  "Honda",
];

const CATEGORIES = [
  "Spor",
  "SUV",
  "Sedan",
  "Coupe",
  "Lüks",
  "Elektrik",
];

const SEAT_OPTIONS = [
  { label: "2 Kişi", value: 2 },
  { label: "4 Kişi", value: 4 },
  { label: "5 Kişi", value: 5 },
];

export function CatalogFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract initial filter values from URL
  const selectedBrands = searchParams?.get("brand")?.split(",").filter(Boolean) || [];
  const selectedCategories = searchParams?.get("category")?.split(",").filter(Boolean) || [];
  const selectedSeats = searchParams?.get("seats")?.split(",").map(Number).filter(Boolean) || [];
  const hasPriceFilter = Boolean(searchParams?.has("maxPrice"));
  const initialMaxPrice = Number(searchParams?.get("maxPrice")) || 200;

  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const activeFilterCount =
    selectedBrands.length +
    selectedCategories.length +
    selectedSeats.length +
    (hasPriceFilter ? 1 : 0);

  useEffect(() => {
    if (searchParams?.has("maxPrice")) {
      setMaxPrice(Number(searchParams.get("maxPrice")) || 200);
    } else {
      setMaxPrice(200);
    }
  }, [searchParams]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    // Reset pagination to page 1 on filter change
    params.delete("page");

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`/vehicles?${params.toString()}`);
  };

  const handleBrandToggle = (brand: string) => {
    let updated = [...selectedBrands];
    if (updated.includes(brand)) {
      updated = updated.filter((b) => b !== brand);
    } else {
      updated.push(brand);
    }
    updateFilters({ brand: updated.length ? updated.join(",") : null });
  };

  const handleCategoryToggle = (cat: string) => {
    let updated = [...selectedCategories];
    if (updated.includes(cat)) {
      updated = updated.filter((c) => c !== cat);
    } else {
      updated.push(cat);
    }
    updateFilters({ category: updated.length ? updated.join(",") : null });
  };

  const handleSingleCategoryPill = (cat: string | null) => {
    if (cat === null) {
      updateFilters({ category: null });
    } else if (selectedCategories.length === 1 && selectedCategories[0] === cat) {
      updateFilters({ category: null });
    } else {
      updateFilters({ category: cat });
    }
  };

  const handleSeatToggle = (seatNum: number) => {
    let updated = [...selectedSeats];
    if (updated.includes(seatNum)) {
      updated = updated.filter((s) => s !== seatNum);
    } else {
      updated.push(seatNum);
    }
    updateFilters({ seats: updated.length ? updated.join(",") : null });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMaxPrice(val);
  };

  const handlePriceCommit = () => {
    updateFilters({ maxPrice: maxPrice.toString() });
  };

  const handleReset = () => {
    setMaxPrice(200);
    router.push("/vehicles");
    setIsMobileDrawerOpen(false);
  };

  const filterFormBody = (
    <div className="space-y-6">
      {/* 1. Marka (Brand) */}
      <div>
        <p className="font-label-xs text-xs uppercase tracking-wider text-outline font-bold mb-3">
          Marka & Üretici
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {BRANDS.map((brand) => {
            const checked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center justify-between cursor-pointer group select-none text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 rounded accent-primary-container cursor-pointer"
                  />
                  <span
                    className={`font-body-md text-sm ${
                      checked
                        ? "text-primary font-semibold"
                        : "text-on-surface group-hover:text-primary"
                    } transition-colors`}
                  >
                    {brand}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Kategori (Category) */}
      <div className="border-t border-surface-container pt-5">
        <p className="font-label-xs text-xs uppercase tracking-wider text-outline font-bold mb-3">
          Araç Kategorisi
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
          {CATEGORIES.map((cat) => {
            const checked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center justify-between cursor-pointer group select-none text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 rounded accent-primary-container cursor-pointer"
                  />
                  <span
                    className={`font-body-md text-sm ${
                      checked
                        ? "text-primary font-semibold"
                        : "text-on-surface group-hover:text-primary"
                    } transition-colors`}
                  >
                    {cat}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Kapasite (Seats) */}
      <div className="border-t border-surface-container pt-5">
        <p className="font-label-xs text-xs uppercase tracking-wider text-outline font-bold mb-3">
          Kişi Kapasitesi
        </p>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
          {SEAT_OPTIONS.map((seat) => {
            const checked = selectedSeats.includes(seat.value);
            return (
              <label
                key={seat.value}
                className="flex items-center justify-between cursor-pointer group select-none text-sm"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSeatToggle(seat.value)}
                    className="w-4 h-4 rounded accent-primary-container cursor-pointer"
                  />
                  <span
                    className={`font-body-md text-sm ${
                      checked
                        ? "text-primary font-semibold"
                        : "text-on-surface group-hover:text-primary"
                    } transition-colors`}
                  >
                    {seat.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Fiyat Aralığı (Price Slider) */}
      <div className="border-t border-surface-container pt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-label-xs text-xs uppercase tracking-wider text-outline font-bold">
            Maks. Günlük Fiyat
          </p>
          <span className="font-headline-sm text-sm font-bold text-primary">
            ${maxPrice}.00
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="200"
          step="5"
          value={maxPrice}
          onChange={handlePriceChange}
          onMouseUp={handlePriceCommit}
          onTouchEnd={handlePriceCommit}
          className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
        />
        <div className="flex justify-between text-[11px] text-outline mt-1.5 font-semibold">
          <span>$50</span>
          <span>$125</span>
          <span>$200+</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* =========================================================================
          MOBILE & TABLET COMPACT FILTER BAR + QUICK CATEGORY PILLS (< lg)
      ========================================================================= */}
      <div className="w-full lg:hidden flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            <span>Filtrele</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-primary text-xs font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-error hover:underline px-2 py-1 cursor-pointer"
            >
              Filtreleri Temizle ({activeFilterCount})
            </button>
          ) : (
            <span className="text-xs text-outline font-medium pr-1">
              Hızlı kategori seçin veya filtreleyin
            </span>
          )}
        </div>

        {/* Horizontal Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSingleCategoryPill(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCategories.length === 0
                ? "bg-on-surface text-surface shadow-xs"
                : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:border-primary"
            }`}
          >
            Tüm Araçlar
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSingleCategoryPill(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-primary-container text-on-primary shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:border-primary"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER FILTER DRAWER MODAL (< lg)
      ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-on-surface/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-Over Panel */}
          <div className="relative z-10 w-full max-w-sm bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">
                  tune
                </span>
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                  Araç Filtreleri
                </h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label="Filtreleri Kapat"
                className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {filterFormBody}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-surface-container bg-surface-container-lowest grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl border border-outline-variant/40 text-on-surface font-label-md text-sm font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-primary-container text-on-primary font-label-md text-sm font-bold hover:bg-secondary-container shadow-md transition-all cursor-pointer"
              >
                Sonuçları Gör
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP STICKY SIDEBAR FILTER (lg and up)
      ========================================================================= */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 space-y-space-md">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-space-lg">
          {/* Filter Header */}
          <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary-container text-xl">
                tune
              </span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Filtreler
              </h2>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="font-label-sm text-label-sm text-primary hover:text-secondary font-bold transition-colors cursor-pointer"
            >
              Sıfırla
            </button>
          </div>

          {filterFormBody}
        </div>
      </aside>
    </>
  );
}

export default CatalogFilterSidebar;
