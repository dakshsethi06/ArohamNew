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
  AlertCircle
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

export function AstrologerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");

  // Astrologer Profile & Completion State
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || "Acharya Astrologer",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    dob: "",
    title: "Senior Vedic Jyotish Acharya",
    experience: "8",
    specialty: "Vedic Kundali",
    languages: "Hindi, English, Sanskrit",
    degree: "Jyotish Acharya (BHU)",
    bio: "Certified Vedic Astrologer with over 8+ years of experience in Prashna Kundali, Gemology & Vastu remedies.",
    avatar: PRESET_AVATARS[0],
    pricePerMin: "0"
  });

  // Calculate Profile Completion Percentage
  const getProfileCompletion = () => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.email) score += 15;
    if (profile.dob) score += 15;
    if (profile.title) score += 15;
    if (profile.experience) score += 10;
    if (profile.bio && profile.bio.length > 20) score += 15;
    if (profile.avatar) score += 15;
    return Math.min(score, 100);
  };

  useEffect(() => {
    // Load cached profile if available
    try {
      const cached = localStorage.getItem(`aroham_astro_profile_${user?.id}`);
      if (cached) {
        setProfile(prev => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch (e) {}

    const syncSessions = () => {
      fetchSessions();
    };

    window.addEventListener("storage", syncSessions);
    window.addEventListener("focus", syncSessions);

    fetchSessions();

    const sub = supabase
      .channel("incoming-requests-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      window.removeEventListener("storage", syncSessions);
      window.removeEventListener("focus", syncSessions);
      supabase.removeChannel(sub);
    };
  }, [user]);

  const toggleOnlineStatus = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);

    try {
      if (user?.id) {
        await supabase.from("astrologers").update({ is_online: nextStatus }).eq("id", user.id);
      }
    } catch (e) {
      console.warn("Status toggle warning:", e);
    }
  };

  const fetchSessions = async () => {
    let sessionList: any[] = [];
    try {
      const { data } = await supabase.from("chat_sessions").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) sessionList = data;
    } catch (e) {}

    try {
      const latestLocal = localStorage.getItem("aroham_latest_live_session");
      if (latestLocal) {
        const parsed = JSON.parse(latestLocal);
        if (!sessionList.some(s => s.id === parsed.id)) {
          sessionList.unshift(parsed);
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
          is_online: isOnline,
          role: "astrologer"
        });
      }
    } catch (e) {}

    setShowProfileWizard(false);
  };

  const acceptSession = async (s: any) => {
    setActiveSession(s);
    try {
      await supabase.from("chat_sessions").update({ status: "active", astrologer_id: user?.id || "astro-1" }).eq("id", s.id);
      setSessions(prev => prev.map(item => item.id === s.id ? { ...item, status: "active" } : item));
      fetchMessages(s.id);
    } catch {
      setSessions(prev => prev.map(item => item.id === s.id ? { ...item, status: "active" } : item));
      fetchMessages(s.id);
    }
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
    if (filterTab === "active") return s.status === "active" || s.status === "pending";
    if (filterTab === "completed") return s.status === "completed";
    return true;
  });

  const completionScore = getProfileCompletion();

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: SANS, background: "#12080A", color: IVORY }}>
      
      {/* Top Astrologer Portal Navigation Header */}
      <header className="px-6 py-4 bg-[#1A0D10] border-b border-amber-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md" />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A0D10] ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: SERIF }}>{profile.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Award size={11} /> Verified Vedic Scholar
              </span>
            </div>
            <p className="text-xs text-amber-200/70">{profile.title} • {profile.experience} Yrs Exp</p>
          </div>
        </div>

        {/* Action Controls & Live Online Switch */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Profile Completion Button */}
          <button
            onClick={() => setShowProfileWizard(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
          >
            <User size={14} />
            <span>Profile ({completionScore}%)</span>
          </button>

          {/* Live Online/Offline Status Switch */}
          <button
            onClick={toggleOnlineStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
              isOnline
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-gray-500/20 text-gray-400 border-gray-500/40 hover:bg-gray-500/30"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-gray-400"}`} />
            <span>{isOnline ? "STATUS: ONLINE" : "STATUS: OFFLINE"}</span>
          </button>

          <button
            onClick={() => navigate("/consult")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 text-amber-100/70 hover:text-white hover:bg-white/5 transition-all"
          >
            View User Directory
          </button>
        </div>
      </header>

      {/* Profile Completion Warning Banner */}
      {completionScore < 100 && (
        <div className="px-6 py-3 bg-amber-900/30 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <span>
              Your profile is <strong>{completionScore}% complete</strong>. Complete your bio & qualifications to receive 3x more consultation requests!
            </span>
          </div>
          <button
            onClick={() => setShowProfileWizard(true)}
            className="underline font-bold text-amber-300 hover:text-white"
          >
            Complete Now →
          </button>
        </div>
      )}

      {/* Daily Stats Dashboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#0B0406] border-b border-amber-900/20">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400"><MessageCircle size={18} /></div>
          <div>
            <p className="text-[11px] text-amber-100/60 uppercase font-semibold">Today's Sessions</p>
            <p className="text-base font-bold text-white">8 Consultations</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><DollarSign size={18} /></div>
          <div>
            <p className="text-[11px] text-amber-100/60 uppercase font-semibold">Today's Earnings</p>
            <p className="text-base font-bold text-emerald-400">₹2,400</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400"><Star size={18} fill="#C8A044" /></div>
          <div>
            <p className="text-[11px] text-amber-100/60 uppercase font-semibold">User Rating</p>
            <p className="text-base font-bold text-white">4.9 ★ (412 Reviews)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400"><TrendingUp size={18} /></div>
          <div>
            <p className="text-[11px] text-amber-100/60 uppercase font-semibold">Active Queue</p>
            <p className="text-base font-bold text-purple-300">{sessions.filter(s => s.status === 'pending' || s.status === 'active').length} Live Seekers</p>
          </div>
        </div>
      </div>

      {/* Main Workstation Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Consultation Request Queue */}
        <div className="w-full md:w-1/3 border-r border-amber-900/20 p-5 bg-[#160B0E] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span>Incoming User Requests</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {filteredSessions.length} Requests
              </span>
            </div>

            {/* Filter Sub-Tabs */}
            <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-xl border border-white/10">
              {(["all", "active", "completed"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    filterTab === tab ? "bg-amber-900/60 text-amber-200 shadow-xs" : "text-amber-100/50 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Request List */}
            <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-amber-100/60 space-y-2">
                  <Clock size={24} className="mx-auto text-amber-500/40" />
                  <p className="font-semibold">No pending requests right now.</p>
                  <p className="text-[11px] text-amber-100/40">Users visiting /consult will appear here live when they request a session.</p>
                </div>
              ) : (
                filteredSessions.map(s => {
                  const isActive = activeSession?.id === s.id;
                  const isPending = s.status === "pending";

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                        isActive
                          ? "bg-amber-900/30 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-amber-200">Seeker #{s.user_id?.slice(0, 8)}</span>
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500 text-black animate-pulse">
                                Ringing Request
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-100/70 font-semibold">{s.topic || "Vedic Kundali Consultation"}</p>
                        </div>
                        <span className="text-[10px] text-amber-100/50">{new Date(s.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Accept / Decline Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        {s.status === "pending" ? (
                          <>
                            <button
                              onClick={() => acceptSession(s)}
                              className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Check size={14} /> Accept & Chat
                            </button>
                            <button
                              onClick={() => rejectSession(s)}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 transition-all flex items-center justify-center active:scale-95"
                            >
                              <X size={14} /> Decline
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => acceptSession(s)}
                            className="w-full py-2 rounded-xl text-xs font-bold bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
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

        {/* Center Live Consultation Chat Room */}
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-between bg-[#1A0D10]">
          {activeSession ? (
            <>
              {/* Chat Room Top Bar */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white" style={{ fontFamily: SERIF }}>Live Consultation Room #{activeSession.id?.slice(0, 8)}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Live
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/60 mt-0.5">Topic: {activeSession.topic || "Vedic Horoscope & Sacred Remedies"}</p>
                </div>

                <button
                  onClick={endSession}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-900/40 text-red-200 border border-red-500/30 hover:bg-red-900/60 active:scale-95 transition-all"
                >
                  End Session
                </button>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 min-h-[300px]">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      m.sender === "astrologer"
                        ? "ml-auto bg-gradient-to-r from-[#5B1F24] to-[#7A2A30] text-white rounded-tr-xs shadow-md"
                        : "mr-auto bg-white/10 text-amber-100 border border-white/10 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    
                    {/* Recommended Product Widget inside Astrologer Chat Stream */}
                    {m.recommendedProduct && (
                      <div className="mt-3 p-3 rounded-xl bg-black/50 border border-amber-500/30 text-amber-100 flex items-center gap-3">
                        <img src={m.recommendedProduct.img} alt={m.recommendedProduct.name} className="w-10 h-10 rounded-lg object-cover border border-amber-500/30" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-extrabold uppercase text-amber-400">Recommended Sacred Remedy</p>
                          <h4 className="font-bold text-xs truncate text-white">{m.recommendedProduct.name}</h4>
                          <p className="text-xs font-bold text-amber-300">₹{m.recommendedProduct.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Astrologer Sacred Response Chips */}
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_ASTRO_RESPONSES.map((resp, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(resp)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all"
                  >
                    {resp}
                  </button>
                ))}
              </div>

              {/* Remedy Recommendation Toolbar */}
              <div className="mb-3 p-3 rounded-2xl bg-amber-900/20 border border-amber-500/20">
                <p className="text-[10px] font-extrabold uppercase text-amber-400 mb-2 flex items-center gap-1">
                  <ShoppingBag size={12} /> Recommend Sacred Remedy Item to Seeker:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {REMEDY_PRODUCTS.map(prod => (
                    <button
                      key={prod.slug}
                      onClick={() => sendMessage(`I recommend wearing this sacred item to balance your planetary stars:`, prod)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-2 transition-all active:scale-95"
                    >
                      <img src={prod.img} alt={prod.name} className="w-5 h-5 rounded-md object-cover" />
                      <span>{prod.name} (₹{prod.price})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type your astrological remedy or guidance..."
                  className="flex-1 h-12 px-4 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400 transition-all"
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
            <div className="flex flex-col items-center justify-center h-full text-amber-100/40 space-y-4 p-8 text-center">
              <div className="p-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <MessageCircle size={48} />
              </div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: SERIF }}>Astrologer Workstation Ready</h3>
              <p className="text-xs max-w-sm text-amber-100/60 leading-relaxed">
                Select an incoming consultation request from the left panel to accept and begin live Vedic guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Modal Wizard */}
      {showProfileWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A0D10] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-amber-100 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: SERIF }}>Complete Astrologer Profile</h2>
                <p className="text-xs text-amber-200/70">Ensure your Vedic credentials and details are complete for seekers.</p>
              </div>
              <button onClick={() => setShowProfileWizard(false)} className="p-2 rounded-full hover:bg-white/10 text-white">
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-400">Profile Completeness</span>
                <span>{completionScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500" style={{ width: `${completionScore}%` }} />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-2">Choose Avatar / Portrait</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {PRESET_AVATARS.map((av, i) => (
                  <img
                    key={i}
                    src={av}
                    onClick={() => setProfile(p => ({ ...p, avatar: av }))}
                    alt="Preset"
                    className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                      profile.avatar === av ? "border-amber-400 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={profile.experience}
                  onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Title & Title Badge</label>
              <input
                type="text"
                value={profile.title}
                onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Senior Prashna Kundali & Gemology Master"
                className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Languages Spoken</label>
              <input
                type="text"
                value={profile.languages}
                onChange={e => setProfile(p => ({ ...p, languages: e.target.value }))}
                placeholder="Hindi, English, Sanskrit, Gujarati"
                className="w-full h-11 px-3.5 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Short Vedic Bio & Credentials</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Write a brief overview of your astrological practice..."
                className="w-full p-3 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={saveProfile}
              className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-xl active:scale-95 transition-all"
            >
              Save Astrologer Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
