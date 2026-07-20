import { Star, Heart, Plus } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { ArohamProduct } from "@/types/product";

export interface ProductCardProps {
  product: ArohamProduct;
  onProductClick: (p: ArohamProduct) => void;
  onAddToCart?: (p: ArohamProduct) => void;
  wishKey?: string;
  wished?: boolean;
  onToggleWish?: (key: string, e: React.MouseEvent) => void;
}

export function ProductCard({ product: p, onProductClick, onAddToCart, wishKey = "", wished = false, onToggleWish }: ProductCardProps) {
  return (
    <div onClick={() => onProductClick(p)}
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer"
      style={{ background: "#FFFFFF", boxShadow: "0 2px 20px rgba(91,31,36,0.06)", border: "1px solid rgba(91,31,36,0.06)" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(91,31,36,0.14)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 20px rgba(91,31,36,0.06)"}>
      <div className="relative overflow-hidden aspect-square bg-amber-50">
        <img src={p.img} alt={`${p.name} - ${p.subtitle}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(91,31,36,0.85)", color: GOLD }}>{p.badges[0]}</div>
        {onToggleWish && (
          <button aria-label="Add to wishlist" onClick={e => onToggleWish(wishKey, e)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: "rgba(255,255,255,0.92)" }}>
            <Heart size={12} style={{ color: wished ? "#E74C3C" : "#9A8A78", fill: wished ? "#E74C3C" : "none" }} />
          </button>
        )}
        {p.original > p.price && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "#E74C3C", color: "#fff" }}>
            -{Math.round((1 - p.price / p.original) * 100)}%
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold leading-tight mb-0.5 line-clamp-2" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p>
        <p className="text-[10px] mb-1.5" style={{ color: "#7A6A58" }}>{p.subtitle}</p>
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={9} fill={j < Math.round(p.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}
          <span className="text-[9px] ml-1" style={{ color: "#9A8A78" }}>({p.reviews})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{p.price.toLocaleString("en-IN")}</span>
            <span className="text-[10px] line-through" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>₹{p.original.toLocaleString("en-IN")}</span>
          </div>
          {onAddToCart && (
            <button aria-label={`Add ${p.name} to cart`}
              onClick={e => { e.stopPropagation(); onAddToCart(p); }}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: MAROON, border: "none", cursor: "pointer" }}>
              <Plus size={12} color={IVORY} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
