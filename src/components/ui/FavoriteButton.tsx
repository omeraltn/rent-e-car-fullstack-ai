"use client";

import React, { useState, useEffect } from "react";

interface FavoriteButtonProps {
  vehicleSlug: string;
  className?: string;
}

export function FavoriteButton({ vehicleSlug, className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("morent_favorites");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsFavorite(list.includes(vehicleSlug));
      }
    } catch {
      // Fallback
    }
  }, [vehicleSlug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem("morent_favorites");
      let list: string[] = stored ? JSON.parse(stored) : [];

      if (list.includes(vehicleSlug)) {
        list = list.filter((s) => s !== vehicleSlug);
        setIsFavorite(false);
      } else {
        list.push(vehicleSlug);
        setIsFavorite(true);
      }

      localStorage.setItem("morent_favorites", JSON.stringify(list));
      window.dispatchEvent(new Event("morent_favorites_updated"));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
        isFavorite
          ? "text-red-500 bg-red-50 hover:bg-red-100"
          : "text-outline hover:text-red-500 hover:bg-surface-container-low"
      } ${className}`}
    >
      <span
        className="material-symbols-outlined text-xl transition-transform active:scale-125"
        style={{
          fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        favorite
      </span>
    </button>
  );
}

export default FavoriteButton;

