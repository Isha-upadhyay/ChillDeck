"use client";

import type { Template } from "@/types/template";
import { TemplateCard } from "./TemplateCard";

interface Props {
  templates: Template[];
  onSelect: (template: Template) => void;
}

export function TemplateGrid({ templates, onSelect }: Props) {
  if (templates.length === 0) {
    return <p className="text-gray-500">No templates found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onClick={() => onSelect(t)}
        />
      ))}
    </div>
  );
}
