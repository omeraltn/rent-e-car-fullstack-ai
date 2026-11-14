import React from "react";

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/20" />
        <div className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/20 hidden lg:block" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="h-80 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-16 h-4 rounded bg-surface-container-low" />
              <div className="w-40 h-5 rounded bg-surface-container" />
            </div>
            <div className="w-full h-40 rounded-xl bg-surface-container-low" />
            <div className="flex items-center justify-between pt-2">
              <div className="w-20 h-6 rounded bg-surface-container" />
              <div className="w-28 h-9 rounded-xl bg-surface-container" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

