import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, User, Package, Truck, CheckCircle, Edit2, Save, X, Calendar, ChevronDown } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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

  // Edit Profile Form state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Other",
    dob: "",
    pobCity: ""
  });

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch real profile from DB
  useEffect(() => {
    const cachedProfile = sessionStorage.getItem("aroham_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setProfile(parsed);
        initEditForm(parsed);
        setLoadingProfile(false);
      } catch (e) {}
    }
    
    api("/auth/profile")
      .then(data => {
        setProfile(data);
        initEditForm(data);
        sessionStorage.setItem("aroham_user_profile", JSON.stringify(data));
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  const initEditForm = (p: any) => {
    setEditForm({
      fullName: p?.full_name || user?.user_metadata?.full_name || "",
      email: p?.email || user?.email || "",
      phone: p?.phone || user?.user_metadata?.phone || "",
      gender: p?.gender || "Other",
      dob: p?.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
      pobCity: p?.pob_city || ""
    });
  };

  // Fetch real orders from DB — only show CONFIRMED/paid orders
  useEffect(() => {
    if (activeTab === "orders") {
      setLoadingOrders(true);
      // Since backend is disconnected, fetch the latest local order from sessionStorage
      const localOrderId = sessionStorage.getItem("aroham_last_order_id");
      const localItemsStr = sessionStorage.getItem("aroham_last_order_items");
      const localTotalStr = sessionStorage.getItem("aroham_order_total");
      
      let mockOrders: any[] = [];
      if (localOrderId && localItemsStr) {
        try {
          const parsedItems = JSON.parse(localItemsStr);
          mockOrders.push({
            id: localOrderId,
            created_at: new Date().toISOString(),
            status: "Processing",
            total_amount: parseFloat(localTotalStr || "0") * 100, // component divides by 100
            items: parsedItems.map((i: any) => ({
              product_name: i.product?.name || "Sacred Item",
              quantity: i.qty || 1,
              unit_price: (i.product?.price || 0) * 100
            }))
          });
        } catch (e) {
          console.error("Failed to parse local order items", e);
        }
      }
      
      setOrders(mockOrders);
      setLoadingOrders(false);
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api("/auth/profile", {
        method: "POST",
        body: JSON.stringify(editForm)
      });
      setProfile(updated);
      sessionStorage.setItem("aroham_user_profile", JSON.stringify(updated));
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert("Failed to save profile: " + (e.message || "Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Devotee";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const profileFields = [
    { label: "Name",   value: profile?.full_name || user?.user_metadata?.full_name || "—" },
    { label: "Email",  value: profile?.email || user?.email || "—" },
    { label: "Phone",  value: profile?.phone || user?.user_metadata?.phone || "—" },
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
        <div className="rounded-3xl p-8 mb-5 text-center relative overflow-hidden" style={{ background: `linear-gradient(160deg,${MAROON} 0%,#3A1015 100%)`, boxShadow: "0 20px 50px rgba(91,31,36,0.2)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(200,160,68,0.15)", border: "2px solid rgba(200,160,68,0.3)" }}>
            <User size={32} style={{ color: GOLD }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: IVORY, marginBottom: 4 }}>
            {loadingProfile ? "Loading…" : displayName}
          </h2>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 13, fontFamily: SANS }}>Member since {memberSince}</p>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-4 rounded-2xl flex items-center justify-center gap-2" style={{ background: "rgba(74,138,74,0.1)", border: "1px solid rgba(74,138,74,0.3)", color: "#2E6B2E" }}>
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">Profile updated successfully!</span>
          </div>
        )}

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
            {!isEditing ? (
              <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid rgba(91,31,36,0.1)", background: "#fff" }}>
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(91,31,36,0.08)" }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9A8A78" }}>Personal Details</span>
                  <button onClick={() => { initEditForm(profile); setIsEditing(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:shadow-sm"
                    style={{ background: "rgba(200,160,68,0.12)", color: "#8B6914", border: "1px solid rgba(200,160,68,0.25)" }}>
                    <Edit2 size={12} /> Edit Profile
                  </button>
                </div>
                {profileFields.map(({ label, value }, i, arr) => (
                  <div key={label} className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(91,31,36,0.07)" : "none" }}>
                    <span className="text-sm" style={{ color: "#9A8A78", fontFamily: SANS }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: value === "—" ? "#ccc" : MAROON, fontFamily: SANS }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-6 mb-4 space-y-4" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.12)", boxShadow: "0 4px 20px rgba(91,31,36,0.05)" }}>
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(91,31,36,0.08)" }}>
                  <h3 className="text-base font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Edit Your Profile</h3>
                  <button onClick={() => setIsEditing(false)} className="p-1 rounded-full hover:bg-black/5" style={{ color: MAROON }}><X size={18} /></button>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Full Name</label>
                  <input type="text" value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Phone Number</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Gender</label>
                    <Select.Root value={editForm.gender} onValueChange={v => setEditForm(p => ({ ...p, gender: v }))}>
                      <Select.Trigger asChild>
                        <button className="w-full px-3 py-2.5 rounded-xl text-sm text-left flex items-center justify-between transition-all focus:ring-2 focus:ring-offset-1"
                          style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON, fontFamily: SANS, outline: "none" }}>
                          <Select.Value />
                          <ChevronDown size={14} style={{ color: GOLD }} />
                        </button>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content position="popper" align="center" sideOffset={4} className="z-[200] rounded-xl shadow-2xl border overflow-hidden"
                          style={{ background: "#FAF7F2", borderColor: "rgba(91,31,36,0.15)", width: "var(--radix-select-trigger-width)" }}>
                          <Select.Viewport>
                            {["Male", "Female", "Other"].map(opt => (
                              <Select.Item key={opt} value={opt} className="px-4 py-2.5 text-sm cursor-pointer outline-none transition-colors data-[highlighted]:bg-black/5"
                                style={{ color: MAROON, fontFamily: SANS }}>
                                <Select.ItemText>{opt}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Date of Birth</label>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button className="w-full px-3 py-2.5 rounded-xl text-sm text-left flex items-center justify-between transition-all focus:ring-2 focus:ring-offset-1"
                          style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: editForm.dob ? MAROON : "#9A8A78", fontFamily: SANS, outline: "none" }}>
                          {editForm.dob ? (() => {
                            const [y, m, d] = editForm.dob.split("-").map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                          })() : "Select date"}
                          <Calendar size={14} style={{ color: GOLD }} />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content side="bottom" avoidCollisions={false} align="start" sideOffset={4} className="z-[200] rounded-2xl shadow-2xl border p-4"
                          style={{ background: "#FAF7F2", borderColor: "rgba(91,31,36,0.15)" }}>
                          <style>{`
                            .rdp { --rdp-cell-size: 36px; --rdp-accent-color: ${MAROON}; --rdp-background-color: rgba(91,31,36,0.1); font-family: ${SANS}; }
                            .rdp-caption { color: ${MAROON}; font-weight: 600; }
                            .rdp-nav_button { color: ${MAROON}; }
                            .rdp-day_selected { background: ${MAROON} !important; color: ${IVORY} !important; font-weight: 600; }
                            .rdp-day:hover:not(.rdp-day_selected) { background: rgba(91,31,36,0.08); }
                            .rdp-day_today:not(.rdp-day_selected) { font-weight: inherit; border: none; outline: none; }
                            .rdp-day:focus { outline: none !important; border: none !important; background: transparent; }
                          `}</style>
                          <DayPicker mode="single" selected={editForm.dob ? (() => { const [y, m, d] = editForm.dob.split("-").map(Number); return new Date(y, m - 1, d); })() : undefined}
                            onSelect={(date) => { 
                              if (date) {
                                const y = date.getFullYear();
                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                const d = String(date.getDate()).padStart(2, '0');
                                setEditForm(p => ({ ...p, dob: `${y}-${m}-${d}` })); 
                              }
                            }}
                            defaultMonth={editForm.dob ? (() => { const [y, m, d] = editForm.dob.split("-").map(Number); return new Date(y, m - 1, d); })() : new Date(2000, 0)}
                            fromYear={1950} toYear={new Date().getFullYear()} captionLayout="dropdown" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>City of Birth</label>
                  <input type="text" value={editForm.pobCity} onChange={e => setEditForm(p => ({ ...p, pobCity: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl text-xs font-semibold" style={{ background: "rgba(91,31,36,0.07)", color: MAROON }}>Cancel</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="flex-1 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                    {saving ? "Saving…" : <><Save size={14} /> Save Profile</>}
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 mt-2"
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
                <p className="text-xs" style={{ color: "#7A6A58" }}>Your purchased sacred items will appear here</p>
              </div>
            )}
            {orders.map(order => {
              const itemsList = order.order_items || order.items || [];
              const isExpanded = expandedOrders[order.id];
              const stepIdx = getOrderStep(order.status, order.awb_code);
              return (
                <div key={order.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.08)" }}>
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleOrder(order.id)}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: MAROON }}>Order #{order.id}</p>
                      <p className="text-[10px]" style={{ color: "#9A8A78" }}>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(order.total_amount / 100).toLocaleString("en-IN")}</p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(74,138,74,0.12)", color: "#2E6B2E" }}>{order.status || "CONFIRMED"}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-black/5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        {ORDER_STEPS.map((s, idx) => (
                          <div key={s.label} className="text-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-[10px]"
                              style={{ background: idx <= stepIdx ? MAROON : "#eee", color: idx <= stepIdx ? IVORY : "#999" }}>
                              {s.icon}
                            </div>
                            <span style={{ fontSize: 9, color: idx <= stepIdx ? MAROON : "#999" }}>{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {itemsList.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span>{it.product_name || "Sacred Item"} x{it.quantity}</span>
                            <span className="font-semibold">₹{((it.unit_price * it.quantity) / 100).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
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
