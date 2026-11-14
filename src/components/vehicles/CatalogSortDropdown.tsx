"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function CatalogSortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams?.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const value = e.target.value;

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.delete("page");
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="font-label-sm text-label-sm text-outline font-semibold whitespace-nowrap hidden sm:inline"
      >
        Sırala:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm text-body-sm py-2 pl-3 pr-8 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer font-medium shadow-sm"
        >
          <option value="newest">En Yeniler (Varsayılan)</option>
          <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
          <option value="rating_desc">Puan: En Yüksek</option>
        </select>
        <span className="material-symbols-outlined absolute right-2 top-2.5 text-outline pointer-events-none text-base">
          expand_more
        </span>
      </div>
    </div>
  );
}

export default CatalogSortDropdown;

