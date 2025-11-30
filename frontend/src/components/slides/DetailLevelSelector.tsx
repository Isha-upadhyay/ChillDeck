"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

export interface DetailOption {
  id: "brief" | "medium" | "deep";
  label: string;
  description?: string;
}

interface DetailLevelSelectorProps {
  levels?: DetailOption[];         // Optional custom list
  selected: DetailOption["id"];    // required
  onChange: (level: DetailOption["id"]) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const DEFAULT_LEVELS: DetailOption[] = [
  {
    id: "brief",
    label: "Brief",
    description: "Short, punchy, minimal content",
  },
  {
    id: "medium",
    label: "Medium",
    description: "Balanced detail (recommended)",
  },
  {
    id: "deep",
    label: "Deep",
    description: "Full explanation with rich points",
  },
];

export const DetailLevelSelector = memo(function DetailLevelSelector({
  levels = DEFAULT_LEVELS,
  selected,
  onChange,
  disabled = false,
  size = "md",
}: DetailLevelSelectorProps) {
  const sizeClasses =
    size === "sm"
      ? "px-3 py-2 text-xs"
      : size === "lg"
      ? "px-5 py-4 text-base"
      : "px-4 py-3 text-sm";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Slide Detail Level</p>

      <div className="flex flex-col gap-3">
        {levels.map((level) => {
          const isActive = selected === level.id;

          return (
            <button
              key={level.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(level.id)}
              className={cn(
                "w-full rounded-md border transition-all text-left shadow-sm",
                "hover:shadow-md active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                sizeClasses,
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 bg-white hover:bg-muted"
              )}
              aria-pressed={isActive}
            >
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-semibold",
                    isActive ? "text-primary" : "text-gray-800"
                  )}
                >
                  {level.label}
                </span>

                {level.description && (
                  <span
                    className={cn(
                      "text-xs",
                      isActive ? "text-primary/80" : "text-gray-500"
                    )}
                  >
                    {level.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
