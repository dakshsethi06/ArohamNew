import { useState } from "react";
import { useNavigate } from "react-router";
import { X, ChevronLeft, Minus, Plus, Trash2, Lock, Tag } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function CartSidebar() {
  const navigate = useNavigate();
  const { items, closeCart, removeFromCart, updateQty, subtotal, discount, total, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { isLoggedIn, openAuth } = useAuth();
  const [inputCode, setInputCode] = useState("");
  const [msg, setMsg] = useState<{ success: boolean; message: string } | null>(null);

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
        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5" style={{ borderTop: `1px solid rgba(91,31,36,0.08)` }}>
            {/* Coupon Code Section */}
            <div className="mb-4 p-3 rounded-2xl" style={{ background: "rgba(200,160,68,0.05)", border: "1px dashed rgba(200,160,68,0.3)" }}>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: MAROON }}>
                <Tag size={13} style={{ color: GOLD }} />
                <span>Apply Coupon Code</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid rgba(74,138,74,0.3)" }}>
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(74,138,74,0.1)", color: "#4A8A4A" }}>{appliedCoupon.code}</span>
                    <p className="text-[10px] mt-0.5" style={{ color: "#7A6A58" }}>{appliedCoupon.label}</p>
                  </div>
                  <button onClick={() => { removeCoupon(); setMsg(null); }} className="text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded" style={{ color: "#C04040" }}>✕ Remove</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={e => { setInputCode(e.target.value); setMsg(null); }}
                      placeholder="Enter code (e.g. AROHAM10)"
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs outline-none uppercase font-semibold"
                      style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FFFFFF", color: MAROON }}
                    />
                    <button
                      onClick={() => {
                        if (!inputCode.trim()) return;
                        const res = applyCoupon(inputCode);
                        setMsg(res);
                        if (res.success) setInputCode("");
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all active:scale-95"
                      style={{ background: MAROON, color: IVORY }}
                    >
                      Apply
                    </button>
                  </div>
                  {msg && (
                    <p className={`text-[10px] font-medium mt-1.5 ${msg.success ? "text-emerald-600" : "text-red-500"}`}>
                      {msg.success ? "✓ " : "✕ "}{msg.message}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs" style={{ color: "#7A6A58" }}>
                <span>Subtotal</span>
                <span style={{ color: MAROON, fontWeight: 600 }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-xs" style={{ color: "#4A8A4A" }}>
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-semibold">−₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-xs" style={{ color: "#7A6A58" }}>
                <span>Shipping</span>
                <span style={{ color: "#4A8A4A", fontWeight: 600 }}>FREE</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: "#7A6A58" }}>
                <span>GST (5%)</span>
                <span style={{ color: MAROON, fontWeight: 600 }}>₹{Math.round(Math.max(0, subtotal - discount) * 0.05).toLocaleString("en-IN")}</span>
              </div>

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
