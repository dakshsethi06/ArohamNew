import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";

export function Footer() {
  return (
    <footer style={{ background: "#1A0D0E", color: "rgba(250,247,242,0.65)", fontFamily: SANS }}>
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${GOLD}40,transparent)` }} />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${MAROON},${SAFFRON})` }}>
                <span className="text-xs font-bold" style={{ color: IVORY, fontFamily: SERIF }}>ॐ</span>
              </div>
              <span className="text-xl font-semibold" style={{ fontFamily: SERIF, color: IVORY }}>Aroham</span>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>India's most trusted premium platform for authentic Vedic products and spiritual guidance.</p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <button key={i} aria-label={["Instagram", "Twitter", "Facebook", "Youtube"][i]} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Icon size={14} style={{ color: "rgba(250,247,242,0.5)" }} />
                </button>
              ))}
            </div>
          </div>
          {[
            { title: "Products", links: ["Yantras", "Pendants", "Crystals", "Rudraksha", "Combo Kits"] },
            { title: "Support",  links: ["FAQ", "Shipping Policy", "Return Policy", "Track Order", "Contact Us"] },
            { title: "Company",  links: ["About Us", "Our Story", "Careers", "Press", "Blog"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.15em] uppercase font-semibold mb-5" style={{ color: GOLD }}>{col.title}</h4>
              <ul className="space-y-3">{col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(250,247,242,0.5)" }}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div id="site-footer" className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>© 2025 Aroham. All rights reserved. Made with reverence in India.</p>
          <div className="flex gap-6 text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
