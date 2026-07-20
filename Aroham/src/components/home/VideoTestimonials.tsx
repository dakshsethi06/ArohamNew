import { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { VIDEO_REVIEWS, navratnaImg, pyramidImg, baglaImg, yantraPlateImg, gemstonImg, pendantSilImg } from "@/constants/data";

const BASE_REELS = [
  ...VIDEO_REVIEWS,
  { name: "Kiran Pillai", city: "Thiruvananthapuram", product: "Pyrite Sun Ring",   rating: 5, thumb: yantraPlateImg, init: "KP", bg: "#2D5A2D", duration: "1:47", review: "The ring transformed the energy of my home completely. Even my neighbours noticed a change in the atmosphere!" },
  { name: "Pooja Desai",  city: "Surat",              product: "Love & Money Metal Bracelet",   rating: 5, thumb: gemstonImg,    init: "PD", bg: "#5B1F24", duration: "2:33", review: "I wear the bracelet every day. My clarity and focus have improved dramatically since I started using it." },
  { name: "Aryan Kapoor", city: "Delhi",              product: "Dhan Yog Necklace",          rating: 5, thumb: pendantSilImg, init: "AK", bg: "#2D4A8B", duration: "1:12", review: "The craftsmanship is extraordinary. I wear it every day and feel genuinely protected. A true sacred artifact." },
];

export function VideoTestimonials() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const n = BASE_REELS.length;
  const ALL_REELS = [...BASE_REELS, ...BASE_REELS, ...BASE_REELS];

  const scrollToIndex = (idx: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.clientWidth / 2 + child.offsetWidth / 2, behavior: smooth ? "smooth" : "instant" });
  };

  const scrollTo = (i: number) => {
    const mid = n + i;
    setActive(i); setPlaying(false);
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
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
      setPlaying(false);

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (closest < n) { scrollToIndex(n + realIdx, false); }
        else if (closest >= n * 2) { scrollToIndex(n + realIdx, false); }
      }, 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section className="py-20 px-0 overflow-hidden" style={{ background: "#0D0508" }}>
      <style>{`
        @keyframes reelPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,160,68,0.4)}50%{box-shadow:0 0 0 8px rgba(200,160,68,0)}}
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronLeft size={18} />
        </button>
        <button aria-label="Next testimonial" onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronRight size={18} />
        </button>
        <div ref={scrollRef}
          className="reel-scroll flex items-center gap-2 md:gap-4 overflow-x-auto px-[calc(50vw-110px)] lg:px-[calc(50vw-130px)]"
          style={{ scrollSnapType: "x mandatory", paddingBottom: "20px", paddingTop: "20px" }}>
          {ALL_REELS.map((v, i) => {
            const isActive = (i % n) === active;
            return (
              <div key={i} onClick={() => scrollTo(i % n)}
                className="flex-shrink-0 relative cursor-pointer w-[220px] h-[390px] lg:w-[260px] lg:h-[460px]"
                style={{
                  borderRadius: 24, overflow: "hidden", scrollSnapAlign: "center",
                  transform: isActive ? "scale(1)" : "scale(0.85)", opacity: isActive ? 1 : 0.4,
                  border: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                  transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  boxShadow: isActive ? `0 0 0 1px rgba(200,160,68,0.2), 0 24px 60px rgba(0,0,0,0.6)` : "none" }}>
                <img src={v.thumb} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,transparent 30%,transparent 40%,rgba(0,0,0,0.85) 100%)" }} />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(200,160,68,0.9)", color: "#1A0D0E" }}>✓ Verified</span>
                  </div>
                  <div className="flex">{Array.from({ length: v.rating }).map((_, j) => <Star key={j} size={9} fill={GOLD} stroke="none" />)}</div>
                </div>
                {isActive && (
                  <button onClick={e => { e.stopPropagation(); setPlaying(p => !p); }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: playing ? "rgba(200,160,68,0.9)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: `1.5px solid ${playing ? GOLD : "rgba(255,255,255,0.35)"}`, animation: !playing ? "reelPulse 2s ease-in-out infinite" : "none" }}>
                    {playing
                      ? <div className="flex gap-1"><div className="w-1 h-5 rounded-full" style={{ background: MAROON }} /><div className="w-1 h-5 rounded-full" style={{ background: MAROON }} /></div>
                      : <div className="ml-1" style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "14px solid white" }} />}
                  </button>
                )}
                {isActive && playing && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(10,5,8,0.7)" }}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-xs" style={{ color: "rgba(250,247,242,0.7)", fontFamily: SANS }}>Now playing…</p>
                      <p className="text-[10px] mt-1" style={{ color: GOLD, fontFamily: SANS }}>{v.duration}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "white", display: isActive ? "none" : "block" }}>▶ {v.duration}</div>
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
            <button key={i} onClick={() => scrollTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ width: active === i ? 20 : 6, height: 6, background: active === i ? GOLD : "rgba(200,160,68,0.25)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
