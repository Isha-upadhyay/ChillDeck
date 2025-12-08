// frontend/src/components/slides/SlideCanvas.tsx
"use client";

import type { SlideOut } from "@/types/slide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Image as ImageIcon } from "lucide-react";

interface SlideCanvasProps {
  slide: SlideOut;
  onEdit: () => void;
}

const getThemeClasses = (themeId: string = "corporate") => {
  const themes: Record<string, string> = {
    corporate: "bg-blue-50 text-blue-900 border-blue-200",
    dark: "bg-gray-900 text-gray-100 border-gray-700",
    modern: "bg-gradient-to-br from-purple-50 to-pink-50 text-purple-900 border-purple-200",
    tech: "bg-green-50 text-green-900 border-green-200",
    cute: "bg-pink-50 text-pink-900 border-pink-200",
    minimal: "bg-white text-gray-900 border-gray-200",
  };
  return themes[themeId] || themes.corporate;
};

export function SlideCanvas({ slide, onEdit }: SlideCanvasProps) {
  const themeClasses = getThemeClasses(slide.design?.theme);
  // Ensure we use the Heading if available, otherwise Title
  const displayTitle = slide.heading || slide.title; 
  const hasImage = !!slide.design?.image_url;

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gray-100/50 h-full overflow-hidden relative">
      <div 
        className={cn(
          "aspect-video w-full max-w-6xl shadow-2xl rounded-xl relative overflow-hidden transition-all duration-300 border-2 flex flex-col p-12",
          themeClasses
        )}
      >
        {/* Edit Trigger */}
        <Button 
          onClick={onEdit}
          size="sm" 
          variant="secondary"
          className="absolute top-6 right-6 shadow-sm hover:scale-105 transition-transform z-10 gap-2 opacity-0 hover:opacity-100 group-hover:opacity-100"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Button>

        {/* Content Container */}
        <div className="flex-1 flex flex-col z-0 h-full">
          {/* Header */}
          <div className="mb-8 shrink-0">
            <span className="text-xs opacity-60 uppercase tracking-widest font-semibold">
              Slide {slide.id}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 leading-tight">
              {displayTitle}
            </h1>
          </div>

          <div className="flex gap-10 flex-1 min-h-0">
            {/* Text Column */}
            <div className={cn("flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar", hasImage ? "flex-[0.6]" : "flex-1")}>
              {(slide.bullets || []).map((point, i) => (
                <div key={i} className="flex gap-4 items-start text-xl">
                  <span className="mt-2.5 h-2 w-2 rounded-full bg-current opacity-60 shrink-0" />
                  <p className="leading-relaxed opacity-90">{point}</p>
                </div>
              ))}
            </div>

            {/* Image Column */}
            {hasImage ? (
               <div className="flex-[0.4] relative rounded-lg overflow-hidden shadow-lg border border-black/5 bg-white/40 h-full">
                 <img 
                   src={slide.design?.image_url!} 
                   alt="Slide visual" 
                   className="absolute inset-0 w-full h-full object-cover"
                 />
               </div>
            ) : slide.design?.image_prompt ? (
               // Placeholder showing prompt exists
               <div className="flex-[0.4] flex flex-col items-center justify-center border-2 border-dashed border-current/20 rounded-lg opacity-40 p-6 text-center">
                 <ImageIcon className="h-10 w-10 mb-3" />
                 <p className="text-sm font-medium">Image Prompt Set</p>
                 <p className="text-xs opacity-70 mt-1 line-clamp-2">"{slide.design.image_prompt}"</p>
               </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}