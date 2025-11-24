// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function generateOutline(topic: string, theme: string = "corporate") {
  const resp = await axios.post(`${API_BASE}/api/slides/generate`, {
    topic,
    detail: "medium",
    style: theme,
  });

  return resp.data;
}

export async function exportSlides(slides: any[], topic: string, format: "pptx" | "pdf" | "md" | "json") {
  const resp = await axios.post(
    `${API_BASE}/api/slides/export`,
    { slides, topic, format },
    { responseType: "blob" }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([resp.data]));
  const link = document.createElement("a");
  link.href = url;
  
  // Set filename based on format
  const extension = format === "pptx" ? "pptx" : format === "pdf" ? "pdf" : format === "md" ? "md" : "json";
  const safeTopic = topic.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.setAttribute("download", `${safeTopic}.${extension}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function uploadDocument(file: File): Promise<{ document_id: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  
  const resp = await axios.post(`${API_BASE}/api/upload/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  // Handle both response formats
  const documentId = resp.data.document_id || resp.data.ingest?.document_id;
  
  if (!documentId) {
    throw new Error("Document ID not found in response");
  }
  
  return {
    document_id: documentId,
    filename: file.name,
  };
}

export async function generateSlidesFromDocument(documentId: string, theme: string = "corporate") {
  const resp = await axios.post(`${API_BASE}/api/slides/generate`, {
    document_id: documentId,
    detail: "medium",
    style: theme,
  });
  
  return resp.data;
}

