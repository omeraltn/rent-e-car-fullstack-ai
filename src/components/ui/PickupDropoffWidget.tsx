import React from "react";
import Form from "next/form";

const TURKISH_LOCATIONS = [
  { label: "İstanbul - Kadıköy", query: "İstanbul" },
  { label: "İstanbul - Beşiktaş / Boğaz", query: "Beşiktaş" },
  { label: "İstanbul - Sarıyer / Maslak", query: "Sarıyer" },
  { label: "İstanbul - Ataşehir", query: "Ataşehir" },
  { label: "Ankara - Çankaya", query: "Ankara" },
  { label: "İzmir - Alsancak", query: "Alsancak" },
  { label: "İzmir - Çeşme Marina", query: "Çeşme" },
  { label: "Antalya - Konyaaltı", query: "Konyaaltı" },
  { label: "Antalya - Lara", query: "Lara" },
  { label: "Muğla - Bodrum Marina", query: "Bodrum" },
  { label: "Bursa - Nilüfer", query: "Bursa" },
  { label: "Eskişehir - Tepebaşı", query: "Eskişehir" },
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

interface PickupDropoffWidgetProps {
  className?: string;
}

export function PickupDropoffWidget({ className = "" }: PickupDropoffWidgetProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultPickupDate = tomorrow.toISOString().split("T")[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultDropoffDate = threeDaysLater.toISOString().split("T")[0];

  return (
    <Form
      action="/vehicles"
      className={`relative grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center ${className}`}
    >
      {/* 1. Alış (Pick-Up) Card (5 cols) */}
      <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-sm mb-space-md">
          <span className="w-4 h-4 rounded-full border-4 border-primary-container bg-surface-container-lowest"></span>
          <h3 className="font-title-md text-title-md font-bold text-on-surface">
            Alış (Pick - Up)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md divide-y sm:divide-y-0 sm:divide-x divide-surface-container">
          {/* Location */}
          <div className="pt-2 sm:pt-0 sm:pr-2">
            <label
              htmlFor="pickup-location"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Lokasyon
            </label>
            <select
              id="pickup-location"
              name="search"
              defaultValue={TURKISH_LOCATIONS[0].query}
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0 pr-6 truncate"
            >
              {TURKISH_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.query} className="text-on-surface">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="pt-2 sm:pt-0 sm:px-2">
            <label
              htmlFor="pickup-date"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Tarih
            </label>
            <input
              id="pickup-date"
              type="date"
              name="pickupDate"
              defaultValue={defaultPickupDate}
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0"
            />
          </div>

          {/* Time */}
          <div className="pt-2 sm:pt-0 sm:pl-2">
            <label
              htmlFor="pickup-time"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Saat
            </label>
            <select
              id="pickup-time"
              name="pickupTime"
              defaultValue="10:00"
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time} className="text-on-surface">
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Center Search / Filter Submit Button (2 cols) */}
      <div className="lg:col-span-2 flex items-center justify-center -my-3 lg:my-0 z-20">
        <button
          type="submit"
          aria-label="Müsait Araçları Ara"
          title="Müsait Araçları Ara"
          className="w-14 h-14 rounded-xl bg-primary-container text-on-primary shadow-lg hover:bg-secondary-container hover:shadow-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
        >
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-300">
            search
          </span>
        </button>
      </div>

      {/* 3. Teslim (Drop-Off) Card (5 cols) */}
      <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-sm mb-space-md">
          <span className="w-4 h-4 rounded-full border-4 border-secondary-container bg-surface-container-lowest"></span>
          <h3 className="font-title-md text-title-md font-bold text-on-surface">
            Teslim (Drop - Off)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md divide-y sm:divide-y-0 sm:divide-x divide-surface-container">
          {/* Location */}
          <div className="pt-2 sm:pt-0 sm:pr-2">
            <label
              htmlFor="dropoff-location"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Lokasyon
            </label>
            <select
              id="dropoff-location"
              name="dropoffLocation"
              defaultValue={TURKISH_LOCATIONS[0].label}
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0 pr-6 truncate"
            >
              {TURKISH_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label} className="text-on-surface">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="pt-2 sm:pt-0 sm:px-2">
            <label
              htmlFor="dropoff-date"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Tarih
            </label>
            <input
              id="dropoff-date"
              type="date"
              name="dropoffDate"
              defaultValue={defaultDropoffDate}
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0"
            />
          </div>

          {/* Time */}
          <div className="pt-2 sm:pt-0 sm:pl-2">
            <label
              htmlFor="dropoff-time"
              className="block font-label-md text-label-md font-bold text-on-surface mb-1"
            >
              Saat
            </label>
            <select
              id="dropoff-time"
              name="dropoffTime"
              defaultValue="10:00"
              className="w-full bg-transparent font-body-sm text-body-sm text-outline border-none focus:ring-0 cursor-pointer p-0"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time} className="text-on-surface">
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default PickupDropoffWidget;
