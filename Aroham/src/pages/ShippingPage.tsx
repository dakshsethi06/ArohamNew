import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Lock, ChevronLeft, ChevronRight, CheckCircle, Truck } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { INDIA_STATES } from "@/constants/data";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { FloatingSelect } from "@/components/auth/FloatingSelect";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function CheckoutHeader() {
  const navigate = useNavigate();
  return (
    <div className="w-full" style={{ background: "rgba(250,247,242,0.97)", borderBottom: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 1px 12px rgba(91,31,36,0.05)" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-14 lg:h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg,${MAROON},#E78B2F)`, color: IVORY, fontFamily: SERIF }}>ॐ</div>
          <span className="hidden sm:inline text-lg lg:text-xl font-semibold tracking-wide" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
        </button>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#9A8A78", letterSpacing: "0.12em" }}>Secure Checkout</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(200,160,68,0.1)", border: "1px solid rgba(200,160,68,0.22)" }}>
          <Lock size={10} style={{ color: GOLD }} /><span className="text-[10px] font-semibold" style={{ color: "#8B6914" }}>SSL Secured</span>
        </div>
      </div>
    </div>
  );
}

export function ShippingPage() {
  const navigate = useNavigate();
  const { items, openCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", pin: "", house: "", street: "", landmark: "", city: "", state: "", addressType: "Home", saveAddress: true, sameBilling: true, specialRequest: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  // Save selected address to sessionStorage so PaymentPage can use it
  const getSelectedAddressObj = () => savedAddresses.find(a => a.id === selectedAddr) || null;

  // Save new address to DB
  const handleSaveAddress = async () => {
    if (!form.firstName || !form.phone || !form.city || !form.pin) {
      alert("Please fill in all required fields."); return;
    }
    setSavingAddress(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone.replace(/\D/g, ""),
        email: form.email,
        address: `${form.house}, ${form.street}${form.landmark ? ", " + form.landmark : ""}`.trim(),
        city: form.city,
        pincode: form.pin,
        address_type: form.addressType,
      };
      const result = await api("/addresses", { method: "POST", body: JSON.stringify(payload) });
      const newAddr = result.data || result;
      setSavedAddresses(prev => [newAddr, ...prev]);
      setSelectedAddr(newAddr.id);
      setShowForm(false);
      setForm({ firstName: "", lastName: "", phone: "", email: "", pin: "", house: "", street: "", landmark: "", city: "", state: "", addressType: "Home", saveAddress: true, sameBilling: true, specialRequest: "" });
    } catch (e: any) {
      alert("Failed to save address: " + (e.message || "Please try again."));
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePinChange = async (val: string) => {
    const cleanVal = val.replace(/\D/g, "").slice(0, 6);
    setForm(prev => ({ ...prev, pin: cleanVal }));
    if (cleanVal.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanVal}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          const city = postOffice.District;
          const state = postOffice.State;
          setForm(prev => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state
          }));
        }
      } catch (e) {
        console.error("Failed to auto-fetch city/state from pincode", e);
      }
    }
  };

  // Fetch real addresses from backend when logged in
  useEffect(() => {
    if (isLoggedIn) {
      api("/addresses")
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const def = data.find((a: any) => a.is_default) || data[0];
            setSelectedAddr(def.id);
          } else {
            // No saved addresses — open the new address form automatically
            setSavedAddresses([]);
            setShowForm(true);
          }
        })
        .catch(() => {
          setSavedAddresses([]);
          setShowForm(true);
        });
    } else {
      // Logged out — clear addresses
      setSavedAddresses([]);
      setSelectedAddr(null);
      setShowForm(true);
    }
  }, [isLoggedIn]);


  return (
    <div className="w-full overflow-x-hidden" style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      <CheckoutHeader />
      <div className="pt-3 pb-5 lg:pt-2 lg:pb-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5EDE0,#FAF7F2,#F0E8D8)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px)` }} />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <button onClick={() => { navigate("/"); openCart(); }} className="flex items-center gap-2 mb-4 lg:mb-3 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md active:scale-95" style={{ background: "#FFFFFF", color: MAROON, border: `1px solid rgba(91,31,36,0.15)`, boxShadow: "0 2px 8px rgba(91,31,36,0.08)" }}>
            <ChevronLeft size={16} /> Back to Cart
          </button>
          <div className="flex items-center gap-2 mb-3 lg:mb-2 text-xs" style={{ color: "#9A8A78" }}>
            <span style={{ color: MAROON }}>Cart</span><ChevronRight size={12} /><span className="font-medium" style={{ color: MAROON }}>Delivery Details</span><ChevronRight size={12} /><span>Payment</span>
          </div>
          <h1 className="mb-1" style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 500, color: MAROON, lineHeight: 1.1 }}>Delivery Details</h1>
          <p className="text-sm" style={{ color: "#7A6A58" }}>Tell us where you'd like your sacred products delivered.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8 lg:py-6 pb-12 lg:pb-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div>
            {savedAddresses.length > 0 && !showForm && (
            <div className="rounded-3xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
              <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
                <h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Saved Addresses</h2>
                <button onClick={() => setShowForm(!showForm)} className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80" style={{ background: "rgba(91,31,36,0.07)", color: MAROON }}>{showForm ? "Cancel" : "+ New Address"}</button>
              </div>

              <div className="p-6 space-y-3">
                {savedAddresses.length === 0 && !showForm && (
                  <p className="text-sm text-center py-4" style={{ color: "#9A8A78" }}>No saved addresses yet. Add one below.</p>
                )}
                {savedAddresses.map(addr => {
                  const sel = selectedAddr === addr.id;
                  const addrLine = [addr.line1 || addr.address_line1, addr.city, addr.state].filter(Boolean).join(", ");
                  return (
                    <div key={addr.id} onClick={() => setSelectedAddr(addr.id)}
                      className="group relative p-5 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{ border: `1.5px solid ${sel ? GOLD : "rgba(91,31,36,0.1)"}`, background: sel ? "rgba(200,160,68,0.05)" : "#FAFAF8", boxShadow: sel ? `0 0 0 3px rgba(200,160,68,0.1)` : "none" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors" style={{ border: `2px solid ${sel ? GOLD : "rgba(91,31,36,0.25)"}`, background: sel ? GOLD : "transparent" }}>
                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{addr.address_type || addr.type || "Home"}</span>
                              {(addr.is_default || addr.isDefault) && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(200,160,68,0.15)", color: "#8B6914" }}>DEFAULT</span>}
                            </div>
                            <p className="text-xs font-medium mb-0.5" style={{ color: "#3A2A1A" }}>{addr.full_name || addr.name} · {addr.phone}</p>
                            <p className="text-xs" style={{ color: "#7A6A58" }}>{addrLine} – {addr.pincode || addr.pin}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-amber-50" style={{ color: MAROON, border: "1px solid rgba(91,31,36,0.12)" }}>Edit</button>
                          <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-red-50" style={{ color: "#C04040", border: "1px solid rgba(192,64,64,0.15)" }}>Delete</button>
                        </div>
                      </div>
                      {sel && <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(200,160,68,0.2)" }}>
                        <Truck size={12} style={{ color: "#4A8A4A" }} /><span className="text-[10px] font-medium" style={{ color: "#4A8A4A" }}>Estimated delivery: 3–5 business days · Free Shipping</span>
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
            )}
            {(showForm || savedAddresses.length === 0) && (

              <div className="rounded-3xl overflow-hidden mt-4" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "0 2px 20px rgba(91,31,36,0.04)" }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}><h2 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>New Address</h2></div>
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="First Name" value={form.firstName} onChange={set("firstName") as (v: string) => void} required />
                    <FloatingInput label="Last Name" value={form.lastName} onChange={set("lastName") as (v: string) => void} required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="Phone" type="tel" value={form.phone} onChange={set("phone") as (v: string) => void} required />
                    <FloatingInput label="Email" type="email" value={form.email} onChange={set("email") as (v: string) => void} required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="PIN Code" value={form.pin} onChange={handlePinChange} required />
                    <FloatingInput label="House / Flat No." value={form.house} onChange={set("house") as (v: string) => void} required />
                  </div>
                  <FloatingInput label="Street Address" value={form.street} onChange={set("street") as (v: string) => void} required />
                  <FloatingInput label="Landmark (Optional)" value={form.landmark} onChange={set("landmark") as (v: string) => void} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="City" value={form.city} onChange={set("city") as (v: string) => void} required />
                    <FloatingSelect label="State" options={INDIA_STATES} value={form.state} onChange={set("state") as (v: string) => void} />
                  </div>
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                    {savingAddress
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
                      : <><CheckCircle size={15} /> Save &amp; Deliver Here</>}
                  </button>
                </div>
              </div>
            )}
            <div className="rounded-3xl overflow-hidden mt-4" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)" }}>
              <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(91,31,36,0.06)" }}>
                <h2 className="text-base font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Special Delivery Instructions</h2>
              </div>
              <div className="p-6">
                <textarea value={form.specialRequest} onChange={e => set("specialRequest")(e.target.value)} rows={3}
                  placeholder="Add delivery instructions for our team..." className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none transition-all"
                  style={{ border: "1.5px solid rgba(91,31,36,0.12)", background: "#FAF7F2", color: "#222222", fontFamily: SANS }}
                  onFocus={e => { e.target.style.borderColor = GOLD; }} onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.12)"; }} />
              </div>
            </div>
          </div>
          <OrderSummaryCard cartItems={items} onBack={() => { navigate("/"); openCart(); }} onNext={() => {
            const addr = getSelectedAddressObj();
            if (!addr) {
              alert("Please select or add a delivery address first.");
              return;
            }
            sessionStorage.setItem("aroham_shipping_addr", JSON.stringify(addr));
            navigate("/checkout/payment");
          }} nextLabel="Proceed to Payment" step={1} />
        </div>
      </div>

    </div>
  );
}
