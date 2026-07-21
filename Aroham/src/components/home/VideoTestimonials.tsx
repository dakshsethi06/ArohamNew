import { useState, useRef, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { VIDEO_REVIEWS, navratnaImg, pyramidImg, baglaImg, yantraPlateImg, gemstonImg, pendantSilImg } from "@/constants/data";

const REVIEWS = VIDEO_REVIEWS;

export function VideoTestimonials() {
  const [active, setActive] = useState(0);
  const n = REVIEWS.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setActive(((i % n) + n) % n);
  }, [n]);

  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  // Auto-rotate every 4s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % n);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  // Reset timer on manual interaction
  const manualGo = (dir: "prev" | "next") => {
    if (timerRef.current) clearInterval(timerRef.current);
    dir === "prev" ? prev() : next();
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % n);
    }, 4000);
  };

  // Build visible cards: show 5 cards centered on active
  const getVisible = () => {
    const cards: { review: typeof REVIEWS[0]; offset: number; realIdx: number }[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = ((active + offset) % n + n) % n;
      cards.push({ review: REVIEWS[idx], offset, realIdx: idx });
    }
    return cards;
  };

  const cards = getVisible();

  return (
    <section className="py-12 px-0 overflow-hidden" style={{ background: "#0D0508" }}>
      <div className="text-center mb-8 px-6">
        <span className="text-xs tracking-[0.25em] uppercase font-medium mb-2 block" style={{ color: SAFFRON, fontFamily: SANS }}>Real Transformations</span>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 500, color: IVORY }}>Customer Stories</h2>
        <p className="text-xs mt-1" style={{ color: "rgba(250,247,242,0.5)", fontFamily: SANS }}>Scroll through real stories from our community</p>
      </div>

      <div className="relative flex items-center justify-center" style={{ minHeight: 440 }}>
        {/* Left button */}
        <button aria-label="Previous testimonial" onClick={() => manualGo("prev")}
          className="absolute left-4 sm:left-8 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronLeft size={18} />
        </button>

        {/* Right button */}
        <button aria-label="Next testimonial" onClick={() => manualGo("next")}
          className="absolute right-4 sm:right-8 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(200,160,68,0.15)", border: "1px solid rgba(200,160,68,0.3)", color: GOLD, backdropFilter: "blur(8px)" }}>
          <ChevronRight size={18} />
        </button>

        {/* Cards */}
        <div className="relative flex items-center justify-center" style={{ width: "100%", height: 430 }}>
          {cards.map(({ review: v, offset, realIdx }) => {
            const isCenter = offset === 0;
            const absOff = Math.abs(offset);
            const w = isCenter ? 260 : 200;
            const h = isCenter ? 420 : 340;
            const scale = isCenter ? 1 : 0.88;
            const opacity = isCenter ? 1 : absOff === 1 ? 0.6 : 0.2;
            const translateX = offset * 280;
            const zIndex = 10 - absOff;

            return (
              <div key={v.name}
                className="absolute"
                style={{
                  width: w, height: h, borderRadius: 24, overflow: "hidden",
                  transform: `translateX(${translateX}px) translateZ(0) scale(${scale})`,
                  opacity,
                  zIndex,
                  border: isCenter ? `2px solid ${GOLD}` : "2px solid transparent",
                  boxShadow: isCenter ? `0 0 0 1px rgba(200,160,68,0.2), 0 20px 50px rgba(0,0,0,0.6)` : "none",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, border 0.5s ease",
                  willChange: "transform, opacity",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (offset !== 0) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    goTo(realIdx);
                    timerRef.current = setInterval(() => { setActive(a => (a + 1) % n); }, 3000);
                  }
                }}
              >
                <img src={v.thumb} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,transparent 30%,transparent 40%,rgba(0,0,0,0.85) 100%)" }} />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(200,160,68,0.9)", color: "#1A0D0E" }}>✓ Verified</span>
                  </div>
                  <div className="flex">{Array.from({ length: v.rating }).map((_, j) => <Star key={j} size={9} fill={GOLD} stroke="none" />)}</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {isCenter && <p className="text-[11px] leading-relaxed mb-3 italic" style={{ color: "rgba(250,247,242,0.85)", fontFamily: SANS }}>"{v.review.slice(0, 90)}{v.review.length > 90 ? "…" : ""}"</p>}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: v.bg, color: GOLD, fontFamily: SERIF }}>{v.init}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ fontFamily: SERIF, color: IVORY }}>{v.name}</div>
                      <div className="text-[10px]" style={{ color: "rgba(250,247,242,0.55)" }}>{v.city}</div>
                    </div>
                  </div>
                  {isCenter && <div className="mt-2 text-[9px] px-2 py-1 rounded-full inline-block" style={{ background: "rgba(200,160,68,0.12)", border: "1px solid rgba(200,160,68,0.2)", color: GOLD }}>{v.product}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {REVIEWS.map((_, i) => (
          <button key={i} onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            goTo(i);
            timerRef.current = setInterval(() => { setActive(a => (a + 1) % n); }, 3000);
          }}
            className="rounded-full transition-all duration-300"
            style={{ width: active === i ? 20 : 6, height: 6, background: active === i ? GOLD : "rgba(200,160,68,0.25)" }} />
        ))}
      </div>
    </section>
  );
}
