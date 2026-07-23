import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/constants/products";
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

  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbCallLogs, setDbCallLogs] = useState<any[]>([]);
  const [remedyProducts, setRemedyProducts] = useState<any[]>(DEFAULT_PRODUCTS || []);
  const [financialStats, setFinancialStats] = useState({
    todayEarnings: 0,
    monthlyEarnings: 0,
    lifetimeEarnings: 0,
    totalConsultations: 0,
    averageRating: 4.95
  });

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
    bio: "PENDING_WIZARD_COMPLETION",
    avatar: PRESET_AVATARS[0],
    pricePerMin: "20"
  });

  const [showProfileWizard, setShowProfileWizard] = useState(false);

  useEffect(() => {
    if (!profile.bio || profile.bio === "PENDING_WIZARD_COMPLETION" || profile.bio.trim() === "") {
      setShowProfileWizard(true);
    }
  }, [profile.bio]);

  const [acceptedSessionIds, setAcceptedSessionIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("aroham_accepted_session_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const currentAstroId = user?.id || "astro-1";
  const pendingSession = sessions.find(s => s.status === "pending" && !acceptedSessionIds.has(s.id));

  const syncProfileToDBAndLocal = async (p: typeof profile) => {
    if (!user?.id) return;
    const formattedObj = {
      id: user.id,
      name: p.name,
      title: p.title,
      experience: `${p.experience}+ Years Exp`,
      rating: 4.95,
      consultations: 0,
      specialties: p.specialty ? [p.specialty, "Vedic Kundali"] : ["Vedic Kundali"],
      languages: p.languages.split(",").map(l => l.trim()),
      avatar: p.avatar,
      status: isChatOnline ? "online" : "offline",
      pricePerMin: parseFloat(p.pricePerMin) || 20,
      bio: p.bio
    };

    try {
      const existing = JSON.parse(localStorage.getItem("aroham_registered_astrologers") || "[]");
      const idx = existing.findIndex((a: any) => a.id === user.id);
      let updated = [...existing];
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], ...formattedObj };
      } else {
        updated.unshift(formattedObj);
      }
      localStorage.setItem("aroham_registered_astrologers", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    try {
      await supabase.from("astrologers").upsert({
        id: user.id,
        full_name: p.name,
        email: p.email,
        phone: p.phone,
        title: p.title,
        experience_years: parseInt(p.experience) || 5,
        specialties: [p.specialty, "Vedic Kundali"],
        languages: p.languages.split(",").map(l => l.trim()),
        bio: p.bio,
        avatar_url: p.avatar,
        price_per_min: parseFloat(p.pricePerMin) || 20,
        is_online: isChatOnline,
        role: "astrologer"
      });
    } catch (e) {}
  };

  useEffect(() => {
    let mockSession: any = null;
    try {
      const stored = localStorage.getItem("aroham_mock_session");
      if (stored) mockSession = JSON.parse(stored);
    } catch (e) {}

    const currentUser = user || mockSession;
    const isAstroRole =
      (currentUser as any)?.role === "astrologer" ||
      (currentUser?.user_metadata as any)?.role === "astrologer" ||
      mockSession?.role === "astrologer";

    if (!currentUser || !isAstroRole) {
      navigate("/auth?role=astrologer", { replace: true });
      return;
    }

    let currentP = { ...profile };
    try {
      const cached = localStorage.getItem(`aroham_astro_profile_${user?.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        currentP = { ...currentP, ...parsed };
        setProfile(currentP);
      }
    } catch (e) {}

    syncProfileToDBAndLocal(currentP);

    const syncAll = () => {
      fetchSessions();
      fetchDatabaseData();
    };

    window.addEventListener("storage", syncAll);
    window.addEventListener("focus", syncAll);

    fetchSessions();
    fetchDatabaseData();

    // 3-second heartbeat polling so incoming chat requests show instantly across devices
    const pollInterval = setInterval(() => {
      fetchSessions();
      fetchDatabaseData();
    }, 3000);

    const sub = supabase
      .channel(`incoming-requests-${currentAstroId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions", filter: `astrologer_id=eq.${currentAstroId}` }, () => {
        fetchSessions();
        fetchDatabaseData();
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("focus", syncAll);
      supabase.removeChannel(sub);
    };
  }, [user, currentAstroId]);

  useEffect(() => {
    if (!activeSession?.id) return;

    fetchMessages(activeSession.id);

    const activeMsgInterval = setInterval(() => {
      fetchMessages(activeSession.id);
    }, 2000);

    const channel = supabase
      .channel(`astro-messages-${activeSession.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${activeSession.id}` }, payload => {
        if (payload.new) {
          const newMsg = {
            id: payload.new.id,
            session_id: payload.new.session_id,
            sender: payload.new.sender || payload.new.sender_type,
            text: payload.new.text || payload.new.message_text,
            created_at: payload.new.created_at || new Date().toISOString()
          };
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      clearInterval(activeMsgInterval);
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id]);

  const fetchDatabaseData = async () => {
    try {
      const { data: txns } = await supabase
        .from("astrologer_transactions")
        .select("*")
        .eq("astrologer_id", currentAstroId)
        .order("created_at", { ascending: false });

      let loadedTxns = txns || [];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      let todaySum = 0;
      let monthSum = 0;
      let lifetimeSum = 0;

      loadedTxns.forEach(t => {
        const amount = Number(t.amount) || 0;
        const created = new Date(t.created_at || Date.now()).getTime();
        lifetimeSum += amount;
        if (created >= todayStart.getTime()) todaySum += amount;
        if (created >= monthStart.getTime()) monthSum += amount;
      });

      setDbTransactions(loadedTxns);
      setFinancialStats(prev => ({
        ...prev,
        todayEarnings: todaySum,
        monthlyEarnings: monthSum,
        lifetimeEarnings: lifetimeSum,
        totalConsultations: loadedTxns.length
      }));
    } catch (e) {}

    try {
      const { data: revs } = await supabase
        .from("astrologer_reviews")
        .select("*")
        .eq("astrologer_id", currentAstroId)
        .order("created_at", { ascending: false });

      if (revs && revs.length > 0) {
        setDbReviews(revs);
        const avg = revs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / revs.length;
        setFinancialStats(prev => ({ ...prev, averageRating: Number(avg.toFixed(2)) }));
      }
    } catch (e) {}

    try {
      const { data: calls } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("astrologer_id", currentAstroId)
        .eq("session_type", "Audio Call")
        .order("created_at", { ascending: false });

      if (calls && calls.length > 0) setDbCallLogs(calls);
    } catch (e) {}

    try {
      const { data: prods } = await supabase.from("products").select("*").limit(8);
      if (prods && prods.length > 0) setRemedyProducts(prods);
    } catch (e) {}
  };

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

    if (activeSession) {
      const match = sessionList.find(s => s.id === activeSession.id);
      if (match && (match.status === "completed" || match.status === "ended" || match.status === "declined")) {
        setActiveSession(null);
      }
    }
  };

  const saveProfile = async () => {
    try {
      const updatedProfile = { ...profile };
      if (!updatedProfile.bio || updatedProfile.bio === "PENDING_WIZARD_COMPLETION" || updatedProfile.bio.trim() === "") {
        updatedProfile.bio = "Certified Vedic Astrologer guiding seekers with sacred remedies, Kundali readings, and traditional wisdom.";
      }
      setProfile(updatedProfile);
      localStorage.setItem(`aroham_astro_profile_${user?.id}`, JSON.stringify(updatedProfile));
      await syncProfileToDBAndLocal(updatedProfile);
    } catch (e) {}

    setShowProfileWizard(false);
    setActiveTab("overview");
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
      if (data && data.length > 0) {
        loadedMsgs = data.map(m => ({
          ...m,
          sender: m.sender || m.sender_type,
          text: m.text || m.message_text
        }));
      }
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
        sender_type: "astrologer",
        text: messageText,
        message_text: messageText,
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

    const endedAt = new Date().toISOString();
    const startTime = new Date(activeSession.created_at || Date.now()).getTime();
    const endTime = Date.now();
    const durationMins = Math.max(1, Math.round((endTime - startTime) / (1000 * 60)));
    const ratePerMin = parseFloat(profile.pricePerMin) || 20;
    const totalAmount = durationMins * ratePerMin;

    try {
      await supabase.from("chat_sessions").update({
        status: "completed",
        ended_at: endedAt,
        duration_mins: durationMins,
        total_amount: totalAmount
      }).eq("id", activeSession.id);
    } catch {}

    try {
      await supabase.from("astrologer_transactions").insert({
        astrologer_id: user?.id || "astro-1",
        session_id: activeSession.id,
        user_name: `Seeker #${activeSession.user_id?.slice(0, 6) || "Guest"}`,
        session_type: "Live Chat",
        duration_mins: durationMins,
        rate_per_min: ratePerMin,
        amount: totalAmount,
        status: "Settled"
      });
    } catch {}

    setSessions(prev => prev.map(item => item.id === activeSession.id ? { ...item, status: "completed" } : item));
    setActiveSession(null);
    setMessages([]);
    fetchDatabaseData();
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
            <span>Today: ₹{financialStats.todayEarnings.toLocaleString("en-IN")}</span>
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
              {/* TAB 0: DASHBOARD & ANALYTICS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full overflow-y-auto">
              
               {/* Profile Completion Alert Banner */}
              {(!profile.bio || profile.bio === "PENDING_WIZARD_COMPLETION" || profile.bio.trim() === "") && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500 text-black shrink-0 font-extrabold shadow-sm">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#5B1F24]" style={{ fontFamily: SERIF }}>
                        Complete Your Scholar Profile & Practice Details
                      </h3>
                      <p className="text-xs text-amber-900/70 mt-0.5">
                        Upload your photo, set per-minute consultation rate (₹/min), languages & bio so users can book you on the Consult page.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setShowProfileWizard(true)}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                    >
                      <User size={14} />
                      <span>Complete Profile Now</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-[#5B1F24] border border-amber-900/15 hover:bg-amber-50"
                    >
                      Quick Settings
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Professional Scholar Control Center</h2>
                <p className="text-xs text-amber-900/70">Overview of active consultations, seeker metrics, and total database payouts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-900/60 text-xs font-bold">
                    <span>Total Consultations</span>
                    <MessageSquare size={16} className="text-[#5B1F24]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#5B1F24]">{financialStats.totalConsultations} Sessions</h3>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={11} /> Realtime Database Log
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
                    <span>Monthly Earnings</span>
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">₹{financialStats.monthlyEarnings.toLocaleString("en-IN")}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold">Settled to Bank Account</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-900/60 text-xs font-bold">
                    <span>Seeker Satisfaction</span>
                    <Star size={16} fill="#C8A044" stroke="none" />
                  </div>
                  <h3 className="text-2xl font-black text-[#5B1F24]">{financialStats.averageRating} ★</h3>
                  <p className="text-[10px] text-amber-900/60">Based on Verified Ratings</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-purple-800 text-xs font-bold">
                    <span>Lifetime Payouts</span>
                    <Wallet size={16} className="text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-black text-purple-700">₹{financialStats.lifetimeEarnings.toLocaleString("en-IN")}</h3>
                  <p className="text-[10px] text-purple-600 font-bold">Total Settled Earnings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-amber-900/15 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Recent Completed Consultations</h3>
                  {sessions.filter(s => s.status === "completed").length === 0 ? (
                    <div className="p-8 text-center text-xs text-amber-900/60 bg-amber-50/50 rounded-2xl border border-amber-900/10">
                      No completed session records in database yet. Completed sessions will show here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.filter(s => s.status === "completed").slice(0, 4).map(s => (
                        <div key={s.id} className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-amber-900/10 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#5B1F24]">Seeker #{s.user_id?.slice(0, 8) || "Client"}</p>
                            <p className="text-[11px] text-amber-900/60">{s.topic || "Vedic Consultation"} • {new Date(s.created_at || Date.now()).toLocaleDateString()}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                              <img src={m.recommendedProduct.image || m.recommendedProduct.img} alt={m.recommendedProduct.name} className="w-10 h-10 rounded-lg object-cover border border-white/30" />
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
                        {remedyProducts.map(prod => (
                          <button
                            key={prod.slug || prod.id}
                            onClick={() => sendMessage(`I recommend wearing this sacred item to balance your planetary stars:`, prod)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-50 border border-amber-900/15 text-[#4A3E31] flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                          >
                            <img src={prod.image || prod.img} alt={prod.name} className="w-5 h-5 rounded-md object-cover" />
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
                <h3 className="text-sm font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Call History & Database Logs</h3>
                {dbCallLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-amber-900/60 mt-4 bg-amber-50/50 rounded-2xl border border-amber-900/10">
                    No completed audio call records in database yet.
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {dbCallLogs.map(call => (
                      <div key={call.id} className="p-4 rounded-2xl bg-[#FAF6F0] border border-amber-900/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-900/10 text-[#5B1F24]">
                            <PhoneCall size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-[#5B1F24] text-sm">Seeker #{call.user_id?.slice(0, 6) || "Client"}</p>
                            <p className="text-amber-900/60 text-[11px]">{new Date(call.created_at).toLocaleString()} • Duration: {call.duration_mins || 15} mins</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700 text-sm">₹{call.total_amount || 300}</p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {call.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Earnings & Wallet Dashboard</h2>
                  <p className="text-xs text-amber-900/70">Track your daily, monthly, and lifetime database consultation payouts.</p>
                </div>
                <button
                  onClick={() => alert(`Withdrawal request for ₹${financialStats.todayEarnings} initiated via UPI / Netbanking. Settlement within 24 hours.`)}
                  className="px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg active:scale-95 transition-all"
                >
                  Withdraw Payout (₹{financialStats.todayEarnings.toLocaleString("en-IN")})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs">
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">Today's Earnings</p>
                  <h3 className="text-2xl font-black text-emerald-600">₹{financialStats.todayEarnings.toLocaleString("en-IN")}</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">Live Database Settlement</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-amber-900/15 shadow-xs">
                  <p className="text-xs text-[#5B1F24] font-bold uppercase tracking-wider mb-1">This Month</p>
                  <h3 className="text-2xl font-black text-[#5B1F24]">₹{financialStats.monthlyEarnings.toLocaleString("en-IN")}</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">{financialStats.totalConsultations} Consultations</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xs">
                  <p className="text-xs text-purple-800 font-bold uppercase tracking-wider mb-1">Lifetime Payouts</p>
                  <h3 className="text-2xl font-black text-purple-700">₹{financialStats.lifetimeEarnings.toLocaleString("en-IN")}</h3>
                  <p className="text-[11px] text-amber-900/60 mt-1">Direct Bank Transfers</p>
                </div>
              </div>

              <div className="bg-white border border-amber-900/15 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#5B1F24] mb-4" style={{ fontFamily: SERIF }}>Recent Database Session Earnings</h3>
                {dbTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-amber-900/60 bg-amber-50/50 rounded-2xl border border-amber-900/10">
                    No transactions recorded in database yet. Completed sessions will automatically populate here.
                  </div>
                ) : (
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
                        {dbTransactions.map(t => (
                          <tr key={t.id} className="hover:bg-amber-50/50">
                            <td className="py-3.5 font-mono text-[#5B1F24] font-bold">{t.id?.slice(0, 8)}</td>
                            <td className="py-3.5 font-bold text-[#4A3E31]">{t.user_name || "Seeker"}</td>
                            <td className="py-3.5 text-amber-900/70">{t.session_type || "Live Chat"}</td>
                            <td className="py-3.5 text-amber-900/70">{t.duration_mins || 1} mins</td>
                            <td className="py-3.5 font-bold text-emerald-600">₹{t.amount}</td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {t.status || "Settled"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  <span>{financialStats.averageRating} ★ Rating ({dbReviews.length} Reviews)</span>
                </div>
              </div>

              {dbReviews.length === 0 ? (
                <div className="p-12 text-center text-xs text-amber-900/60 bg-white rounded-3xl border border-amber-900/15 shadow-xs">
                  <Star size={32} className="mx-auto text-amber-400 mb-2" />
                  <p className="font-bold text-[#5B1F24]">No Database Reviews Yet</p>
                  <p className="text-[11px] text-amber-900/60 mt-1">Ratings submitted by users after consultations will show here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dbReviews.map(r => (
                    <div key={r.id} className="p-5 rounded-3xl bg-white border border-amber-900/15 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#5B1F24]">{r.user_name || "Seeker"}</span>
                          <span className="flex text-amber-500 text-xs">
                            {"★".repeat(r.rating || 5)}
                          </span>
                        </div>
                        <span className="text-xs text-amber-900/50">{new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-amber-900/80 leading-relaxed font-medium">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "remedies" && (
            <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Sacred Remedies Catalog</h2>
                <p className="text-xs text-amber-900/70">These active remedies can be recommended during live chats.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {remedyProducts.map(prod => (
                  <div key={prod.slug || prod.id} className="p-4 rounded-3xl bg-white border border-amber-900/15 space-y-3 flex flex-col justify-between shadow-xs">
                    <div>
                      <img src={prod.image || prod.img} alt={prod.name} className="w-full h-32 rounded-2xl object-cover border border-amber-900/10 mb-3" />
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
                  <p className="text-xs text-amber-900/70">Update your qualifications, bio, and per-minute fee in Supabase.</p>
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
                    value={profile.bio === "PENDING_WIZARD_COMPLETION" ? "" : profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    className="w-full p-3.5 rounded-xl text-xs bg-amber-50/50 border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Profile Completion Modal Wizard Overlay */}
      {showProfileWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF6F0] w-full max-w-2xl rounded-3xl border border-amber-900/20 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/15">
              <div>
                <h2 className="text-lg font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Complete Astrologer Profile</h2>
                <p className="text-xs text-amber-900/70">Fill out your professional credentials to appear live in the User Consult Directory.</p>
              </div>
              <button
                onClick={() => setShowProfileWizard(false)}
                className="p-2 rounded-xl bg-amber-900/10 hover:bg-amber-900/20 text-[#5B1F24]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#5B1F24]">Choose Profile Photo</label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, avatar: av }))}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                      profile.avatar === av ? "border-amber-600 ring-2 ring-amber-600/40 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt="Avatar option" className="w-14 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5B1F24] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                  placeholder="e.g. Acharya Devrat Sharma"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Per-Minute Rate (₹/min)</label>
                  <input
                    type="number"
                    value={profile.pricePerMin}
                    onChange={e => setProfile(p => ({ ...p, pricePerMin: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-emerald-700 font-bold outline-none focus:border-[#5B1F24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B1F24] mb-1">Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                  placeholder="e.g. Senior Vedic Jyotish & Prashna Kundali Master"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Primary Specialty</label>
                  <input
                    type="text"
                    value={profile.specialty}
                    onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                    placeholder="e.g. Vedic Kundali, Gemstone Remedies"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Languages Spoken</label>
                  <input
                    type="text"
                    value={profile.languages}
                    onChange={e => setProfile(p => ({ ...p, languages: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24]"
                    placeholder="e.g. Hindi, English, Sanskrit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B1F24] mb-1">Bio & Practice Summary</label>
                <textarea
                  rows={3}
                  value={profile.bio === "PENDING_WIZARD_COMPLETION" ? "" : profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  className="w-full p-3.5 rounded-xl text-xs bg-white border border-amber-900/15 text-[#4A3E31] outline-none focus:border-[#5B1F24] leading-relaxed"
                  placeholder="Describe your experience, credentials, and astrological guidance style..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-amber-900/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowProfileWizard(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-900/10 text-amber-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
              >
                <Check size={14} />
                <span>Save & Publish Profile Live</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Incoming Consultation Request Banner (Ringing Toast) */}
      {pendingSession && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-3xl border-2 border-amber-500 shadow-2xl p-5 space-y-4 animate-bounce" style={{ fontFamily: SANS }}>
          {/* Glowing pulse ring */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 text-amber-700 flex items-center justify-center border border-amber-400/20 shrink-0">
              <Bell size={20} className="animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-xs text-amber-800 uppercase tracking-wider">Incoming Consultation</h3>
              <p className="text-sm font-bold text-[#5B1F24] truncate" style={{ fontFamily: SERIF }}>
                Seeker #{pendingSession.user_id?.slice(-6) || "Devotee"}
              </p>
              <p className="text-[11px] text-amber-900/60 font-semibold truncate mt-0.5">
                Topic: {pendingSession.topic || "Vedic Guidance"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => rejectSession(pendingSession)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-900/5 text-[#5B1F24] border border-amber-900/10 hover:bg-amber-900/10 transition-all active:scale-95"
            >
              Decline
            </button>
            <button
              onClick={() => acceptSession(pendingSession)}
              className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              style={{ background: `linear-gradient(135deg, ${MAROON}, #8C1D24)` }}
            >
              <Check size={14} /> Accept Request
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
