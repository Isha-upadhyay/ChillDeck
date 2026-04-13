"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import type { SlideOut } from "@/types/slide";
import { SlidePreview } from "@/components/slides/SlidePreview";
import { SlideEditor } from "@/components/slides/SlideEditor";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { ChatPanel } from "@/components/slides/ChatPanel";
import { X, PanelRightClose, PanelRightOpen, MessageCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlidesLayoutProps {
  slides: SlideOut[];
  onUpdateSlides: (slides: SlideOut[]) => void;
  presentationId?: string;
}

export function SlidesLayout({ slides, onUpdateSlides, presentationId }: SlidesLayoutProps) {
  const { slide, setSlide } = useEditorStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    if (slides.length > 0 && !slide) {
      setSlide(slides[0]);
    }
  }, [slides, slide, setSlide]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setSlide(slides[index]);
  };

  const handleSaveFromEditor = (updated: SlideOut) => {
    const newSlides = [...slides];
    newSlides[selectedIndex] = updated;
    onUpdateSlides(newSlides);
  };

  const handleDuplicate = (index: number) => {
    const copy = structuredClone(slides[index]);
    copy.id = crypto.randomUUID();
    const newSlides = [
      ...slides.slice(0, index + 1),
      copy,
      ...slides.slice(index + 1),
    ];
    onUpdateSlides(newSlides);
  };

  const handleDelete = (index: number) => {
    if (slides.length <= 1) {
      alert("Cannot delete the last slide.");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    onUpdateSlides(newSlides);

    const nextIdx = Math.max(0, index - 1);
    setSelectedIndex(nextIdx);
    setSlide(newSlides[nextIdx]);
  };

  const handleAdd = () => {
    const newSlide: SlideOut = {
      id: crypto.randomUUID(),
      title: "New Slide",
      heading: "New Topic",
      bullets: ["Point 1", "Point 2"],
      notes: "",
      design: {
        theme: slides[0]?.design?.theme || "corporate",
        layout: "title_and_body",
      },
    };
    onUpdateSlides([...slides, newSlide]);
    setTimeout(() => {
      setSelectedIndex(slides.length);
      setSlide(newSlide);
    }, 50);
  };

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newSlides = [...slides];
    const [removed] = newSlides.splice(dragIndex, 1);
    newSlides.splice(index, 0, removed);
    onUpdateSlides(newSlides);
    setDragIndex(index);
    setSelectedIndex(index);
    setSlide(newSlides[index]);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          useEditorStore.getState().undo();
        }
        if ((e.key === "y") || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          useEditorStore.getState().redo();
        }
      }
      // Arrow keys for slide navigation (when not editing text)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowUp" && selectedIndex > 0) {
        handleSelect(selectedIndex - 1);
      }
      if (e.key === "ArrowDown" && selectedIndex < slides.length - 1) {
        handleSelect(selectedIndex + 1);
      }
    },
    [selectedIndex, slides.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">

      {/* 1. LEFT SIDEBAR - Slide thumbnails with drag support */}
      <aside className="w-64 border-r bg-muted/10 flex flex-col h-full shrink-0">
        <div className="p-4 border-b bg-background/50">
          <h2 className="font-semibold text-sm">Slides ({slides.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <SlidePreview
            slides={slides}
            activeIndex={selectedIndex}
            onSelectSlide={handleSelect}
            onDuplicateSlide={handleDuplicate}
            onDeleteSlide={handleDelete}
            onAddSlide={handleAdd}
          />
        </div>
      </aside>

      {/* 2. CENTER CANVAS */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-gray-100/80">
        {slide ? (
          <SlideCanvas
            slide={slide}
            onEdit={() => setShowEditor(!showEditor)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading slide...
          </div>
        )}

        {/* Chat toggle button */}
        {presentationId && (
          <Button
            onClick={() => setShowChat(!showChat)}
            size="sm"
            variant={showChat ? "default" : "outline"}
            className="absolute bottom-4 right-4 gap-2 shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </Button>
        )}
      </main>

      {/* 3. RIGHT SIDEBAR (Editor) */}
      {showEditor && (
        <aside className="w-[400px] border-l bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-200 relative z-20 shrink-0">
          <div className="flex items-center justify-between p-4 border-b bg-muted/5">
            <h3 className="font-semibold flex items-center gap-2">
              <PanelRightOpen className="h-4 w-4" /> Edit Slide
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <SlideEditor onSave={handleSaveFromEditor} saving={false} />
          </div>
        </aside>
      )}

      {/* 4. CHAT PANEL */}
      {showChat && presentationId && (
        <aside className="w-[350px] border-l bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-200 relative z-20 shrink-0">
          <ChatPanel
            presentationId={presentationId}
            slideIndex={selectedIndex}
            onClose={() => setShowChat(false)}
          />
        </aside>
      )}
    </div>
  );
}
