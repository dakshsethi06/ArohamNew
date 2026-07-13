import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, User } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useEffect } from "react";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "orders") {
      api("/orders").then(data => setOrders(data)).catch(console.error);
    }
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen pt-20 lg:pt-28 pb-16 px-4 sm:px-6" style={{ background: "#FAF7F2" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: MAROON }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className="rounded-3xl p-8 mb-5 text-center" style={{ background: `linear-gradient(160deg,${MAROON} 0%,#3A1015 100%)`, boxShadow: "0 20px 50px rgba(91,31,36,0.2)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(200,160,68,0.15)", border: "2px solid rgba(200,160,68,0.3)" }}>
            <User size={32} style={{ color: GOLD }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: IVORY, marginBottom: 4 }}>Devotee</h2>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 13, fontFamily: SANS }}>Member since 2025</p>
        </div>
        <div className="flex p-1 rounded-2xl mb-5" style={{ background: "rgba(91,31,36,0.06)" }}>
          {(["profile", "orders"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              style={{ background: activeTab === t ? MAROON : "transparent", color: activeTab === t ? IVORY : MAROON }}>
              {t === "profile" ? "My Profile" : "My Orders"}
            </button>
          ))}
        </div>
        {activeTab === "profile" && (
          <>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid rgba(91,31,36,0.1)" }}>
              {[
                { label: "Name",   value: user?.user_metadata?.full_name || "User" },
                { label: "Email",  value: user?.email || "Not provided"     },
                { label: "Phone",  value: user?.phone || "Not provided"       },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className="flex items-center justify-between px-5 py-4"
                  style={{ background: "#fff", borderBottom: i < arr.length - 1 ? "1px solid rgba(91,31,36,0.07)" : "none" }}>
                  <span className="text-sm" style={{ color: "#9A8A78", fontFamily: SANS }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: MAROON, fontFamily: SANS }}>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "rgba(91,31,36,0.07)", color: MAROON, border: "1px solid rgba(91,31,36,0.12)" }}>
              Sign Out
            </button>
          </>
        )}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.09)", boxShadow: "0 2px 16px rgba(91,31,36,0.05)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50 flex items-center justify-center text-xl">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-wide" style={{ color: MAROON, fontFamily: SANS }}>Order #{order.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(74,138,74,0.1)", color: "#2E8B57" }}>{order.status}</span>
                    </div>
                    <p className="text-sm font-medium truncate mb-1" style={{ fontFamily: SERIF, color: "#2A1A12" }}>{order.items?.length || 0} items</p>
                    <p className="text-xs" style={{ color: "#9A8A78" }}>{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <p className="text-base font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(order.total / 100).toLocaleString("en-IN")}</p>
                    <button className="text-[11px] font-semibold mt-1 hover:opacity-70 transition-opacity" style={{ color: GOLD }}>View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
