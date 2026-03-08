// frontend/src/lib/api.ts
import axios from "axios";
import type { Template, TemplateCreatePayload } from "@/types/template";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function generateOutline(topic: string, theme: string) {
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

export async function generateImage(prompt: string) 
 {
  const res = await fetch(`${API_BASE}/api/image/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data;
}

// FETCH ALL SAVED IMAGES
export async function fetchImages() {
  const res = await fetch(`${API_BASE}/api/image/all`);
  return res.json();
}

// DELETE IMAGE
export async function deleteImage(id: string) {
  const res = await fetch(`${API_BASE}/api/image/${id}`, {
    method: "DELETE",
  });
  return res.json();
}


// ✅ NEW: Assign presentation to folder
export async function assignPresentationToFolder(folderId: string, presentationId: string) {
  const res = await fetch(`${API_BASE}/api/folders/${folderId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presentation_id: presentationId }),
  });

  if (!res.ok) throw new Error("Failed to assign presentation to folder");

  return res.json();
}



// ---------- FOLDER API ----------

export async function fetchFolders() {
  const res = await fetch(`${API_BASE}/api/folders/all`);
  return res.json();
}

export async function createFolder(name: string) {
  const res = await fetch(`${API_BASE}/api/folders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function addPresentationToFolder(folderId: string, presentationId: string) {
  const res = await fetch(`${API_BASE}/api/folders/${folderId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presentation_id: presentationId }),
  });
  return res.json();
}

export async function fetchFolderPresentations(folderId: string) {
  const res = await fetch(`${API_BASE}/api/folders/${folderId}/presentations`);
  const data = await res.json();

  if (Array.isArray(data.presentation_ids)) {
    const ids = data.presentation_ids;

    const presentations = [];

    for (const id of ids) {
      const r = await fetch(`${API_BASE}/api/slides/presentation/${id}`);

      if (r.status === 200) {
        presentations.push(await r.json());
      } else {
        console.warn("Missing presentation:", id);
      }
    }

    return presentations;
  }

  return data;
}

// ---------- TEMPLATE API ----------

// export async function fetchTemplates(params?: {
//   category?: string;
//   limit?: number;
//   offset?: number;
// }) {
//   const query = new URLSearchParams();

//   if (params?.category) query.append("category", params.category);
//   if (params?.limit) query.append("limit", String(params.limit));
//   if (params?.offset) query.append("offset", String(params.offset));

//   const res = await fetch(
//     `${API_BASE}/api/templates${query.toString() ? `?${query}` : ""}`
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch templates");
//   }

//   return res.json();
// }

// export async function fetchTemplateById(templateId: string) {
//   const res = await fetch(`${API_BASE}/api/templates/${templateId}`);

//   if (!res.ok) {
//     throw new Error("Template not found");
//   }

//   return res.json();
// }

// export async function createTemplate(payload: any) {
//   const res = await fetch(`${API_BASE}/api/templates`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to create template");
//   }

//   return res.json();
// }

// export async function deleteTemplate(templateId: string) {
//   const res = await fetch(`${API_BASE}/api/templates/${templateId}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to delete template");
//   }

//   return true;
// }




// ---------------- TEMPLATES ----------------

export async function fetchTemplates(params?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Template[]> {
  const res = await axios.get(`${API_BASE}/api/templates`, {
    params,
  });
  return res.data;
}

export async function fetchTemplateById(
  templateId: string
): Promise<Template> {
  const res = await axios.get(`${API_BASE}/api/templates/${templateId}`);
  return res.data;
}

// ⚠️ Admin / Seed only
export async function createTemplate(
  payload: TemplateCreatePayload
): Promise<Template> {
  const res = await axios.post(`${API_BASE}/api/templates`, payload);
  return res.data;
}

// ⚠️ Admin only
export async function deleteTemplate(templateId: string): Promise<void> {
  await axios.delete(`${API_BASE}/api/templates/${templateId}`);
}

// ---------- SSE STREAMING GENERATE ----------

export function generateOutlineStream(
  topic: string,
  theme: string,
  onProgress: (data: { step: string; message: string; progress: number; presentation_id?: string; slides?: unknown[] }) => void,
  onError: (error: string) => void
) {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  fetch(`${API}/api/slides/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, detail: "medium", style: theme }),
  }).then(async (response) => {
    if (!response.body) {
      onError("No response body");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            onProgress(data);
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  }).catch((err) => {
    onError(err.message || "Stream failed");
  });
}

// ---------- CHAT API ----------

export async function sendChatMessage(presentationId: string, slideIndex: number, message: string) {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${API}/api/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presentation_id: presentationId, slide_index: slideIndex, message }),
  });
  return res.json();
}

export async function getChatHistory(presentationId: string, slideIndex: number) {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${API}/api/chat/history/${presentationId}/${slideIndex}`);
  return res.json();
}

// ---------- VERSION HISTORY API ----------

export async function getVersionHistory(presentationId: string) {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${API}/api/slides/presentation/${presentationId}/versions`);
  return res.json();
}

export async function restoreVersion(presentationId: string, versionId: string) {
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${API}/api/slides/presentation/${presentationId}/restore/${versionId}`, {
    method: "POST",
  });
  return res.json();
}
