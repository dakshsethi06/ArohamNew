import { MAROON, GOLD, SERIF, SANS } from "@/constants/theme";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    q: "How are the products energized before shipping?",
    a: "Every sacred item undergoes 'Pran Pratishtha'—an authentic Vedic ritual performed by expert Pandits. We use your name, gotra, and birth details during the mantra chanting to align the item's frequency with your aura. This process takes 2-3 days before dispatch."
  },
  {
    q: "Are the Rudrakshas and Gemstones certified authentic?",
    a: "Yes. 100% of our premium Rudrakshas and Gemstones are shipped with a physical Lab Certificate of Authenticity proving their origin, natural state, and un-tampered quality."
  },
  {
    q: "How long will it take to receive my order?",
    a: "After the 2-3 day energization process, delivery takes 3-5 business days for Metro cities, and 7-10 business days for the rest of India."
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, we focus on pan-India delivery to ensure the sacred items reach you safely and within predictable timelines. International shipping will be launched soon."
  },
  {
    q: "What should I do if my Rudraksha cracks or breaks?",
    a: "A cracked Rudraksha should not be worn, as it loses its geometric energy structure. If it arrives cracked in transit, please send us an unboxing video within 24 hours for a free replacement. If it cracks later due to mishandling or extreme temperature changes, it is considered physically damaged by the user."
  },
  {
    q: "Can I return a product if I change my mind?",
    a: "Yes, we have a 7-day return policy for unused items in their original condition with all certificates. However, highly customized ritual items may be exempt. Please refer to our Return Policy page for exact details."
  }
];

export function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-4xl md:text-5xl font-medium mb-4">Frequently Asked Questions</h1>
          <div className="h-1 w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <p className="mt-6 text-[#7A6A58]">Find answers to common questions about our products, energization process, and logistics.</p>
        </div>
        
        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[rgba(91,31,36,0.05)] shadow-sm transition-all duration-300">
                <button 
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span style={{ fontFamily: SERIF, color: MAROON }} className="text-lg font-medium pr-4">{faq.q}</span>
                  <ChevronDown size={20} className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} style={{ color: GOLD }} />
                </button>
                <div 
                  className={`px-6 transition-all duration-300 ease-in-out overflow-hidden`}
                  style={{ maxHeight: isOpen ? "200px" : "0px", opacity: isOpen ? 1 : 0 }}
                >
                  <p className="pb-6 leading-relaxed" style={{ color: "#4A3A2A" }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
