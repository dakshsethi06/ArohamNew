import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { 
  Star, Heart, Eye, Filter, X, CheckRight, ChevronRight, ChevronDown, 
  ShoppingCart, LayoutGrid, List, Sparkles, Check, Plus, Minus, RotateCcw
} from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import * as Select from "@radix-ui/react-select";
import { CATEGORIES, PURPOSES } from "@/constants/data";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function ShopPage() {
  const navigate = useNavigate();
  const { items, addToCart, updateQty, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const titleParam = searchParams.get("title") || searchParams.get("collection") || "";
  const catParam = searchParams.get("category") || "";
  const prpParam = searchParams.get("purpose") || "";
  
  const [cats, setCats] = useState<string[]>(() => {
    if (catParam) return [catParam];
    if (CATEGORIES.includes(titleParam)) return [titleParam];
    return [];
  });
  const [prps, setPrps] = useState<string[]>(() => {
    if (prpParam) return [prpParam];
    if (PURPOSES.includes(titleParam)) return [titleParam];
    return [];
  });
  const [cols, setCols] = useState<string[]>(() => {
    if (titleParam && !CATEGORIES.includes(titleParam) && !PURPOSES.includes(titleParam)) return [titleParam];
    return [];
  });
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sort, setSort] = useState("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (catParam) setCats([catParam]);
    else if (CATEGORIES.includes(titleParam)) setCats([titleParam]);
    else setCats([]);

    if (prpParam) setPrps([prpParam]);
    else if (PURPOSES.includes(titleParam)) setPrps([titleParam]);
    else setPrps([]);

    if (titleParam && !CATEGORIES.includes(titleParam) && !PURPOSES.includes(titleParam)) setCols([titleParam]);
    else setCols([]);
  }, [titleParam, catParam, prpParam]);

  let displayTitle = "Sacred Products";
  if (cols.length === 1) displayTitle = cols[0];
  else if (cats.length === 1 && prps.length === 0) displayTitle = cats[0];
  else if (prps.length === 1 && cats.length === 0) displayTitle = prps[0];
  else if (cats.length > 1 || prps.length > 1 || cols.length > 1) displayTitle = "Filtered Products";
  else if (titleParam) displayTitle = titleParam;

  const isCustom = displayTitle !== "Sacred Products";

  const { products } = useProducts();

  const filtered = products.filter(p => {
    if (cats.length && p.category && !cats.includes(p.category)) return false;
    if (prps.length && p.purpose && !prps.includes(p.purpose)) return false;
    if (cols.length) {
      let matchesCol = false;
      const lowerCols = cols.map(c => c.toLowerCase());

      if (lowerCols.some(c => c.includes("discount") || c.includes("sale") || c.includes("off"))) {
        if (p.original && p.original > p.price) matchesCol = true;
      }
      if (lowerCols.some(c => c.includes("trending") || c.includes("bestsell") || c.includes("top pick"))) {
        if ((p.rating || 0) >= 4.7 || (p.badges && p.badges.some(b => b.toLowerCase().includes("bestseller") || b.toLowerCase().includes("trending")))) {
          matchesCol = true;
        }
      }
      if (lowerCols.some(c => c.includes("combo") || c.includes("kit") || c.includes("bundle"))) {
        if (
          p.name.toLowerCase().includes("kit") ||
          p.name.toLowerCase().includes("combo") ||
          p.name.toLowerCase().includes("bundle") ||
          (p.category && (p.category.toLowerCase().includes("kit") || p.category.toLowerCase().includes("combo")))
        ) {
          matchesCol = true;
        }
      }
      if (lowerCols.some(c => c.includes("fav"))) {
        if ((p.reviews || 0) >= 200 || (p.rating || 0) >= 4.8) matchesCol = true;
      }

      if (!matchesCol) {
        const isKnownFilter = lowerCols.some(c => 
          c.includes("discount") || c.includes("sale") || c.includes("trending") || 
          c.includes("bestsell") || c.includes("combo") || c.includes("kit") || c.includes("fav")
        );
        if (!isKnownFilter) matchesCol = true;
      }

      if (!matchesCol && lowerCols.some(c => c.includes("combo") || c.includes("kit"))) {
        matchesCol = true;
      }

      if (!matchesCol) return false;
    }
    if (maxPrice < 30000 && p.price > maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return (b.reviews || 0) - (a.reviews || 0);
  });

  const toggleCat = (c: string) => setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const togglePrp = (p: string) => setPrps(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleCol = (c: string) => setCols(prev => prev[0] === c ? [] : [c]);
  const clearAll = () => { setCats([]); setPrps([]); setCols([]); setMaxPrice(30000); };
  const hasActiveFilters = cats.length > 0 || prps.length > 0 || cols.length > 0 || maxPrice < 30000;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between" style={{ color: MAROON }}>
          <span>Category</span>
          {cats.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">{cats.length} selected</span>
          )}
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map(c => {
            const count = products.filter(p => p.category === c).length;
            const isSelected = cats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`flex items-center gap-3 w-full text-left px-2.5 py-2 rounded-xl transition-all ${
                  isSelected ? "bg-amber-900/5 font-semibold" : "hover:bg-amber-900/5"
                }`}
              >
                <div
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    border: `2px solid ${isSelected ? MAROON : "rgba(91,31,36,0.25)"}`,
                    background: isSelected ? MAROON : "transparent"
                  }}
                >
                  {isSelected && <Check size={11} color="white" strokeWidth={3.5} />}
                </div>
                <span className="text-xs sm:text-sm flex-1" style={{ color: isSelected ? MAROON : "#4A3E31" }}>{c}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/5" style={{ color: "#8A7A68" }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-amber-900/10" />

      {/* Purpose Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between" style={{ color: MAROON }}>
          <span>Purpose & Benefit</span>
          {prps.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">{prps.length} selected</span>
          )}
        </h3>
        <div className="space-y-2">
          {PURPOSES.map(p => {
            const isSelected = prps.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePrp(p)}
                className={`flex items-center gap-3 w-full text-left px-2.5 py-2 rounded-xl transition-all ${
                  isSelected ? "bg-amber-900/5 font-semibold" : "hover:bg-amber-900/5"
                }`}
              >
                <div
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    border: `2px solid ${isSelected ? MAROON : "rgba(91,31,36,0.25)"}`,
                    background: isSelected ? MAROON : "transparent"
                  }}
                >
                  {isSelected && <Check size={11} color="white" strokeWidth={3.5} />}
                </div>
                <span className="text-xs sm:text-sm flex-1" style={{ color: isSelected ? MAROON : "#4A3E31" }}>{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-amber-900/10" />

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: MAROON }}>Price Budget</h3>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-900/5" style={{ color: MAROON, fontFamily: PRICE_FONT }}>
            {maxPrice >= 30000 ? "All Prices" : `Up to ₹${maxPrice.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div className="space-y-2 pt-1 px-1">
          <input
            type="range"
            min="500"
            max="30000"
            step="500"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-amber-100 rounded-lg appearance-none accent-[#5B1F24]"
          />
          <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: "#8A7A68" }}>
            <span>₹500</span>
            <span>₹30,000+</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-amber-900/10" />

      {/* Collections Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: MAROON }}>Curated Collections</h3>
        <div className="space-y-2">
          {["Trending Products", "Discount Zone", "Combos & Kits", "Combo Deals"].map(c => {
            const isSelected = cols.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCol(c)}
                className={`flex items-center gap-3 w-full text-left px-2.5 py-2 rounded-xl transition-all ${
                  isSelected ? "bg-amber-900/5 font-semibold" : "hover:bg-amber-900/5"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    border: `2px solid ${isSelected ? GOLD : "rgba(91,31,36,0.25)"}`,
                    background: isSelected ? GOLD : "transparent"
                  }}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-xs sm:text-sm flex-1" style={{ color: isSelected ? MAROON : "#4A3E31" }}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200"
          style={{ borderColor: "rgba(192,64,64,0.3)", color: "#C04040" }}
        >
          <RotateCcw size={13} /> Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden pt-16 sm:pt-20 pb-6 sm:pb-10 px-4 sm:px-6 lg:px-10 border-b border-amber-900/10" style={{ background: "linear-gradient(135deg, #F9F3EA 0%, #F5EDE0 100%)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium" style={{ color: "#8A7A68" }}>
            <button onClick={() => navigate("/")} className="hover:underline transition-all" style={{ color: MAROON }}>Home</button>
            <ChevronRight size={12} />
            <span className="font-semibold" style={{ color: MAROON }}>Shop</span>
            {isCustom && (
              <>
                <ChevronRight size={12} />
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-amber-900/10" style={{ color: MAROON }}>{displayTitle}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="tracking-tight" style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 600, color: MAROON }}>
                {displayTitle}
              </h1>
              <p className="text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-xl font-medium" style={{ color: "#7A6A58" }}>
                {isCustom 
                  ? `Explore our authentic, temple-energized selection of ${displayTitle.toLowerCase()} products.`
                  : "Handcrafted, temple-energized & astrologer-recommended sacred essentials for spiritual harmony."}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900/80 bg-white/70 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-amber-900/10 shadow-xs w-fit">
              <Sparkles size={14} style={{ color: GOLD }} />
              <span>100% Authentic & Vedic Energized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        
        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-white border border-amber-900/10 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900/70 mr-1 flex items-center gap-1.5">
              <Filter size={12} /> Active Filters:
            </span>
            {cats.map(c => (
              <span key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>
                {c}
                <button onClick={() => toggleCat(c)} className="hover:bg-amber-900/10 rounded-full p-0.5 transition-all"><X size={11} /></button>
              </span>
            ))}
            {prps.map(p => (
              <span key={p} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>
                {p}
                <button onClick={() => togglePrp(p)} className="hover:bg-amber-900/10 rounded-full p-0.5 transition-all"><X size={11} /></button>
              </span>
            ))}
            {cols.map(c => (
              <span key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>
                {c}
                <button onClick={() => toggleCol(c)} className="hover:bg-amber-900/10 rounded-full p-0.5 transition-all"><X size={11} /></button>
              </span>
            ))}
            {maxPrice < 30000 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>
                Under ₹{maxPrice.toLocaleString("en-IN")}
                <button onClick={() => setMaxPrice(30000)} className="hover:bg-amber-900/10 rounded-full p-0.5 transition-all"><X size={11} /></button>
              </span>
            )}
            <button
              onClick={clearAll}
              className="ml-auto text-xs font-bold hover:underline px-2.5 py-1 text-red-700"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 p-6 rounded-3xl bg-white border border-amber-900/10 shadow-[0_4px_24px_rgba(91,31,36,0.04)]">
              <FilterPanel />
            </div>
          </div>

          {/* Product Listing Main Section */}
          <div className="flex-1 min-w-0">
            
            {/* Toolbar: Filter Toggle, Item Count, View Switcher & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 sm:p-4 rounded-2xl border border-amber-900/10 shadow-xs">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Drawer Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-amber-900/5 active:scale-95 shadow-xs"
                  style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON, background: "#FFFFFF" }}
                >
                  <Filter size={14} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#5B1F24]" />
                  )}
                </button>

                <p className="text-xs sm:text-sm font-semibold" style={{ color: "#6A5A48" }}>
                  Showing <strong className="text-sm sm:text-base font-bold" style={{ color: MAROON }}>{filtered.length}</strong> products
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                {/* View Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-amber-100/60 border border-amber-900/10">
                  <button
                    aria-label="Grid View"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white shadow-xs text-[#5B1F24]"
                        : "text-amber-900/60 hover:text-amber-900"
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    aria-label="List View"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white shadow-xs text-[#5B1F24]"
                        : "text-amber-900/60 hover:text-amber-900"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5">
                  <Select.Root value={sort} onValueChange={setSort}>
                    <Select.Trigger asChild>
                      <button
                        className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs outline-none hover:border-amber-900/30"
                        style={{ border: `1px solid rgba(91,31,36,0.2)`, background: "#FFFFFF", color: MAROON, fontFamily: SANS }}
                      >
                        <span className="hidden sm:inline text-amber-900/70 font-normal">Sort:</span>
                        <Select.Value />
                        <ChevronDown size={14} style={{ color: MAROON }} />
                      </button>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content
                        position="popper"
                        align="end"
                        sideOffset={6}
                        className="z-[200] rounded-2xl shadow-2xl border overflow-hidden p-1.5 min-w-[185px] bg-white border-amber-900/15"
                      >
                        <Select.Viewport className="space-y-1">
                          {[
                            { v: "popular", l: "Most Popular" },
                            { v: "price-asc", l: "Price: Low to High" },
                            { v: "price-desc", l: "Price: High to Low" },
                            { v: "rating", l: "Highest Rated" }
                          ].map(opt => (
                            <Select.Item
                              key={opt.v}
                              value={opt.v}
                              className="px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer outline-none transition-colors data-[highlighted]:bg-amber-900/10 data-[state=checked]:bg-amber-900/15 data-[state=checked]:text-[#5B1F24]"
                              style={{ color: MAROON, fontFamily: SANS }}
                            >
                              <Select.ItemText>{opt.l}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-amber-900/10 shadow-xs my-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 text-3xl">
                  🔍
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: SERIF, color: MAROON }}>
                  No sacred products match your criteria
                </h3>
                <p className="text-sm max-w-md mx-auto mb-6 text-amber-900/70 font-medium">
                  Try adjusting your price range, clearing specific category filters, or resetting your filter choices.
                </p>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-95"
                  style={{ background: MAROON, color: IVORY }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Products Grid or List View */
              viewMode === "grid" ? (
                /* GRID VIEW CARDS */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                  {filtered.map(p => {
                    const discountPct = p.original > p.price ? Math.round((1 - p.price / p.original) * 100) : 0;
                    const itemInCart = items.find(i => i.product.id === p.id);
                    const cartQty = itemInCart ? itemInCart.qty : 0;
                    const isWish = isInWishlist(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/shop/${p.slug}`)}
                        className="group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 bg-white flex flex-col justify-between border border-amber-900/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(91,31,36,0.12)]"
                      >
                        {/* Image Frame Box */}
                        <div className="relative aspect-[4/3] bg-[#FAF7F2] overflow-hidden flex items-center justify-center p-4">
                          <img
                            src={p.img}
                            alt={`${p.name} - ${p.subtitle}`}
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-108"
                          />

                          {/* Top Badges overlay */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                            {p.badges && p.badges.length > 0 && (
                              <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow-xs"
                                style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}
                              >
                                {p.badges[0]}
                              </span>
                            )}
                          </div>

                          {/* Wishlist Floating Button */}
                          <button
                            aria-label="Add to wishlist"
                            onClick={e => {
                              e.stopPropagation();
                              toggleWishlist(p);
                            }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md bg-white/80 border border-white/60 shadow-sm transition-transform duration-200 hover:scale-110 active:scale-90 z-10"
                          >
                            <Heart
                              size={15}
                              style={{
                                color: isWish ? "#E74C3C" : "#7A6A58",
                                fill: isWish ? "#E74C3C" : "none"
                              }}
                            />
                          </button>

                          {/* Quick View Hover Strip */}
                          <div className="hidden sm:flex absolute inset-x-0 bottom-0 py-2.5 items-center justify-center gap-2 text-xs font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 shadow-md"
                            style={{ background: "rgba(91,31,36,0.92)", color: GOLD }}>
                            <Eye size={14} /> Quick View
                          </div>
                        </div>

                        {/* Details Content Box */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-extrabold tracking-wider" style={{ color: "#8A7A68" }}>
                                {p.category || "Sacred Item"}
                              </span>
                              {p.rating && (
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-900/10">
                                  <Star size={11} fill={GOLD} stroke={GOLD} />
                                  <span className="text-[11px] font-bold" style={{ color: MAROON }}>{p.rating}</span>
                                  {p.reviews && <span className="text-[9px]" style={{ color: "#8A7A68" }}>({p.reviews})</span>}
                                </div>
                              )}
                            </div>

                            <h3
                              className="text-sm sm:text-base font-bold leading-snug line-clamp-2 transition-colors group-hover:text-[#7A2A30]"
                              style={{ fontFamily: SERIF, color: MAROON }}
                            >
                              {p.name}
                            </h3>

                            <p className="text-xs line-clamp-1 font-medium" style={{ color: "#7A6A58" }}>
                              {p.subtitle}
                            </p>
                          </div>

                          {/* Pricing & Cart Action Area */}
                          <div className="pt-3 border-t border-amber-900/10 space-y-3">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-lg sm:text-xl font-extrabold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                                {p.original > p.price && (
                                  <span className="text-xs line-through opacity-60 font-semibold" style={{ fontFamily: PRICE_FONT, color: "#8A7A68" }}>
                                    ₹{p.original.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>

                              {discountPct > 0 && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {discountPct}% OFF
                                </span>
                              )}
                            </div>

                            {/* Add to Cart / Qty selector button */}
                            {cartQty > 0 ? (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="w-full py-1.5 px-3 rounded-2xl flex items-center justify-between font-bold text-xs shadow-sm"
                                style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`, color: IVORY }}
                              >
                                <button
                                  aria-label="Decrease quantity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cartQty <= 1) removeFromCart(p.id);
                                    else updateQty(p.id, -1);
                                  }}
                                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:bg-white/20 active:scale-90"
                                  style={{ color: GOLD }}
                                >
                                  <Minus size={13} strokeWidth={3} />
                                </button>
                                
                                <span className="text-xs font-extrabold tracking-wider" style={{ color: IVORY }}>
                                  {cartQty} IN CART
                                </span>

                                <button
                                  aria-label="Increase quantity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQty(p.id, 1);
                                  }}
                                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:bg-white/20 active:scale-90"
                                  style={{ color: GOLD }}
                                >
                                  <Plus size={13} strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <button
                                aria-label={`Add ${p.name} to cart`}
                                onClick={e => {
                                  e.stopPropagation();
                                  addToCart(p, 1, false);
                                }}
                                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:opacity-95 active:scale-98 uppercase"
                                style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`, color: IVORY }}
                              >
                                <ShoppingCart size={14} />
                                <span>ADD TO CART</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW CARDS */
                <div className="space-y-4">
                  {filtered.map(p => {
                    const discountPct = p.original > p.price ? Math.round((1 - p.price / p.original) * 100) : 0;
                    const itemInCart = items.find(i => i.product.id === p.id);
                    const cartQty = itemInCart ? itemInCart.qty : 0;
                    const isWish = isInWishlist(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/shop/${p.slug}`)}
                        className="group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border border-amber-900/10 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6"
                      >
                        {/* List View Image */}
                        <div className="w-full sm:w-44 md:w-52 h-44 sm:h-40 flex-shrink-0 relative rounded-2xl overflow-hidden bg-[#FAF7F2] p-3 flex items-center justify-center">
                          <img
                            src={p.img}
                            alt={`${p.name} - ${p.subtitle}`}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {p.badges && p.badges.length > 0 && (
                            <span
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase backdrop-blur-md"
                              style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}
                            >
                              {p.badges[0]}
                            </span>
                          )}

                          <button
                            aria-label="Add to wishlist"
                            onClick={e => {
                              e.stopPropagation();
                              toggleWishlist(p);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md bg-white/80 border border-white/60 shadow-xs"
                          >
                            <Heart size={13} style={{ color: isWish ? "#E74C3C" : "#7A6A58", fill: isWish ? "#E74C3C" : "none" }} />
                          </button>
                        </div>

                        {/* List View Details Column */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider" style={{ color: "#8A7A68" }}>
                              {p.category || "Sacred Item"}
                            </span>
                            {p.purpose && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900/80 border border-amber-900/10">
                                {p.purpose}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-[#7A2A30]" style={{ fontFamily: SERIF, color: MAROON }}>
                            {p.name}
                          </h3>

                          <p className="text-xs text-amber-900/70 font-medium line-clamp-2">
                            {p.subtitle}
                          </p>

                          {p.rating && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <Star key={j} size={11} fill={j < Math.round(p.rating!) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />
                                ))}
                              </div>
                              <span className="text-xs font-bold" style={{ color: MAROON }}>{p.rating}</span>
                              {p.reviews && <span className="text-xs text-amber-900/60 font-medium">({p.reviews} verified reviews)</span>}
                            </div>
                          )}
                        </div>

                        {/* List View Price & Action Column */}
                        <div className="w-full sm:w-48 flex-shrink-0 flex flex-col sm:items-end justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-amber-900/10">
                          <div className="flex flex-col sm:items-end">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              {p.original > p.price && (
                                <span className="text-xs line-through opacity-60 font-semibold" style={{ fontFamily: PRICE_FONT, color: "#8A7A68" }}>
                                  ₹{p.original.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                            {discountPct > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                                Save {discountPct}%
                              </span>
                            )}
                          </div>

                          {cartQty > 0 ? (
                            <div
                              onClick={e => e.stopPropagation()}
                              className="w-full sm:w-40 py-2 px-3 rounded-2xl flex items-center justify-between font-bold text-xs shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`, color: IVORY }}
                            >
                              <button
                                aria-label="Decrease quantity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cartQty <= 1) removeFromCart(p.id);
                                  else updateQty(p.id, -1);
                                }}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
                                style={{ color: GOLD }}
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              
                              <span className="text-xs font-bold" style={{ color: IVORY }}>
                                {cartQty} in cart
                              </span>

                              <button
                                aria-label="Increase quantity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQty(p.id, 1);
                                }}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
                                style={{ color: GOLD }}
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <button
                              aria-label={`Add ${p.name} to cart`}
                              onClick={e => {
                                e.stopPropagation();
                                addToCart(p, 1, false);
                              }}
                              className="w-full sm:w-40 py-2.5 px-4 rounded-2xl text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md active:scale-98 uppercase"
                              style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`, color: IVORY }}
                            >
                              <ShoppingCart size={14} />
                              <span>ADD TO CART</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6 shadow-2xl ml-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-amber-900/10 mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={18} style={{ color: MAROON }} />
                  <h3 className="font-bold text-base" style={{ fontFamily: SERIF, color: MAROON }}>Filter Products</h3>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-black/5">
                  <X size={20} style={{ color: MAROON }} />
                </button>
              </div>
              <FilterPanel />
            </div>

            <div className="pt-6 border-t border-amber-900/10 mt-6 sticky bottom-0 bg-white">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full py-3 rounded-2xl text-xs font-bold tracking-wider uppercase shadow-md active:scale-95"
                style={{ background: MAROON, color: IVORY }}
              >
                Apply Filters ({filtered.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

