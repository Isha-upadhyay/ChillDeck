// frontend/src/app/page.tsx
"use client";
import { useState } from "react";
import { generateOutline } from "@/lib/api";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!topic.trim()) return setError("Please enter a topic");
    setLoading(true);
    try {
      const res = await generateOutline(topic);
      setOutline(res);
    } catch (err: any) {
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">AI Slide Generator — Demo</h1>
        <form onSubmit={handleGenerate} className="mb-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type a topic e.g. Impact of AI on Education"
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? "Generating..." : "Generate Outline"}
            </button>
            <button type="button" onClick={()=>{setTopic("Impact of AI on Education")}} className="px-4 py-2 border rounded">Sample</button>
          </div>
        </form>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        {outline && (
          <div>
            <h2 className="text-lg font-semibold">Result (source: {outline.source})</h2>
            <div className="mt-3 space-y-4">
              {Array.isArray(outline.outline) ? (
                outline.outline.map((s: any, i: number) => (
                  <div key={i} className="p-3 border rounded">
                    <div className="font-bold">{s.title}</div>
                    <ul className="list-disc ml-6">
                      {s.points?.map((p:string, idx:number) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                ))
              ) : (
                <pre className="whitespace-pre-wrap">{outline.text || JSON.stringify(outline,null,2)}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
