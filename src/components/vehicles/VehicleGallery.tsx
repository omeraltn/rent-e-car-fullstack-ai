"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CAMERA_ANGLES,
  STUDIO_PAINT_COLORS,
  generateCarImageUrl,
  resolveImaginSpec,
  PaintColorOption,
} from "@/lib/vehicle-images";

interface VehicleGalleryProps {
  imageSlug: string;
  vehicleName: string;
}

export function VehicleGallery({ imageSlug, vehicleName }: VehicleGalleryProps) {
  const defaultSpec = resolveImaginSpec(imageSlug);
  const initialPaint =
    STUDIO_PAINT_COLORS.find((p) => p.id === defaultSpec.paintId) ||
    STUDIO_PAINT_COLORS[0];

  const [selectedAngle, setSelectedAngle] = useState<string>("23");
  const [selectedPaint, setSelectedPaint] =
    useState<PaintColorOption>(initialPaint);

  const activeAngleObj =
    CAMERA_ANGLES.find((a) => a.angle === selectedAngle) || CAMERA_ANGLES[0];

  const mainImageUrl = generateCarImageUrl(imageSlug, selectedAngle, {
    paintId: selectedPaint.id,
    paintDescription: selectedPaint.description,
  });

  const currentAngleIndex = CAMERA_ANGLES.findIndex(
    (a) => a.angle === selectedAngle
  );
  const handlePrevAngle = () => {
    const prevIdx =
      (currentAngleIndex - 1 + CAMERA_ANGLES.length) % CAMERA_ANGLES.length;
    setSelectedAngle(CAMERA_ANGLES[prevIdx].angle);
  };
  const handleNextAngle = () => {
    const nextIdx = (currentAngleIndex + 1) % CAMERA_ANGLES.length;
    setSelectedAngle(CAMERA_ANGLES[nextIdx].angle);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Main Interactive 360° Multi-Angle Showroom Stage */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1D51] via-[#13389E] to-[#2557D6] text-on-primary p-5 sm:p-7 lg:p-8 shadow-xl min-h-[380px] sm:min-h-[440px] flex flex-col justify-between border border-white/10">
        {/* Decorative Studio Lighting & Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,_rgba(255,255,255,0.16),_transparent_65%)] pointer-events-none"></div>

        {/* Top Bar: Vehicle Header + Current Camera Angle Pill */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full mb-2.5 border border-white/10">
              <span
                className="material-symbols-outlined text-amber-300 text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                360
              </span>
              <span className="font-label-xs text-[11px] uppercase tracking-wider text-white font-bold">
                İnteraktif Stüdyo Görünümü · {activeAngleObj.label}
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
              {vehicleName}
            </h2>
            <p className="font-body-sm text-xs sm:text-sm text-blue-100/90 mt-1">
              Farklı kamera açılarını ve gövde renklerini seçerek aracı detaylı inceleyin.
            </p>
          </div>

          {/* Paint Finish Picker (Top Right) */}
          <div className="flex flex-col sm:items-end gap-1.5 bg-slate-950/35 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 self-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Renk: <strong className="text-white">{selectedPaint.label}</strong>
            </span>
            <div className="flex items-center gap-2">
              {STUDIO_PAINT_COLORS.map((paint) => {
                const isSelected = selectedPaint.id === paint.id;
                return (
                  <button
                    key={paint.id}
                    type="button"
                    onClick={() => setSelectedPaint(paint)}
                    title={paint.label}
                    aria-label={paint.label}
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#13389E] scale-110"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: paint.hex }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Dynamic Imagin Studio Car Render + Prev/Next Angle Controls */}
        <div className="relative z-10 w-full my-2 flex items-center justify-center">
          {/* Left Angle Arrow */}
          <button
            type="button"
            onClick={handlePrevAngle}
            aria-label="Önceki Açı"
            className="absolute left-0 sm:left-2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_left
            </span>
          </button>

          {/* Studio Floor Shadow & Next.js <Image /> */}
          <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center px-8 sm:px-12">
            <div className="absolute bottom-4 w-3/4 h-6 bg-slate-950/45 rounded-full blur-xl pointer-events-none"></div>
            <Image
              key={mainImageUrl}
              src={mainImageUrl}
              alt={`${vehicleName} - ${activeAngleObj.label}`}
              fill
              priority
              loading="eager"
              sizes="(max-width: 1024px) 95vw, 680px"
              className="z-10 object-contain filter drop-shadow-[0_22px_28px_rgba(0,10,40,0.55)] transition-all duration-500 hover:scale-105 p-2 sm:p-4"
            />
          </div>

          {/* Right Angle Arrow */}
          <button
            type="button"
            onClick={handleNextAngle}
            aria-label="Sonraki Açı"
            className="absolute right-0 sm:right-2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_right
            </span>
          </button>
        </div>

        {/* Bottom Stage Footer: Quick Angle Pill Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/15">
          <div className="flex items-center gap-1.5 text-xs text-blue-100">
            <span className="material-symbols-outlined text-sm text-emerald-300">
              verified_user
            </span>
            <span>Imagin Studio 3D Stüdyo Render</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {CAMERA_ANGLES.map((cam) => {
              const isSelected = selectedAngle === cam.angle;
              return (
                <button
                  key={cam.angle}
                  type="button"
                  onClick={() => setSelectedAngle(cam.angle)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-[#0B1D51] shadow-sm"
                      : "bg-white/10 text-blue-100 hover:bg-white/20"
                  }`}
                >
                  {cam.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Multi-Angle Thumbnail Grid (6 Camera Angles) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        {CAMERA_ANGLES.map((cam) => {
          const thumbUrl = generateCarImageUrl(imageSlug, cam.angle, {
            paintId: selectedPaint.id,
            paintDescription: selectedPaint.description,
          });
          const isSelected = selectedAngle === cam.angle;

          return (
            <button
              key={cam.angle}
              type="button"
              onClick={() => setSelectedAngle(cam.angle)}
              className={`relative rounded-xl overflow-hidden p-2 bg-gradient-to-b from-[#F4F7FE] to-surface-container-lowest border-2 transition-all cursor-pointer h-24 flex flex-col items-center justify-between group ${
                isSelected
                  ? "border-primary-container ring-2 ring-primary-container/20 shadow-md scale-[1.02]"
                  : "border-outline-variant/30 hover:border-primary-container/50"
              }`}
            >
              <div className="relative w-full h-14">
                <Image
                  src={thumbUrl}
                  alt={`${vehicleName} - ${cam.label}`}
                  fill
                  sizes="120px"
                  className="object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                />
              </div>
              <span
                className={`text-[10px] font-bold truncate w-full text-center ${
                  isSelected ? "text-primary" : "text-outline"
                }`}
              >
                {cam.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VehicleGallery;
