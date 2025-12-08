// frontend/src/lib/api.ts
import axios from "axios";

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


// // folder api
// export async function fetchFolders() {
//   const res = await fetch(`${API_BASE}/api/folders/all`);
//   return res.json();
// }

// export async function fetchFolderPresentations(id: string) {
//   const res = await fetch(`${API_BASE}/api/folders/${id}`);
//   return res.json();
// }


// export async function createFolder(name: string) {
//   const res = await fetch(`${API_BASE}/api/folders/create`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name }),
//   });
//   return res.json();
// }

// export async function deleteFolder(id: string) {
//   return fetch(`${API_BASE}/api/folders/${id}`, { method: "DELETE" });
// }





// export async function fetchFolders() {
//   const res = await fetch(`${API_BASE}/api/folders/all`);
//   return res.json();
// }

// export async function createFolder(name: string) {
//   const res = await fetch(`${API_BASE}/api/folders/create`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name }),
//   });
//   return res.json();
// }

// export async function deleteFolder(id: string) {
//   return fetch(`${API_BASE}/api/folders/${id}`, { method: "DELETE" });
// }

// // ✅ NEW: Folder ke andar presentations
// export async function fetchFolderPresentations(folderId: string) {
//   const res = await fetch(`${API_BASE}/api/folders/${folderId}/presentations`);
//   return res.json();
// }

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
