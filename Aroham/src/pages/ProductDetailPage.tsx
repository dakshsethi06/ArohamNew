import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Star, ShoppingCart, Share2, Heart, ChevronRight, Sparkles, Flame, Gem, Award, Shield, Package, Truck, CheckCircle, Mail, Phone, ChevronDown } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { CONTACT_INFO } from "@/constants/contact";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { ArohamProduct } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/constants/products";
import { getShiprocketDeliveryEstimate } from "@/lib/shipping";

const PROD_TABS = ["Description", "Benefits", "How to Use", "Temple Ritual", "Reviews"];
const REVIEWS_DATA = [
  { name: "Sunita R.",  city: "Delhi",  rating: 5, text: "The quality is outstanding. I can feel the positive energy radiating from the yantra. Temple energization makes a real difference.", verified: true, date: "2 weeks ago" },
  { name: "Rahul K.",   city: "Chennai",rating: 5, text: "Received beautifully packaged with the authenticity certificate. The craftsmanship is exceptional — worth every rupee.",             verified: true, date: "1 month ago" },
  { name: "Meera P.",   city: "Pune",   rating: 4, text: "Very happy with my purchase. Delivery was prompt and the product matches the description perfectly. Highly recommend Aroham.",    verified: true, date: "3 weeks ago" },
];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn, openAuth } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [product, setProduct] = useState<ArohamProduct | null>(() => {
    return DEFAULT_PRODUCTS.find(p => p.slug === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !DEFAULT_PRODUCTS.some(p => p.slug === slug);
  });

  useEffect(() => {
    if (slug) {
      const found = products.find(p => p.slug === slug) || DEFAULT_PRODUCTS.find(p => p.slug === slug);
      if (found) {
        setProduct(found);
        setLoading(false);
      } else if (!productsLoading) {
        setLoading(false);
      }
    }
  }, [slug, products, productsLoading]);

  const [tab, setTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const mainButtonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mainButtonsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting);
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [product, loading]);

  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{ city?: string; state?: string; date?: string; cod?: boolean; error?: string; fallback?: boolean; carrier?: string } | null>(null);

  const checkDelivery = async () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setDeliveryResult({ error: "Please enter a valid 6-digit pincode." });
      return;
    }
    setChecking(true);
    setDeliveryResult(null);
    try {
      let city = "";
      let state = "";
      try {
        const locRes = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const locData = await locRes.json();
        if (locData && locData[0] && locData[0].Status === "Success") {
          const postOffice = locData[0].PostOffice[0];
          city = postOffice.District;
          state = postOffice.State;
        }
      } catch (e) {
        console.error("Postal API error", e);
      }

      const est = await getShiprocketDeliveryEstimate(pin);
      setDeliveryResult({
        city: city || est.city || "",
        state: state || est.state || "",
        date: est.deliveryDate,
        cod: est.codAvailable,
        carrier: est.courier,
      });
    } catch (e) {
      console.error("Pincode check error", e);
      setDeliveryResult({
        date: "3–5 business days",
        cod: true,
        carrier: "Shiprocket Express",
        fallback: true
      });
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F2" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
          <p className="text-sm" style={{ color: "#9A8A78", fontFamily: SANS }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F2" }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-4" style={{ fontFamily: SERIF, color: MAROON }}>Product not found</p>
          <button onClick={() => navigate("/shop")} className="px-6 py-3 rounded-full text-sm font-medium" style={{ background: MAROON, color: IVORY }}>Back to Shop</button>
        </div>
      </div>
    );
  }

  const imgViews = ["Front View", "Detail View", "In Use", "Packaging", "Certificate"];

  const tabContent = [
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>
        <strong style={{ color: MAROON }}>{product.name}</strong> is not merely a product — it is a sacred instrument of Vedic science,
        crafted according to ancient Shilpa Shastra principles and energized through traditional temple rituals.
        Each piece carries the accumulated wisdom of centuries of Jyotish practice.
      </p>
      <p className="text-sm leading-relaxed md:text-base md:leading-relaxed" style={{ color: "#5A4A3A" }}>
        {product.shortDesc} The geometric precision in its construction aligns with cosmic frequencies that Vedic tradition identifies as channels for specific divine energies.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {[["Material", product.material], ["Size", product.size], ["Category", product.category], ["Purpose", product.purpose]].map(([k, v]) => (
          <div key={k} className="p-3 rounded-xl" style={{ background: "rgba(200,160,68,0.06)", border: "1px solid rgba(200,160,68,0.15)" }}>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: GOLD }}>{k}</div>
            <div className="text-sm font-medium" style={{ color: MAROON }}>{v}</div>
          </div>
        ))}
      </div>
    </div>,
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {product?.benefits?.map(b => (
        <div key={b} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)" }}>
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(200,160,68,0.1)" }}><Sparkles size={14} style={{ color: GOLD }} /></div>
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{b}</p>
            <p className="text-xs mt-0.5" style={{ color: "#7A6A58" }}>Vedic tradition attests to this benefit</p>
          </div>
        </div>
      ))}
    </div>,
    <div className="space-y-4 max-w-4xl">
      {["Unbox carefully and keep in a clean place", "Cleanse with Gangajal or incense smoke", "Place in the recommended direction (usually East/Northeast)", "Offer a flower, light a diya, and chant the associated mantra", "Experience the positive energy over 40 days of regular worship"].map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg,${GOLD},#E8B84B)`, color: "#1A0D0E" }}>{i + 1}</div>
            {i < 4 && <div className="w-px flex-1 mt-1 mb-1" style={{ background: "rgba(200,160,68,0.2)", minHeight: 20 }} />}
          </div>
          <div className="pb-4"><p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>{step}</p></div>
        </div>
      ))}
    </div>,
    <div className="space-y-5 max-w-4xl">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,#FAF0D8,#FAF7F2)`, border: "1px solid rgba(200,160,68,0.2)" }}>
        <h4 className="font-semibold mb-2" style={{ fontFamily: SERIF, color: MAROON }}>Pran Pratishtha Ceremony</h4>
        <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>Before reaching you, every {product.name} undergoes a complete Pran Pratishtha — a sacred consecration ritual performed by certified Vedic pandits. The ceremony includes 108 rounds of mantra chanting, ritual bathing with Panchamrit, and invocation of the presiding deity.</p>
      </div>
      {["Shuddhikaran (Purification)", "Sthapan (Installation)", "Pranpratishtha (Life-Infusion)", "Naivedya (Offering)", "Visarjan (Conclusion)"].map((r, i) => (
        <div key={r} className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(200,160,68,0.12)", color: GOLD, border: `1px solid rgba(200,160,68,0.3)` }}>{i + 1}</div>
          <span className="text-sm" style={{ color: "#5A4A3A" }}>{r}</span>
        </div>
      ))}
    </div>,
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-6 p-5 rounded-2xl" style={{ background: "rgba(200,160,68,0.06)", border: "1px solid rgba(200,160,68,0.15)" }}>
        <div className="text-center">
          <div className="text-4xl font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{product.rating}</div>
          <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill={j < Math.round(product.rating) ? GOLD : "none"} stroke={GOLD} />)}</div>
          <div className="text-xs mt-1" style={{ color: "#7A6A58" }}>{product.reviews} reviews</div>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map(n => (
            <div key={n} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-4" style={{ color: "#9A8A78" }}>{n}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(91,31,36,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${n === 5 ? 75 : n === 4 ? 18 : n === 3 ? 5 : 1}%`, background: GOLD }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {REVIEWS_DATA.map((r, i) => (
        <div key={i} className="p-5 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)" }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: MAROON, color: GOLD }}>{r.name[0]}</div>
              <div>
                <div className="text-xs font-semibold" style={{ color: MAROON }}>{r.name} · {r.city}</div>
                {r.verified && <div className="text-[10px]" style={{ color: "#4A8A4A" }}>✓ Verified Purchase</div>}
              </div>
            </div>
            <span className="text-[10px]" style={{ color: "#9A8A78" }}>{r.date}</span>
          </div>
          <div className="flex mb-2">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={11} fill={GOLD} stroke={GOLD} />)}</div>
          <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>{r.text}</p>
        </div>
      ))}
    </div>,
  ];

  return (
    <div className="w-full overflow-x-hidden" style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <div className="pt-24 pb-0 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-xs mb-6" style={{ color: "#9A8A78" }}>
          <button onClick={() => navigate("/")} className="hover:underline whitespace-nowrap" style={{ color: MAROON }}>Home</button>
          <ChevronRight size={12} className="flex-shrink-0" />
          <button onClick={() => navigate("/shop")} className="hover:underline whitespace-nowrap" style={{ color: MAROON }}>Shop</button>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span>{product.name}</span>
        </div>
      </div>
      <div className="px-5 lg:px-10 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[48%_32%_20%] gap-6 lg:gap-8">
          {/* Gallery */}
          <div>
            <div className="rounded-3xl overflow-hidden aspect-square bg-amber-50 mb-3 relative group" style={{ boxShadow: "0 8px 40px rgba(91,31,36,0.1)" }}>
              <img src={product.img} alt={`${product.name} - ${product.subtitle}`} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button aria-label="Add to wishlist" onClick={() => { if (product) { toggleWishlist(product); } }} className="p-2 rounded-full hover:opacity-80 transition-opacity" style={{ background: "rgba(255,255,255,0.9)" }}>
                  <Heart size={16} style={{ color: product && isInWishlist(product.id) ? "#E74C3C" : "#7A6A58", fill: product && isInWishlist(product.id) ? "#E74C3C" : "none" }} />
                </button>
                <button aria-label="Share product" className="p-2 rounded-full hover:opacity-80 transition-opacity" style={{ background: "rgba(255,255,255,0.9)" }}><Share2 size={16} style={{ color: "#7A6A58" }} /></button>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}>{imgViews[selectedImg]}</div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imgViews.map((v, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                  style={{ border: `2px solid ${selectedImg === i ? GOLD : "rgba(91,31,36,0.1)"}`, boxShadow: selectedImg === i ? `0 0 0 2px rgba(200,160,68,0.2)` : "none" }}>
                  <img src={product.img} alt={v} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
          {/* Product story */}
          <div>

            <h1 className="mb-1" style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 500, color: MAROON, lineHeight: 1.15 }}>{product.name}</h1>
            <p className="text-sm mb-3" style={{ color: GOLD, fontFamily: SANS, fontWeight: 600 }}>{product.subtitle}</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A4A3A" }}>{product.shortDesc}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill={j < Math.round(product.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}</div>
                <span className="text-sm font-medium" style={{ color: MAROON }}>{product.rating}</span>
                <span className="text-xs whitespace-nowrap" style={{ color: "#9A8A78" }}>({product.reviews} reviews)</span>
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: "#4A8A4A" }}>· 120+ bought this month</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-base line-through" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>₹{Math.round(product.original).toLocaleString("en-IN")}</span>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#4A8A4A" }}>{Math.round((1 - product.price / product.original) * 100)}% off</span>
            </div>
            <p className="text-[11px] mb-5" style={{ color: "#9A8A78" }}>Inclusive of GST · Free shipping · Temple energized</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center rounded-full overflow-hidden" style={{ border: `1.5px solid rgba(91,31,36,0.15)` }}>
                <button aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-black/5" style={{ color: MAROON }}>−</button>
                <span className="w-10 text-center font-semibold" style={{ color: MAROON, fontFamily: SERIF }}>{qty}</span>
                <button aria-label="Increase quantity" onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5" style={{ color: MAROON }}>+</button>
              </div>
              <span className="text-xs" style={{ color: "#4A8A4A" }}>✓ In Stock</span>
            </div>
            <div ref={mainButtonsRef} className="hidden lg:block space-y-3 mb-5">
              <button onClick={() => addToCart(product, qty)}
                className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center transition-all hover:opacity-90 hover:shadow-lg uppercase"
                style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                Add to Cart
              </button>
              <button
                onClick={async () => { 
                  await addToCart(product, qty); 
                  navigate("/checkout/shipping");
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border transition-all hover:bg-amber-50 flex items-center justify-center gap-2"
                style={{ borderColor: GOLD, color: MAROON }}>⚡ Buy Now
              </button>
            </div>

            {/* Myntra-style Delivery & Pincode Checker */}
            <div className="rounded-2xl p-4 mb-6" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 12px rgba(91,31,36,0.03)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Truck size={16} style={{ color: GOLD }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: MAROON }}>Delivery Options</span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ border: "1.5px solid rgba(91,31,36,0.12)", background: "#FAF7F2", color: "#222222", fontFamily: SANS }}
                />
                <button
                  onClick={checkDelivery}
                  disabled={checking}
                  className="flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all active:scale-95"
                  style={{ background: MAROON, color: IVORY }}
                >
                  {checking ? "Checking..." : "Check"}
                </button>
              </div>
              {deliveryResult && (
                <div className="mt-3 space-y-2 text-xs transition-opacity duration-300">
                  {deliveryResult.error ? (
                    <p className="text-red-500 font-semibold">✕ {deliveryResult.error}</p>
                  ) : (
                    <>
                      <p className="font-semibold text-emerald-600 flex items-center gap-1.5">
                        <span>✓</span> Estimated delivery: {deliveryResult.date}
                      </p>
                      {deliveryResult.city && (
                        <p style={{ color: "#7A6A58" }}>
                          Delivered to: <strong style={{ color: MAROON }}>{deliveryResult.city}, {deliveryResult.state}</strong>
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[{ icon: Flame, l: "Temple Energized" }, { icon: Gem, l: "100% Authentic" }, { icon: Award, l: "Handcrafted" }, { icon: Shield, l: "Secure Pay" }, { icon: Package, l: "Easy Returns" }].map(({ icon: Icon, l }) => (
                <div key={l} className="flex flex-col items-center gap-1 text-center">
                  <Icon size={16} style={{ color: GOLD }} strokeWidth={1.5} />
                  <span className="text-[9px] leading-tight" style={{ color: "#7A6A58" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Trust panel */}
          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 4px 24px rgba(91,31,36,0.07)" }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)` }}>
                <p className="text-xs font-semibold" style={{ color: GOLD }}>Why Buy from Aroham?</p>
              </div>
              <div className="p-4 space-y-3">
                {[{ icon: "🪔", t: "Temple Energized", d: "Pran Pratishtha by certified pandits" }, { icon: "📜", t: "Authenticity Certificate", d: "Included with every product" }, { icon: "✋", t: "Handcrafted Quality", d: "By master artisans" }, { icon: "⭐", t: "Expert Recommended", d: "By Jyotish scholars" }, { icon: "📦", t: "Premium Packaging", d: "Luxury gift box" }, { icon: "↩️", t: "Easy Returns", d: "7-day hassle-free returns" }].map(({ icon, t, d }) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: MAROON }}>{t}</div>
                      <div className="text-[10px]" style={{ color: "#9A8A78" }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "rgba(200,160,68,0.06)", border: "1px solid rgba(200,160,68,0.2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ fontFamily: SERIF, color: MAROON }}>Need Guidance?</p>
              <p className="text-[10px] mb-3" style={{ color: "#7A6A58" }}>Talk to our Vastu Expert to confirm this is the right remedy for you.</p>
              <div className="flex gap-2">
                <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-opacity hover:opacity-90" style={{ background: "#25D366", color: "white" }}>💬 WhatsApp</a>
                <a href={CONTACT_INFO.phoneTel} className="flex-1 py-2 rounded-xl text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors hover:bg-amber-50" style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON }}>📞 Call</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trust strip */}
      <div className="border-y px-6 py-4" style={{ borderColor: "rgba(91,31,36,0.08)", background: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 lg:gap-10">
          {[{ icon: Truck, l: "Free Shipping" }, { icon: Flame, l: "Temple Energized" }, { icon: Shield, l: "Secure Payments" }, { icon: Package, l: "Easy Returns" }, { icon: Award, l: "Premium Packaging" }, { icon: CheckCircle, l: "Trusted India-Wide" }].map(({ icon: Icon, l }) => (
            <div key={l} className="flex items-center gap-2"><Icon size={14} style={{ color: GOLD }} strokeWidth={1.5} /><span className="text-xs font-medium" style={{ color: "#5A4A3A" }}>{l}</span></div>
          ))}
        </div>
      </div>
      {/* Info tabs */}
      <div className="sticky top-16 z-30 border-b overflow-x-auto" style={{ background: "rgba(250,247,242,0.97)", backdropFilter: "blur(12px)", borderColor: "rgba(91,31,36,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-0">
          {PROD_TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${tab === i ? "border-b-[#5B1F24] text-[#5B1F24]" : "border-b-transparent text-[#7A6A58]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-2">
        <div className="w-full">{tabContent[tab]}</div>
      </div>
      {/* Contact section */}
      <div className="px-6 lg:px-10 mt-2 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, position: "relative" }}>
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "24px 24px" }} />
            <div className="relative px-8 py-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs tracking-widest uppercase font-medium block mb-3" style={{ color: "rgba(200,160,68,0.8)" }}>Expert Guidance</span>
                  <h3 className="mb-2 text-2xl font-semibold" style={{ fontFamily: SERIF, color: IVORY, lineHeight: 1.2 }}>Confused? Let Us Help You Choose.</h3>
                  <p className="text-sm" style={{ color: "rgba(250,247,242,0.65)" }}>Our Vedic experts will personally guide you to the right remedy for your specific situation.</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a href={CONTACT_INFO.emailMailto} className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <Mail size={20} style={{ color: GOLD }} /><div><div className="text-sm font-semibold" style={{ color: IVORY }}>Email Us</div><div className="text-[11px]" style={{ color: "rgba(250,247,242,0.6)" }}>{CONTACT_INFO.email}</div></div>
                </a>
                <a href={CONTACT_INFO.phoneTel} className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <Phone size={20} style={{ color: GOLD }} /><div><div className="text-sm font-semibold" style={{ color: IVORY }}>Call Us</div><div className="text-[11px]" style={{ color: "rgba(250,247,242,0.6)" }}>{CONTACT_INFO.phoneDisplay}</div></div>
                </a>
                <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105" style={{ background: "#25D366", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <span className="text-xl">💬</span><div><div className="text-sm font-semibold" style={{ color: "white" }}>WhatsApp</div><div className="text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>Chat instantly</div></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 border-t transition-transform duration-300 shadow-2xl"
        style={{
          background: "rgba(250,247,242,0.98)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(91,31,36,0.12)",
          boxShadow: "0 -4px 24px rgba(91,31,36,0.12)",
          transform: "translateY(0)"
        }}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-xs line-through" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>₹{Math.round(product.original).toLocaleString("en-IN")}</span>
            <span className="text-xs font-bold" style={{ color: "#4A8A4A" }}>{Math.round((1 - product.price / product.original) * 100)}% off</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">✓ In Stock</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => addToCart(product, qty)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center shadow-md active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
            Add to Cart
          </button>
          <button
            onClick={async () => {
              await addToCart(product, qty);
              navigate("/checkout/shipping");
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            className="px-6 py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            style={{ borderColor: GOLD, color: MAROON, background: "#FFFFFF" }}>⚡ Buy</button>
        </div>
      </div>
    </div>
  );
}
