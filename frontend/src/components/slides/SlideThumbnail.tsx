"use client";

import type { SlideOut } from "@/types/slide";
import { cn } from "@/lib/utils";

interface SlideThumbnailProps {
  slide: SlideOut;
  index: number;
  active: boolean;
  onClick: () => void;
}

export function SlideThumbnail({ slide, index, active, onClick }: SlideThumbnailProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all",
        active ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"
      )}
    >
      <p className="text-xs font-semibold text-gray-600 mb-2">Slide {index + 1}</p>

      {/* Mini title */}
      <p className="text-sm font-medium text-gray-900 truncate">
        {slide.title || "Untitled"}
      </p>

      {/* Mini bullets */}
      <ul className="mt-2 space-y-1 text-xs text-gray-700">
        {slide.bullets.slice(0, 3).map((b, i) => (
          <li key={i} className="flex items-start">
            <span className="mr-1">•</span>
            <span className="line-clamp-1">{b}</span>
          </li>
        ))}
        {slide.bullets.length > 3 && (
          <li className="text-gray-400 text-xs">+ more...</li>
        )}
      </ul>
    </div>
  );
}
