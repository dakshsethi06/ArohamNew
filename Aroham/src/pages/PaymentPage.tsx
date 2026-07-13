import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, ChevronLeft, ChevronRight, Search, CheckCircle } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { UPI_APPS, BANKS_DATA, WALLETS_DATA, EMI_PLANS } from "@/constants/data";
import { CardInput } from "@/components/auth/CardInput";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PayMethod = "upi" | "card" | "netbanking" | "wallet" | "emi" | "cod";

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
  const { items } = useCart();
  const [method, setMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", save: false });
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedEmi, setSelectedEmi] = useState(0);
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + 99 + Math.round(subtotal * 0.05);
  const filteredBanks = BANKS_DATA.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  const { user } = useAuth();

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

  const handlePlace = async () => { 
    if (method === "cod") {
      setPlacing(true); 
      setTimeout(() => { setPlacing(false); navigate("/checkout/confirm"); }, 1800); 
      return;
    }

    setPlacing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) { alert("Failed to load Razorpay. Please check your connection."); setPlacing(false); return; }

      // Create Order on Backend
      const orderData = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          amount: total * 100, // Amount in paise
          currency: "INR",
          receipt: "receipt_temp_" + Date.now()
        })
      });

      const options = {
        key: "rzp_test_YourTestKey", // Replace with real key in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Aroham",
        description: "Sacred Products",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            navigate("/checkout/confirm");
          } catch (e: any) {
            alert("Payment verification failed: " + e.message);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "Customer",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { color: MAROON }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      rzp.open();

    } catch (e: any) {
      alert("Error initiating payment: " + e.message);
    } finally {
      setPlacing(false);
    }
  };

  const PAYMENT_METHODS: [PayMethod, string, string, string][] = [
    ["upi",        "UPI",                   "Pay instantly via any UPI app",  "⚡"],
    ["card",       "Credit / Debit Card",    "Visa, Mastercard, RuPay",        "💳"],
    ["netbanking", "Net Banking",            "All major Indian banks",          "🏦"],
    ["wallet",     "Wallets",                "Amazon Pay, Paytm & more",        "👜"],
    ["emi",        "EMI",                    "No-cost EMI available",           "📅"],
    ["cod",        "Cash on Delivery",       "Pay when order arrives",          "📦"],
  ];

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <CheckoutHeader />
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
          <p className="text-sm" style={{ color: "#7A6A58" }}>Complete your sacred purchase securely.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 lg:py-6 pb-32 lg:pb-6 mx-[-20px] my-[0px]">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="lg:ml-[-35px] lg:mr-[0px] my-[0px] px-4 lg:px-0 space-y-4 lg:space-y-3">
            <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
              <div className="px-6 pt-6 pb-4 lg:pt-4 lg:pb-3" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}><h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Payment Method</h2></div>
              <div className="divide-y" style={{ borderColor: "rgba(91,31,36,0.06)" }}>
                {PAYMENT_METHODS.map(([id, label, desc, icon]) => {
                  const active = method === id;
                  return (
                    <div key={id}>
                      <button onClick={() => setMethod(id)} className="w-full flex items-center gap-4 px-6 py-4 lg:py-3 transition-colors text-left"
                        style={{ background: active ? "rgba(200,160,68,0.04)" : "transparent" }}>
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all" style={{ border: `2px solid ${active ? GOLD : "rgba(91,31,36,0.2)"}`, background: active ? GOLD : "transparent" }}>
                          {active && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{label}</div>
                          <div className="text-xs" style={{ color: "#9A8A78" }}>{desc}</div>
                        </div>
                        <ChevronRight size={14} className="flex-shrink-0 transition-transform duration-200" style={{ color: "#9A8A78", transform: active ? "rotate(90deg)" : "rotate(0deg)" }} />
                      </button>
                      {active && (
                        <div className="px-6 pb-6 pt-2" style={{ background: "rgba(200,160,68,0.03)", borderTop: "1px solid rgba(200,160,68,0.12)" }}>
                          {id === "upi" && (
                            <div className="space-y-5">
                              <div className="grid grid-cols-5 gap-2">
                                {UPI_APPS.map(app => (
                                  <button key={app.name} onClick={() => setUpiApp(app.name)} className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-0.5"
                                    style={{ border: `1.5px solid ${upiApp === app.name ? GOLD : "rgba(91,31,36,0.1)"}`, background: upiApp === app.name ? "rgba(200,160,68,0.08)" : "#FFFFFF" }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: app.color }}>{app.icon}</div>
                                    <span className="text-[9px] text-center leading-tight font-medium" style={{ color: MAROON }}>{app.name}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                                  className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none" style={{ border: "1.5px solid rgba(91,31,36,0.14)", background: "#FFFFFF", color: "#222222", fontFamily: SANS }}
                                  onFocus={e => { e.target.style.borderColor = GOLD; }} onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.14)"; }} />
                                <button className="px-5 py-3 rounded-2xl text-sm font-semibold" style={{ background: MAROON, color: IVORY }}>Verify</button>
                              </div>
                            </div>
                          )}
                          {id === "card" && (
                            <div className="space-y-4">
                              <div className="relative w-full max-w-xs mx-auto h-40 rounded-2xl p-5 overflow-hidden" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30,#3A1015)` }}>
                                <div className="flex justify-between items-start mb-6">
                                  <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: GOLD }}>Aroham</span>
                                  <div className="flex gap-1"><div className="w-7 h-7 rounded-full opacity-80" style={{ background: "#EB001B" }} /><div className="w-7 h-7 rounded-full opacity-80 -ml-3" style={{ background: "#F79E1B" }} /></div>
                                </div>
                                <div className="text-sm tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "monospace" }}>{card.number || "•••• •••• •••• ••••"}</div>
                                <div className="flex justify-between">
                                  <div><div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Holder</div><div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{card.name || "FULL NAME"}</div></div>
                                  <div><div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Expires</div><div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{card.expiry || "MM/YY"}</div></div>
                                </div>
                              </div>
                              <CardInput value={card.number} onChange={v => setCard(c => ({ ...c, number: v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() }))} placeholder="1234 5678 9012 3456" maxLength={19} />
                              <div className="grid grid-cols-2 gap-3">
                                <CardInput value={card.expiry} onChange={v => { const d = v.replace(/\D/g, "").slice(0, 4); setCard(c => ({ ...c, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d })); }} placeholder="MM / YY" maxLength={5} />
                                <CardInput value={card.cvv} onChange={v => setCard(c => ({ ...c, cvv: v.replace(/\D/g, "").slice(0, 4) }))} placeholder="• • •" maxLength={4} type="password" />
                              </div>
                              <CardInput value={card.name} onChange={v => setCard(c => ({ ...c, name: v.toUpperCase() }))} placeholder="CARDHOLDER NAME" maxLength={26} />
                            </div>
                          )}
                          {id === "netbanking" && (
                            <div className="space-y-4">
                              <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9A8A78" }} />
                                <input value={bankSearch} onChange={e => setBankSearch(e.target.value)} placeholder="Search bank..."
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none" style={{ border: "1.5px solid rgba(91,31,36,0.14)", background: "#FFFFFF", color: "#222222", fontFamily: SANS }}
                                  onFocus={e => { e.target.style.borderColor = GOLD; }} onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.14)"; }} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {filteredBanks.map(bank => (
                                  <button key={bank.code} onClick={() => setSelectedBank(bank.code)} className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                                    style={{ border: `1.5px solid ${selectedBank === bank.code ? GOLD : "rgba(91,31,36,0.1)"}`, background: selectedBank === bank.code ? "rgba(200,160,68,0.08)" : "#FFFFFF" }}>
                                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>{bank.code.slice(0, 2)}</div>
                                    <span className="text-xs font-medium" style={{ color: MAROON }}>{bank.name}</span>
                                    {selectedBank === bank.code && <CheckCircle size={13} className="ml-auto" style={{ color: GOLD }} />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {id === "wallet" && (
                            <div className="grid grid-cols-2 gap-3">
                              {WALLETS_DATA.map(w => (
                                <button key={w.name} onClick={() => setSelectedWallet(w.name)} className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                                  style={{ border: `1.5px solid ${selectedWallet === w.name ? GOLD : "rgba(91,31,36,0.1)"}`, background: selectedWallet === w.name ? "rgba(200,160,68,0.08)" : "#FFFFFF" }}>
                                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white" style={{ background: w.color }}>{w.icon}</div>
                                  <span className="text-xs font-semibold" style={{ color: MAROON }}>{w.name}</span>
                                  {selectedWallet === w.name && <CheckCircle size={14} className="ml-auto" style={{ color: GOLD }} />}
                                </button>
                              ))}
                            </div>
                          )}
                          {id === "emi" && (
                            <div className="space-y-3">
                              {EMI_PLANS.map((plan, i) => (
                                <button key={i} onClick={() => setSelectedEmi(i)} className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
                                  style={{ border: `1.5px solid ${selectedEmi === i ? GOLD : "rgba(91,31,36,0.1)"}`, background: selectedEmi === i ? "rgba(200,160,68,0.08)" : "#FFFFFF" }}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${selectedEmi === i ? GOLD : "rgba(91,31,36,0.2)"}`, background: selectedEmi === i ? GOLD : "transparent" }}>
                                      {selectedEmi === i && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{plan.months} Months</div>
                                      <div className="text-[10px]" style={{ color: "#7A6A58" }}>{plan.interest}</div>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{plan.per}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {id === "cod" && (
                            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#FAF0D8,#FAF7F2)", border: `1px solid rgba(200,160,68,0.22)` }}>
                              <div className="flex items-start gap-4">
                                <span className="text-3xl">📦</span>
                                <div>
                                  <h4 className="text-sm font-semibold mb-1.5" style={{ fontFamily: SERIF, color: MAROON }}>Cash on Delivery</h4>
                                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#7A6A58" }}>Pay ₹{total.toLocaleString("en-IN")} in cash when your order arrives. A ₹49 handling fee applies.</p>
                                  {["No online payment required", "Pay at your doorstep", "Sacred products delivered safely"].map(t => (
                                    <div key={t} className="flex items-center gap-2 text-xs mb-1" style={{ color: "#5A4A3A" }}><CheckCircle size={11} style={{ color: GOLD }} /> {t}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl p-6" style={{ background: "linear-gradient(135deg,#FAF0D8,#FAF7F2)", border: `1px solid rgba(200,160,68,0.22)` }}>
              <div className="flex items-center gap-2 mb-4"><Lock size={14} style={{ color: GOLD }} /><span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>100% Secure Checkout</span></div>
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
          {/* Right sidebar */}
          <div className="lg:sticky lg:top-24 ml-[-20px] mr-[0px] my-[0px]">
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
                {[["Subtotal", `₹${subtotal.toLocaleString("en-IN")}`], ["Temple Energization", "₹99"], ["Shipping", "FREE", true], ["GST (5%)", `₹${Math.round(subtotal * 0.05).toLocaleString("en-IN")}`]].map(([l, v, g]) => (
                  <div key={l as string} className="flex justify-between text-sm"><span style={{ color: "#7A6A58" }}>{l as string}</span><span style={{ color: g ? "#4A8A4A" : MAROON, fontFamily: PRICE_FONT, fontWeight: 600 }}>{v as string}</span></div>
                ))}
                <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,rgba(200,160,68,0.3),transparent)` }} />
                <div className="flex justify-between items-baseline"><span className="text-sm font-semibold" style={{ color: MAROON }}>Grand Total</span><span className="text-2xl font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{total.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="px-6 pb-6 lg:pb-4 space-y-3 lg:space-y-2">
                <button onClick={handlePlace} disabled={placing}
                  className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                  {placing ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing…</> : <><Lock size={14} />Place Order · ₹{total.toLocaleString("en-IN")}</>}
                </button>
                <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON }}>← Back to Address</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-4" style={{ background: "rgba(250,247,242,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(91,31,36,0.1)" }}>
        <button onClick={handlePlace} disabled={placing} className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
          {placing ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing…</> : <><Lock size={14} />Place Order · ₹{total.toLocaleString("en-IN")}</>}
        </button>
      </div>
    </div>
  );
}
