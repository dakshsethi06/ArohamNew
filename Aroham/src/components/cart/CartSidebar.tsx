import { useNavigate } from "react-router";
import { X, ChevronLeft, Minus, Plus, Trash2, Lock } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function CartSidebar() {
  const navigate = useNavigate();
  const { items, closeCart, removeFromCart, updateQty } = useCart();
  const { isLoggedIn, openAuth } = useAuth();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + 99 + Math.round(subtotal * 0.05);

  return (
    <div role="dialog" aria-modal="true" aria-label="Shopping cart" className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative w-full max-w-md flex flex-col h-full shadow-2xl"
        style={{ background: "#FFFFFF", transform: "translateX(0)", transition: "transform 0.3s ease" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid rgba(91,31,36,0.08)` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => { closeCart(); navigate("/"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm active:scale-95"
              style={{ background: "rgba(91,31,36,0.07)", color: MAROON, border: `1px solid rgba(91,31,36,0.12)` }}>
              <ChevronLeft size={13} /> Home
            </button>
            <div>
              <h2 className="text-lg font-semibold leading-tight" style={{ fontFamily: SERIF, color: MAROON }}>Your Cart</h2>
              <p className="text-xs" style={{ color: "#9A8A78" }}>{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button aria-label="Close cart" onClick={closeCart} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: MAROON }}><X size={20} /></button>
        </div>
        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🪷</div>
              <p className="text-sm font-semibold mb-1" style={{ fontFamily: SERIF, color: MAROON }}>Your cart is peaceful</p>
              <p className="text-xs" style={{ color: "#7A6A58" }}>Add sacred products to begin your journey</p>
              <button onClick={closeCart} className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium" style={{ background: MAROON, color: IVORY }}>Explore Products</button>
            </div>
          ) : items.map(({ product: p, qty }) => (
            <div key={p.id} className="flex gap-3 p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)" }}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                <img src={p.img} alt={`${p.name} - ${p.subtitle}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-snug mb-0.5" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p>
                <p className="text-[10px] mb-2" style={{ color: "#9A8A78" }}>{p.subtitle}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full overflow-hidden" style={{ border: `1.5px solid rgba(91,31,36,0.12)` }}>
                    <button aria-label="Decrease quantity" onClick={() => updateQty(p.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5" style={{ color: MAROON }}><Minus size={11} /></button>
                    <span className="w-6 text-center text-xs font-semibold" style={{ color: MAROON }}>{qty}</span>
                    <button aria-label="Increase quantity" onClick={() => updateQty(p.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5" style={{ color: MAROON }}><Plus size={11} /></button>
                  </div>
                  <span className="text-sm font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(p.price * qty).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button aria-label={`Remove ${p.name}`} onClick={() => removeFromCart(p.id)} className="p-1 self-start hover:opacity-60 transition-opacity" style={{ color: "#9A8A78" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5" style={{ borderTop: `1px solid rgba(91,31,36,0.08)` }}>
            <div className="space-y-2 mb-4">
              {[
                { label: "Subtotal", value: `₹${subtotal.toLocaleString("en-IN")}`, green: false },
                { label: "Temple Energization", value: "₹99", green: false },
                { label: "Shipping", value: "FREE", green: true },
                { label: "GST (5%)", value: `₹${Math.round(subtotal * 0.05).toLocaleString("en-IN")}`, green: false },
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-xs" style={{ color: "#7A6A58" }}>
                  <span>{label}</span>
                  <span style={{ color: green ? "#4A8A4A" : MAROON, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold pt-2" style={{ borderTop: `1px solid rgba(91,31,36,0.08)`, color: MAROON }}>
                <span>Grand Total</span>
                <span style={{ fontFamily: PRICE_FONT, fontSize: "1.1rem" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button onClick={() => { 
              if (!isLoggedIn) {
                closeCart();
                openAuth();
              } else {
                closeCart(); 
                navigate("/checkout/shipping"); 
              }
            }}
              className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
              <Lock size={14} /> Proceed to Checkout
            </button>
            <button onClick={closeCart} className="w-full py-3 text-sm font-medium text-center mt-2 hover:opacity-70 transition-opacity" style={{ color: MAROON }}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
