"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface ThemeOption {
  id: string;
  name: string;
  colors: {
    bg: string;
    border: string;
    text: string;
  };
}

interface ThemeSelectorProps {
  themes: ThemeOption[];
  selected: string;
  onChange: (themeId: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";   // flexibility for UI screens
}

export const ThemeSelector = memo(function ThemeSelector({
  themes,
  selected,
  onChange,
  disabled = false,
  size = "md",
}: ThemeSelectorProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-1 text-xs"
      : size === "lg"
      ? "px-4 py-3 text-base"
      : "px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-3">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(theme.id)}
          className={cn(
            "rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-primary",
            "shadow-sm hover:shadow-md active:scale-[0.98]",
            sizeClasses,
            selected === theme.id
              ? `${theme.colors.bg} ${theme.colors.border} border-2 font-semibold`
              : "bg-white border-gray-300 hover:bg-gray-50"
          )}
          aria-pressed={selected === theme.id}
        >
          <div className="flex items-center gap-2">
            {/* Theme preview dot */}
            <span
              className={cn(
                "h-3 w-3 rounded-full border",
                theme.colors.border,
                theme.colors.bg
              )}
            />
            <span className={cn(theme.colors.text)}>{theme.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
});
