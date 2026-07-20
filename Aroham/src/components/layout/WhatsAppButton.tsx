import { useState } from "react";
import { useLocation } from "react-router";
import { MAROON } from "@/constants/theme";

export function WhatsAppButton() {
  const [open,setOpen]=useState(false);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/shop/");
  const bottomClass = isProductPage ? "bottom-[100px] lg:bottom-6" : "bottom-6";
  
  const questions=["Which Yantra is right for me?","How do I use my product?","Track my order"];
  return(
    <div className={`fixed ${bottomClass} right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300`}>
      {open&&(
        <div className="rounded-2xl p-4 w-64 shadow-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.1)"}}>
          <div className="flex items-center gap-2 mb-3 pb-3" style={{borderBottom:"1px solid rgba(91,31,36,0.08)"}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{background:"#25D366"}}>💬</div>
            <div>
              <div className="text-xs font-semibold" style={{color:MAROON,fontFamily:"'Playfair Display', Georgia, serif"}}>Vedic AI Assistant</div>
              <div className="text-[10px]" style={{color:"#4A8A4A"}}>● Online now</div>
            </div>
          </div>
          <p className="text-xs mb-3" style={{color:"#7A6A58"}}>Hi! How can I guide your spiritual journey today?</p>
          <div className="space-y-2">
            {questions.map(q=>(
              <button key={q} className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                style={{background:"rgba(200,160,68,0.08)",border:`1px solid rgba(200,160,68,0.2)`,color:MAROON}}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        aria-label="Open WhatsApp chat"
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all hover:scale-110"
        style={{ background: "#25D366" }}>
        💬
      </button>
    </div>
  );
}
