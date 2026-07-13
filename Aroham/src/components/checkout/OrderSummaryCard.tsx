import { Lock, Gem, Flame, Shield, Package, Truck, CheckCircle } from "lucide-react";
import { MAROON, GOLD, IVORY, SERIF, PRICE_FONT } from "@/constants/theme";
import { CartItem } from "@/types/cart";
import { CheckoutProgress } from "./CheckoutProgress";

export function OrderSummaryCard({ cartItems, onBack, onNext, nextLabel, step }: {
  cartItems: CartItem[];
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  step: number;
}) {
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + 99 + Math.round(subtotal * 0.05);

  return (
    <div className="lg:sticky lg:top-24 ml-[-20px] mr-[0px] my-[0px]">
      <CheckoutProgress step={step} />
      <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 4px 30px rgba(91,31,36,0.07)" }}>
        <div className="px-6 pt-6 pb-4 lg:pt-4 lg:pb-3" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Order Summary</h2>
        </div>
        <div className="px-6 py-4 lg:py-3 space-y-3 lg:space-y-2" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
          {cartItems.map(({ product: p, qty }) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50"><img src={p.img} alt={p.name} className="w-full h-full object-cover" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p>
                <p className="text-[10px]" style={{ color: "#9A8A78" }}>Qty: {qty}</p>
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(p.price * qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-5 lg:py-3 space-y-3 lg:space-y-2">
          {[
            { label: "Subtotal",             value: `₹${subtotal.toLocaleString("en-IN")}`, green: false },
            { label: "Temple Energization",  value: "₹99",                                   green: false },
            { label: "Shipping",             value: "FREE",                                  green: true  },
            { label: "GST (5%)",             value: `₹${Math.round(subtotal * 0.05).toLocaleString("en-IN")}`, green: false },
          ].map(({ label, value, green }) => (
            <div key={label} className="flex justify-between text-sm">
              <span style={{ color: "#7A6A58" }}>{label}</span>
              <span style={{ color: green ? "#4A8A4A" : MAROON, fontFamily: PRICE_FONT, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,rgba(200,160,68,0.3),transparent)` }} />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold" style={{ color: MAROON }}>Grand Total</span>
            <span className="text-2xl font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="px-6 pb-6 lg:pb-4 space-y-3 lg:space-y-2">
          <button onClick={onNext}
            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
            <Lock size={14} /> {nextLabel}
          </button>
          <button onClick={onBack} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON }}>← Back</button>
        </div>
      </div>
      <div className="rounded-2xl px-5 py-4 mt-4" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)" }}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Gem,         label: "100% Authentic"   },
            { icon: Flame,       label: "Temple Energized" },
            { icon: Shield,      label: "Secure Payments"  },
            { icon: Package,     label: "Easy Returns"     },
            { icon: Truck,       label: "Fast Delivery"    },
            { icon: CheckCircle, label: "Trusted Brand"    },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} style={{ color: GOLD, flexShrink: 0 }} strokeWidth={1.5} />
              <span className="text-[10px] font-medium" style={{ color: "#5A4A3A" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
