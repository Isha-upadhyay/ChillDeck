"use client";

import { ReactNode } from "react";
import SidebarPro from "@/components/sidebar/SidebarPro";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <SidebarPro />
      <main className="flex-1 h-screen overflow-y-auto bg-[#F6F7FB]">
        {children}
      </main>
    </div>
  );
}
