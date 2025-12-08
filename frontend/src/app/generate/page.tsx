"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateOutline, exportSlides } from "@/lib/api";
import { SlideEditor } from "@/components/slides/SlideEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEditorStore } from "@/store/editorStore";
import type { SlideOut } from "@/types/slide";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface Slide {
  id: number;
  title?: string;
  heading?: string;
  bullets?: string[];
  points?: string[];
  notes?: string;
  design?: any;
}

const THEMES = [
  { id: "corporate", name: "Corporate", colors: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900" } },
  { id: "dark", name: "Dark", colors: { bg: "bg-gray-900", border: "border-gray-700", text: "text-gray-100" } },
  { id: "modern", name: "Modern", colors: { bg: "bg-gradient-to-br from-purple-50 to-pink-50", border: "border-purple-200", text: "text-purple-900" } },
  { id: "tech", name: "Tech", colors: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900" } },
  { id: "cute", name: "Cute", colors: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900" } },
  { id: "minimal", name: "Minimal", colors: { bg: "bg-white", border: "border-gray-300", text: "text-gray-900" } },
];

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("corporate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ topic: string; slides: Slide[] } | null>(null);
  const [error, setError] = useState("");
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const { setSlide, clearSlide } = useEditorStore();
  const searchParams = useSearchParams();
const folderId = searchParams.get("folder");

  // -------------------------------------------------
  // FIXED + MERGED handleGenerate
  // -------------------------------------------------
  async function handleGenerate(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  if (!topic.trim()) return setError("Please enter a topic");

  setLoading(true);

  try {
    const res = await generateOutline(topic, selectedTheme);

    // Theme apply
    const themedSlides = res.slides.map((slide: Slide) => ({
      ...slide,
      design: {
        ...slide.design,
        theme: selectedTheme,
        layout: slide.design?.layout || "title_and_body",
      },
    }));

    setResult({ ...res, slides: themedSlides });

    // ⭐ Folder-aware redirect
    if (folderId) {
      router.push(`/slides/${res.presentation_id}?folder=${folderId}`);
    } else {
      router.push(`/slides/${res.presentation_id}`);
    }

  } catch (err: any) {
    setError(err?.message || "Request failed");
  } finally {
    setLoading(false);
  }
}

  function getThemeColors(themeId: string) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    return theme.colors;
  }

  // -------------------------------------------------
  // MERGED: OPEN EDITOR
  // -------------------------------------------------
  function handleEditSlide(index: number) {
    if (!result) return;

    const slide = result.slides[index];
    const slideOut: SlideOut = {
      id: String(slide.id ?? index + 1),
      title: slide.title || slide.heading || `Slide ${index + 1}`,
      bullets: slide.bullets || slide.points || [],
      notes: slide.notes || "",
      design: slide.design || { layout: "title_and_body", theme: "corporate" },
      heading: "",
    };

    setSlide(slideOut);
    setEditingSlideIndex(index);
  }

  // -------------------------------------------------
  // MERGED: SAVE SLIDE
  // -------------------------------------------------
  function handleSaveSlide(updatedSlide: SlideOut) {
    if (!result || editingSlideIndex === null) return;

    const updated = [...result.slides];
    updated[editingSlideIndex] = {
      id: Number(updatedSlide.id),
      title: updatedSlide.title,
      bullets: updatedSlide.bullets,
      notes: updatedSlide.notes || "",
      design: updatedSlide.design,
    };

    setResult({ ...result, slides: updated });
    setEditingSlideIndex(null);
    clearSlide();
  }

  // MERGED Close Dialog
  function handleCloseEdit() {
    clearSlide();
    setEditingSlideIndex(null);
  }


  function getThemeStyles(themeId: string) {
  switch (themeId) {
    case "corporate":
      return "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border-blue-300";
    case "dark":
      return "bg-gray-900 text-gray-200 border-gray-700";
    case "modern":
      return "bg-gradient-to-br from-purple-50 to-pink-50 text-purple-900 border-purple-300";
    case "tech":
      return "bg-gradient-to-br from-green-50 to-blue-50 text-green-900 border-green-300";
    case "cute":
      return "bg-pink-50 text-pink-900 border-pink-300";
    case "minimal":
      return "bg-white text-gray-900 border-gray-300";
    default:
      return "bg-gray-100 text-gray-900";
  }
}


  

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-16 flex justify-center">
      <div className="max-w-4xl w-full">

        {/* PAGE TITLE */}
        <h1 className="text-center text-4xl font-bold mb-3">
          What would you like to create?
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Choose a starting point and let our AI handle the heavy lifting.
        </p>

        {/* TOGGLE BUTTONS */}
        <div className="flex gap-4 justify-center mb-10">
          <button
            className="w-full max-w-[260px] px-5 py-3 rounded-xl bg-[#1a1a22] border border-gray-700 
                       text-gray-200 hover:bg-[#22222b] transition flex items-center justify-center gap-2"
          >
            ✏️ Paste a Topic
          </button>

          <button
            onClick={() => router.push("/upload")}
            className="w-full max-w-[260px] px-5 py-3 rounded-xl bg-[#1a1a22] border border-gray-700
                       text-gray-200 hover:bg-[#22222b] transition flex items-center justify-center gap-2"
          >
            📤 Upload Document
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-8 shadow-xl">

          <label className="text-sm text-gray-300 mb-2 block font-medium">
            Topic or Prompt
          </label>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The Future of Renewable Energy in 2025..."
            className="w-full h-36 p-4 rounded-xl bg-[#0c0c13] border border-gray-700 
                       text-gray-200 placeholder-gray-500 text-base resize-none outline-none
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30 mb-8"
          ></textarea>

          {/* Theme Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Select Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
  {THEMES.map((theme) => (
    <button
      key={theme.id}
      type="button"
      onClick={() => setSelectedTheme(theme.id)}
      className={`
        px-3 py-2 rounded-lg text-xs border transition-all shadow-sm
        flex items-center justify-center font-medium
        ${
          selectedTheme === theme.id
            ? `${theme.colors.bg} ${theme.colors.border} border-2 scale-[1.05] shadow-md`
            : "bg-[#181820] border-gray-700 text-gray-300 hover:bg-[#22222a]"
        }
      `}
    >
      {theme.name}
    </button>
  ))}
</div>

          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 
                       hover:opacity-90 rounded-xl text-lg font-semibold shadow-lg"
          >
            ⚡ {loading ? "Generating..." : "Generate Presentation"}
          </button>

          {error && <p className="mt-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">{error}</p>}
        </div>

        {/* RESULTS */}
        {result && result.slides && (
          <div className="mt-10">

            {/* EXPORT BUTTONS */}
            <div className="bg-[#11111a] border border-gray-800 p-5 rounded-xl shadow flex flex-wrap gap-3 mb-6">
              <Button onClick={() => exportSlides(result.slides, result.topic, "pptx")} className="bg-green-600 hover:bg-green-700">
                📊 Export PPTX
              </Button>
              <Button onClick={() => exportSlides(result.slides, result.topic, "pdf")} className="bg-red-600 hover:bg-red-700">
                📄 Export PDF
              </Button>
              <Button onClick={() => exportSlides(result.slides, result.topic, "md")} className="bg-blue-600 hover:bg-blue-700">
                📝 Export MD
              </Button>
              <Button onClick={() => exportSlides(result.slides, result.topic, "json")} className="bg-gray-600 hover:bg-gray-700">
                💾 Export JSON
              </Button>
            </div>

            

            {/* SLIDE PREVIEWS */}
           <div className="grid gap-4 md:grid-cols-2">
  {result.slides.map((slide, index) => {
    const themeId = slide.design?.theme || selectedTheme;
    const themeClass = getThemeStyles(themeId);

    return (
      <div
        key={slide.id || index}
        className={`p-5 rounded-xl shadow-md border ${themeClass}`}
      >
        <h3 className="text-xl font-semibold mb-2">
          {slide.title || `Slide ${index + 1}`}
        </h3>

        <ul className="mb-3 space-y-1">
          {(slide.bullets || []).map((b, i) => (
            <li key={i} className="text-sm flex">
              <span className="mr-2">•</span> {b}
            </li>
          ))}
        </ul>

        <Button onClick={() => handleEditSlide(index)} className="text-sm mt-2">
          ✏️ Edit
        </Button>
      </div>
    );
  })}
</div>


            {/* EDIT DIALOG */}
            <Dialog open={editingSlideIndex !== null} onOpenChange={(open) => !open && handleCloseEdit()}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Slide</DialogTitle>
                </DialogHeader>
                <SlideEditor onSave={handleSaveSlide} saving={false} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </main>
  );
}


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { generateOutline, exportSlides } from "@/lib/api";
// import { SlideEditor } from "@/components/slides/SlideEditor";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useEditorStore } from "@/store/editorStore";
// import type { SlideOut } from "@/types/slide";
// import { Button } from "@/components/ui/button";

// interface Slide {
//   id: number;
//   title?: string;
//   heading?: string;
//   bullets?: string[];
//   points?: string[];
//   notes?: string;
//   design?: any;
// }

// const THEMES = [
//   { id: "corporate", name: "Corporate", colors: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900" } },
//   { id: "dark", name: "Dark", colors: { bg: "bg-gray-900", border: "border-gray-700", text: "text-gray-100" } },
//   { id: "modern", name: "Modern", colors: { bg: "bg-gradient-to-br from-purple-50 to-pink-50", border: "border-purple-200", text: "text-purple-900" } },
//   { id: "tech", name: "Tech", colors: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900" } },
//   { id: "cute", name: "Cute", colors: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900" } },
//   { id: "minimal", name: "Minimal", colors: { bg: "bg-white", border: "border-gray-300", text: "text-gray-900" } },
// ];

// export default function Home() {
//   const router = useRouter();

//   const [topic, setTopic] = useState("");
//   const [selectedTheme, setSelectedTheme] = useState("corporate");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Slide editor
//   const [result, setResult] = useState<{ topic: string; slides: Slide[] } | null>(null);
//   const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
//   const { setSlide, clearSlide } = useEditorStore();

//   // -------------------------------------------------
//   // GENERATE PRESENTATION
//   // -------------------------------------------------
//   async function handleGenerate(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");

//     if (!topic.trim()) return setError("Please enter a topic");

//     setLoading(true);
//     try {
//       const res = await generateOutline(topic, selectedTheme);

//       // Apply theme to all slides
//       const themedSlides = res.slides.map((slide: Slide) => ({
//         ...slide,
//         design: {
//           ...slide.design,
//           theme: selectedTheme,
//         },
//       }));

//       setResult({ ...res, slides: themedSlides });
//       router.push(`/slides/${res.presentation_id}`);
//     } catch (err: any) {
//       setError(err?.message || "Request failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function getThemeColors(themeId: string) {
//     const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
//     return theme.colors;
//   }

//   // -------------------------------------------------
//   // OPEN EDITOR
//   // -------------------------------------------------
//   function handleEditSlide(index: number) {
//     if (!result) return;

//     const slide = result.slides[index];
//     const slideOut: SlideOut = {
//       id: String(slide.id ?? index + 1),
//       title: slide.title || slide.heading || `Slide ${index + 1}`,
//       bullets: slide.bullets || slide.points || [],
//       notes: slide.notes || "",
//       design: slide.design || { layout: "title_and_body", theme: "corporate" },
//       heading: "",
//     };

//     setSlide(slideOut);
//     setEditingSlideIndex(index);
//   }

//   // -------------------------------------------------
//   // SAVE SLIDE
//   // -------------------------------------------------
//   function handleSaveSlide(updatedSlide: SlideOut) {
//     if (!result || editingSlideIndex === null) return;

//     const updated = [...result.slides];
//     updated[editingSlideIndex] = {
//       id: Number(updatedSlide.id),
//       title: updatedSlide.title,
//       bullets: updatedSlide.bullets,
//       notes: updatedSlide.notes || "",
//       design: updatedSlide.design,
//     };

//     setResult({ ...result, slides: updated });
//     setEditingSlideIndex(null);
// clearSlide();
//   }

//   // CLOSE DIALOG
//   function handleCloseEdit() {
//     clearSlide();
//     setEditingSlideIndex(null);
//   }

//   // -------------------------------------------------
//   // UI STARTS HERE
//   // -------------------------------------------------

//   return (
//     <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-16 flex justify-center">
//       <div className="max-w-4xl w-full">

//         {/* PAGE TITLE */}
//         <h1 className="text-center text-4xl font-bold mb-3">
//           What would you like to create?
//         </h1>
//         <p className="text-center text-gray-400 mb-12">
//           Choose a starting point and let our AI handle the heavy lifting.
//         </p>

//         {/* TOGGLE BUTTONS */}
//         <div className="flex gap-4 justify-center mb-10">
//           <button
//             className="w-full max-w-[260px] px-5 py-3 rounded-xl bg-[#1a1a22] border border-gray-700 
//                        text-gray-200 hover:bg-[#22222b] transition flex items-center justify-center gap-2"
//           >
//             ✏️ Paste a Topic
//           </button>

//           <button
//             onClick={() => router.push("/upload")}
//             className="w-full max-w-[260px] px-5 py-3 rounded-xl bg-[#1a1a22] border border-gray-700
//                        text-gray-200 hover:bg-[#22222b] transition flex items-center justify-center gap-2"
//           >
//             📤 Upload Document
//           </button>
//         </div>

//         {/* MAIN CARD */}
//         <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-8 shadow-xl">

//           {/* Topic Input */}
//           <label className="text-sm text-gray-300 mb-2 block font-medium">
//             Topic or Prompt
//           </label>

//           <textarea
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             placeholder="e.g., The Future of Renewable Energy in 2025..."
//             className="w-full h-36 p-4 rounded-xl bg-[#0c0c13] border border-gray-700 
//                        text-gray-200 placeholder-gray-500 text-base resize-none outline-none
//                        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30 mb-8"
//           ></textarea>

//           {/* Dropdowns */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             {/* Slide Count */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block font-medium">Slide Count</label>
//               <select
//                 className="w-full p-3 rounded-xl bg-[#0c0c13] border border-gray-700 text-gray-200 outline-none 
//                            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30"
//               >
//                 <option>Medium (10–12 slides)</option>
//                 <option>Short (5–7 slides)</option>
//                 <option>Long (15–20 slides)</option>
//               </select>
//             </div>

//             {/* Theme Style */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block font-medium">Style</label>
//               <select
//                 value={selectedTheme}
//                 onChange={(e) => setSelectedTheme(e.target.value)}
//                 className="w-full p-3 rounded-xl bg-[#0c0c13] border border-gray-700 text-gray-200 outline-none 
//                            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/30"
//               >
//                 {THEMES.map((theme) => (
//                   <option key={theme.id} value={theme.id}>
//                     {theme.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//           </div>

//           {/* Generate Button */}
//           <button
//             onClick={handleGenerate}
//             disabled={loading}
//             className="w-full mt-10 py-4 text-center rounded-xl bg-gradient-to-r 
//                        from-indigo-500 to-blue-600 hover:opacity-90 transition
//                        font-semibold text-white text-lg shadow-md disabled:opacity-40"
//           >
//             ⚡ {loading ? "Generating..." : "Generate Presentation"}
//           </button>

//           {/* Error */}
//           {error && (
//             <p className="mt-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">{error}</p>
//           )}
//         </div>

//         {/*  RESULTS UI (kept same, no UI rewrite needed unless you want it) */}

//       </div>
//     </main>
//   );
// }
