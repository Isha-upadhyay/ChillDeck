// frontend/src/components/slides/SlideEditor.tsx
"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { generateImage } from "@/lib/api"; // ✅ Imported from your API file
import type { SlideOut } from "@/types/slide";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Trash2, Plus } from "lucide-react";

interface SlideEditorProps {
  onSave?: (slide: SlideOut) => void;
  saving?: boolean;
}

export function SlideEditor({ onSave, saving }: SlideEditorProps) {
  const {
    slide,
    updateTitle,
    updateHeading,
    updateNotes,
    updateBullet,
    addBullet,
    removeBullet,
    updateDesign,
  } = useEditorStore();

  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No slide selected.
      </div>
    );
  }

  // Save Handler
  const handleSaveClick = () => {
    if (onSave) onSave(slide);
  };

  // ✅ Image Generation Logic using lib/api.ts
  const handleGenerateImage = async () => {
  const prompt = slide.design?.image_prompt;
  if (!prompt) return;

  try {
    setIsGeneratingImg(true);

    // Call API (returns: { id, url, prompt, created_at })
    const data = await generateImage(prompt);

    // NEW: backend returns 'url'
    const finalImageUrl = data.url;

    if (!finalImageUrl) {
      alert("No image returned from server.");
      return;
    }

    // Update slide design
    updateDesign({ image_url: finalImageUrl });

  } catch (err) {
    console.error(err);
    alert("Failed to generate image.");
  } finally {
    setIsGeneratingImg(false);
  }
};

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex-1 overflow-y-auto border-0 shadow-none">
        <CardHeader className="pb-2 px-0">
          <CardTitle className="text-md font-bold">Content Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-1">
          
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Title (Top Bar)</Label>
            <Input
              value={slide.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Main Heading</Label>
            <Input
              value={slide.heading || slide.title}
              onChange={(e) => updateHeading(e.target.value)}
              className="font-semibold text-lg"
            />
          </div>

          {/* Bullets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">Bullet Points</Label>
              <Button variant="ghost" size="sm" onClick={addBullet} className="h-6 w-6 p-0 hover:bg-muted">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(slide.bullets || []).map((b, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <Input
                    value={b}
                    onChange={(e) => updateBullet(idx, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBullet(idx)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Image Generator Section */}
          <div className="pt-4 mt-4 border-t border-dashed">
            <Label className="text-xs font-semibold text-indigo-400 mb-2 block">AI Image Generator</Label>
            <div className="space-y-2">
                <Textarea
                  value={slide.design?.image_prompt || ""}
                  onChange={(e) => updateDesign({ image_prompt: e.target.value })}
                  placeholder="Describe the image (e.g. 'Futuristic city with flying cars')..."
                  className="min-h-[80px] text-sm resize-none"
                />
                <Button 
                    onClick={handleGenerateImage} 
                    disabled={!slide.design?.image_prompt || isGeneratingImg}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                >
                    {isGeneratingImg ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Generate Image</>
                    )}
                </Button>
            </div>
          </div>

          {/* Speaker Notes */}
          <div className="pt-4 border-t">
            <Label className="text-xs text-muted-foreground mb-1 block">Speaker Notes</Label>
            <Textarea
              value={slide.notes || ""}
              onChange={(e) => updateNotes(e.target.value)}
              rows={3}
              className="text-xs bg-muted/20"
              placeholder="Notes for the presenter..."
            />
          </div>

        </CardContent>
      </Card>
      
      {/* Footer Save Button */}
      <div className="pt-2 border-t">
          <Button onClick={handleSaveClick} disabled={saving} className="w-full">
            {saving ? "Saving All..." : "Save Changes"}
          </Button>
      </div>
    </div>
  );
}