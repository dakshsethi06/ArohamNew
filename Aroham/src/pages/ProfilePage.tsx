import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, User, Package, Truck, CheckCircle, Edit2, Save, X, Calendar, ChevronDown, MapPin, Trash2, Plus, LogOut } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { INDIA_STATES } from "@/constants/data";

const ORDER_STEPS = [
  { label: "Ordered", icon: "✓" },
  { label: "Processing", icon: "🪔" },
  { label: "Shipped", icon: "🚚" },
  { label: "Delivered", icon: "🏠" },
];

function getOrderStep(status: string, awbCode?: string) {
  if (status === "CANCELLED" || status === "Cancelled") return -1;
  if (status === "Delivered" || status === "DELIVERED") return 3;
  if (awbCode || status === "SHIPPED" || status === "Shipped") return 2;
  if (status === "CONFIRMED" || status === "Processing") return 1;
  return 0; // Ordered
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">(
    (searchParams.get("tab") as "profile" | "addresses" | "orders") || "profile"
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
    gender: "",
    dob: "",
    pobCity: ""
  });

  // Address Manager State
  const [profileAddresses, setProfileAddresses] = useState<any[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | number | null>(null);
  const [addrForm, setAddrForm] = useState({
    name: "",
    phone: "",
    pin: "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    addressType: "Home"
  });

  // Load profile addresses
  useEffect(() => {
    try {
      const savedList = localStorage.getItem("aroham_saved_addresses_list");
      if (savedList) {
        setProfileAddresses(JSON.parse(savedList));
      }
    } catch (e) {}

    if (user?.id) {
      Promise.resolve(supabase.from("addresses").select("*").eq("user_id", user.id))
        .then(({ data }) => {
          if (data && data.length > 0) {
            setProfileAddresses(data);
            localStorage.setItem("aroham_saved_addresses_list", JSON.stringify(data));
          }
        }).catch(() => {});
    }
  }, [user?.id, activeTab]);

  const handleSaveProfileAddress = async () => {
    const missing: string[] = [];
    if (!addrForm.name.trim()) missing.push("Name");
    if (!addrForm.phone.trim()) missing.push("Phone Number");
    if (!addrForm.pin.trim()) missing.push("PIN Code");
    if (!addrForm.house.trim()) missing.push("House / Flat No.");
    if (!addrForm.city.trim()) missing.push("City");

    if (missing.length > 0) {
      alert(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const newAddrObj = {
      id: editingAddrId || Date.now(),
      name: addrForm.name.trim(),
      full_name: addrForm.name.trim(),
      phone: addrForm.phone.replace(/\D/g, "").slice(-10),
      house: addrForm.house,
      street: addrForm.street,
      landmark: addrForm.landmark,
      address: `${addrForm.house}, ${addrForm.street}${addrForm.landmark ? ", " + addrForm.landmark : ""}`.trim(),
      line1: `${addrForm.house}, ${addrForm.street}${addrForm.landmark ? ", " + addrForm.landmark : ""}`.trim(),
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pin,
      pin: addrForm.pin,
      address_type: addrForm.addressType
    };

    const updatedList = profileAddresses.filter(a => a.id !== editingAddrId);
    const newList = [newAddrObj, ...updatedList];
    setProfileAddresses(newList);
    localStorage.setItem("aroham_saved_addresses_list", JSON.stringify(newList));
    setShowAddrForm(false);
    setEditingAddrId(null);
    setAddrForm({ name: "", phone: "", pin: "", house: "", street: "", landmark: "", city: "", state: "", addressType: "Home" });

    if (user?.id) {
      Promise.resolve(supabase.from("addresses").upsert({
        user_id: user.id,
        name: newAddrObj.name,
        phone: newAddrObj.phone,
        address: newAddrObj.address,
        city: newAddrObj.city,
        state: newAddrObj.state,
        pincode: newAddrObj.pincode,
        address_type: newAddrObj.address_type
      })).catch(err => console.warn("Supabase address save warning:", err));
    }
  };

  const handleEditProfileAddress = (addr: any) => {
    const nameParts = (addr.full_name || addr.name || "").trim();
    setEditingAddrId(addr.id);

    let houseVal = (addr.house || "").trim();
    let streetVal = (addr.street || "").trim();

    if (!houseVal && (addr.address || addr.line1)) {
      houseVal = (addr.address || addr.line1 || "").trim();
    }

    // Clean houseVal if it contains a comma or merged street address
    if (houseVal.includes(",")) {
      const parts = houseVal.split(",");
      houseVal = parts[0].trim();
      if (!streetVal) {
        streetVal = parts.slice(1).join(",").trim();
      }
    }

    setAddrForm({
      name: nameParts,
      phone: addr.phone || "",
      pin: String(addr.pincode || addr.pin || ""),
      house: houseVal,
      street: streetVal,
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      addressType: addr.address_type || addr.type || "Home"
    });
    setShowAddrForm(true);
  };

  const handleDeleteProfileAddress = (id: string | number) => {
    if (!confirm("Remove this address?")) return;
    const newList = profileAddresses.filter(a => String(a.id) !== String(id));
    setProfileAddresses(newList);
    localStorage.setItem("aroham_saved_addresses_list", JSON.stringify(newList));
    if (user?.id) {
      Promise.resolve(supabase.from("addresses").delete().eq("id", id)).catch(() => {});
    }
  };

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancelOrder = async (orderId: string | number) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    // 1. Save CANCELLED status persistently in localStorage
    localStorage.setItem(`aroham_order_status_${orderId}`, "CANCELLED");

    try {
      if (user?.id) {
        await Promise.resolve(
          supabase.from("orders").update({ status: "CANCELLED" }).eq("id", orderId)
        ).catch(() => {});
      }

      await api(`/orders/${orderId}/cancel`, { method: "POST" }).catch(() => {});

      setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: "CANCELLED" } : o));
      alert(`Order #${orderId} has been cancelled successfully.`);
    } catch (err) {
      console.error("Order cancellation error:", err);
      setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: "CANCELLED" } : o));
      alert(`Order #${orderId} has been cancelled.`);
    }
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
    
    if (user?.id) {
      Promise.resolve(supabase.from("users").select("*").eq("id", user.id).single())
        .then(({ data, error }) => {
          if (data && !error) {
            setProfile(data);
            initEditForm(data);
            sessionStorage.setItem("aroham_user_profile", JSON.stringify(data));
          }
        })
        .catch(console.error)
        .finally(() => setLoadingProfile(false));
    } else {
      setLoadingProfile(false);
    }
  }, [user?.id]);

  const initEditForm = (p: any) => {
    setEditForm({
      fullName: p?.full_name || p?.fullName || user?.user_metadata?.full_name || "",
      email: p?.email || user?.email || "",
      phone: p?.phone || user?.user_metadata?.phone || "",
      gender: p?.gender || "",
      dob: p?.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
      pobCity: p?.pob_city || p?.pobCity || ""
    });
  };

  // Fetch real orders from DB with cancellation persistence
  useEffect(() => {
    if (activeTab === "orders") {
      setLoadingOrders(true);
      
      const fetchOrders = async () => {
        let fetchedOrders: any[] = [];

        if (user?.id) {
          try {
            const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
            if (data && data.length > 0) {
              fetchedOrders = data;
            }
          } catch (e) {
            console.warn("Error fetching Supabase orders:", e);
          }
        }

        // Fetch from user-specific local storage
        const userOrdersKey = user?.id ? `aroham_user_orders_${user.id}` : "aroham_guest_orders";
        const localUserOrdersStr = localStorage.getItem(userOrdersKey);
        if (localUserOrdersStr) {
          try {
            const parsedLocal = JSON.parse(localUserOrdersStr);
            parsedLocal.forEach((lo: any) => {
              if (!fetchedOrders.some(o => String(o.id) === String(lo.id))) {
                fetchedOrders.push(lo);
              }
            });
          } catch (e) {}
        }

        const localOrderId = sessionStorage.getItem("aroham_last_order_id");
        const localItemsStr = sessionStorage.getItem("aroham_last_order_items");
        const localTotalStr = sessionStorage.getItem("aroham_order_total");

        if (localOrderId && localItemsStr && !fetchedOrders.some(o => String(o.id) === String(localOrderId))) {
          try {
            const parsedItems = JSON.parse(localItemsStr);
            const savedStatus = localStorage.getItem(`aroham_order_status_${localOrderId}`) || "Processing";
            
            fetchedOrders.unshift({
              id: localOrderId,
              created_at: new Date().toISOString(),
              status: savedStatus,
              total_amount: parseFloat(localTotalStr || "0") * 100,
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

        // Apply saved status overrides from localStorage for all orders
        fetchedOrders = fetchedOrders.map(o => {
          const overrideStatus = localStorage.getItem(`aroham_order_status_${o.id}`);
          return overrideStatus ? { ...o, status: overrideStatus } : o;
        });

        setOrders(fetchedOrders);
        setLoadingOrders(false);
      };

      fetchOrders();
    }
  }, [activeTab, user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    const phoneDigits = editForm.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const profileData = {
        id: user.id,
        full_name: editForm.fullName,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        gender: editForm.gender,
        dob: editForm.dob,
        pobCity: editForm.pobCity,
        created_at: profile?.created_at || new Date().toISOString()
      };

      // 1. Instant save to Session Storage & Local Storage
      sessionStorage.setItem("aroham_user_profile", JSON.stringify(profileData));
      if (editForm.phone) {
        const phoneDigits = editForm.phone.replace(/\D/g, "");
        localStorage.setItem(`aroham_registered_user_phone_${phoneDigits}`, JSON.stringify(profileData));
      }

      // Update UI profile state & finish saving instantly
      setProfile(profileData);
      setIsEditing(false);
      setSaveSuccess(true);
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);

      // 2. Non-blocking background sync with Firestore & Supabase
      Promise.race([
        setDoc(doc(db, "users", user.id), {
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          gender: editForm.gender,
          dob: editForm.dob,
          pobCity: editForm.pobCity,
          updatedAt: serverTimestamp()
        }, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]).catch(err => console.warn("Firestore save profile warning:", err));

      Promise.race([
        supabase.from("users").upsert({
          id: user.id,
          full_name: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          gender: editForm.gender,
          dob: editForm.dob,
          created_at: profile?.created_at || new Date().toISOString()
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
      ]).catch(err => console.warn("Supabase profile save warning:", err));

    } catch (e: any) {
      alert("Failed to save profile: " + (e.message || "Please try again."));
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const displayName = profile?.full_name || profile?.fullName || user?.user_metadata?.full_name || "Devotee";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const profileFields = [
    { label: "Name",   value: profile?.full_name || profile?.fullName || user?.user_metadata?.full_name || "—" },
    { label: "Email",  value: profile?.email || user?.email || "—" },
    { label: "Phone",  value: profile?.phone || user?.user_metadata?.phone || "—" },
    { label: "Gender", value: profile?.gender || "—" },
    { label: "Date of Birth", value: profile?.dob ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
    { label: "City of Birth", value: profile?.pob_city || profile?.pobCity || "—" },
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
          {(["profile", "addresses", "orders"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200"
              style={{ background: activeTab === t ? MAROON : "transparent", color: activeTab === t ? IVORY : MAROON }}>
              {t === "profile" ? "My Profile" : t === "addresses" ? "Saved Addresses" : "My Orders"}
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
                  <label htmlFor="profile-full-name" className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Full Name</label>
                  <input id="profile-full-name" name="name" autoComplete="name" type="text" value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Email Address</label>
                  <input id="profile-email" name="email" autoComplete="email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON }} />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Mobile Phone Number</label>
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2" }}>
                    <span className="px-3 py-2.5 text-xs font-bold border-r flex items-center gap-1 flex-shrink-0 select-none" style={{ background: "rgba(91,31,36,0.04)", color: MAROON, borderColor: "rgba(91,31,36,0.1)", fontFamily: SANS }}>
                      🇮🇳 +91
                    </span>
                    <input id="profile-phone" name="tel" autoComplete="tel" type="tel" placeholder="10-digit mobile number" maxLength={10} value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" style={{ color: MAROON }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>Gender</label>
                    <Select.Root value={editForm.gender} onValueChange={v => setEditForm(p => ({ ...p, gender: v }))}>
                      <Select.Trigger asChild>
                        <button className="w-full px-3 py-2.5 rounded-xl text-sm text-left flex items-center justify-between transition-all focus:ring-2 focus:ring-offset-1"
                          style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON, fontFamily: SANS, outline: "none" }}>
                          <Select.Value placeholder="Select gender" />
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
                  <label htmlFor="profile-city" className="block text-xs font-semibold mb-1" style={{ color: "#7A6A58" }}>City of Birth</label>
                  <input id="profile-city" name="address-level2" autoComplete="address-level2" type="text" value={editForm.pobCity} onChange={e => setEditForm(p => ({ ...p, pobCity: e.target.value }))}
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

            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 mt-6 shadow-md hover:shadow-xl active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`,
                color: IVORY,
                border: "1px solid rgba(200,160,68,0.3)",
                cursor: "pointer"
              }}
            >
              <LogOut size={16} style={{ color: GOLD }} />
              <span>Sign Out</span>
            </button>
          </>
        )}

        {/* Saved Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            {!showAddrForm ? (
              <>
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-base font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Your Saved Addresses</h3>
                  <button
                    onClick={() => {
                      setEditingAddrId(null);
                      setAddrForm({ name: "", phone: "", pin: "", house: "", street: "", landmark: "", city: "", state: "", addressType: "Home" });
                      setShowAddrForm(true);
                    }}
                    className="text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 transition-all hover:opacity-90 shadow-sm"
                    style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {profileAddresses.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.08)" }}>
                    <MapPin size={32} className="mx-auto mb-2 opacity-40" style={{ color: MAROON }} />
                    <p className="text-sm font-semibold mb-1" style={{ fontFamily: SERIF, color: MAROON }}>No saved addresses</p>
                    <p className="text-xs text-gray-500">Add an address to make your checkout faster</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileAddresses.map(addr => {
                      const addrLine = [addr.line1 || addr.address_line1 || addr.address, addr.city, addr.state].filter(Boolean).join(", ");
                      return (
                        <div key={addr.id} className="p-4 rounded-2xl bg-white border border-black/10 flex items-start justify-between gap-3 shadow-sm">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-xl mt-0.5" style={{ background: "rgba(200,160,68,0.1)", color: MAROON }}>
                              <MapPin size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "rgba(91,31,36,0.08)", color: MAROON }}>
                                  {addr.address_type || addr.type || "Home"}
                                </span>
                              </div>
                              <p className="text-xs font-semibold" style={{ color: "#3A2A1A" }}>{addr.full_name || addr.name} · {addr.phone}</p>
                              <p className="text-xs leading-relaxed text-gray-600 mt-1">{addrLine} – {addr.pincode || addr.pin}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => handleEditProfileAddress(addr)} className="p-2 rounded-lg hover:bg-amber-50" style={{ color: MAROON, border: "1px solid rgba(91,31,36,0.12)" }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteProfileAddress(addr.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "#C04040", border: "1px solid rgba(192,64,64,0.15)" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.12)", boxShadow: "0 4px 20px rgba(91,31,36,0.05)" }}>
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <h3 className="text-base font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>{editingAddrId ? "Edit Address" : "Add New Address"}</h3>
                  <button onClick={() => setShowAddrForm(false)} className="p-1 rounded-full hover:bg-black/5" style={{ color: MAROON }}><X size={18} /></button>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">Full Name *</label>
                  <input type="text" value={addrForm.name} onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">Phone Number *</label>
                  <input type="tel" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">PIN Code *</label>
                    <input type="text" maxLength={6} value={addrForm.pin} onChange={e => setAddrForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">House / Flat No. *</label>
                    <input type="text" value={addrForm.house} onChange={e => setAddrForm(p => ({ ...p, house: e.target.value.replace(/\D/g, "") }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-600">Street Address</label>
                  <input type="text" value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">City *</label>
                    <input type="text" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">State</label>
                    <input type="text" value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-black/15 bg-[#FAF7F2]" />
                  </div>
                </div>

                {/* Address Type Selector */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-600">Save Address As</label>
                    <div className="flex gap-2">
                      {["Home", "Office", "Other"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddrForm(p => ({ ...p, addressType: type }))}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          style={{
                            background: addrForm.addressType === type ? MAROON : "#FAF7F2",
                            color: addrForm.addressType === type ? IVORY : MAROON,
                            border: `1.5px solid ${addrForm.addressType === type ? MAROON : "rgba(91,31,36,0.15)"}`
                          }}
                        >
                          {type === "Home" ? "🏠 Home" : type === "Office" ? "🏢 Office" : "📍 Other"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddrForm(false)} className="flex-1 py-3 rounded-xl text-xs font-semibold bg-black/5" style={{ color: MAROON }}>Cancel</button>
                  <button onClick={handleSaveProfileAddress} className="flex-1 py-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)` }}>
                    <Save size={14} /> Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
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
              const isCancelled = order.status === "CANCELLED" || order.status === "Cancelled";
              return (
                <div key={order.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: "#fff", border: "1px solid rgba(91,31,36,0.08)" }}>
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleOrder(order.id)}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: MAROON }}>Order #{order.id}</p>
                      <p className="text-[10px]" style={{ color: "#9A8A78" }}>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{(order.total_amount / 100).toLocaleString("en-IN")}</p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{
                          background: isCancelled ? "rgba(220,38,38,0.12)" : "rgba(74,138,74,0.12)",
                          color: isCancelled ? "#DC2626" : "#2E6B2E"
                        }}>
                        {order.status || "CONFIRMED"}
                      </span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-black/5 space-y-4">
                      {/* Timeline */}
                      {!isCancelled && (
                        <div className="relative pt-2">
                          {/* Background line */}
                          <div className="absolute top-[18px] left-[12%] right-[12%] h-[2px] bg-[#eee] z-0" />
                          {/* Progress line */}
                          <div className="absolute top-[18px] left-[12%] h-[2px] z-0 transition-all duration-500" 
                               style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 76}%`, background: MAROON }} />
                          
                          <div className="flex justify-between items-center text-xs relative z-10">
                            {ORDER_STEPS.map((s, idx) => (
                              <div key={s.label} className="text-center flex-1 flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] transition-colors"
                                  style={{ background: idx <= stepIdx ? MAROON : "#eee", color: idx <= stepIdx ? IVORY : "#999" }}>
                                  {s.icon}
                                </div>
                                <span style={{ fontSize: 9, color: idx <= stepIdx ? MAROON : "#999", fontWeight: idx <= stepIdx ? 600 : 400 }}>{s.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-2 pt-2 border-t border-black/5">
                        {itemsList.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span>{it.product_name || "Sacred Item"} x{it.quantity}</span>
                            <span className="font-semibold">₹{((it.unit_price * it.quantity) / 100).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      {!isCancelled && stepIdx <= 1 && (
                        <div className="pt-4 flex justify-end items-center mt-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                            className="text-xs font-semibold px-5 py-2 rounded-full transition-colors border hover:bg-red-100 active:scale-95 transition-all"
                            style={{ borderColor: "rgba(220,38,38,0.3)", color: "#DC2626", background: "rgba(220,38,38,0.05)" }}>
                            Cancel Order
                          </button>
                        </div>
                      )}
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
