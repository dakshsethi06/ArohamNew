import { MAROON, GOLD, SERIF, SANS, IVORY } from "@/constants/theme";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { useState } from "react";
import { PackageSearch, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const navigate = useNavigate();

  const handleTrack = () => {
    if (!orderId || !email) return;
    setLoading(true);
    setError(false);
    setTrackedOrder(null);
    
    setTimeout(() => {
      setLoading(false);
      const localOrderId = sessionStorage.getItem("aroham_last_order_id");
      // For demo purposes, we accept any email if the order ID matches the local one
      if (orderId === localOrderId || orderId === "ORD-1784679348893") { 
        setTrackedOrder({ id: orderId, status: "Processing", date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) });
      } else {
        setError(true);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 max-w-lg mx-auto w-full">
        <button onClick={() => navigate(-1)} className="self-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 transition-all hover:bg-black/5" style={{ color: MAROON, border: "1px solid rgba(91,31,36,0.18)", background: "#FFFFFF" }}>
          <ChevronLeft size={14} /> Back
        </button>
        
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(91,31,36,0.05)", color: MAROON }}>
          <PackageSearch size={36} strokeWidth={1.5} />
        </div>
        
        <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-3xl md:text-4xl font-medium mb-3 text-center">Track Your Order</h1>
        <p className="text-center mb-8" style={{ color: "#7A6A58" }}>Enter your Order ID and Email Address to see real-time updates on your sacred items.</p>
        
        {trackedOrder ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[rgba(91,31,36,0.05)] w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${MAROON}, ${GOLD})` }} />
            <h3 style={{ fontFamily: SERIF, color: MAROON }} className="text-xl font-semibold mb-6">Order Status</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm" style={{ color: "#7A6A58" }}>Order ID</span>
                <span className="font-semibold" style={{ color: MAROON }}>{trackedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm" style={{ color: "#7A6A58" }}>Order Date</span>
                <span className="font-medium" style={{ color: "#4A3A2A" }}>{trackedOrder.date}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm" style={{ color: "#7A6A58" }}>Current Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(74,138,74,0.1)", color: "#2E6B2E" }}>
                  {trackedOrder.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center text-sm" style={{ color: "#7A6A58" }}>
              Your sacred items are currently undergoing the Pran Pratishtha energization process.
            </div>

            <button onClick={() => setTrackedOrder(null)} className="w-full mt-6 py-3 text-sm font-medium hover:underline transition-all" style={{ color: MAROON }}>
              Track Another Order
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[rgba(91,31,36,0.05)] w-full space-y-5">
            <FloatingInput label="Order ID (e.g. ARO-12345)" value={orderId} onChange={setOrderId} required />
            <FloatingInput label="Email Address" type="email" value={email} onChange={setEmail} required />
            
            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(200,160,68,0.1)", color: "#8B6914", border: `1px solid rgba(200,160,68,0.2)` }}>
                We couldn't find an active order matching those details. Please check your spelling.
              </div>
            )}

            <button onClick={handleTrack} disabled={loading || !orderId || !email}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2 mt-2"
              style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY, opacity: (!orderId || !email || loading) ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Track Package"}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm mb-3" style={{ color: "#7A6A58" }}>Have an Aroham account?</p>
          <button onClick={() => navigate("/profile?tab=orders")} className="flex items-center justify-center gap-2 mx-auto text-sm font-medium hover:underline transition-all" style={{ color: MAROON }}>
            View Order History <ArrowRight size={14} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
