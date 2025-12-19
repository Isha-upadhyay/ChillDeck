import { templates } from "@/data/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";

export default function TemplatesPage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Templates</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </main>
  );
}
