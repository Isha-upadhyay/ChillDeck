"use client";

import { useEffect, useState } from "react";
import { fetchImages, deleteImage, generateImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

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

  // Load all images from backend
  useEffect(() => {
    const load = async () => {
      setLoadingImages(true);
      const data = await fetchImages();
      setImages(data);
      setLoadingImages(false);
    };
    load();
  }, []);

  // IMAGE GENERATION
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await generateImage(prompt);

      // Backend already returns the saved image details
      const newImage: GeneratedImage = {
        id: res.id,
        url: res.url,
        prompt: res.prompt,
        created_at: res.created_at,
      };

      setImages((prev) => [newImage, ...prev]);
      setPrompt("");
    } catch (error) {
      alert("Image generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE IMAGE
  const handleDelete = async (id: string) => {
    await deleteImage(id);
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#0B0B10] text-white px-10 py-12">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-gray-400 mb-10">
          Create unlimited AI-powered visuals — stunning, fast, and magical.
        </p>

        {/* INPUT */}
        <div className="bg-[#12121A] border border-gray-700/40 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[110px] bg-[#0D0D14] border border-gray-700 text-gray-200 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/40"
            placeholder="Describe what you want (e.g. vibrant galaxy city with pink clouds)..."
          />

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {images.map((img) => (
            <Card
              key={img.id}
              className="rounded-2xl bg-[#11111A] border border-gray-700/40 p-4 shadow-lg 
                        hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all duration-300"
            >
              <div className="rounded-xl overflow-hidden">
                <img
                  src={img.url}
                  className="h-52 w-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="mt-3 text-xs text-gray-400 line-clamp-2">{img.prompt}</p>

              <div className="flex justify-between mt-4">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => navigator.clipboard.writeText(img.url)}
                >
                  Copy URL
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-black border-gray-500"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = img.url;
                    a.download = `image-${img.id}.png`;
                    a.click();
                  }}
                >
                  Download
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(img.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {images.length === 0 && !loadingImages && (
          <p className="text-center text-gray-500 mt-20">
            No images yet — generate your first masterpiece!
          </p>
        )}
      </div>
    </main>
  );
}
