import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#FAF7F2" }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-6">ॐ</div>
        <h2 className="mb-3" style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 500, color: MAROON, lineHeight: 1.2 }}>
          Join India's Spiritual Community
        </h2>
        <p className="text-sm mb-8" style={{ color: "#7A6A58" }}>Auspicious dates, Vedic wisdom, exclusive offers &amp; early access to new products.</p>
        {joined ? (
          <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl" style={{ background: "rgba(200,160,68,0.1)", border: `1px solid rgba(200,160,68,0.3)` }}>
            <CheckCircle size={18} style={{ color: GOLD }} /><span className="text-sm font-medium" style={{ color: MAROON }}>Welcome to the Aroham community!</span>
          </div>
        ) : (
          <form className="flex gap-3 flex-col sm:flex-row" onSubmit={e => { e.preventDefault(); if (email) setJoined(true); }}>
            <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none"
              style={{ background: "#FFFFFF", border: `1px solid rgba(91,31,36,0.15)`, color: MAROON, fontFamily: SANS }}
              onFocus={e => { e.target.style.borderColor = GOLD; }} onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.15)"; }} />
            <button type="submit" className="px-7 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 whitespace-nowrap"
              style={{ background: MAROON, color: IVORY }}>Join Community</button>
          </form>
        )}
      </div>
    </section>
  );
}
