export function ThemeCard({ theme }: any) {
  return (
    <div className="
      rounded-2xl p-4 border
      bg-white dark:bg-[#11111a]
      border-gray-200 dark:border-gray-700
      hover:scale-[1.03] transition cursor-pointer
    ">
      <div className={`h-28 rounded-xl mb-3 ${theme.preview}`} />
      <h3 className="font-medium text-sm">{theme.name}</h3>
    </div>
  );
}
