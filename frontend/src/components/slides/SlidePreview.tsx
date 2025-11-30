"use client";

import { memo } from "react";
import type { SlideOut } from "@/types/slide";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Copy } from "lucide-react";

interface SlidePreviewProps {
  slides: SlideOut[];
  /** Index of currently selected / active slide */
  activeIndex?: number;
  /** When user clicks a slide thumbnail */
  onSelectSlide?: (index: number) => void;
  /** Add a new slide (usually at end or after active) */
  onAddSlide?: () => void;
  /** Duplicate selected slide */
  onDuplicateSlide?: (index: number) => void;
  /** Delete selected slide */
  onDeleteSlide?: (index: number) => void;
  /** Disable interactions while generating/exporting */
  disabled?: boolean;
}

export const SlidePreview = memo(function SlidePreview({
  slides,
  activeIndex = 0,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  disabled = false,
}: SlidePreviewProps) {
  const hasSlides = slides && slides.length > 0;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Slides</h2>
          {hasSlides && (
            <span className="text-xs text-muted-foreground">
              {slides.length} total
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={onAddSlide}
            disabled={disabled}
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>
      </div>

      {/* Content */}
      {hasSlides ? (
        <ScrollArea className="h-full rounded-md border bg-muted/30 p-2">
          <div className="flex flex-col gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              const title = slide.title?.trim() || `Slide ${index + 1}`;

const bullets = slide.bullets ?? [];


              return (
                <button
                  key={slide.id ?? index}
                  type="button"
                  className={cn(
                    "group flex w-full items-stretch gap-2 rounded-md text-left outline-none transition",
                    isActive
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => !disabled && onSelectSlide?.(index)}
                  disabled={disabled}
                >
                  {/* Index indicator */}
                  <div className="flex w-8 items-center justify-center text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Slide thumbnail */}
                  <Card
                    className={cn(
                      "flex-1 overflow-hidden border bg-background shadow-sm transition group-hover:shadow-md",
                      isActive && "border-primary"
                    )}
                  >
                    <CardContent className="flex flex-col gap-1 p-3">
                      <p className="line-clamp-1 text-xs font-semibold">
                        {title}
                      </p>
                      {bullets.length > 0 ? (
                        <ul className="space-y-0.5">
                          {bullets.slice(0, 3).map((b, i) => (
                            <li
                              key={i}
                              className="line-clamp-1 text-[11px] text-muted-foreground"
                            >
                              • {b}
                            </li>
                          ))}
                          {bullets.length > 3 && (
                            <li className="text-[10px] italic text-muted-foreground">
                              + {bullets.length - 3} more…
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-[11px] italic text-muted-foreground">
                          No bullets yet
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 pr-1 pt-1 opacity-0 transition group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSlide?.(index);
                      }}
                      disabled={disabled}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide?.(index);
                      }}
                      disabled={disabled}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-md border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground">
          No slides yet. Generate from AI or create a new slide to get started.
        </div>
      )}
    </div>
  );
});
