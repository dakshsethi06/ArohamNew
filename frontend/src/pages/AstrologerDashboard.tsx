import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  UserCheck,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Clock,
  Check,
  X,
  User,
  Camera,
  Star,
  DollarSign,
  TrendingUp,
  BookOpen,
  ShoppingBag,
  Award,
  AlertCircle,
  PhoneCall,
  Wallet,
  MessageSquare,
  FileText,
  Settings,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Lock,
  ThumbsUp,
  LogOut,
  BarChart2,
  Bell,
  Headphones,
  Users,
  Layers,
  Activity
} from "lucide-react";

const REMEDY_PRODUCTS = [
  { slug: "5-mukhi-rudraksha", name: "5 Mukhi Nepali Rudraksha", price: 1499, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80" },
  { slug: "yellow-sapphire-pukhraj", name: "Certified Yellow Sapphire (Pukhraj)", price: 8999, img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=200&q=80" },
  { slug: "shree-yantra-brass", name: "Energized Brass Shree Yantra", price: 2499, img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80" },
  { slug: "seven-chakra-bracelet", name: "7-Chakra Crystal Gemstone Bracelet", price: 999, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80" }
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
];

const QUICK_ASTRO_RESPONSES = [
  "Hari Om! Please share your Exact Time & Date of Birth.",
  "I am analyzing your Prashna Kundali planetary positions right now.",
  "Your Rahu Mahadasha is active. I recommend wearing a 5 Mukhi Rudraksha.",
  "According to your 7th House position, Jupiter brings strong marriage prospects."
];

const MOCK_REVIEWS = [
  { id: 1, user: "Rahul Sharma", rating: 5, date: "Today", text: "Acharya Ji gave very accurate Kundali analysis. Recommended 5 Mukhi Rudraksha which brought immense mental peace." },
  { id: 2, user: "Priya Malhotra", rating: 5, date: "Yesterday", text: "Extremely insightful consultation regarding my career change & gemstone selection!" },
  { id: 3, user: "Vikram Patel", rating: 5, date: "2 days ago", text: "Prashna Kundali remedy for business growth worked wonders. Grateful!" }
];

const MOCK_TRANSACTIONS = [
  { id: "TXN-8812", user: "Daksh Sethi", type: "Live Chat", duration: "18 mins", rate: "₹20/min", amount: "₹360", status: "Settled", date: "Today, 02:45 PM" },
  { id: "TXN-8811", user: "Priya M.", type: "Live Chat", duration: "25 mins", rate: "₹20/min", amount: "₹500", status: "Settled", date: "Today, 01:15 PM" },
  { id: "TXN-8810", user: "Anand Verma", type: "Audio Call", duration: "30 mins", rate: "₹25/min", amount: "₹750", status: "Settled", date: "Yesterday" }
];

const MOCK_CALL_LOGS = [
  { id: "CALL-101", user: "Sneha Reddy", duration: "12 mins", status: "Completed", amount: "₹240", time: "Today, 11:20 AM" },
  { id: "CALL-102", user: "Amitabh K.", duration: "20 mins", status: "Completed", amount: "₹400", time: "Yesterday, 06:15 PM" }
];

type MainTab = "overview" | "workstation" | "calls" | "wallet" | "reviews" | "remedies" | "profile";

export function AstrologerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");

  const [isChatOnline, setIsChatOnline] = useState(true);
  const [isCallOnline, setIsCallOnline] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");

  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || "Acharya Astrologer",
    email: user?.email || "acharya.vedic@aroham.com",
    phone: user?.user_metadata?.phone || "9876543210",
    dob: "1988-06-15",
    title: "Senior Vedic Jyotish & Prashna Kundali Master",
    experience: "8",
    specialty: "Vedic Kundali",
    languages: "Hindi, English, Sanskrit, Gujarati",
    degree: "Jyotish Acharya (BHU, Varanasi)",
    bio: "Certified Vedic Astrologer with over 8+ years of experience in Prashna Kundali, Gemology & Vastu remedies. Over 9,500+ consultations guided successfully.",
    avatar: PRESET_AVATARS[0],
    pricePerMin: "20"
  });

  const [acceptedSessionIds, setAcceptedSessionIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("aroham_accepted_session_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const currentAstroId = user?.id || "astro-1";

  useEffect(() => {
    try {
      const cached = localStorage.getItem(`aroham_astro_profile_${user?.id}`);
      if (cached) setProfile(prev => ({ ...prev, ...JSON.parse(cached) }));
    } catch (e) {}

    const syncSessions = () => { fetchSessions(); };
    window.addEventListener("storage", syncSessions);
    window.addEventListener("focus", syncSessions);

    fetchSessions();

    const sub = supabase
      .channel(`incoming-requests-${currentAstroId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions", filter: `astrologer_id=eq.${currentAstroId}` }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      window.removeEventListener("storage", syncSessions);
      window.removeEventListener("focus", syncSessions);
      supabase.removeChannel(sub);
    };
  }, [user, currentAstroId]);

  const handleLogout = async () => {
    await broadcastStatus(false);
    try {
      await logout();
    } catch (e) {}
    navigate("/auth?role=astrologer");
  };

  const toggleChatOnline = async () => {
    const nextStatus = !isChatOnline;
    setIsChatOnline(nextStatus);
    broadcastStatus(nextStatus);
  };

  const toggleCallOnline = () => {
    setIsCallOnline(prev => !prev);
  };

  const broadcastStatus = async (statusBool: boolean) => {
    try {
      const existing = JSON.parse(localStorage.getItem("aroham_registered_astrologers") || "[]");
      if (Array.isArray(existing) && existing.length > 0) {
        const updated = existing.map((a: any) => {
          if (a.id === currentAstroId || !user?.id) {
            return { ...a, status: statusBool ? "online" : "offline" };
          }
          return a;
        });
        localStorage.setItem("aroham_registered_astrologers", JSON.stringify(updated));
      }

      localStorage.setItem("aroham_global_online_status", JSON.stringify({
        userId: currentAstroId,
        isOnline: statusBool,
        timestamp: Date.now()
      }));

      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    try {
      if (user?.id) {
        await supabase.from("astrologers").update({ is_online: statusBool }).eq("id", user.id);
      }
    } catch (e) {}
  };

  const fetchSessions = async () => {
    let sessionList: any[] = [];
    try {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .or(`astrologer_id.eq.${currentAstroId},astrologer_id.eq.astro-1`)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) sessionList = data;
    } catch (e) {}

    try {
      const latestLocal = localStorage.getItem("aroham_latest_live_session");
      if (latestLocal) {
        const parsed = JSON.parse(latestLocal);
        if (parsed.astrologer_id === currentAstroId || parsed.astrologer_id === "astro-1" || !parsed.astrologer_id) {
          if (!sessionList.some(s => s.id === parsed.id)) {
            sessionList.unshift(parsed);
          }
        }
      }
    } catch (e) {}

    setSessions(sessionList);
  };

  const saveProfile = async () => {
    try {
      const updatedProfile = { ...profile };
      localStorage.setItem(`aroham_astro_profile_${user?.id}`, JSON.stringify(updatedProfile));
      
      if (user?.id) {
        await supabase.from("astrologers").upsert({
          id: user.id,
          full_name: profile.name,
          email: profile.email,
          phone: profile.phone,
          title: profile.title,
          experience_years: parseInt(profile.experience) || 5,
          specialties: [profile.specialty, "Vedic Kundali"],
          languages: profile.languages.split(",").map(l => l.trim()),
          bio: profile.bio,
          avatar_url: profile.avatar,
          is_online: isChatOnline,
          role: "astrologer"
        });
      }
    } catch (e) {}

    setShowProfileWizard(false);
  };

  const acceptSession = async (s: any) => {
    const updatedSet = new Set(acceptedSessionIds);
    updatedSet.add(s.id);
    setAcceptedSessionIds(updatedSet);
    try {
      localStorage.setItem("aroham_accepted_session_ids", JSON.stringify(Array.from(updatedSet)));
    } catch (e) {}

    const activeObj = { ...s, status: "active" };
    setActiveSession(activeObj);
    setActiveTab("workstation");

    setSessions(prev => prev.map(item => item.id === s.id ? { ...item, status: "active" } : item));

    try {
      const latestLocal = localStorage.getItem("aroham_latest_live_session");
      if (latestLocal) {
        const parsed = JSON.parse(latestLocal);
        if (parsed.id === s.id) {
          parsed.status = "active";
          localStorage.setItem("aroham_latest_live_session", JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (e) {}

    try {
      await supabase.from("chat_sessions").update({ status: "active", astrologer_id: user?.id || "astro-1" }).eq("id", s.id);
    } catch (e) {}

    fetchMessages(s.id);
  };

  const rejectSession = async (s: any) => {
    try {
      await supabase.from("chat_sessions").update({ status: "declined" }).eq("id", s.id);
      setSessions(prev => prev.filter(item => item.id !== s.id));
      if (activeSession?.id === s.id) setActiveSession(null);
    } catch {
      setSessions(prev => prev.filter(item => item.id !== s.id));
    }
  };

  const fetchMessages = async (sessionId: string) => {
    let loadedMsgs: any[] = [];
    try {
      const { data } = await supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
      if (data && data.length > 0) loadedMsgs = data;
    } catch (e) {}

    try {
      const localMsgs = JSON.parse(localStorage.getItem(`aroham_live_chat_${sessionId}`) || "[]");
      if (Array.isArray(localMsgs) && localMsgs.length > 0) {
        localMsgs.forEach(lm => {
          if (!loadedMsgs.some(m => m.id === lm.id || (m.text === lm.text && m.sender === lm.sender))) {
            loadedMsgs.push(lm);
          }
        });
      }
    } catch (e) {}

    setMessages(loadedMsgs);
  };

  const sendMessage = async (customText?: string, productRemedy?: any) => {
    const messageText = customText || reply;
    if (!messageText.trim() && !productRemedy) return;
    if (!activeSession) return;

    const newMsg = {
      id: Date.now().toString(),
      session_id: activeSession.id,
      sender: "astrologer",
      text: messageText,
      recommendedProduct: productRemedy || null,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    if (!customText) setReply("");

    try {
      await supabase.from("chat_messages").insert({
        session_id: activeSession.id,
        sender: "astrologer",
        text: messageText,
        recommended_product_slug: productRemedy?.slug || null
      });
    } catch (e) {}

    try {
      const existingKey = `aroham_live_chat_${activeSession.id}`;
      const existing = JSON.parse(localStorage.getItem(existingKey) || "[]");
      const updated = [...existing, newMsg];
      localStorage.setItem(existingKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      await supabase.from("chat_sessions").update({ status: "completed" }).eq("id", activeSession.id);
    } catch {}
    setSessions(prev => prev.map(item => item.id === activeSession.id ? { ...item, status: "completed" } : item));
    setActiveSession(null);
    setMessages([]);
  };

  const filteredSessions = sessions.filter(s => {
    if (filterTab === "active") return s.status === "active" || acceptedSessionIds.has(s.id);
    if (filterTab === "completed") return s.status === "completed";
    return true;
  });

  const pendingCount = sessions.filter(s => s.status === "pending" && !acceptedSessionIds.has(s.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]" style={{ fontFamily: SANS, color: "#4A3E31" }}>
      
      <header className="px-6 py-3.5 border-b border-amber-900/15 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-xl" style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}>
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img src={profile.avatar} alt={profile.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-300 shadow-md" />
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#5B1F24] ${isChatOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: SERIF }}>{profile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                <Award size={10} /> Certified Scholar
              </span>
            </div>
            <p className="text-xs text-amber-200/80">{profile.title} • ₹{profile.pricePerMin}/min</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          
          {pendingCount > 0 && (
            <button
              onClick={() => setActiveTab("workstation")}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 animate-bounce shadow-md"
            >
              <Bell size={14} />
              <span>{pendingCount} Ringing</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Wallet size={14} className="text-amber-300" />
            <span>Today: ₹3,850</span>
          </div>

          <button
            onClick={toggleChatOnline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              isChatOnline
                ? "bg-emerald-600/30 text-emerald-200 border-emerald-400/40 hover:bg-emerald-600/40"
                : "bg-black/30 text-amber-200/60 border-white/20 hover:bg-black/40"
            }`}
          >
            <MessageSquare size={13} />
            <span>CHAT: {isChatOnline ? "ONLINE" : "OFFLINE"}</span>
          </button>

          <button
            onClick={toggleCallOnline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              isCallOnline
                ? "bg-amber-400/20 text-amber-200 border-amber-400/40 hover:bg-amber-400/30"
                : "bg-black/30 text-amber-200/60 border-white/20 hover:bg-black/40"
            }`}
          >
            <PhoneCall size={13} />
            <span>CALL: {isCallOnline ? "ONLINE" : "OFFLINE"}</span>
          </button>

          <button
            onClick={() => navigate("/consult")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 text-amber-100 hover:text-white hover:bg-white/10 transition-all"
          >
            User Directory
          </button>

          <button
            onClick={handleLogout}
            title="Log Out Astrologer Session"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        <aside className="w-full lg:w-64 bg-[#F5EDE0] border-r border-amber-900/15 p-4 flex lg:flex-col justify-between overflow-x-auto lg:overflow-y-auto shrink-0">
          <div className="space-y-1 flex lg:flex-col gap-1 w-full">
            {[
              { id: "overview", label: "Dashboard & Analytics", icon: BarChart2 },
              { id: "workstation", label: "Live Workstation & Queue", icon: MessageCircle, badge: pendingCount },
              { id: "calls", label: "Call & Audio Consults", icon: PhoneCall },
              { id: "wallet", label: "Earnings & Wallet", icon: Wallet },
              { id: "reviews", label: "Ratings & Reviews", icon: Star },
              { id: "remedies", label: "Remedies Catalog", icon: ShoppingBag },
              { id: "profile", label: "Profile & Rate Settings", icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MainTab)}
                  className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all whitespace-nowrap ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-amber-900/80 hover:text-[#5B1F24] hover:bg-amber-900/10"
                  }`}
                  style={isActive ? { background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-amber-300" : "text-amber-900/60"} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-black">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block pt-4 border-t border-amber-900/15 mt-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/60 border border-amber-900/10 text-xs">
              <p className="text-xs font-bold text-[#5B1F24] mb-1" style={{ fontFamily: SERIF }}>Aroham Scholar Helpline</p>
              <p className="text-[10px] text-amber-900/70 leading-relaxed">Dedicated Astrologer support available 24x7.</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-2xl text-xs font-bold bg-red-900/10 hover:bg-red-900/20 text-red-800 border border-red-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut size={14} /> Log Out Account
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-[#FAF6F0]">
          
          {activeTab === "overview" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Professional Scholar Control Center</h2>
                <p className="text-xs text-amber-900/70">Overview of active consultations, seeker metrics, and total payouts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-900/60 text-xs font-bold">
                    <span>Total Consultations</span>
                    <MessageSquare size={16} className="text-[#5B1F24]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#5B1F24]">412 Sessions</h3>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={11} /> +18% from last month
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
                    <span>Monthly Earnings</span>
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">₹84,200</h3>
                  <p className="text-[10px] text-emerald-600 font-bold">Settled to Bank Account</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-900/60 text-xs font-bold">
                    <span>Seeker Satisfaction</span>
                    <Star size={16} fill="#C8A044" stroke="none" />
                  </div>
                  <h3 className="text-2xl font-black text-[#5B1F24]">4.95 ★</h3>
                  <p className="text-[10px] text-amber-900/60">Based on 412 Verified Ratings</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-purple-800 text-xs font-bold">
                    <span>Repeat Seekers</span>
                    <Users size={16} className="text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-black text-purple-700">86.4%</h3>
                  <p className="text-[10px] text-purple-600 font-bold">High Client Retention</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Weekly Consultation Volume</h3>
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-amber-900/10 px-2">
                    {[
                      { day: "Mon", count: 12, height: "60%" },
                      { day: "Tue", count: 18, height: "85%" },
                      { day: "Wed", count: 15, height: "70%" },
                      { day: "Thu", count: 22, height: "100%" },
                      { day: "Fri", count: 19, height: "90%" },
                      { day: "Sat", count: 25, height: "100%" },
                      { day: "Sun", count: 21, height: "95%" }
                    ].map(d => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-bold text-amber-900/60">{d.count}</span>
                        <div className="w-full rounded-t-xl bg-gradient-to-t from-[#5B1F24] to-[#7A2A30] group-hover:from-amber-600 group-hover:to-amber-500 transition-all shadow-xs" style={{ height: d.height }} />
                        <span className="text-[10px] font-bold text-[#4A3E31]">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Quick Controls</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab("workstation")}
                      className="w-full p-3.5 rounded-2xl bg-amber-900/10 hover:bg-amber-900/15 text-[#5B1F24] font-bold text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2"><MessageCircle size={15} /> Enter Live Workstation</span>
                      <ArrowUpRight size={15} />
                    </button>

                    <button
                      onClick={() => setActiveTab("wallet")}
                      className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-between transition-all border border-emerald-200"
                    >
                      <span className="flex items-center gap-2"><Wallet size={15} /> Request Instant Payout</span>
                      <ArrowUpRight size={15} />
                    </button>

                    <button
                      onClick={() => setActiveTab("profile")}
                      className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#5B1F24] font-bold text-xs flex items-center justify-between transition-all border border-amber-900/15"
                    >
                      <span className="flex items-center gap-2"><Settings size={15} /> Edit Per-Minute Fee</span>
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workstation" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/3 border-r border-amber-900/15 p-5 bg-[#F7F0E6] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/15">
                    <h2 className="text-xs font-bold tracking-wider uppercase flex items-center gap-2" style={{ color: MAROON }}>
                      <Sparkles size={15} className="text-amber-600" />
                      <span>Live Consultation Queue</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B1F24] text-amber-200">
                      {filteredSessions.length} Requests
                    </span>
                  </div>

                  <div className="flex gap-1 mb-4 bg-white/70 p-1 rounded-xl border border-amber-900/15 shadow-xs">
                    {(["all", "active", "completed"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setFilterTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          filterTab === tab ? "bg-[#5B1F24] text-white shadow-xs" : "text-amber-900/70 hover:text-[#5B1F24]"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                    {filteredSessions.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-white border border-amber-900/10 text-center text-xs text-amber-900/70 space-y-2 shadow-xs">
                        <Clock size={24} className="mx-auto text-amber-700/50" />
                        <p className="font-semibold text-[#5B1F24]">No pending requests right now.</p>
                      </div>
                    ) : (
                      filteredSessions.map(s => {
                        const isActive = activeSession?.id === s.id;
                        const isAccepted = s.status === "active" || acceptedSessionIds.has(s.id) || isActive;
                        const isPending = s.status === "pending" && !isAccepted;

                        return (
                          <div
                            key={s.id}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                              isActive
                                ? "bg-[#FFFDF9] border-amber-600/50 shadow-md ring-1 ring-amber-600/30"
                                : "bg-white border-amber-900/10 hover:border-amber-900/25 shadow-xs"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-xs text-[#5B1F24]">Seeker #{s.user_id?.slice(0, 8)}</span>
                                  {isPending && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600 text-white animate-pulse">
                                      Ringing
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-amber-900/70 font-semibold">{s.topic || "Vedic Kundali Consultation"}</p>
                              </div>
                              <span className="text-[10px] text-amber-900/50">{new Date(s.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-amber-900/10">
                              {!isAccepted ? (
                                <>
                                  <button
                                    onClick={() => acceptSession(s)}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                    style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                                  >
                                    <Check size={14} /> Accept & Chat
                                  </button>
                                  <button
                                    onClick={() => rejectSession(s)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 border border-amber-900/20 transition-all flex items-center justify-center active:scale-95"
                                  >
                                    <X size={14} /> Decline
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => acceptSession(s)}
                                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-900/10 text-[#5B1F24] border border-amber-900/20 hover:bg-amber-900/15 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <MessageCircle size={13} /> {isActive ? "Currently Active Room" : "Open Consultation Room"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 p-6 flex flex-col justify-between bg-[#FFFDF9]">
                {activeSession ? (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-amber-900/15 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Live Consultation Room #{activeSession.id?.slice(0, 8)}</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" /> Real-time Live
                          </span>
                        </div>
                        <p className="text-xs text-amber-900/60 mt-0.5">Topic: {activeSession.topic || "Vedic Horoscope & Sacred Remedies"}</p>
                      </div>

                      <button
                        onClick={endSession}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95 transition-all"
                      >
                        End Session
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-2xl bg-[#FAF6F0] border border-amber-900/15 space-y-3 min-h-[300px]">
                      {messages.map(m => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                            m.sender === "astrologer"
                              ? "ml-auto text-white rounded-tr-xs shadow-md"
                              : "mr-auto bg-white text-[#4A3E31] border border-amber-900/15 rounded-tl-xs shadow-xs"
                          }`}
                          style={m.sender === "astrologer" ? { background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` } : {}}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          {m.recommendedProduct && (
                            <div className="mt-3 p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-3">
                              <img src={m.recommendedProduct.img} alt={m.recommendedProduct.name} className="w-10 h-10 rounded-lg object-cover border border-white/30" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-extrabold uppercase text-amber-200">Recommended Sacred Remedy</p>
                                <h4 className="font-bold text-xs truncate text-white">{m.recommendedProduct.name}</h4>
                                <p className="text-xs font-bold text-amber-300">₹{m.recommendedProduct.price}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {QUICK_ASTRO_RESPONSES.map((resp, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(resp)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-900/5 hover:bg-amber-900/10 text-[#5B1F24] border border-amber-900/15 transition-all"
                        >
                          {resp}
                        </button>
                      ))}
                    </div>

                    <div className="mb-3 p-3 rounded-2xl bg-[#F7F0E6] border border-amber-900/15">
                      <p className="text-[10px] font-extrabold uppercase text-[#5B1F24] mb-2 flex items-center gap-1">
                        <ShoppingBag size={12} /> Recommend Sacred Remedy Item:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {REMEDY_PRODUCTS.map(prod => (
                          <button
                            key={prod.slug}
                            onClick={() => sendMessage(`I recommend wearing this sacred item to balance your planetary stars:`, prod)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-50 border border-amber-900/15 text-[#4A3E31] flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                          >
                            <img src={prod.img} alt={prod.name} className="w-5 h-5 rounded-md object-cover" />
                            <span>{prod.name} (₹{prod.price})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder="Type your astrological remedy or guidance..."
                        className="flex-1 h-12 px-4 rounded-xl text-xs bg-white border border-amber-900/20 text-[#4A3E31] outline-none focus:border-[#5B1F24] transition-all shadow-xs"
                      />
                      <button
                        onClick={() => sendMessage()}
                        disabled={!reply.trim()}
                        className="h-12 px-6 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                      >
                        <span>Send</span>
                        <Send size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-amber-900/40 space-y-4 p-8 text-center">
                    <div className="p-5 rounded-full bg-amber-900/10 border border-amber-900/20 text-[#5B1F24]">
                      <MessageCircle size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Astrologer Workstation Ready</h3>
                    <p className="text-xs max-w-sm text-amber-900/60 leading-relaxed">
                      Select an incoming consultation request from the left queue to accept and begin live Vedic guidance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "calls" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Audio & Call Consultations</h2>
                  <p className="text-xs text-amber-900/70 font-semibold">Manage live audio call requests and consultation logs.</p>
                </div>
                <button
                  onClick={toggleCallOnline}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isCallOnline ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" : "bg-gray-200 text-gray-700 border-gray-300"
                  }`}
                >
                  CALL STATUS: {isCallOnline ? "ONLINE" : "OFFLINE"}
                </button>
              </div>

              <div className="bg-white border border-amber-900/15 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#5B1F24] mb-4" style={{ fontFamily: SERIF }}>Call History & Logs</h3>
                <div className="space-y-3">
                  {MOCK_CALL_LOGS.map(call => (
                    <div key={call.id} className="p-4 rounded-2xl bg-[#FAF6F0] border border-amber-900/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-900/10 text-[#5B1F24]">
                          <PhoneCall size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-[#5B1F24] text-sm">{call.user}</p>
                          <p className="text-amber-900/60 text-[11px]">{call.time} • Duration: {call.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700 text-sm">{call.amount}</p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Earnings & Wallet Dashboard</h2>
                  <p className="text-xs text-amber-900/70">Track your daily, monthly, and lifetime consultation payouts.</p>
                </div>
                <button
                  onClick={() => alert("Withdrawal request initiated via UPI / Netbanking. Settlement within 24 hours.")}
                  className="px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg active:scale-95 transition-all"
                >
                  Withdraw Payout (₹3,850)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs">
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">Today's Earnings</p>
                  <h3 className="text-2xl font-black text-emerald-600">₹3,850</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">18 Live Consultation Mins</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs">
                  <p className="text-xs text-[#5B1F24] font-bold uppercase tracking-wider mb-1">This Month (July)</p>
                  <h3 className="text-2xl font-black text-[#5B1F24]">₹84,200</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">412 Total Consultations</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xs">
                  <p className="text-xs text-purple-800 font-bold uppercase tracking-wider mb-1">Lifetime Payouts</p>
                  <h3 className="text-2xl font-black text-purple-700">₹4,12,000</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">Direct Bank Transfers</p>
                </div>
              </div>

              <div className="bg-white border border-amber-900/15 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#5B1F24] mb-4" style={{ fontFamily: SERIF }}>Recent Session Earnings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-amber-900/10 text-amber-900/60 text-[11px]">
                        <th className="pb-3 font-semibold">Transaction ID</th>
                        <th className="pb-3 font-semibold">Seeker Name</th>
                        <th className="pb-3 font-semibold">Session Type</th>
                        <th className="pb-3 font-semibold">Duration</th>
                        <th className="pb-3 font-semibold">Earnings</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/5">
                      {MOCK_TRANSACTIONS.map(t => (
                        <tr key={t.id} className="hover:bg-amber-50/50">
                          <td className="py-3.5 font-mono text-[#5B1F24] font-bold">{t.id}</td>
                          <td className="py-3.5 font-bold text-[#4A3E31]">{t.user}</td>
                          <td className="py-3.5 text-amber-900/70">{t.type}</td>
                          <td className="py-3.5 text-amber-900/70">{t.duration}</td>
                          <td className="py-3.5 font-bold text-emerald-600">{t.amount}</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Customer Reviews & Ratings</h2>
                  <p className="text-xs text-amber-900/70">Seeker feedback and ratings from live Vedic consultations.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#5B1F24] px-4 py-2 rounded-2xl text-amber-200 font-bold text-sm shadow-md">
                  <Star size={18} fill="#C8A044" stroke="none" />
                  <span>4.95 ★ Rating (412 Reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_REVIEWS.map(r => (
                  <div key={r.id} className="p-5 rounded-3xl bg-white border border-amber-900/15 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#5B1F24]">{r.user}</span>
                        <span className="flex text-amber-500 text-xs">
                          {"★".repeat(r.rating)}
                        </span>
                      </div>
                      <span className="text-xs text-amber-900/50">{r.date}</span>
                    </div>
                    <p className="text-xs text-amber-900/80 leading-relaxed font-medium">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "remedies" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Sacred Remedies Catalog</h2>
                <p className="text-xs text-amber-900/70">These temple-energized remedies can be recommended during live chats.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {REMEDY_PRODUCTS.map(prod => (
                  <div key={prod.slug} className="p-4 rounded-3xl bg-white border border-amber-900/15 space-y-3 flex flex-col justify-between shadow-xs">
                    <div>
                      <img src={prod.img} alt={prod.name} className="w-full h-32 rounded-2xl object-cover border border-amber-900/10 mb-3" />
                      <h4 className="font-bold text-xs text-[#5B1F24]">{prod.name}</h4>
                      <p className="text-xs font-bold text-amber-700 mt-1">₹{prod.price}</p>
                    </div>
                    <button
                      onClick={() => alert(`Item "${prod.name}" ready to recommend during chat.`)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-amber-900/10 hover:bg-amber-900/15 text-[#5B1F24] border border-amber-900/15 transition-all"
                    >
                      Active Remedy Item
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto w-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Astrologer Profile Settings</h2>
                  <p className="text-xs text-amber-900/70">Update your qualifications, bio, and per-minute fee.</p>
                </div>
                <button
                  onClick={saveProfile}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                  style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                >
                  Save Profile Changes
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-amber-900/15 space-y-4 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5B1F24] mb-1">Per-Minute Rate (₹/min)</label>
                    <input
                      type="number"
                      value={profile.pricePerMin}
                      onChange={e => setProfile(p => ({ ...p, pricePerMin: e.target.value }))}
                      className="w-full h-11 px-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-emerald-700 font-bold outline-none focus:border-[#5B1F24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B1F24] mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={profile.experience}
                      onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                      className="w-full h-11 px-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Title Badge</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Bio & Vedic Practice Summary</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    className="w-full p-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
