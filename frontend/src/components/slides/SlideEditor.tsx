"use client";

import { useEditorStore } from "@/store/editorStore";
import { SlideOut } from "@/types/slide";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SlideEditorProps {
  onSave?: (slide: SlideOut) => void;
  saving?: boolean;
}

export function SlideEditor({ onSave, saving }: SlideEditorProps) {
  const {
    slide,
    updateTitle,
    updateNotes,
    updateBullet,
    addBullet,
    removeBullet,
    updateDesign,
  } = useEditorStore();

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No slide loaded.
      </div>
    );
  }

  const handleSaveClick = () => {
    if (onSave) onSave(slide);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
      {/* Main content editor */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Edit Slide Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={slide.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Enter slide title"
            />
          </div>

          {/* Bullets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Bullet Points</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addBullet}
              >
                + Add bullet
              </Button>
            </div>
            <div className="space-y-2">
              {slide.bullets.map((b, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={b}
                    onChange={(e) => updateBullet(idx, e.target.value)}
                    placeholder={`Bullet ${idx + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBullet(idx)}
                    disabled={slide.bullets.length <= 1}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Speaker Notes (optional)</Label>
            <Textarea
              id="notes"
              value={slide.notes ?? ""}
              onChange={(e) => updateNotes(e.target.value)}
              rows={4}
              placeholder="Add detailed notes for the speaker..."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveClick} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Design sidebar */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layout */}
          <div className="space-y-1.5">
            <Label htmlFor="layout">Layout</Label>
            <Input
              id="layout"
              value={slide.design?.layout ?? "title_and_body"}
              onChange={(e) => updateDesign({ layout: e.target.value })}
              placeholder="title_and_body / left-image / cover ..."
            />
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <Label htmlFor="theme">Theme</Label>
            <Input
              id="theme"
              value={slide.design?.theme ?? "corporate"}
              onChange={(e) => updateDesign({ theme: e.target.value })}
              placeholder="corporate / dark / modern / cute / tech"
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              value={slide.design?.icon ?? ""}
              onChange={(e) => updateDesign({ icon: e.target.value || null })}
              placeholder="e.g. 'Sparkles', 'Brain', 'Chart'"
            />
          </div>

          {/* Image Prompt */}
          <div className="space-y-1.5">
            <Label htmlFor="image_prompt">Image Prompt</Label>
            <Textarea
              id="image_prompt"
              value={slide.design?.image_prompt ?? ""}
              onChange={(e) =>
                updateDesign({ image_prompt: e.target.value || null })
              }
              rows={3}
              placeholder="Prompt for AI image generator..."
            />
          </div>

          {/* Image URL Preview (if exists) */}
          {slide.design?.image_url && (
            <div className="space-y-1.5">
              <Label>Preview Image</Label>
              <div className="overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.design.image_url}
                  alt="slide image"
                  className="h-40 w-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
