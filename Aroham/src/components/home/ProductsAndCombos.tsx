import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { MAROON, SAFFRON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";

import { ArohamProduct } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductsAndCombos({ products, onProductClick, onAddCombo: _onAddCombo, onAddToCart }: {
  products: ArohamProduct[];
  onProductClick: (p: ArohamProduct) => void;
  onAddCombo: (name: string) => void;
  onAddToCart: (p: ArohamProduct) => void;
}) {
  const [wish, setWish] = useState<Record<string, boolean>>({});
  const toggleWish = (key: string, e: React.MouseEvent) => { e.stopPropagation(); setWish(w => ({ ...w, [key]: !w[key] })); };

  if (!products || products.length === 0) return null;

  const shelves: [string, string, string, ArohamProduct[], string][] = [
    ["Bestselling Products", "Top Picks",     "🔥 Trending", products.slice(0, 6),                                                       SAFFRON],
    ["Fav Items",            "Fan Favourites", "❤️ Loved",   [...products].reverse().slice(0, 6),                                         "#E74C3C"],
    ["Combo Deals",          "Bundle & Save",  "🎁 Kits",    products.slice(0, 4).concat(products.slice(4)),                       GOLD],
    ["Mega Sale",            "Limited Time",   "⚡ Hot",      [...products].sort((a, b) => b.original - b.price - (a.original - a.price)).slice(0, 6), SAFFRON],
    ["Discount Zone",        "Best Savings",   "🏷️ Off",     products.slice(0, 6).sort(() => 0.5 - Math.random()),                       "#4A8A4A"],
  ];

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#FAF7F2" }}>
      <div className="max-w-7xl mx-auto space-y-16">
        {shelves.map(([title, eyebrow, badge, products, eyebrowColor], si) => (
          <div key={title}>
            {si > 0 && <div className="h-px mb-16" style={{ background: "linear-gradient(90deg,transparent,rgba(91,31,36,0.1),transparent)" }} />}
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs tracking-[0.18em] uppercase font-medium" style={{ color: eyebrowColor, fontFamily: SANS }}>{eyebrow}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${eyebrowColor}18`, color: eyebrowColor }}>{badge}</span>
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem,3.5vw,2.5rem)", fontWeight: 500, color: MAROON, lineHeight: 1.15 }}>{title}</h2>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-60" style={{ color: MAROON }}>
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((p, pi) => (
                <ProductCard key={`${si}-${pi}`} product={p} wishKey={`${si}-${p.id}`}
                  wished={!!wish[`${si}-${p.id}`]} onToggleWish={toggleWish}
                  onProductClick={onProductClick} onAddToCart={onAddToCart} />
              ))}
            </div>
            <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-6 px-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {products.map((p, pi) => (
                <div key={`${si}-${pi}-m`} style={{ minWidth: "52vw", maxWidth: "52vw", flexShrink: 0 }}>
                  <ProductCard product={p} wishKey={`${si}-m-${p.id}`}
                    wished={!!wish[`${si}-m-${p.id}`]} onToggleWish={toggleWish}
                    onProductClick={onProductClick} onAddToCart={onAddToCart} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
