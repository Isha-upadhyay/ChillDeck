"use client";

import { useEffect, useState } from "react";
import { fetchImages, deleteImage, generateImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Image as ImgIcon, Download, Trash2, X } from "lucide-react";

// ------------------------
// Types
// ------------------------
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  created_at: number;
}

export default function ImageGalleryPage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);

  // Modal Preview
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);

  // Art style options
  const STYLES = ["Illustration", "Photorealistic", "Abstract", "3D", "Line Art"];
  const [selectedStyle, setSelectedStyle] = useState("Illustration");

  // ------------------------
  // Load all images
  // ------------------------
  useEffect(() => {
    const load = async () => {
      setLoadingImages(true);
      const data = await fetchImages();
      setImages(data.reverse());
      setLoadingImages(false);
    };
    load();
  }, []);

  // ------------------------
  // Generate Image
  // ------------------------
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const styledPrompt = `${prompt}. Art style: ${selectedStyle}`;
      const res = await generateImage(styledPrompt);

      const newImage: GeneratedImage = {
        id: res.id,
        url: res.url,
        prompt: res.prompt,
        created_at: res.created_at,
      };

      setImages((prev) => [newImage, ...prev]);
      setPrompt("");
    } catch {
      alert("Image generation failed.");
    }

    setLoading(false);
  };

  // ------------------------
  // Delete image
  // ------------------------
  const handleDelete = async (id: string) => {
    await deleteImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (activeImage?.id === id) setModalOpen(false);
  };

  // ------------------------
  // Regenerate Similar
  // ------------------------
  const handleRegenerate = async () => {
    if (!activeImage) return;
    setLoading(true);

    try {
      const res = await generateImage(activeImage.prompt);
      setImages((prev) => [res, ...prev]);
    } catch {
      alert("Failed to regenerate");
    }

    setLoading(false);
  };

  // ------------------------
  // MAIN UI
  // ------------------------
  return (
    <main className="min-h-screen bg-[#0B0B10] text-white px-10 py-12">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI Images
          </h1>
          <ImgIcon className="h-10 w-10 text-indigo-400 opacity-60" />
        </div>

        <p className="text-gray-400 mb-10">
          Create unlimited AI-powered visuals — stunning, fast, and magical.
        </p>

        {/* INPUT SECTION */}
        <div className="bg-[#12121A] border border-gray-700/40 p-6 rounded-2xl shadow-xl">
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[110px] bg-[#0D0D14] border border-gray-700 text-gray-200 
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/40"
            placeholder="Describe your image idea..."
          />

          {/* ART STYLES */}
          <div className="flex flex-wrap gap-3 mt-4">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStyle(s)}
                className={`px-3 py-1 text-xs rounded-lg border transition ${
                  selectedStyle === s
                    ? "bg-indigo-600 border-indigo-400"
                    : "border-gray-600 text-gray-300 hover:border-indigo-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* GENERATE BUTTON */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4 py-4 text-md font-semibold bg-gradient-to-r 
            from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
          {images.map((img) => (
            <Card
              key={img.id}
              className="rounded-2xl bg-[#11111A] border border-gray-700/40 p-4 shadow-lg 
              hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] transform hover:scale-[1.03] transition-all cursor-pointer"
              onClick={() => {
                setActiveImage(img);
                setModalOpen(true);
              }}
            >
              <img
                src={img.url}
                className="h-48 w-full object-cover rounded-xl"
              />
              <p className="mt-3 text-xs text-gray-400 line-clamp-2">{img.prompt}</p>
            </Card>
          ))}
        </div>

        {!loadingImages && images.length === 0 && (
          <p className="text-center text-gray-500 mt-20">
            No images yet — generate your first masterpiece!
          </p>
        )}
      </div>

      {/* ------------------------ */}
      {/* MODAL VIEW */}
      {/* ------------------------ */}
      {modalOpen && activeImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[999]">
          <Card className="bg-[#1A1A22] border border-gray-700/40 p-6 rounded-2xl w-[90%] max-w-3xl relative">
            
            {/* CLOSE */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setModalOpen(false)}
            >
              <X size={22} />
            </button>

            {/* IMAGE */}
            <img
              src={activeImage.url}
              className="w-full rounded-xl max-h-[420px] object-cover"
            />

            {/* PROMPT */}
            <p className="mt-4 text-sm text-gray-300">{activeImage.prompt}</p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6">
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = activeImage.url;
                  a.download = "ai-image.png";
                  a.click();
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>

              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleRegenerate}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Generate Similar
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(activeImage.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>

          </Card>
        </div>
      )}
    </main>
  );
}
