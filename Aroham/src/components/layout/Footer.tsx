import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";

const SOCIAL_LINKS = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com/aroham.in" },
  { Icon: Twitter,   label: "Twitter",   href: "https://twitter.com/aroham_in" },
  { Icon: Facebook,  label: "Facebook",  href: "https://facebook.com/aroham.in" },
  { Icon: Youtube,   label: "Youtube",   href: "https://youtube.com/@aroham" },
];

export function Footer() {
  return (
    <footer style={{ background: "#1A0D0E", color: "rgba(250,247,242,0.65)", fontFamily: SANS }}>
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${GOLD}40,transparent)` }} />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 lg:mb-12">
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${MAROON},${SAFFRON})` }}>
                <span className="text-xs font-bold" style={{ color: IVORY, fontFamily: SERIF }}>ॐ</span>
              </div>
              <span className="text-xl font-semibold" style={{ fontFamily: SERIF, color: IVORY }}>Aroham</span>
            </div>
            <p className="text-sm mb-4 leading-relaxed hidden lg:block" style={{ color: "rgba(250,247,242,0.5)" }}>India's most trusted premium platform for authentic Vedic products and spiritual guidance.</p>
            <p className="text-xs mb-4 leading-relaxed lg:hidden" style={{ color: "rgba(250,247,242,0.4)" }}>Authentic Vedic products & spiritual guidance.</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Icon size={14} style={{ color: "rgba(250,247,242,0.5)" }} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Products", links: [{ label: "Yantras", href: "/shop?category=Yantra" }, { label: "Pendants", href: "/shop?category=Pendant" }, { label: "Crystals", href: "/shop?category=Crystals" }, { label: "Rudraksha", href: "/shop?category=Rudraksha" }, { label: "Combo Kits", href: "/shop?title=Combo%20Deals" }] },
            { title: "Support",  links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping Policy", href: "/shipping" }, { label: "Return Policy", href: "/returns" }, { label: "Track Order", href: "/track" }, { label: "Contact Us", href: "/contact" }] },
            { title: "Company",  links: [{ label: "About Us", href: "#" }, { label: "Our Story", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }, { label: "Blog", href: "#" }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.15em] uppercase font-semibold mb-3 lg:mb-5" style={{ color: GOLD }}>{col.title}</h4>
              <ul className="space-y-2 lg:space-y-3">{col.links.map(l => <li key={l.label}><Link to={l.href} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(250,247,242,0.5)" }}>{l.label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div id="site-footer" className="pt-6 lg:pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>© 2025 Aroham. All rights reserved. Made with reverence in India.</p>
          <div className="flex gap-6 text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
