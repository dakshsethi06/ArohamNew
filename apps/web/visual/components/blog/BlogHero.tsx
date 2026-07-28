import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BlogHeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function BlogHero({ searchQuery, setSearchQuery }: BlogHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      {/* Top Search Bar */}
      <div className="relative w-full mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("blog.search_placeholder", "Let's find what you're looking for...")}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-sm shadow-xs outline-none focus:border-[#C8A044] transition-all"
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      </div>
    </div>
  );
}
