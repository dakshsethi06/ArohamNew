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
  const [centerIndex, setCenterIndex] = useState(n);
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

  // 2-second auto-slide timer with hover pause
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
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0, minDist = Infinity;
      Array.from(el.children).forEach((child, ci) => {
        const c = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
        const dist = Math.abs(c - center);
        if (dist < minDist) { minDist = dist; closest = ci; }
      });
      const realIdx = closest % n;
      setActive(realIdx);
      setCenterIndex(closest);

      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
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
        <p className="text-sm mt-2" style={{ color: "rgba(250,247,242,0.5)", fontFamily: SANS }}>Scroll through real stories from our community</p>
      </div>
      <div className="relative">
        <button aria-label="Previous testimonial" onClick={prev}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronLeft size={18} />
        </button>
        <button aria-label="Next testimonial" onClick={next}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronRight size={18} />
        </button>

        <div ref={scrollRef}
          className="reel-scroll flex items-center gap-4 overflow-x-auto px-[max(2rem,calc(50vw-140px))]"
          style={{ scrollSnapType: "x mandatory", paddingBottom: "4px", minHeight: isMobile ? 484 : 464, perspective: 1200, WebkitMaskImage: isMobile ? "none" : "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", maskImage: isMobile ? "none" : "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
          {ALL_REELS.map((v, i) => {
            const isActive = (i % n) === active;
            let diff = i - centerIndex;
            
            let rotY = 0;
            let sc = 1;
            let op = 1;
            
            if (isMobile) {
              if (diff === 0) { sc = 1; op = 1; }
              else { sc = 0.95; op = 0.4; }
            } else {
              if (diff === 0) {
                rotY = 0; sc = 1; op = 1;
              } else if (diff === -1) {
                rotY = 22; sc = 0.93; op = 0.6;
              } else if (diff === 1) {
                rotY = -22; sc = 0.93; op = 0.6;
              } else if (diff <= -2) {
                rotY = 40; sc = 0.85; op = 0.2;
              } else if (diff >= 2) {
                rotY = -40; sc = 0.85; op = 0.2;
              }
            }

            const mobileWidth = isActive ? 300 : 280;
            const mobileHeight = isActive ? 480 : 450;
            const desktopWidth = isActive ? 260 : 200;
            const desktopHeight = isActive ? 460 : 355;

            return (
              <div key={i} onClick={() => scrollTo(i % n)}
                className="flex-shrink-0 relative cursor-pointer transition-all duration-500"
                style={{ width: isMobile ? mobileWidth : desktopWidth, height: isMobile ? mobileHeight : desktopHeight, borderRadius: 24, overflow: "hidden", scrollSnapAlign: "center",
                  transform: isMobile ? `scale(${sc})` : `perspective(1000px) rotateY(${rotY}deg) scale(${sc})`, opacity: op,
                  border: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                  transition: "transform 0.3s ease, opacity 0.3s ease",
                  boxShadow: isActive ? `0 0 0 1px rgba(200,160,68,0.2), 0 24px 60px rgba(0,0,0,0.6)` : "none" }}>
                <img src={v.thumb} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,transparent 30%,transparent 40%,rgba(0,0,0,0.85) 100%)" }} />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(200,160,68,0.9)", color: "#1A0D0E" }}>✓ Verified</span>
                  </div>
                  <div className="flex">{Array.from({ length: v.rating }).map((_, j) => <Star key={j} size={9} fill={GOLD} stroke="none" />)}</div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {isActive && <p className="text-[11px] leading-relaxed mb-3 italic" style={{ color: "rgba(250,247,242,0.85)", fontFamily: SANS }}>"{v.review.slice(0, 90)}{v.review.length > 90 ? "…" : ""}"</p>}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: v.bg, color: GOLD, fontFamily: SERIF }}>{v.init}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ fontFamily: SERIF, color: IVORY }}>{v.name}</div>
                      <div className="text-[10px]" style={{ color: "rgba(250,247,242,0.55)" }}>{v.city}</div>
                    </div>
                  </div>
                  {isActive && <div className="mt-2 text-[9px] px-2 py-1 rounded-full inline-block" style={{ background: "rgba(200,160,68,0.12)", border: "1px solid rgba(200,160,68,0.2)", color: GOLD }}>{v.product}</div>}
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
