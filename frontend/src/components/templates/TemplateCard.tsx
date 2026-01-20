import type { Template } from "@/types/template";
interface Props {
  template: Template;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="
        rounded-2xl p-5 border cursor-pointer
        bg-white dark:bg-[#11111a]
        border-gray-200 dark:border-gray-700
        hover:scale-[1.02] transition
      "
    >
      <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-200 to-indigo-400 mb-4" />

      <h3 className="font-semibold text-lg">{template.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {template.description}
      </p>
    </div>
  );
}
