"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAllPresentations } from "@/services/slides.services";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { deletePresentation } from "@/services/slides.services";

interface PresentationItem {
  presentation_id: string;
  title: string;
  num_slides: number;
  edited_at: string;
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
    <main className="min-h-screen bg-[#0C0C12] text-white p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>

          <Button
            className="bg-[#4F46E5] hover:bg-[#4338CA] px-6 py-2 text-sm rounded-xl shadow-lg shadow-indigo-500/20"
            onClick={() => router.push("/generate")}
          >
            <Plus className="mr-2 h-4 w-4" /> New Presentation
          </Button>
        </div>

        {/* SUBTITLE */}
        <p className="text-gray-400 mb-10">
          Manage your presentations and create new ones effortlessly.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* CREATE NEW CARD */}
          <Card
            onClick={() => router.push("/generate")}
            className="
              h-56 rounded-2xl bg-gradient-to-br from-[#1A1A27] to-[#14141F] 
              border border-gray-700/50 flex flex-col justify-center items-center 
              cursor-pointer hover:scale-[1.02] hover:border-indigo-400 transition-all 
              backdrop-blur-sm shadow-xl
            "
          >
            <div className="h-14 w-14 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-3">
              <Plus className="h-7 w-7 text-indigo-300" />
            </div>
            <p className="text-lg text-white font-semibold">Create New Presentation</p>
            <p className="text-gray-400 text-sm">From topic or upload document</p>
          </Card>

          {/* DYNAMIC PRESENTATIONS */}

          {loading && (
            <p className="text-gray-400 text-sm col-span-full">Loading...</p>
          )}

          {presentations.length === 0 && !loading && (
            <p className="text-gray-400 text-sm col-span-full">
              No presentations found. Create your first one!
            </p>
          )}

          {!loading &&
            presentations.map((p: any) => (
              <Card
                key={p.presentation_id}
                className="
                  h-56 p-6 rounded-2xl bg-[#11111a]/80 border border-gray-700/40 
                  hover:bg-[#181824] backdrop-blur-sm hover:scale-[1.02] 
                  transition-all cursor-pointer shadow-lg relative text-white
                "
                onClick={() => router.push(`/slides/${p.presentation_id}`)}
              >
               <div className="flex justify-between mb-4">
  <span className="bg-indigo-600/20 px-4 py-1 rounded-full text-xs border border-indigo-600/40 text-indigo-300">
    {p.num_slides} slides
  </span>

  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <MoreVertical className="text-gray-400 cursor-pointer" size={18} />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="bg-[#1A1A27] text-white">
      <DropdownMenuItem
        className="cursor-pointer hover:bg-red-600/40"
        onClick={async (e) => {
          e.stopPropagation();
          if (confirm("Delete this presentation?")) {
            await deletePresentation(p.presentation_id);

            setPresentations(prev =>
              prev.filter(item => item.presentation_id !== p.presentation_id)
            );
          }
        }}
      >
        Delete Presentation
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>


                <h2 className="text-xl font-semibold leading-tight">
                  {p.title}
                </h2>

                <p className="text-gray-400 text-xs absolute bottom-6">
                  Edited {new Date(Number(p.edited_at)).toLocaleString()}
                </p>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
