export function TemplateCard({ template }: any) {
  return (
    <div className="
      rounded-2xl p-5 border
      bg-white dark:bg-[#11111a]
      border-gray-200 dark:border-gray-700
      hover:scale-[1.02] transition cursor-pointer
    ">
      <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-200 to-indigo-400 mb-4" />

      <h3 className="font-semibold text-lg">{template.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {template.description}
      </p>

      <span className="text-xs text-indigo-500 mt-2 inline-block">
        {template.slides} slides
      </span>
    </div>
  );
}
