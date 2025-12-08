"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  Image,
  Globe,
  Folder,
  Plus,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  Trash2,
  FileText,
  Palette,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchFolders, createFolder } from "@/lib/api";

interface FolderItem {
  id: string;
  name: string;
  created_at: number;
}

export default function SidebarPro() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [showFolders, setShowFolders] = useState(true);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await fetchFolders();
      setFolders(data);
    };
    load();
  }, []);

  return (
    <aside
      className={`
        h-screen bg-white border-r transition-all duration-300 shadow-sm
        flex flex-col
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div>
            <p className="font-semibold text-sm">Isha&apos;s Workspace</p>
            <p className="text-[10px] text-gray-500">FREE</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* SEARCH BAR */}
      {!collapsed && (
        <div className="px-4 py-3">
          <input
            placeholder="Jump to…"
            className="w-full bg-gray-100 px-3 py-2 text-xs rounded-lg"
          />
        </div>
      )}

      {/* MAIN NAVIGATION */}
      <nav className="flex-1 px-2 space-y-1 mt-2">
        <NavItem
          icon={<LayoutGrid size={18} />}
          text="Decks"
          collapsed={collapsed}
          active
          href="/"
        />
        <NavItem
          icon={<Users size={18} />}
          text="Shared with you"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Globe size={18} />}
          text="Sites"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Image size={18} />}
          text="AI Images"
          collapsed={collapsed}
          href="/images"
        />

        {/* FOLDERS */}
        <div className="mt-4">
          {!collapsed && (
            <button
              className="flex items-center justify-between w-full text-[10px] text-gray-500 px-2 mb-1"
              onClick={() => setShowFolders(!showFolders)}
            >
              FOLDERS
              {showFolders ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
          )}

          {showFolders && (
            <div className="space-y-1">
              {folders.map((f) => (
                <NavItem
                  key={f.id}
                  icon={<Folder size={16} />}
                  text={f.name}
                  collapsed={collapsed}
                  onClick={() => router.push(`/folders/${f.id}`)}
                />
              ))}

              {/* Create Folder */}
              <NavItem
                icon={<Plus size={16} />}
                text="Create folder"
                collapsed={collapsed}
                altStyle
                onClick={() => setShowCreate(true)}
              />
            </div>
          )}
        </div>

        {/* SETTINGS GROUP */}
        <div className="mt-6 border-t pt-4">
          <NavItem
            icon={<FileText size={16} />}
            text="Templates"
            collapsed={collapsed}
          />
          <NavItem
            icon={<Palette size={16} />}
            text="Themes"
            collapsed={collapsed}
          />
          <NavItem
            icon={<Trash2 size={16} />}
            text="Trash"
            collapsed={collapsed}
          />
          <NavItem
            icon={<Settings size={16} />}
            text="Settings"
            collapsed={collapsed}
          />
          <NavItem
            icon={<HelpCircle size={16} />}
            text="Support"
            collapsed={collapsed}
          />
        </div>
      </nav>

      {/* USER AVATAR */}
      <div className="border-t p-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">
          I
        </div>

        {!collapsed && (
          <div>
            <p className="text-sm font-medium">Isha</p>
            <p className="text-xs text-gray-500">isha@example.com</p>
          </div>
        )}
      </div>

      {/* CREATE FOLDER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white text-black p-6 rounded-xl w-80 space-y-4">
            <h2 className="text-lg font-semibold">Create Folder</h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <button
                className="text-gray-600"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>

             <button
  className="bg-indigo-600 text-white px-4 py-2 rounded"
  onClick={async () => {
    if (!folderName.trim()) return;

    const newFolder = await createFolder(folderName.trim());

    // Update sidebar immediately
    setFolders((prev) => [...prev, newFolder]);

    // Close modal
    setFolderName("");
    setShowCreate(false);

    // ⭐ Redirect inside the folder immediately
    router.push(`/folders/${newFolder.id}`);
  }}
>
  Create
</button>

            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* Reusable NAV item */
function NavItem({
  icon,
  text,
  collapsed,
  active,
  altStyle,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
  active?: boolean;
  altStyle?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        onClick?.();
        if (href) router.push(href);
      }}
      className={`
        w-full flex items-center gap-3 p-2 rounded-lg text-sm transition
        ${active ? "bg-indigo-50 text-indigo-600 font-medium" : ""}
        ${altStyle ? "text-indigo-500 hover:bg-indigo-50" : "hover:bg-gray-100"}
      `}
    >
      {icon}
      {!collapsed && <span>{text}</span>}
    </button>
  );
}
