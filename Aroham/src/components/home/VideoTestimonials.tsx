import { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { VIDEO_REVIEWS, yantraPlateImg, gemstonImg, pendantSilImg } from "@/constants/data";

const BASE_REELS = [
  ...VIDEO_REVIEWS,
  { name: "Kiran Pillai", city: "Thiruvananthapuram", product: "Pyrite Sun Ring",   rating: 5, thumb: yantraPlateImg, init: "KP", bg: "#2D5A2D", duration: "1:47", review: "The ring transformed the energy of my home completely. Even my neighbours noticed a change in the atmosphere!" },
  { name: "Pooja Desai",  city: "Surat",              product: "Love & Money Metal Bracelet",   rating: 5, thumb: gemstonImg,    init: "PD", bg: "#5B1F24", duration: "2:33", review: "I wear the bracelet every day. My clarity and focus have improved dramatically since I started using it." },
  { name: "Aryan Kapoor", city: "Delhi",              product: "Dhan Yog Necklace",          rating: 5, thumb: pendantSilImg, init: "AK", bg: "#2D4A8B", duration: "1:12", review: "The craftsmanship is extraordinary. I wear it every day and feel genuinely protected. A true sacred artifact." },
];

export function VideoTestimonials() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const n = BASE_REELS.length;
  const ALL_REELS = [...BASE_REELS, ...BASE_REELS, ...BASE_REELS];

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToIndex = (idx: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.clientWidth / 2 + child.offsetWidth / 2, behavior: smooth ? "smooth" : "instant" });
  };

  const scrollTo = (i: number) => {
    const mid = n + i;
    setActive(i);
    scrollToIndex(mid);
  };

  const prev = () => scrollTo((active - 1 + n) % n);
  const next = () => scrollTo((active + 1) % n);

  useEffect(() => {
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => { scrollToIndex(n + active, false); });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2-second auto-slide timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      next();
    }, 2000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, active, n]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let snapTimer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let closest = 0, minDist = Infinity;
        Array.from(el.children).forEach((child, ci) => {
          const c = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
          const dist = Math.abs(c - center);
          if (dist < minDist) { minDist = dist; closest = ci; }
        });
        const realIdx = closest % n;
        setActive(realIdx);
        if (closest < n) { scrollToIndex(n + realIdx, false); }
        else if (closest >= n * 2) { scrollToIndex(n + realIdx, false); }
      }, 100);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(snapTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-20 px-0 overflow-hidden"
      style={{ background: "#0D0508" }}
    >
      <style>{`
        .reel-scroll{scrollbar-width:none;}
        .reel-scroll::-webkit-scrollbar{display:none;}
      `}</style>
      <div className="text-center mb-10 px-6">
        <span className="text-xs tracking-[0.25em] uppercase font-medium mb-3 block" style={{ color: SAFFRON, fontFamily: SANS }}>Real Transformations</span>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: IVORY }}>Customer Stories</h2>
        <p className="text-sm mt-2" style={{ color: "rgba(250,247,242,0.5)", fontFamily: SANS }}>Real experiences shared by our sacred community</p>
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div
          ref={scrollRef}
          className="reel-scroll flex items-center gap-5 overflow-x-auto px-8 lg:px-16"
          style={{ scrollSnapType: "x mandatory", paddingBottom: "12px", minHeight: isMobile ? 420 : 450 }}
        >
          {ALL_REELS.map((v, i) => {
            const isActive = (i % n) === active;

            return (
              <div key={i} onClick={() => scrollTo(i % n)}
                className="flex-shrink-0 relative cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden"
                style={{
                  width: isMobile ? 260 : 290,
                  height: isMobile ? 400 : 430,
                  scrollSnapAlign: "center",
                  border: isActive ? `2px solid ${GOLD}` : "1px solid rgba(200,160,68,0.18)",
                  boxShadow: isActive
                    ? `0 0 24px rgba(200,160,68,0.3), 0 16px 40px rgba(0,0,0,0.8)`
                    : "0 8px 24px rgba(0,0,0,0.4)",
                  transform: isActive ? "scale(1.02)" : "scale(0.97)",
                  opacity: isActive ? 1 : 0.75
                }}
              >
                <img src={v.thumb} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,transparent 30%,transparent 40%,rgba(0,0,0,0.88) 100%)" }} />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(200,160,68,0.9)", color: "#1A0D0E" }}>✓ Verified</span>
                  <div className="flex">{Array.from({ length: v.rating }).map((_, j) => <Star key={j} size={9} fill={GOLD} stroke="none" />)}</div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[11px] leading-relaxed mb-3 italic" style={{ color: "rgba(250,247,242,0.9)", fontFamily: SANS }}>
                    "{v.review.slice(0, 90)}{v.review.length > 90 ? "…" : ""}"
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: v.bg, color: GOLD, fontFamily: SERIF }}>{v.init}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ fontFamily: SERIF, color: IVORY }}>{v.name}</div>
                      <div className="text-[10px]" style={{ color: "rgba(250,247,242,0.55)" }}>{v.city}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[9px] px-2.5 py-1 rounded-full inline-block" style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.25)", color: GOLD }}>📦 {v.product}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {BASE_REELS.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ width: active === i ? 24 : 6, height: 6, background: active === i ? GOLD : "rgba(200,160,68,0.25)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
