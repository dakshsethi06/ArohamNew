import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, X, ArrowRight } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { useProducts } from "@/hooks/useProducts";
import { ArohamProduct } from "@/types/product";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { products } = useProducts();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || (Array.isArray(p.description) ? p.description.join(" ") : (p.description || "")).toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/shop/${slug}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className="absolute top-[80px] right-6 lg:right-32 w-[calc(100vw-48px)] lg:w-[420px] z-[100] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all" style={{ background: "rgba(15,10,12,0.98)", backdropFilter: "blur(16px)", borderColor: "rgba(200,160,68,0.2)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        {/* Header / Search Bar */}
        <div className="w-full p-4 relative flex items-center gap-3 border-b" style={{ borderColor: "rgba(200,160,68,0.1)" }}>
          <Search size={18} style={{ color: GOLD }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for yantras, rudraksha..."
            className="flex-1 bg-transparent border-none outline-none text-base placeholder:opacity-40"
            style={{ color: IVORY, fontFamily: SANS }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-white/10 transition-colors" style={{ color: IVORY }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 w-full">
          {query.trim().length > 1 && (
            <div className="mb-3 text-[11px] font-medium tracking-wider uppercase" style={{ color: "rgba(250,247,242,0.5)", fontFamily: SANS }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
          )}

          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.map(product => (
                <div 
                  key={product.id}
                  onClick={() => handleSelect(product.slug)}
                  className="group cursor-pointer rounded-xl overflow-hidden relative flex items-center gap-4 p-2 transition-colors hover:bg-white/5"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: IVORY, fontFamily: SERIF }}>{product.name}</h3>
                    <div className="font-medium text-xs mt-0.5" style={{ color: GOLD, fontFamily: SANS }}>₹{(product.price / 100).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length > 1 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "rgba(250,247,242,0.5)" }}>No matches found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(250,247,242,0.3)" }}>Popular:</span>
              {["Shree Yantra", "Rudraksha", "Navagraha", "Consultation"].map(term => (
                <button 
                  key={term} 
                  onClick={() => setQuery(term)}
                  className="text-left text-sm px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "rgba(250,247,242,0.7)" }}
                >
                  <Search size={14} className="inline mr-2 opacity-50" /> {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
