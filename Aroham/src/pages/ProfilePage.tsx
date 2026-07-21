import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, User, Package, Truck, CheckCircle } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const ORDER_STEPS = [
  { label: "Ordered", icon: "✓" },
  { label: "Processing", icon: "🪔" },
  { label: "Shipped", icon: "🚚" },
  { label: "Delivered", icon: "🏠" },
];

function getOrderStep(status: string, awbCode?: string) {
  if (status === "Delivered" || status === "DELIVERED") return 3;
  if (awbCode || status === "SHIPPED" || status === "Shipped") return 2;
  if (status === "CONFIRMED" || status === "Processing") return 1;
  return 0; // Ordered
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">(
    (searchParams.get("tab") as "profile" | "orders") || "profile"
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch real profile from DB
  useEffect(() => {
    const cachedProfile = sessionStorage.getItem("aroham_user_profile");
    if (cachedProfile) {
      try { setProfile(JSON.parse(cachedProfile)); setLoadingProfile(false); } catch (e) {}
    }
    
    api("/auth/profile")
      .then(data => {
        setProfile(data);
        sessionStorage.setItem("aroham_user_profile", JSON.stringify(data));
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  // Fetch real orders from DB — only show CONFIRMED/paid orders
  useEffect(() => {
    if (activeTab === "orders") {
      setLoadingOrders(true);
      api("/orders")
        .then(data => {
          const all = Array.isArray(data) ? data : [];
          // Filter out PENDING/FAILED orders — only show confirmed/paid
          const confirmedOrders = all.filter(o => 
            o.status === "CONFIRMED" || o.status === "Delivered" || o.status === "SHIPPED" || o.status === "Processing"
          );
          setOrders(confirmedOrders);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate("/"); };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Devotee";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const profileFields = [
    { label: "Name",   value: profile?.full_name || user?.user_metadata?.full_name || "—" },
    { label: "Email",  value: profile?.email || user?.email || "—" },
    { label: "Phone",  value: profile?.phone || "—" },
    { label: "Gender", value: profile?.gender || "—" },
    { label: "Date of Birth", value: profile?.dob ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
    { label: "City of Birth", value: profile?.pob_city || "—" },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-28 pb-16 px-4 sm:px-6" style={{ background: "#FAF7F2" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: MAROON }}>
          <ChevronLeft size={16} /> Back
        </button>

        {/* Profile Hero */}
        <div className="rounded-3xl p-8 mb-5 text-center" style={{ background: `linear-gradient(160deg,${MAROON} 0%,#3A1015 100%)`, boxShadow: "0 20px 50px rgba(91,31,36,0.2)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(200,160,68,0.15)", border: "2px solid rgba(200,160,68,0.3)" }}>
            <User size={32} style={{ color: GOLD }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: IVORY, marginBottom: 4 }}>
            {loadingProfile ? "Loading…" : displayName}
          </h2>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 13, fontFamily: SANS }}>Member since {memberSince}</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-2xl mb-5" style={{ background: "rgba(91,31,36,0.06)" }}>
          {(["profile", "orders"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              style={{ background: activeTab === t ? MAROON : "transparent", color: activeTab === t ? IVORY : MAROON }}>
              {t === "profile" ? "My Profile" : "My Orders"}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid rgba(91,31,36,0.1)" }}>
              {profileFields.map(({ label, value }, i, arr) => (
                <div key={label} className="flex items-center justify-between px-5 py-4"
                  style={{ background: "#fff", borderBottom: i < arr.length - 1 ? "1px solid rgba(91,31,36,0.07)" : "none" }}>
                  <span className="text-sm" style={{ color: "#9A8A78", fontFamily: SANS }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: value === "—" ? "#ccc" : MAROON, fontFamily: SANS }}>{value}</span>
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

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {loadingOrders && (
              <div className="text-center py-10">
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent mx-auto animate-spin mb-3" style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
                <p className="text-sm" style={{ color: "#9A8A78" }}>Loading orders…</p>
              </div>
            )}
            {!loadingOrders && orders.length === 0 && (
              <div className="text-center py-12 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.08)" }}>
                <p className="text-2xl mb-2">📦</p>
                <p className="text-sm font-semibold mb-1" style={{ fontFamily: SERIF, color: MAROON }}>No orders yet</p>
                <p className="text-xs mb-4" style={{ color: "#9A8A78" }}>Your sacred orders will appear here.</p>
                <button onClick={() => navigate("/shop")} className="px-5 py-2 rounded-full text-sm font-medium" style={{ background: MAROON, color: IVORY }}>
                  Shop Now
                </button>
              </div>
            )}
            {orders.map(order => {
              const isExpanded = !!expandedOrders[order.id];
              const itemsList = order.order_items || order.items || [];
              const currentStep = getOrderStep(order.status, order.awb_code);
              
              // Calculate estimated delivery (4 days from order date)
              const orderDate = new Date(order.created_at);
              const estDelivery = new Date(orderDate);
              estDelivery.setDate(estDelivery.getDate() + 4);
              const estDeliveryStr = estDelivery.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

              return (
                <div key={order.id} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.09)", boxShadow: "0 2px 16px rgba(91,31,36,0.05)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 cursor-pointer hover:bg-amber-50/20" onClick={() => toggleOrder(order.id)}>
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50 flex items-center justify-center text-xl">📦</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-wide" style={{ color: MAROON, fontFamily: SANS }}>Order #{order.id.substring(0, 8)}...</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: order.status === "CONFIRMED" || order.status === "Delivered" ? "rgba(74,138,74,0.1)" : "rgba(200,160,68,0.15)", color: order.status === "CONFIRMED" || order.status === "Delivered" ? "#2E8B57" : "#8B6914" }}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate mb-1" style={{ fontFamily: SERIF, color: "#2A1A12" }}>
                        {itemsList.length ? `${itemsList.length} item${itemsList.length > 1 ? "s" : ""}` : "Order placed"}
                      </p>
                      <p className="text-xs" style={{ color: "#9A8A78" }}>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <div>
                        <p className="text-base font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>
                          ₹{((order.amount || 0) / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button className="text-[11px] font-semibold hover:opacity-70 transition-opacity" style={{ color: GOLD }}>
                        {isExpanded ? "Hide Details ↑" : "View Details →"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "rgba(91,31,36,0.06)", background: "#FAF9F6" }}>
                      <div className="space-y-4">
                        {/* Order tracking stepper */}
                        <div className="p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.08)" }}>
                          <h4 className="text-xs font-semibold mb-3" style={{ color: MAROON }}>Order Status</h4>
                          <div className="flex items-center justify-between mb-2">
                            {ORDER_STEPS.map((step, i) => {
                              const reached = i <= currentStep;
                              const active = i === currentStep;
                              return (
                                <div key={step.label} className="flex flex-col items-center flex-1">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1"
                                    style={{
                                      background: reached ? (active ? `linear-gradient(135deg,${GOLD},#E8B84B)` : "rgba(74,138,74,0.15)") : "rgba(91,31,36,0.06)",
                                      border: reached ? `2px solid ${active ? GOLD : "#4A8A4A"}` : "2px solid rgba(91,31,36,0.1)",
                                      color: reached ? (active ? "#1A0D0E" : "#4A8A4A") : "#9A8A78",
                                      boxShadow: active ? "0 0 12px rgba(200,160,68,0.4)" : "none"
                                    }}>
                                    {reached ? (i < currentStep ? <CheckCircle size={14} /> : step.icon) : step.icon}
                                  </div>
                                  <span className="text-[9px] font-semibold text-center" style={{ color: reached ? MAROON : "#9A8A78" }}>{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Progress bar */}
                          <div className="flex gap-1 mt-1">
                            {ORDER_STEPS.slice(0, -1).map((_, i) => (
                              <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < currentStep ? "#4A8A4A" : "rgba(91,31,36,0.08)" }} />
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Truck size={12} style={{ color: "#4A8A4A" }} />
                            <span className="text-[10px] font-medium" style={{ color: "#4A8A4A" }}>
                              Expected delivery by <strong>{estDeliveryStr}</strong> · Free Shipping
                            </span>
                          </div>
                        </div>

                        {/* Render items */}
                        <div>
                          <h4 className="text-xs font-semibold mb-2" style={{ color: MAROON, fontFamily: SANS }}>Items in Order</h4>
                          <div className="space-y-2">
                            {itemsList.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white border border-gray-100">
                                <div>
                                  <p className="font-semibold" style={{ color: MAROON }}>{item.name}</p>
                                  <p className="text-gray-400">Qty: {item.qty}</p>
                                </div>
                                <span className="font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>
                                  ₹{((item.price * item.qty) / 100).toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Render shipping address */}
                        {order.address && (
                          <div className="text-xs p-3 rounded-lg bg-white border border-gray-100">
                            <h4 className="font-semibold mb-1" style={{ color: MAROON }}>Shipping Address</h4>
                            <p style={{ color: "#7A6A58" }}>{order.address.name}</p>
                            <p style={{ color: "#7A6A58" }}>{order.address.address || `${order.address.house}, ${order.address.street}`}</p>
                            <p style={{ color: "#7A6A58" }}>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                            <p style={{ color: "#7A6A58" }}>Phone: {order.address.phone}</p>
                          </div>
                        )}

                        {/* Track order button — user-friendly */}
                        <div className="pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (order.awb_code) {
                                window.open(`https://shiprocket.co/tracking/${order.awb_code}`, "_blank");
                              }
                            }}
                            className="w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                            style={{
                              background: order.awb_code ? `linear-gradient(135deg,${MAROON},#7A2A30)` : "rgba(91,31,36,0.06)",
                              color: order.awb_code ? IVORY : MAROON,
                              border: order.awb_code ? "none" : "1px solid rgba(91,31,36,0.12)"
                            }}
                          >
                            <Package size={14} />
                            {order.awb_code ? "Track Your Order" : "Order is being prepared"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
