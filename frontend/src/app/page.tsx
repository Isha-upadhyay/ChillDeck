"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const presentations = [
    {
      id: "1",
      title: "Q4 Marketing Strategy",
      slides: 12,
      theme: "Corporate",
      updated: "Edited 2 mins ago",
    },
    {
      id: "2",
      title: "AI in Healthcare",
      slides: 8,
      theme: "Modern Dark",
      updated: "Edited 2 days ago",
    },
    {
      id: "3",
      title: "Project Nebula Overview",
      slides: 15,
      theme: "Tech",
      updated: "Edited 1 week ago",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0C0C12] text-white p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Dashboard
          </h1>

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
              h-56 
              rounded-2xl
              bg-gradient-to-br from-[#1A1A27] to-[#14141F] 
              border border-gray-700/50 
              flex flex-col justify-center items-center cursor-pointer 
              hover:scale-[1.02] hover:border-indigo-400 transition-all 
              backdrop-blur-sm shadow-xl
            "
          >
            <div className="h-14 w-14 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-3">
              <Plus className="h-7 w-7 text-indigo-300" />
            </div>
            <p className="text-lg font-semibold">Create New Presentation</p>
            <p className="text-gray-400 text-sm">From topic or upload document</p>
          </Card>

          {/* SAVED PRESENTATIONS */}
          {presentations.map((p) => (
            <Card
              key={p.id}
              className="
                h-56 p-6 rounded-2xl 
                bg-[#11111a]/80 border border-gray-700/40 
                hover:bg-[#181824] backdrop-blur-sm 
                hover:scale-[1.02] transition-all cursor-pointer shadow-lg
              "
              onClick={() => router.push(`/presentation/${p.id}`)}
            >
              <div className="flex justify-between mb-4">
                <span className="bg-indigo-600/20 px-4 py-1 rounded-full text-xs border border-indigo-600/40 text-indigo-300">
                  {p.slides} slides
                </span>
                <MoreVertical className="text-gray-400" size={18} />
              </div>

              <h2 className="text-xl font-semibold leading-tight">{p.title}</h2>
              <p className="text-gray-400 mt-1 text-sm">{p.theme}</p>

              <p className="text-gray-500 text-xs absolute bottom-6">
                {p.updated}
              </p>
            </Card>
          ))}

        </div>
      </div>
    </main>
  );
}
