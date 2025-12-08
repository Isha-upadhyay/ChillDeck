"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAllPresentations, deletePresentation } from "@/services/slides.services";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PresentationItem {
  presentation_id: string;
  title: string;
  num_slides: number;
  edited_at: string;
  thumbnail?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<PresentationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAllPresentations();
        setPresentations(data);
      } catch (err) {
        console.error("Failed to load presentations:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0B10] text-white px-10 py-12">
      <div className="max-w-7xl mx-auto">

        {/* 🌟 HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight 
              bg-gradient-to-r from-indigo-400 to-pink-400 
              bg-clip-text text-transparent">
              Your Presentations
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Smart AI-crafted decks — beautifully organized.
            </p>
          </div>

          <Button
            onClick={() => router.push("/generate")}
            className="rounded-xl px-5 py-2.5 bg-gradient-to-r 
                from-indigo-500 to-purple-500 hover:opacity-90
                shadow-lg shadow-indigo-600/20 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Create New
          </Button>
        </div>

        {/* 🌟 SUBTEXT */}
        <p className="text-gray-400 mb-8">All your generated presentations at one place.</p>

        {/* 🌟 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* CREATE NEW CARD */}
          <Card
            onClick={() => router.push("/generate")}
            className="
              h-64 rounded-2xl bg-gradient-to-br from-[#1A1A25] to-[#111118]
              border border-gray-700/40 flex flex-col items-center justify-center
              cursor-pointer hover:scale-[1.03] hover:border-indigo-500/50 
              transition-all group shadow-xl
            "
          >
            <div className="h-16 w-16 rounded-full flex items-center justify-center 
                bg-indigo-600/20 border border-indigo-500/40 
                mb-3 group-hover:scale-110 transition">
              <Plus className="h-8 w-8 text-indigo-300" />
            </div>

            <p className="text-lg font-semibold">Create New</p>
            <p className="text-gray-400 text-sm">Topic • Document • AI templates</p>
          </Card>

          {/* PRESENTATION CARDS */}
          {loading && (
            <p className="text-gray-400 col-span-full">Loading...</p>
          )}

          {!loading && presentations.length === 0 && (
            <p className="text-gray-400 col-span-full">No presentations yet.</p>
          )}

          {!loading &&
            presentations.map((p) => (
              <Card
                key={p.presentation_id}
                onClick={() => router.push(`/slides/${p.presentation_id}`)}
                className="
                  h-64 rounded-2xl bg-[#11111A]/80 border border-gray-700/40 
                  backdrop-blur-xl cursor-pointer overflow-hidden
                  hover:scale-[1.03] 
                  hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]
                  transition-all relative
                "
              >

                {/* THUMBNAIL */}
                <div className="h-32 w-full bg-gradient-to-br from-indigo-300/20 to-purple-300/20
                    flex items-center justify-center overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-indigo-300">
                      {p.title?.charAt(0).toUpperCase() || "P"}
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4">

                  <div className="flex justify-between mb-2">
                    {/* SLIDE COUNT */}
                    <span className="px-3 py-1 rounded-full text-xs bg-indigo-600/20 
                        border border-indigo-500/40 text-indigo-300">
                      {p.num_slides} slides
                    </span>

                    {/* MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical
                          className="text-gray-400 hover:text-white"
                          size={18}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1A1A27] border border-gray-700 text-white"
                      >
                        <DropdownMenuItem
                          className="hover:bg-red-600/40 cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();

                            if (confirm("Delete this presentation?")) {
                              await deletePresentation(p.presentation_id);
                              setPresentations(prev =>
                                prev.filter((x) => x.presentation_id !== p.presentation_id)
                              );
                            }
                          }}
                        >
                          Delete Presentation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* TITLE */}
                  <h2 className="text-lg font-semibold line-clamp-2">{p.title}</h2>

                  {/* DATE */}
                  <p className="text-gray-500 text-xs mt-1">
                    Edited {new Date(Number(p.edited_at)).toLocaleString()}
                  </p>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
