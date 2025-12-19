"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadBox } from "@/components/slides/UploadBox";
import { uploadDocument, generateSlidesFromDocument, exportSlides } from "@/lib/api";
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
  { id: "corporate", name: "Corporate" },
  { id: "dark", name: "Dark" },
  { id: "modern", name: "Modern" },
  { id: "tech", name: "Tech" },
  { id: "cute", name: "Cute" },
  { id: "minimal", name: "Minimal" },
];

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("corporate");
  // const [result, setResult] = useState<{ topic: string; slides: Slide[] } | null>(null);
  const [error, setError] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const searchParams = useSearchParams();
const folderId = searchParams.get("folder");

  const handleFileSelect = (file: File) => {
    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setError("Please upload a PDF, DOCX, or TXT file");
      return;
    }
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum of 10MB. Please use a smaller file.`);
      return;
    }
    
    // Warn for very large files (>5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("⚠️ Large file detected. Processing may take longer and use more memory. Consider splitting the document.");
      // Still allow upload but warn user
    }
    
    setSelectedFile(file);
    if (file.size <= 5 * 1024 * 1024) {
      setError(""); // Clear error for smaller files
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setGenerating(true);
  setError("");

  try {
    // 1️⃣ Upload document
    const uploadResult = await uploadDocument(selectedFile);

    // 2️⃣ Generate slides
    const res = await generateSlidesFromDocument(
      uploadResult.document_id,
      selectedTheme
    );

    // 3️⃣ Open SAME slide editor page
    if (folderId) {
  router.push(`/slides/${res.presentation_id}?folder=${folderId}`);
} else {
  router.push(`/slides/${res.presentation_id}`);
}


  } catch (err: any) {
    setError(err?.message || "Upload failed");
  } finally {
    setUploading(false);
    setGenerating(false);
  }
};


  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
              <p className="text-gray-600">Upload a PDF, DOCX, or TXT file to generate slides</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              ← Back to Home
            </Button>
          </div>

          {/* Upload Box */}
          <div className="mb-4">
            <UploadBox
              onFileSelect={handleFileSelect}
              uploading={uploading || generating}
            />
          </div>

          {/* Selected File Info */}
          {selectedFile  && (
            <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Selected: {selectedFile.name}</p>
                  <p className="text-sm text-blue-700">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          {selectedFile  && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Theme:</label>
              <div className="flex gap-2 flex-wrap">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-3 py-2 rounded text-sm border transition-all ${
                      selectedTheme === theme.id
                        ? "bg-blue-100 border-blue-500 border-2 font-semibold"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={uploading || generating}
              className="w-full"
              size="lg"
            >
              {uploading 
                ? "Uploading Document..." 
                : generating 
                ? "Generating Slides from Document..." 
                : "Upload"
              }
            </Button>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </div>



   
      </div>
    </main>
  );
}

function getThemeColors(themeId: string) {
  const themes: Record<string, { bg: string; border: string; text: string }> = {
    corporate: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900" },
    dark: { bg: "bg-gray-900", border: "border-gray-700", text: "text-gray-100" },
    modern: { bg: "bg-gradient-to-br from-purple-50 to-pink-50", border: "border-purple-200", text: "text-purple-900" },
    tech: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900" },
    cute: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900" },
    minimal: { bg: "bg-white", border: "border-gray-300", text: "text-gray-900" },
  };
  return themes[themeId] || themes.corporate;
}

