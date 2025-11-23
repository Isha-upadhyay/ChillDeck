// frontend/src/lib/api.ts
// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function generateOutline(topic: string) {
  const resp = await axios.post(`${API_BASE}/api/slides/generate`, {
    topic,
    detail: "medium",
    theme: "corporate",
  });

  return resp.data;
}

