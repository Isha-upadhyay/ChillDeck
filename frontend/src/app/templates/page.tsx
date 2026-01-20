// import { TemplateGrid } from "@/components/templates/TemplateGrid";

// export default function TemplatesPage() {
//   return (
//     <main className="p-10">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold mb-2">Templates</h1>
//         <p className="text-gray-500 mb-8">
//           Choose a professionally designed template to get started faster.
//         </p>

//         <TemplateGrid />
//       </div>
//     </main>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { TemplatesService } from "@/services/template.services";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import type { Template } from "@/types/template";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModel";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TemplatesService.list()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-10 text-gray-500">Loading templates…</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Templates</h1>

      <TemplateGrid
        templates={templates}
        onSelect={setSelected}
      />

      <TemplatePreviewModal
        open={!!selected}
        template={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
