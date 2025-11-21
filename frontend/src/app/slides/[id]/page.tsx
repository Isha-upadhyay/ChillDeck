"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSlideById, updateSlide } from "@/services/slides.services";
import { useEditorStore } from "@/store/editorStore";
import { SlideEditor } from "@/components/slides/SlideEditor";
import type { SlideIn, SlideOut } from "@/types/slide";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SlideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { slide, setSlide, loading, setLoading, error, setError } =
    useEditorStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSlideById(id);
        setSlide(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load slide.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, setLoading, setSlide, setError]);

  const handleSave = async (s: SlideOut) => {
    try {
      setSaving(true);
      const payload: SlideIn = {
        title: s.title,
        bullets: s.bullets,
        notes: s.notes,
        design: s.design,
      };
      const updated = await updateSlide(s.id, payload);
      setSlide(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !slide) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error ? error : "Loading slide..."}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Edit Slide <span className="text-muted-foreground">#{slide.order ?? slide.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Adjust content, notes, and design for this slide.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={() => handleSave(slide)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Slide #{slide.order ?? 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <SlideEditor onSave={handleSave} saving={saving} />
        </CardContent>
      </Card>
    </main>
  );
}
