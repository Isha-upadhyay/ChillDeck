// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { fetchSlideById, updateSlide } from "@/services/slides.services";
// import { useEditorStore } from "@/store/editorStore";
// import { SlideEditor } from "@/components/slides/SlideEditor";
// import type { SlideIn, SlideOut } from "@/types/slide";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// export default function SlideDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params?.id as string;

//   const { slide, setSlide, loading, setLoading, error, setError } =
//     useEditorStore();
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!id) return;

//     const load = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchSlideById(id);
//         setSlide(data);
//         setError(null);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load slide.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [id, setLoading, setSlide, setError]);

//   const handleSave = async (s: SlideOut) => {
//     try {
//       setSaving(true);
//       const payload: SlideIn = {
//         title: s.title,
//         bullets: s.bullets,
//         notes: s.notes,
//         design: s.design,
//       };
//       const updated = await updateSlide(s.id, payload);
//       setSlide(updated);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save slide");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading || !slide) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <p className="text-sm text-muted-foreground">
//           {error ? error : "Loading slide..."}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-semibold">
//             Edit Slide <span className="text-muted-foreground">#{slide.order ?? slide.id}</span>
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Adjust content, notes, and design for this slide.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => router.back()}>
//             Back
//           </Button>
//           <Button onClick={() => handleSave(slide)} disabled={saving}>
//             {saving ? "Saving..." : "Save"}
//           </Button>
//         </div>
//       </div>

//       {/* Editor */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Slide #{slide.order ?? 1}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <SlideEditor onSave={handleSave} saving={saving} />
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

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
import { Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { addPresentationToFolder } from "@/lib/api";

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



  // Fetch ALL slides for this presentation
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Fetch full document/presentation
        const data = await fetchPresentationById(presentationId);

        // Ensure slides are SlideOut[]
        const formattedSlides: SlideOut[] = data.slides.map(
          (s: any, i: number): SlideOut => ({
            id: String(s.id ?? i + 1),
            title: s.title ?? `Slide ${i + 1}`,
            heading: s.heading ?? s.title ?? `Slide ${i + 1}`, // <-- FIX
            bullets: s.bullets ?? [],
            notes: s.notes ?? "",
            design: s.design ?? {
              layout: "title_and_body",
              theme: "corporate",
            },
          })
        );

        setSlides(formattedSlides);

        setSlides(formattedSlides);
      } catch (err) {
        console.error(err);
        setError("Failed to load slides.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [presentationId]);

  // Save all slides (bulk update)
const handleSaveAll = async () => {
  try {
    setSaving(true);

    await updatePresentation(presentationId, {
      title: slides[0]?.title || "Untitled",
      theme: slides[0]?.design?.theme || "corporate",
      slides: slides,
    });

    // ⭐ ADD THIS: Auto add to folder if folderId exists
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

  <Button onClick={handleSaveAll} disabled={saving}>
    {saving ? "Saving..." : "Save All"}
  </Button>

  {/* EXPORT BUTTON HERE INSIDE SAME FLEX ROW */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">🚀 Export</Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem onClick={() => handleExport("pptx")}>📊 PPTX</DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport("pdf")}>📄 PDF</DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport("md")}>📝 Markdown</DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport("json")}>💾 JSON</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

</div>

      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-4 overflow-hidden">
        <SlidesLayout
          slides={slides}
          onUpdateSlides={(updated) => setSlides(updated)}
        />
      </div>
    </main>
  );
}
