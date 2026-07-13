import { useState } from "react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Star, Heart, Eye, Filter, X, CheckCircle, ChevronRight } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { CATEGORIES, PURPOSES, PRICE_RANGES } from "@/constants/data";
import { api } from "@/lib/api";
import { ArohamProduct } from "@/types/product";

export function ShopPage() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<string[]>([]);
  const [prps, setPrps] = useState<string[]>([]);
  const [priceIdx, setPriceIdx] = useState<number | null>(null);
  const [sort, setSort] = useState("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wish, setWish] = useState<Record<number, boolean>>({});

  const [products, setProducts] = useState<ArohamProduct[]>([]);

  useEffect(() => {
    api("/products")
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products", err));
  }, []);

  const filtered = products.filter(p => {
    if (cats.length && !cats.includes(p.category)) return false;
    if (prps.length && !prps.includes(p.purpose)) return false;
    if (priceIdx !== null) { const r = PRICE_RANGES[priceIdx]; if (p.price < r.min || p.price > r.max) return false; }
    return true;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const toggleCat = (c: string) => setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const togglePrp = (p: string) => setPrps(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const clearAll = () => { setCats([]); setPrps([]); setPriceIdx(null); };

  const FilterPanel = () => (
    <div className="space-y-7">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MAROON }}>Category</h3>
        <div className="space-y-2.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => toggleCat(c)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{ border: `2px solid ${cats.includes(c) ? MAROON : "rgba(91,31,36,0.2)"}`, background: cats.includes(c) ? MAROON : "transparent" }}>
                {cats.includes(c) && <CheckCircle size={10} color="white" strokeWidth={3} />}
              </div>
              <span className="text-sm" style={{ color: cats.includes(c) ? MAROON : "#5A4A3A" }}>{c}</span>
              <span className="ml-auto text-[10px]" style={{ color: "#9A8A78" }}>{products.filter(p => p.category === c).length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px" style={{ background: "rgba(91,31,36,0.08)" }} />
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MAROON }}>Purpose</h3>
        <div className="space-y-2.5">
          {PURPOSES.map(p => (
            <button key={p} onClick={() => togglePrp(p)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{ border: `2px solid ${prps.includes(p) ? MAROON : "rgba(91,31,36,0.2)"}`, background: prps.includes(p) ? MAROON : "transparent" }}>
                {prps.includes(p) && <CheckCircle size={10} color="white" strokeWidth={3} />}
              </div>
              <span className="text-sm" style={{ color: prps.includes(p) ? MAROON : "#5A4A3A" }}>{p}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px" style={{ background: "rgba(91,31,36,0.08)" }} />
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MAROON }}>Price</h3>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((r, i) => (
            <button key={r.label} onClick={() => setPriceIdx(priceIdx === i ? null : i)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                style={{ border: `2px solid ${priceIdx === i ? GOLD : "rgba(91,31,36,0.2)"}`, background: priceIdx === i ? GOLD : "transparent" }}>
                {priceIdx === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm" style={{ color: priceIdx === i ? MAROON : "#5A4A3A" }}>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      {(cats.length || prps.length || priceIdx !== null) && (
        <button onClick={clearAll} className="w-full py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50"
          style={{ borderColor: "rgba(200,0,0,0.2)", color: "#C04040" }}>Clear All Filters</button>
      )}
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <div className="pt-24 pb-8 px-6 lg:px-10" style={{ background: `linear-gradient(135deg,#F5EDE0,#FAF7F2)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#9A8A78" }}>
            <button onClick={() => navigate("/")} className="hover:underline" style={{ color: MAROON }}>Home</button>
            <ChevronRight size={12} /><span>Shop</span>
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>Sacred Products</h1>
          <p className="text-sm mt-1" style={{ color: "#7A6A58" }}>Temple-energized, handcrafted, expert-recommended</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {(cats.length || prps.length || priceIdx !== null) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map(c => <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{c}<button onClick={() => toggleCat(c)} className="ml-1"><X size={10} /></button></span>)}
            {prps.map(p => <span key={p} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{p}<button onClick={() => togglePrp(p)} className="ml-1"><X size={10} /></button></span>)}
            {priceIdx !== null && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{PRICE_RANGES[priceIdx].label}<button onClick={() => setPriceIdx(null)} className="ml-1"><X size={10} /></button></span>}
          </div>
        )}
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
              <FilterPanel />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "#7A6A58" }}>Showing <strong style={{ color: MAROON }}>{filtered.length}</strong> products</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "rgba(91,31,36,0.15)", color: MAROON }}><Filter size={14} /> Filter</button>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm outline-none appearance-none"
                  style={{ border: `1px solid rgba(91,31,36,0.15)`, background: "#FFFFFF", color: MAROON, fontFamily: SANS }}>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2" style={{ fontFamily: SERIF, color: MAROON }}>No products match your filters</p>
                <button onClick={clearAll} className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium" style={{ background: MAROON, color: IVORY }}>Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filtered.map(p => (
                  <div key={p.id} onClick={() => navigate(`/shop/${p.slug}`)}
                    className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
                    style={{ background: "#FFFFFF", boxShadow: "0 2px 20px rgba(91,31,36,0.06)", border: "1px solid rgba(91,31,36,0.06)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(91,31,36,0.14)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 20px rgba(91,31,36,0.06)"}>
                    <div className="relative overflow-hidden aspect-square bg-amber-50">
                      <img src={p.img} alt={`${p.name} - ${p.subtitle}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {p.badges.map(b => <span key={b} className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}>{b}</span>)}
                      </div>
                      <button aria-label="Add to wishlist" onClick={e => { e.stopPropagation(); setWish(w => ({ ...w, [p.id]: !w[p.id] })); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
                        <Heart size={13} style={{ color: wish[p.id] ? "#E74C3C" : "#7A6A58", fill: wish[p.id] ? "#E74C3C" : "none" }} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                        style={{ background: "rgba(91,31,36,0.9)" }}>
                        <span className="text-xs font-semibold flex items-center gap-2" style={{ color: GOLD }}><Eye size={12} /> View Product</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-0.5 leading-snug" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</h3>
                      <p className="text-xs mb-2" style={{ color: "#7A6A58" }}>{p.subtitle}</p>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={10} fill={j < Math.round(p.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}
                        <span className="text-[10px] ml-1" style={{ color: "#9A8A78" }}>({p.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs line-through" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>₹{p.original.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#4A8A4A" }}>{Math.round((1 - p.price / p.original) * 100)}% off</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white h-full overflow-y-auto p-6 shadow-2xl ml-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Filters</h3>
              <button onClick={() => setSidebarOpen(false)}><X size={20} style={{ color: MAROON }} /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setSidebarOpen(false)} className="w-full mt-6 py-3 rounded-2xl text-sm font-semibold" style={{ background: MAROON, color: IVORY }}>
              Apply Filters ({filtered.length} products)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
