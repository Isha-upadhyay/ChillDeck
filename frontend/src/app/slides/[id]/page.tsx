"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { assignPresentationToFolder } from "@/lib/api";

import {
  exportSlides,
  fetchPresentationById,
  updatePresentation,
} from "@/services/slides.services";
import { SlidesLayout } from "@/components/slides/SlideLayout";
import type { SlideOut } from "@/types/slide";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function SlideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const presentationId = params?.id as string;

  const [slides, setSlides] = useState<SlideOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");
  const urlTheme = searchParams.get("theme") || "corporate";
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<Array<{id: string; version_number: number; created_at: string; slide_count: number}>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchPresentationById(presentationId);

        const formattedSlides: SlideOut[] = data.slides.map(
          (s: Record<string, unknown>, i: number): SlideOut => ({
            id: String((s.id as string | number) ?? i + 1),
            title: (s.title as string) ?? `Slide ${i + 1}`,
            heading: (s.heading as string) ?? (s.title as string) ?? `Slide ${i + 1}`,
            bullets: (s.bullets as string[]) ?? [],
            notes: (s.notes as string) ?? "",
            design: {
              layout: ((s.design as Record<string, unknown>)?.layout as string) ?? "title_and_body",
              theme: ((s.design as Record<string, unknown>)?.theme as string) ?? urlTheme,
            },
          }),
        );

        setSlides(formattedSlides);
      } catch (err) {
        console.error(err);
        setError("Failed to load slides.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [presentationId, urlTheme]);

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      await updatePresentation(presentationId, {
        title: slides[0]?.title || "Untitled",
        theme: slides[0]?.design?.theme || "corporate",
        slides: slides,
      });

      if (folderId) {
        await assignPresentationToFolder(folderId, presentationId);
      }

      router.push(folderId ? `/folders/${folderId}` : "/workspace");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const topic = slides[0]?.title || "Presentation";
      const blob = await exportSlides(slides, topic, format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${topic}.${format}`;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed.");
    }
  };

  const loadVersions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/slides/presentation/${presentationId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        setShowVersions(true);
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
    }
  };

  const restoreVersion = async (versionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/slides/presentation/${presentationId}/restore/${versionId}`, {
        method: "POST",
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-red-500 mb-3">{error || "No slides found."}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Presentation Editor</h1>
          <p className="text-sm text-muted-foreground">
            Edit structure, design & content of your slides
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back
          </Button>

          <Button variant="outline" onClick={loadVersions}>
            <History className="h-4 w-4 mr-1" /> Versions
          </Button>

          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? "Saving..." : "Save All"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport("pptx")}>PPTX</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}>Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* VERSION HISTORY PANEL */}
      {showVersions && (
        <div className="bg-muted/50 border-b p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Version History</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)}>Close</Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => restoreVersion(v.id)}
                className="flex-shrink-0 px-3 py-2 bg-background rounded-lg border text-xs hover:border-indigo-400 transition"
              >
                <span className="font-semibold">v{v.version_number}</span>
                <span className="text-muted-foreground ml-2">{v.slide_count} slides</span>
                <span className="text-muted-foreground ml-2">{new Date(v.created_at).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-4 overflow-hidden">
        <SlidesLayout
          slides={slides}
          onUpdateSlides={(updated) => setSlides(updated)}
          presentationId={presentationId}
        />
      </div>
    </main>
  );
}
