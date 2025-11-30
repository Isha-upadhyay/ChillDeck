"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateOutline } from "@/lib/api";
import { useEditorStore } from "@/store/editorStore";
import { SlidePreview } from "@/components/slides/SlidePreview";
import { Loader2 } from "lucide-react";
import { SlideOut } from "@/types/slide";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const { slides, setSlides } = useEditorStore();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const outline = await generateOutline(topic);
      setSlides(outline.slides);
    } catch (err) {
      console.error("Error generating slides:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <section className="p-6 border-b bg-background">
        <h1 className="text-3xl font-bold mb-4">Generate Presentation</h1>

        <div className="flex gap-4">
          <Input
            placeholder="Enter a topic, description, or paste content…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Generate"}
          </Button>
        </div>
      </section>

      {/* Body */}
      <div className="flex flex-1">
        {/* Left: Slide list */}
        <aside className="w-[280px] border-r p-4 overflow-y-auto">
          <h2 className="font-semibold mb-3">Slides</h2>

          {slides.map((s: SlideOut, i: number) => (

            <div
              key={i}
              className="border p-3 rounded mb-3 hover:bg-accent cursor-pointer"
            >
              <p className="font-medium">{s.heading || `Slide ${i + 1}`}</p>
            </div>
          ))}

          <Button className="mt-4 w-full" variant="secondary">
            + Add New Slide
          </Button>
        </aside>

        {/* Right: Slide preview */}
        <main className="flex-1 p-6 overflow-y-auto">
          {slides.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Start by entering a topic to generate slides.
            </div>
          ) : (
            <SlidePreview slides={slides} />

          )}
        </main>
      </div>

      {/* Bottom Export Bar */}
      <footer className="border-t p-4 flex justify-between items-center bg-background">
        <div className="text-sm text-muted-foreground">
          {slides.length} slides generated
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Export PDF</Button>
          <Button variant="outline">Export PPTX</Button>
          <Button>Export with Notes</Button>
        </div>
      </footer>
    </div>
  );
}
