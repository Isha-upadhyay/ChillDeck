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

// -------------------------------------------------------
// LAYOUT RENDERERS
// -------------------------------------------------------

function TitleOnlyLayout({ slide }: { slide: SlideOut }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
      <h1 className="text-5xl md:text-6xl font-bold leading-tight">{slide.heading || slide.title}</h1>
      {slide.notes && <p className="text-lg opacity-60 mt-6 max-w-2xl">{slide.notes}</p>}
    </div>
  );
}

function TitleAndBodyLayout({ slide, hasImage }: { slide: SlideOut; hasImage: boolean }) {
  return (
    <div className="flex-1 flex flex-col z-0 h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl md:text-5xl font-bold mt-2 leading-tight">{slide.heading || slide.title}</h1>
      </div>
      <div className="flex gap-10 flex-1 min-h-0">
        <div className={cn("flex-col gap-6 overflow-y-auto pr-2", hasImage ? "flex-[0.6]" : "flex-1")}>
          {(slide.bullets || []).map((point, i) => (
            <div key={i} className="flex gap-4 items-start text-xl">
              <span className="mt-2.5 h-2 w-2 rounded-full bg-current opacity-60 shrink-0" />
              <p className="leading-relaxed opacity-90">{point}</p>
            </div>
          ))}
        </div>
        {hasImage && (
          <div className="flex-[0.4] relative rounded-lg overflow-hidden shadow-lg border border-black/5 bg-white/40 h-full">
            <img src={slide.design?.image_url || ""} alt="Slide visual" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

function TwoColumnLayout({ slide }: { slide: SlideOut }) {
  const bullets = slide.bullets || [];
  const mid = Math.ceil(bullets.length / 2);
  const left = bullets.slice(0, mid);
  const right = bullets.slice(mid);

  return (
    <div className="flex-1 flex flex-col z-0 h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.heading || slide.title}</h1>
      </div>
      <div className="flex gap-8 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-4">
          {left.map((point, i) => (
            <div key={i} className="flex gap-3 items-start text-lg">
              <span className="mt-2 h-2 w-2 rounded-full bg-current opacity-60 shrink-0" />
              <p className="leading-relaxed opacity-90">{point}</p>
            </div>
          ))}
        </div>
        <div className="w-px bg-current opacity-20" />
        <div className="flex-1 flex flex-col gap-4">
          {right.map((point, i) => (
            <div key={i} className="flex gap-3 items-start text-lg">
              <span className="mt-2 h-2 w-2 rounded-full bg-current opacity-60 shrink-0" />
              <p className="leading-relaxed opacity-90">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuoteLayout({ slide }: { slide: SlideOut }) {
  const quote = (slide.bullets || [])[0] || slide.heading || slide.title;
  const author = (slide.bullets || [])[1] || "";

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
      <div className="text-6xl opacity-30 mb-4">&ldquo;</div>
      <blockquote className="text-3xl md:text-4xl font-light italic leading-relaxed max-w-3xl">
        {quote}
      </blockquote>
      {author && <p className="mt-6 text-lg font-semibold opacity-70">&mdash; {author}</p>}
    </div>
  );
}

function StatsLayout({ slide }: { slide: SlideOut }) {
  return (
    <div className="flex-1 flex flex-col z-0 h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl font-bold leading-tight">{slide.heading || slide.title}</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {(slide.bullets || []).map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-6 rounded-xl border border-current/10 bg-current/5">
            <p className="text-3xl font-bold">{stat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineLayout({ slide }: { slide: SlideOut }) {
  return (
    <div className="flex-1 flex flex-col z-0 h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl font-bold leading-tight">{slide.heading || slide.title}</h1>
      </div>
      <div className="flex-1 flex flex-col gap-4 relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-current opacity-20" />
        {(slide.bullets || []).map((point, i) => (
          <div key={i} className="flex items-start gap-4 relative">
            <div className="absolute left-[-22px] top-2 h-3 w-3 rounded-full bg-current opacity-60" />
            <p className="text-lg leading-relaxed opacity-90">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonLayout({ slide }: { slide: SlideOut }) {
  const bullets = slide.bullets || [];
  const mid = Math.ceil(bullets.length / 2);

  return (
    <div className="flex-1 flex flex-col z-0 h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl font-bold leading-tight">{slide.heading || slide.title}</h1>
      </div>
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 rounded-xl border border-green-500/30 bg-green-500/5 p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Pros</h3>
          {bullets.slice(0, mid).map((point, i) => (
            <div key={i} className="flex gap-2 items-start mb-3 text-base">
              <span className="text-green-500 mt-0.5">+</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Cons</h3>
          {bullets.slice(mid).map((point, i) => (
            <div key={i} className="flex gap-2 items-start mb-3 text-base">
              <span className="text-red-500 mt-0.5">-</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------

export function SlideCanvas({ slide, onEdit }: SlideCanvasProps) {
  const themeClasses = getThemeClasses(slide.design?.theme);
  const hasImage = !!slide.design?.image_url;
  const layout = slide.design?.layout || "title_and_body";

  const renderLayout = () => {
    switch (layout) {
      case "title_only":
        return <TitleOnlyLayout slide={slide} />;
      case "two_column":
        return <TwoColumnLayout slide={slide} />;
      case "quote":
        return <QuoteLayout slide={slide} />;
      case "stats":
        return <StatsLayout slide={slide} />;
      case "timeline":
        return <TimelineLayout slide={slide} />;
      case "comparison":
        return <ComparisonLayout slide={slide} />;
      case "title_and_body":
      default:
        return <TitleAndBodyLayout slide={slide} hasImage={hasImage} />;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gray-100/50 h-full overflow-hidden relative">
      <div
        className={cn(
          "aspect-video w-full max-w-6xl shadow-2xl rounded-xl relative overflow-hidden transition-all duration-300 border-2 flex flex-col p-12",
          themeClasses
        )}
      >
        <Button
          onClick={onEdit}
          size="sm"
          variant="secondary"
          className="absolute top-6 right-6 shadow-sm hover:scale-105 transition-transform z-10 gap-2 opacity-0 hover:opacity-100"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Button>

        {renderLayout()}

        {/* Image placeholder for non-body layouts */}
        {!hasImage && slide.design?.image_prompt && layout === "title_and_body" && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-40 text-xs">
            <ImageIcon className="h-4 w-4" />
            <span>Image prompt set</span>
          </div>
        )}
      </div>
    </div>
  );
}
