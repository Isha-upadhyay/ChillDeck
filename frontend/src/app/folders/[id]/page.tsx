// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { fetchFolderPresentations } from "@/lib/api";
// import { fetchPresentationById } from "@/services/slides.services";

// interface PresentationItem {
//   presentation_id: string;
//   title: string;
//   num_slides: number;
//   edited_at: string;
//   thumbnail?: string | null;
// }

// export default function FolderDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const folderId = params?.id as string;

//   const [presentations, setPresentations] = useState<PresentationItem[]>([]);
//   const [folderName, setFolderName] = useState("");

//   useEffect(() => {
//     async function load() {
//       const data = await fetchFolderPresentations(folderId);

//       setFolderName(data.folder.name);

//       const presList: PresentationItem[] = [];

//       for (const presId of data.presentations) {
//         const pres = await fetchPresentationById(presId);

//         presList.push({
//           presentation_id: pres.presentation_id,
//           title: pres.title || "Untitled",
//           num_slides: pres.slides.length,
//           edited_at: Date.now().toString(),
//           thumbnail: null, // optional
//         });
//       }

//       setPresentations(presList);
//     }

//     load();
//   }, [folderId]);

//   return (
//     <main className="p-10">
//       <h1 className="text-3xl font-bold mb-6">{folderName}</h1>

//       {presentations.map((p) => (
//         <div
//           key={p.presentation_id}
//           className="p-3 border mb-3 rounded hover:bg-gray-50 cursor-pointer"
//           onClick={() => router.push(`/slides/${p.presentation_id}`)}
//         >
//           <h2 className="font-semibold">{p.title}</h2>
//           <p className="text-sm text-gray-500">{p.num_slides} slides</p>
//         </div>
//       ))}
//     </main>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { fetchFolderPresentations } from "@/lib/api";
// import { fetchPresentationById } from "@/services/slides.services";

// interface PresentationItem {
//   presentation_id: string;
//   title: string;
//   num_slides: number;
//   edited_at: string;
//   thumbnail?: string | null;
// }

// export default function FolderDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const folderId = params?.id as string;

//   const [presentations, setPresentations] = useState<PresentationItem[]>([]);
//   const [folderName, setFolderName] = useState("");

//   useEffect(() => {
//     async function load() {
//       const data = await fetchFolderPresentations(folderId);

//       setFolderName(data.folder.name);

//       const presList: PresentationItem[] = [];

//       for (const presId of data.presentations) {
//         const pres = await fetchPresentationById(presId);

//         presList.push({
//           presentation_id: pres.presentation_id,
//           title: pres.title || "Untitled",
//           num_slides: pres.slides.length,
//           edited_at: Date.now().toString(),
//           thumbnail: null, // optional
//         });
//       }

//       setPresentations(presList);
//     }

//     load();
//   }, [folderId]);

//   return (
//     <main className="p-10">
//       <h1 className="text-3xl font-bold mb-6">{folderName}</h1>

//       {presentations.map((p) => (
//         <div
//           key={p.presentation_id}
//           className="p-3 border mb-3 rounded hover:bg-gray-50 cursor-pointer"
//           onClick={() => router.push(`/slides/${p.presentation_id}`)}
//         >
//           <h2 className="font-semibold">{p.title}</h2>
//           <p className="text-sm text-gray-500">{p.num_slides} slides</p>
//         </div>
//       ))}
//     </main>
//   );
// }



// frontend/src/app/folders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchFolderPresentations, fetchFolders, assignPresentationToFolder } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
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
  slides?: any[];
  num_slides?: number;
  edited_at?: number | string;
  thumbnail?: string | null;
}

interface FolderItem {
  id: string;
  name: string;
}

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params?.id as string;

  const [presentations, setPresentations] = useState<PresentationItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // ---- 1) Load folder presentations ----
      const data = await fetchFolderPresentations(folderId);

      // backend returns array → use directly
      setPresentations(
        data.map((p: any) => ({
          presentation_id: p.presentation_id,
          title: p.title || "Untitled",
          num_slides: p.slides?.length || 0,
          edited_at: p.edited_at || Date.now(),
          thumbnail: p.thumbnail || null,
        }))
      );

      // ---- 2) Load all folders for dropdown ----
      const folderList = await fetchFolders();
      setFolders(folderList);

      // ---- 3) Set folder name ----
      const match = folderList.find((f: any) => f.id === folderId);
      setFolderName(match?.name || "Folder");

      setLoading(false);
    }

    load();
  }, [folderId]);

  return (
    <main className="min-h-screen bg-[#0B0B10] text-white px-10 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/workspace")}
          className="text-xs text-gray-400 hover:underline mb-6"
        >
          ← Back to workspace
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold">
            Folder: <span className="text-indigo-400">{folderName}</span>
          </h1>

          <Button
            onClick={() => router.push(`/generate?folder=${folderId}`)}
            className="rounded-xl px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" /> Create New
          </Button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {loading && <p className="text-gray-500">Loading…</p>}

          {!loading && presentations.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">This folder is empty.</p>
          )}

          {!loading &&
            presentations.map((p) => (
              <Card
                key={p.presentation_id}
                onClick={() => router.push(`/slides/${p.presentation_id}?folder=${folderId}`)}
                className="h-64 bg-[#11111A]/80 border border-gray-700/40 rounded-2xl cursor-pointer hover:scale-[1.03] transition shadow-lg relative"
              >
                {/* Thumbnail */}
                <div className="h-32 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-300/20 to-purple-300/20">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-indigo-300">
                      {p.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-indigo-600/20 border border-indigo-500/40 text-indigo-300">
                      {p.num_slides} slides
                    </span>

                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical className="text-gray-400 cursor-pointer" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1A1A27] border border-gray-700 text-white"
                      >
                        <p className="px-2 pt-2 pb-1 text-[11px] text-gray-400">Move to folder</p>

                        {folders.map((f) => (
                          <DropdownMenuItem
                            key={f.id}
                            className="text-xs hover:bg-indigo-600/40"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await assignPresentationToFolder(f.id, p.presentation_id);
                              alert(`Moved to ${f.name}`);
                            }}
                          >
                            {f.name}
                          </DropdownMenuItem>
                          
                        ))}

                         <DropdownMenuItem
                            className="hover:bg-red-600/40 cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                        
                              if (confirm("Delete this presentation?")) {
                                await deletePresentation(p.presentation_id);
                                setPresentations((prev) =>
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

                  <h2 className="text-lg font-semibold line-clamp-2">{p.title}</h2>
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
