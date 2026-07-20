import { useState } from "react";
import { Star } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { COMMENTS_DATA } from "@/constants/data";
import { ArohamProduct } from "@/types/product";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { FloatingSelect } from "@/components/auth/FloatingSelect";

export function CommunityComments({ products = [] }: { products?: ArohamProduct[] }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [review, setReview] = useState({ name: "", rating: 5, text: "", product: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#FAF7F2" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{ color: GOLD, fontFamily: SANS }}>Community</span>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>What Our Community Says</h2>
            <p className="text-sm mt-1" style={{ color: "#7A6A58" }}>{COMMENTS_DATA.length} verified reviews · 4.8 average rating</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 self-start"
            style={{ background: MAROON, color: IVORY }}>
            ✍ Write a Review
          </button>
        </div>
        {showForm && (
          <div className="mb-10 rounded-3xl p-7" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 4px 30px rgba(91,31,36,0.07)" }}>
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🙏</div>
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: SERIF, color: MAROON }}>Thank You for Your Review!</h3>
                <p className="text-sm" style={{ color: "#7A6A58" }}>Your experience helps others in their spiritual journey.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: SERIF, color: MAROON }}>Share Your Experience</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <FloatingInput label="Your Name" value={review.name} onChange={v => setReview(r => ({ ...r, name: v }))} required />
                  <FloatingSelect label="Product Purchased" options={products.length ? products.map(p => p.name) : []} value={review.product} onChange={v => setReview(r => ({ ...r, product: v }))} />
                </div>
                <div className="mb-4">
                  <div className="text-xs font-semibold mb-2" style={{ color: MAROON }}>Your Rating</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setReview(r => ({ ...r, rating: n }))} className="transition-transform hover:scale-110">
                        <Star size={24} fill={n <= review.rating ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={review.text} onChange={e => setReview(r => ({ ...r, text: e.target.value }))}
                  placeholder="Share how this product has impacted your life…" rows={4}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none mb-4"
                  style={{ border: "1.5px solid rgba(91,31,36,0.12)", background: "#FAF7F2", color: "#222222", fontFamily: SANS }}
                  onFocus={e => { e.target.style.borderColor = GOLD; }} onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.12)"; }} />
                <button onClick={() => { if (review.name && review.text) setSubmitted(true); }}
                  className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                  Submit Review
                </button>
              </>
            )}
          </div>
        )}
        <div className="flex gap-5 overflow-x-auto pb-3 -mx-6 lg:-mx-10 px-6 lg:px-10 scroll-pl-6 lg:scroll-pl-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}>
          {COMMENTS_DATA.map((c, i) => (
            <div key={i} className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl flex-shrink-0"
              style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)", boxShadow: "0 2px 12px rgba(91,31,36,0.04)", width: "clamp(280px,80vw,340px)", scrollSnapAlign: "start" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex">{Array.from({ length: c.rating }).map((_, j) => <Star key={j} size={12} fill={GOLD} stroke={GOLD} strokeWidth={1.5} />)}</div>
                <span className="text-[10px]" style={{ color: "#9A8A78" }}>{c.date}</span>
              </div>
              <p className="text-sm leading-relaxed mb-3 italic" style={{ color: "#4A3A2A" }}>"{c.text}"</p>
              <div className="text-[10px] mb-4 px-2 py-1 rounded-lg inline-block" style={{ background: "rgba(200,160,68,0.08)", color: "#8B6914" }}>📦 {c.product}</div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(91,31,36,0.07)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: c.bg, color: GOLD, fontFamily: SERIF }}>{c.init}</div>
                  <div>
                    <div className="text-xs font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{c.name}</div>
                    <div className="text-[10px]" style={{ color: "#9A8A78" }}>{c.city} · ✓ Verified</div>
                  </div>
                </div>
                <button onClick={() => setLiked(l => ({ ...l, [i]: !l[i] }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all"
                  style={{ background: liked[i] ? "rgba(91,31,36,0.08)" : "rgba(91,31,36,0.04)", color: liked[i] ? MAROON : "#9A8A78", border: `1px solid ${liked[i] ? "rgba(91,31,36,0.2)" : "rgba(91,31,36,0.08)"}` }}>
                  {liked[i] ? "❤️" : "🤍"} {c.likes + (liked[i] ? 1 : 0)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
