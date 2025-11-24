"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  acceptedTypes?: string;
}

export function UploadBox({ onFileSelect, uploading = false, acceptedTypes = ".pdf,.docx,.txt" }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }
        ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onClick={!uploading ? handleClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="hidden"
        disabled={uploading}
      />
      
      <div className="space-y-4">
        <div className="text-4xl">📄</div>
        {uploading ? (
          <>
            <p className="text-lg font-semibold text-gray-700">Uploading...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag & drop your document here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supported: PDF, DOCX, TXT (Max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

