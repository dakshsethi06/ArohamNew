import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Star, Heart, Eye, Filter, X, CheckCircle, ChevronRight, ChevronDown, ShoppingCart } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import * as Select from "@radix-ui/react-select";
import { CATEGORIES, PURPOSES, PRICE_RANGES } from "@/constants/data";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ArohamProduct } from "@/types/product";

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
  const [wish, setWish] = useState<Record<number, boolean>>({});

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
    if (sort === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const toggleCat = (c: string) => setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const togglePrp = (p: string) => setPrps(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleCol = (c: string) => setCols(prev => prev[0] === c ? [] : [c]);
  const clearAll = () => { setCats([]); setPrps([]); setCols([]); setMaxPrice(30000); };

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: MAROON }}>Price Range</h3>
          <span className="text-xs font-bold" style={{ color: MAROON, fontFamily: PRICE_FONT }}>
            {maxPrice >= 30000 ? "All Prices" : `Up to ₹${maxPrice.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div className="space-y-3 pt-1">
          <input
            type="range"
            min="500"
            max="30000"
            step="500"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-amber-100/80 rounded-lg appearance-none"
            style={{ accentColor: MAROON }}
          />
          <div className="flex items-center justify-between text-[11px] font-medium" style={{ color: "#7A6A58" }}>
            <span>₹500</span>
            <span>₹30,000+</span>
          </div>
        </div>
      </div>
      <div className="h-px" style={{ background: "rgba(91,31,36,0.08)" }} />
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MAROON }}>Collections</h3>
        <div className="space-y-2.5">
          {["Trending Products", "Discount Zone", "Combos & Kits", "Combo Deals"].map(c => (
            <button key={c} onClick={() => toggleCol(c)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                style={{ border: `2px solid ${cols.includes(c) ? GOLD : "rgba(91,31,36,0.2)"}`, background: cols.includes(c) ? GOLD : "transparent" }}>
                {cols.includes(c) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm" style={{ color: cols.includes(c) ? MAROON : "#5A4A3A" }}>{c}</span>
            </button>
          ))}
        </div>
      </div>
      {(cats.length > 0 || prps.length > 0 || cols.length > 0 || maxPrice < 30000) && (
        <button onClick={clearAll} className="w-full py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50"
          style={{ borderColor: "rgba(200,0,0,0.2)", color: "#C04040" }}>Clear All Filters</button>
      )}
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <div className="pt-16 sm:pt-24 pb-4 sm:pb-8 px-4 sm:px-6 lg:px-10" style={{ background: `linear-gradient(135deg,#F5EDE0,#FAF7F2)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs" style={{ color: "#9A8A78" }}>
            <button onClick={() => navigate("/")} className="hover:underline" style={{ color: MAROON }}>Home</button>
            <ChevronRight size={12} /><span>Shop</span>
            {isCustom && <><ChevronRight size={12} /><span style={{ color: MAROON }}>{displayTitle}</span></>}
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>{displayTitle}</h1>
          <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: "#7A6A58" }}>
            {isCustom ? `Explore our finest selection of ${displayTitle.toLowerCase()} items` : "Temple-energized, handcrafted, expert-recommended"}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
        {(cats.length > 0 || prps.length > 0 || cols.length > 0 || maxPrice < 30000) && (
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {cats.map(c => <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{c}<button onClick={() => toggleCat(c)} className="ml-1"><X size={10} /></button></span>)}
            {prps.map(p => <span key={p} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{p}<button onClick={() => togglePrp(p)} className="ml-1"><X size={10} /></button></span>)}
            {cols.map(c => <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{c}<button onClick={() => toggleCol(c)} className="ml-1"><X size={10} /></button></span>)}
            {maxPrice < 30000 && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>Under ₹{maxPrice.toLocaleString("en-IN")}<button onClick={() => setMaxPrice(30000)} className="ml-1"><X size={10} /></button></span>}
          </div>
        )}
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
              <FilterPanel />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium" style={{ color: "#7A6A58" }}>Showing <strong style={{ color: MAROON }}>{filtered.length}</strong> products</p>
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{ borderColor: "rgba(91,31,36,0.15)", color: MAROON, background: "#FFFFFF" }}><Filter size={13} /> Filter</button>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium hidden sm:inline" style={{ color: "#7A6A58" }}>Sort:</span>
                  <Select.Root value={sort} onValueChange={setSort}>
                    <Select.Trigger asChild>
                      <button className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm outline-none max-w-[150px] sm:max-w-none truncate"
                        style={{ border: `1px solid rgba(91,31,36,0.2)`, background: "#FFFFFF", color: MAROON, fontFamily: SANS }}>
                        <Select.Value />
                        <ChevronDown size={13} style={{ color: MAROON }} />
                      </button>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content position="popper" align="end" sideOffset={6} className="z-[200] rounded-2xl shadow-xl border overflow-hidden p-1 min-w-[175px]"
                        style={{ background: "#FFFFFF", borderColor: "rgba(91,31,36,0.15)" }}>
                        <Select.Viewport className="space-y-0.5">
                          {[
                            { v: "popular", l: "Most Popular" },
                            { v: "price-asc", l: "Price: Low to High" },
                            { v: "price-desc", l: "Price: High to Low" },
                            { v: "rating", l: "Highest Rated" }
                          ].map(opt => (
                            <Select.Item key={opt.v} value={opt.v} className="px-3.5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer outline-none transition-colors data-[highlighted]:bg-[rgba(91,31,36,0.08)] data-[state=checked]:bg-[rgba(91,31,36,0.12)] data-[state=checked]:text-[#5B1F24]"
                              style={{ color: MAROON, fontFamily: SANS }}>
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
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2" style={{ fontFamily: SERIF, color: MAROON }}>No products match your filters</p>
                <button onClick={clearAll} className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium" style={{ background: MAROON, color: IVORY }}>Clear Filters</button>
              </div>
            ) : (
              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 items-stretch">
                {filtered.map(p => {
                  const discountPct = Math.round((1 - p.price / p.original) * 100);
                  return (
                    <div key={p.id} onClick={() => navigate(`/shop/${p.slug}`)}
                      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 flex flex-row sm:flex-col justify-between bg-white"
                      style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(91,31,36,0.06)", border: "1px solid rgba(91,31,36,0.08)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(91,31,36,0.14)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(91,31,36,0.06)"}>
                      
                      {/* Product Image Box */}
                      <div className="relative overflow-hidden w-28 sm:w-full self-stretch bg-amber-50 flex-shrink-0">
                        <img src={p.img} alt={`${p.name} - ${p.subtitle}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                          {p.price > 1000 && p.badges.slice(0, 1).map(b => <span key={b} className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold" style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}>{b}</span>)}
                        </div>
                        <button aria-label="Add to wishlist" onClick={e => { e.stopPropagation(); toggleWishlist(p); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: "rgba(255,255,255,0.9)" }}>
                          <Heart size={12} style={{ color: isInWishlist(p.id) ? "#E74C3C" : "#7A6A58", fill: isInWishlist(p.id) ? "#E74C3C" : "none" }} />
                        </button>
                        <div className="hidden sm:flex absolute inset-x-0 bottom-0 py-3 items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                          style={{ background: "rgba(91,31,36,0.9)" }}>
                          <span className="text-xs font-semibold flex items-center gap-2" style={{ color: GOLD }}><Eye size={12} /> View Product</span>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0 gap-1">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold sm:font-semibold mb-0.5 leading-tight line-clamp-2" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</h3>
                          <p className="text-[10px] sm:text-xs mb-1 truncate" style={{ color: "#7A6A58" }}>{p.subtitle}</p>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={9} fill={j < Math.round(p.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}
                            <span className="text-[9px] sm:text-[10px] ml-0.5 font-bold" style={{ color: MAROON }}>{p.rating}</span>
                            <span className="text-[9px] sm:text-[10px]" style={{ color: "#9A8A78" }}>({p.reviews})</span>
                          </div>
                        </div>

                        {/* Price & Add to Cart button */}
                        <div className="pt-1 sm:pt-0 flex items-end justify-between gap-1 border-t sm:border-t-0 border-black/[0.05]">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-xs sm:text-base font-bold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{p.price.toLocaleString("en-IN")}</span>
                              {p.original > p.price && (
                                <span className="text-[9px] sm:text-xs line-through opacity-70" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>₹{p.original.toLocaleString("en-IN")}</span>
                              )}
                            </div>
                            {p.original > p.price && (
                              <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: "#2E7D32" }}>{discountPct}% OFF</span>
                            )}
                          </div>

                          {(() => {
                            const itemInCart = items.find(i => i.product.id === p.id);
                            const cartQty = itemInCart ? itemInCart.qty : 0;

                            if (cartQty > 0) {
                              return (
                                <div onClick={e => e.stopPropagation()} className="flex-shrink-0 px-2 py-1 rounded-xl flex items-center gap-1.5 font-bold text-xs shadow-sm" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                                  <button
                                    aria-label="Decrease quantity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (cartQty <= 1) {
                                        removeFromCart(p.id);
                                      } else {
                                        updateQty(p.id, -1);
                                      }
                                    }}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:bg-white/20 active:scale-95"
                                    style={{ color: GOLD }}
                                  >
                                    -
                                  </button>
                                  <span className="text-[10px] sm:text-xs font-bold" style={{ color: IVORY, fontFamily: SANS }}>{cartQty}</span>
                                  <button aria-label="Increase quantity" onClick={() => updateQty(p.id, 1)} className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:bg-white/20 active:scale-95" style={{ color: GOLD }}>+</button>
                                </div>
                              );
                            }

                            return (
                              <button
                                aria-label={`Add ${p.name} to cart`}
                                onClick={e => {
                                  e.stopPropagation();
                                  addToCart(p, 1, false);
                                }}
                                className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-xs font-bold tracking-wide transition-all hover:opacity-90 active:scale-95 flex items-center justify-center shadow-sm uppercase whitespace-nowrap"
                                style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
                              >
                                <span>ADD TO CART</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
