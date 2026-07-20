import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay public key — safe to expose in frontend
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T905SJtpz903AN";

function CheckoutHeader() {
  const navigate = useNavigate();
  return (
    <div className="w-full" style={{ background: "rgba(250,247,242,0.97)", borderBottom: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 1px 12px rgba(91,31,36,0.05)" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-14 lg:h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg,${MAROON},#E78B2F)`, color: IVORY, fontFamily: SERIF }}>ॐ</div>
          <span className="hidden sm:inline text-lg lg:text-xl font-semibold tracking-wide" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
        </button>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#9A8A78" }}>Secure Checkout</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(200,160,68,0.1)", border: "1px solid rgba(200,160,68,0.22)" }}>
          <Lock size={10} style={{ color: GOLD }} /><span className="text-[10px] font-semibold" style={{ color: "#8B6914" }}>SSL Secured</span>
        </div>
      </div>
    </div>
  );
}

export function PaymentPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + Math.round(subtotal * 0.05);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (items.length === 0) { alert("Your cart is empty."); return; }

    setPlacing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) { alert("Failed to load Razorpay. Please check your connection."); setPlacing(false); return; }

      // Read shipping address saved by ShippingPage
      const shippingAddr = (() => {
        try { return JSON.parse(sessionStorage.getItem("aroham_shipping_addr") || "null"); } catch { return null; }
      })();

      // Create Order on Backend — match exact backend contract
      const orderData = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(i => ({ id: i.product.id, qty: i.qty })),
          address: shippingAddr,
          checkoutType: "cart"
        })
      });

      const rzpKey = orderData.keyId || RAZORPAY_KEY_ID;
      const rzpOrderId = orderData.razorpayOrderId;
      const internalOrderId = orderData.orderId;

      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Aroham",
        description: "Sacred Products – Temple Energized",
        image: "/favicon.ico",
        order_id: rzpOrderId,
        handler: async function (response: any) {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                orderId: internalOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            await clearCart();
            sessionStorage.removeItem("aroham_shipping_addr");
            // Store order ID for confirmation page
            sessionStorage.setItem("aroham_last_order_id", String(internalOrderId));
            navigate("/checkout/confirm");
          } catch (e: any) {
            alert("Payment verification failed: " + e.message);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "Customer",
          email: user?.email || "",
          contact: user?.user_metadata?.phone || ""
        },
        notes: { items_count: items.length },
        theme: { color: MAROON },
        modal: {
          ondismiss: () => setPlacing(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + (response.error?.description || "Please try again."));
        setPlacing(false);
      });
      rzp.open();

    } catch (e: any) {
      alert("Error initiating payment: " + e.message);
      setPlacing(false);
    }
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <CheckoutHeader />
      {/* Page header */}
      <div className="pt-3 pb-5 lg:pt-2 lg:pb-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5EDE0,#FAF7F2,#F0E8D8)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px)` }} />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 lg:mb-3 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md active:scale-95" style={{ background: "#FFFFFF", color: MAROON, border: `1px solid rgba(91,31,36,0.15)`, boxShadow: "0 2px 8px rgba(91,31,36,0.08)" }}>
            <ChevronLeft size={16} /> Back to Delivery
          </button>
          <div className="flex items-center gap-2 mb-3 lg:mb-2 text-xs" style={{ color: "#9A8A78" }}>
            <span>Cart</span><ChevronRight size={12} /><span style={{ color: MAROON }}>Delivery Details</span><ChevronRight size={12} /><span className="font-medium" style={{ color: MAROON }}>Payment</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 500, color: MAROON, lineHeight: 1.1 }}>Secure Payment</h1>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(200,160,68,0.12)", border: "1px solid rgba(200,160,68,0.25)" }}>
              <Lock size={11} style={{ color: GOLD }} /><span className="text-[10px] font-semibold" style={{ color: "#8B6914" }}>256-bit SSL</span>
            </div>
          </div>
          <p className="text-sm" style={{ color: "#7A6A58" }}>Complete your sacred purchase securely via Razorpay.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8 lg:py-6 pb-12 lg:pb-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          {/* Left — Pay via Razorpay card */}
          <div className="space-y-4">
            {/* Razorpay pay card */}
            <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
                <h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Payment</h2>
              </div>
              <div className="p-8 flex flex-col items-center text-center gap-6">
                {/* Razorpay brand */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#072654,#3395FF)" }}>
                    <span className="text-white font-black text-2xl" style={{ fontFamily: "sans-serif" }}>R</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Pay Securely with Razorpay</p>
                    <p className="text-xs mt-1" style={{ color: "#9A8A78" }}>UPI · Cards · Net Banking · Wallets · EMI · COD</p>
                  </div>
                </div>

                {/* Total amount */}
                <div className="w-full rounded-2xl py-4 px-6" style={{ background: "linear-gradient(135deg,#FAF0D8,#FAF7F2)", border: "1px solid rgba(200,160,68,0.22)" }}>
                  <p className="text-xs mb-1" style={{ color: "#9A8A78" }}>Total Amount</p>
                  <p className="text-3xl font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{total.toLocaleString("en-IN")}</p>
                  <p className="text-xs mt-1" style={{ color: "#4A8A4A" }}>Includes shipping + GST</p>
                </div>

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={placing || items.length === 0}
                  className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg,#072654,#3395FF)`, color: "#FFFFFF" }}
                >
                  {placing
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing…</>
                    : <><Lock size={15} />Pay ₹{total.toLocaleString("en-IN")} with Razorpay</>
                  }
                </button>

                <p className="text-[11px]" style={{ color: "#B0A090" }}>
                  By proceeding, you agree to our Terms & Conditions. Your payment is processed securely by Razorpay.
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-3xl p-6" style={{ background: "linear-gradient(135deg,#FAF0D8,#FAF7F2)", border: "1px solid rgba(200,160,68,0.22)" }}>
              <div className="flex items-center gap-2 mb-4"><ShieldCheck size={14} style={{ color: GOLD }} /><span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>100% Secure Checkout</span></div>
              <div className="grid grid-cols-4 gap-3">
                {[{ i: "🔒", l: "SSL Encrypted", s: "256-bit" }, { i: "🛡", l: "PCI DSS", s: "Compliant" }, { i: "💳", l: "Razorpay", s: "Secured" }, { i: "🚫", l: "No Data", s: "Stored" }].map(({ i, l, s }) => (
                  <div key={l} className="flex flex-col items-center text-center gap-1 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)" }}>
                    <span className="text-xl">{i}</span>
                    <span className="text-[10px] font-semibold" style={{ color: MAROON }}>{l}</span>
                    <span className="text-[9px]" style={{ color: "#9A8A78" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar – order summary */}
          <div className="lg:sticky lg:top-24">
            <CheckoutProgress step={2} />
            <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 4px 30px rgba(91,31,36,0.07)" }}>
              <div className="px-6 pt-6 pb-4 lg:pt-4 lg:pb-3" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}><h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Order Summary</h2></div>
              <div className="px-6 py-4 lg:py-3 space-y-3 lg:space-y-2" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
                {items.map(({ product: p, qty }) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50"><img src={p.img} alt={p.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p><p className="text-[10px]" style={{ color: "#9A8A78" }}>Qty: {qty}</p></div>
                    <span className="text-xs font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(p.price * qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-5 lg:py-3 space-y-3 lg:space-y-2">
                 {[["Subtotal", `₹${subtotal.toLocaleString("en-IN")}`], ["Shipping", "FREE", true], ["GST (5%)", `₹${Math.round(subtotal * 0.05).toLocaleString("en-IN")}`]].map(([l, v, g]) => (
                  <div key={l as string} className="flex justify-between text-sm"><span style={{ color: "#7A6A58" }}>{l as string}</span><span style={{ color: g ? "#4A8A4A" : MAROON, fontFamily: PRICE_FONT, fontWeight: 600 }}>{v as string}</span></div>
                ))}
                <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,rgba(200,160,68,0.3),transparent)` }} />
                <div className="flex justify-between items-baseline"><span className="text-sm font-semibold" style={{ color: MAROON }}>Grand Total</span><span className="text-2xl font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{total.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="px-6 pb-6 lg:pb-4">
                <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON }}>← Back to Address</button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
