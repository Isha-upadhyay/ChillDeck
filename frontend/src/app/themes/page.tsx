import { themes } from "@/data/themes";
import { ThemeCard } from "@/components/themes/ThemeCard";

export default function ThemesPage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Themes</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {themes.map(t => (
          <ThemeCard key={t.id} theme={t} />
        ))}
      </div>
    </main>
  );
}
