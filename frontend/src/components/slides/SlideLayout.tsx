"use client";

import { useState, useEffect } from "react";
import { SlideEditor } from "@/components/slides/SlideEditor";
import { SlidePreview } from "@/components/slides/SlidePreview";
import { SlideThumbnail } from "@/components/slides/SlideThumbnail";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editorStore";
import type { SlideOut } from "@/types/slide";

interface SlidesLayoutProps {
  slides: SlideOut[];
  onUpdateSlides: (slides: SlideOut[]) => void;
}


export function SlidesLayout({ slides, onUpdateSlides }: SlidesLayoutProps) {
  const { slide, setSlide, clearSlide } = useEditorStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load first slide initially
  useEffect(() => {
    if (slides.length > 0) {
      setSlide(slides[0]);
    }
  }, [slides, setSlide]);

  // Select slide
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setSlide(slides[index]);
  };

  // Save slide changes
  const handleSave = (updated: SlideOut) => {
    const newSlides = [...slides];
    newSlides[selectedIndex] = updated;
    onUpdateSlides(newSlides);
  };

  // Duplicate slide
  const duplicateSlide = () => {
    const copy = structuredClone(slides[selectedIndex]);
    copy.id = crypto.randomUUID();

    const newSlides = [
      ...slides.slice(0, selectedIndex + 1),
      copy,
      ...slides.slice(selectedIndex + 1),
    ];

    onUpdateSlides(newSlides);
    setSelectedIndex(selectedIndex + 1);
    setSlide(copy);
  };

  // Delete slide
  const deleteSlide = () => {
    if (slides.length <= 1) return;

    const newSlides = slides.filter((_, i) => i !== selectedIndex);
    onUpdateSlides(newSlides);

    const newIndex = Math.max(0, selectedIndex - 1);
    setSelectedIndex(newIndex);
    setSlide(newSlides[newIndex]);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar Thumbnails */}
      <aside className="w-60 bg-white border rounded-xl shadow-sm p-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm">Slides</p>
          <Button variant="outline" size="sm" onClick={duplicateSlide}>
            ➕
          </Button>
        </div>

        <div className="space-y-3">
          {slides.map((s, i) => (
            <SlideThumbnail
              key={s.id}
              slide={s}
              index={i}
              active={i === selectedIndex}
              onClick={() => handleSelect(i)}
            />
          ))}
        </div>

        {slides.length > 1 && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full mt-4"
            onClick={deleteSlide}
          >
            Delete Slide
          </Button>
        )}
      </aside>

      {/* Middle Preview */}
      <div className="flex-1 bg-gray-50 rounded-xl p-6 overflow-auto">
        <SlidePreview slides={slides} />
      </div>

      {/* Right Slide Editor */}
      <div className="w-[420px]">
        <SlideEditor onSave={handleSave} saving={false} />
      </div>
    </div>
  );
}
