"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Template , TemplateStructure} from "@/types/template";
import { useState } from "react";
import { useRouter } from "next/navigation";

const THEMES = [
  "corporate",
  "dark",
  "modern",
  "tech",
  "minimal",
];

interface Props {
  template: Template | null;
  open: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({ template, open, onClose }: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState("corporate");

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {template.title}
          </DialogTitle>
        </DialogHeader>

        {/* Description */}
        <p className="text-gray-500 mb-4">
          {template.description}
        </p>

        {/* Slide Structure Preview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {template.structure?.slides?.map((slide, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 bg-gray-50 dark:bg-[#1a1a22]"
            >
              <p className="text-xs text-gray-400 uppercase">{slide.type}</p>
              <p className="font-medium">{slide.title}</p>
            </div>
          ))}
        </div>

        {/* Theme Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Select Theme</p>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  theme === t
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-[#11111a]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={() =>
              router.push(
                `/generate?template=${template.id}&theme=${theme}`
              )
            }
          >
            Use this template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
