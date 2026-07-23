import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Send, Sparkles, Star, MessageSquare, ShieldCheck,
  Clock, CheckCircle2, User, RefreshCw, ShoppingBag, PhoneCall,
  Video, Image, Smile, Lock, Search, Filter, Award
} from "lucide-react";
import { GOLD, IVORY, SANS, SERIF, MAROON } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface Astrologer {
  id: string;
  name: string;
  title: string;
  experience: string;
  rating: number;
  consultations: number;
  specialties: string[];
  languages: string[];
  avatar: string;
  status: "online" | "busy" | "offline";
  pricePerMin: number;
}

const DEFAULT_DB_ASTROLOGER: Astrologer = {
  id: "astro-1",
  name: "Acharya Devrat Sharma",
  title: "Senior Vedic Jyotish & Rudraksha Specialist",
  experience: "18+ Years Exp",
  rating: 4.95,
  consultations: 2450,
  specialties: ["Kundali Matchmaking", "Rudraksha Remedy", "Career & Wealth"],
  languages: ["Hindi", "English", "Sanskrit"],
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  status: "online",
  pricePerMin: 20
};

const STARTER_QUESTIONS = [
  "Which Rudraksha bead is best suited for my Rashi?",
  "Which Gemstone should I wear for career growth & wealth?",
  "How do I balance negative planetary influences (Graha Dosha)?",
  "Which Vastu product will bring peace to my home?"
];

// Strictly fetch database & registered astrologers
const getDatabaseAstrologers = (): Astrologer[] => {
  let list: Astrologer[] = [];
  try {
    const customRegistered = JSON.parse(localStorage.getItem("aroham_registered_astrologers") || "[]");
    if (Array.isArray(customRegistered) && customRegistered.length > 0) {
      list = [...customRegistered];
    }
  } catch (e) {}

  try {
    const sessionStr = localStorage.getItem("aroham_mock_session");
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed && (parsed.role === "astrologer" || parsed.user_metadata?.role === "astrologer")) {
        const id = parsed.id || "astro-custom";
        if (!list.some(a => a.id === id)) {
          list.unshift({
            id: id,
            name: parsed.user_metadata?.full_name || parsed.name || "Acharya Astrologer",
            title: "Senior Vedic Jyotish Master",
            experience: "5+ Years Exp",
            rating: 4.95,
            consultations: 0,
            specialties: ["Vedic Kundali", "Sacred Remedies"],
            languages: ["Hindi", "English"],
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            status: "online",
            pricePerMin: 20
          });
        }
      }
    }
  } catch (e) {}

  if (list.length === 0) list = [DEFAULT_DB_ASTROLOGER];
  return list;
};

export function ConsultPage() {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const { addToCart } = useCart();

  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [astrologers, setAstrologers] = useState<Astrologer[]>(getDatabaseAstrologers);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time database status changes
  useEffect(() => {
    const syncAstrologers = () => {
      let list = getDatabaseAstrologers();
      try {
        const globalStatusStr = localStorage.getItem("aroham_global_online_status");
        if (globalStatusStr) {
          const parsed = JSON.parse(globalStatusStr);
          list = list.map(a => {
            if (a.id === parsed.userId || (parsed.userId === "astro-1" && a.id.startsWith("astro-"))) {
              return { ...a, status: parsed.isOnline ? "online" : "offline" };
            }
            return a;
          });
        }
      } catch (e) {}
      setAstrologers(list);
    };

    window.addEventListener("storage", syncAstrologers);
    window.addEventListener("focus", syncAstrologers);

    const fetchRealtimeAstrologers = async () => {
      try {
        const { data } = await supabase.from("astrologers").select("*");
        if (data && data.length > 0) {
          const dbFormatted: Astrologer[] = data.map(liveData => ({
            id: liveData.id,
            name: liveData.full_name || liveData.name || "Acharya Astrologer",
            title: liveData.title || "Senior Vedic Jyotish Master",
            experience: `${liveData.experience_years || 5}+ Years Exp`,
            rating: Number(liveData.rating) || 4.95,
            consultations: liveData.consultations_count || 120,
            specialties: liveData.specialties || ["Vedic Kundali", "Gemstones"],
            languages: liveData.languages || ["Hindi", "English"],
            avatar: liveData.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            status: liveData.is_online ? "online" : "offline",
            pricePerMin: 20
          }));
          setAstrologers(dbFormatted);
        }
      } catch (err) {}
    };

    fetchRealtimeAstrologers();

    const channel = supabase
      .channel("public:astrologers-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "astrologers" }, () => {
        fetchRealtimeAstrologers();
      })
      .subscribe();

    return () => {
      window.removeEventListener("storage", syncAstrologers);
      window.removeEventListener("focus", syncAstrologers);
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startConsultation = async (astro: Astrologer) => {
    if (!user) {
      openAuth();
      return;
    }

    setSelectedAstrologer(astro);

    const sessionUuid = crypto.randomUUID();
    let createdSession: any = {
      id: sessionUuid,
      user_id: user.id,
      astrologer_id: astro.id,
      status: "pending",
      topic: "Vedic Kundali & Horoscope",
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await supabase
        .from("chat_sessions")
        .insert({ id: sessionUuid, user_id: user.id, status: "pending", astrologer_id: astro.id, topic: "Vedic Kundali & Horoscope" })
        .select("*")
        .single();
      
      if (data) createdSession = data;
    } catch {}

    try {
      localStorage.setItem("aroham_latest_live_session", JSON.stringify(createdSession));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setSession(createdSession);

    const initialMsg = {
      id: "init-" + Date.now(),
      session_id: createdSession.id,
      sender: "astrologer",
      text: `Hari Om ${user.user_metadata?.full_name || "Ji"} 🙏 I am ${astro.name}. Welcome to Aroham Sacred Consultations. How may I guide your spiritual path today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([initialMsg]);

    try {
      localStorage.setItem(`aroham_live_chat_${createdSession.id}`, JSON.stringify([initialMsg]));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    if (createdSession.id && !createdSession.id.startsWith("demo-")) {
      supabase
        .channel(`messages-${createdSession.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${createdSession.id}` }, payload => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        })
        .subscribe();
    }
  };

  useEffect(() => {
    if (!session?.id) return;

    const syncLiveMessages = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(`aroham_live_chat_${session.id}`) || "[]");
        if (Array.isArray(stored) && stored.length > 0) {
          setMessages(prev => {
            const merged = [...prev];
            stored.forEach(m => {
              if (!merged.some(p => p.id === m.id || p.text === m.text)) {
                merged.push(m);
              }
            });
            return merged;
          });
        }
      } catch (e) {}
    };

    window.addEventListener("storage", syncLiveMessages);

    const channel = supabase
      .channel(`live-session-${session.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${session.id}` }, payload => {
        if (payload.new) {
          const newMsg = {
            id: payload.new.id,
            sender: payload.new.sender,
            text: payload.new.text,
            timestamp: new Date(payload.new.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener("storage", syncLiveMessages);
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || !session || !selectedAstrologer) return;

    const userMsg = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");

    try {
      await supabase.from("chat_messages").insert({
        session_id: session.id,
        sender: "user",
        text: messageText
      });
    } catch (e) {}

    try {
      const existingKey = `aroham_live_chat_${session.id}`;
      const existing = JSON.parse(localStorage.getItem(existingKey) || "[]");
      const updated = [...existing, userMsg];
      localStorage.setItem(existingKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  };

  const endSession = () => {
    setSession(null);
    setSelectedAstrologer(null);
    setMessages([]);
  };

  if (session && selectedAstrologer) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-3 sm:p-6" style={{ fontFamily: SANS }}>
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-amber-900/15 shadow-2xl flex flex-col h-[85vh] overflow-hidden">
          
          <div className="p-4 border-b border-amber-900/15 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}>
            <div className="flex items-center gap-3">
              <button
                onClick={endSession}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="relative">
                <img src={selectedAstrologer.avatar} alt={selectedAstrologer.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-300 shadow-xs" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#5B1F24] bg-emerald-400 animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5" style={{ fontFamily: SERIF }}>
                  {selectedAstrologer.name}
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    Verified
                  </span>
                </h3>
                <p className="text-[11px] text-amber-200/80">{selectedAstrologer.title}</p>
              </div>
            </div>

            <button
              onClick={endSession}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-red-900/40 text-red-200 border border-red-500/30 hover:bg-red-900/60 active:scale-95"
            >
              End Chat
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF6F0]/60">
            <div className="text-center my-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-900/5 text-amber-900/70 border border-amber-900/10">
                <Lock size={11} /> End-to-End Encrypted Vedic Session
              </span>
            </div>

            {messages.map(m => {
              const isUser = m.sender === "user";
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed ${
                      isUser
                        ? "rounded-tr-xs text-white"
                        : "rounded-tl-xs bg-white text-[#4A3E31] border border-amber-900/15"
                    }`}
                    style={isUser ? { background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` } : {}}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    
                    {m.recommendedProduct && (
                      <div className="mt-3 p-3 rounded-xl bg-[#FAF6F0] border border-amber-900/15 text-[#4A3E31]">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B1F24] mb-1.5 flex items-center gap-1">
                          <Sparkles size={12} style={{ color: GOLD }} /> Recommended Remedy Item
                        </p>
                        <div className="flex items-center gap-3">
                          <img src={m.recommendedProduct.img} alt={m.recommendedProduct.name} className="w-12 h-12 rounded-lg object-cover border border-amber-900/10" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-[#5B1F24]">{m.recommendedProduct.name}</h4>
                            <p className="text-xs font-bold text-amber-900">₹{m.recommendedProduct.price.toLocaleString("en-IN")}</p>
                          </div>
                          <button
                            onClick={() => addToCart(m.recommendedProduct, 1)}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-xs active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap"
                            style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                          >
                            <ShoppingBag size={11} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-amber-900/50 px-1">{m.timestamp || "Just now"}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900/60 p-2.5 bg-white/90 rounded-2xl w-fit border border-amber-900/15 shadow-xs">
                <RefreshCw size={13} className="animate-spin text-amber-600" />
                <span>{selectedAstrologer.name} is typing remedy...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length < 3 && (
            <div className="p-2.5 border-t border-amber-900/10 bg-white flex gap-2 overflow-x-auto">
              {STARTER_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border border-amber-900/15 bg-amber-900/5 hover:bg-amber-900/10 text-[#5B1F24]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3.5 border-t border-amber-900/15 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about Kundali, Rudraksha, Gemstones or Vastu..."
              className="flex-1 h-12 px-4 rounded-xl text-xs sm:text-sm border border-amber-900/20 outline-none focus:border-[#5B1F24] transition-all bg-[#FAF6F0]/50 text-[#4A3E31]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="h-12 px-6 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Filter Astrologers strictly from DB
  const filteredAstrologers = astrologers.filter(a => {
    const matchesTopic = selectedTopic === "All"
      ? true
      : selectedTopic === "Online Now"
      ? a.status === "online"
      : a.specialties.some(s => s.toLowerCase().includes(selectedTopic.toLowerCase()));

    const matchesSearch = !searchQuery.trim()
      ? true
      : a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTopic && matchesSearch;
  });

  const onlineCount = astrologers.filter(a => a.status === "online").length;

  return (
    <div className="bg-[#FAF6F0] min-h-screen" style={{ fontFamily: SANS, color: "#4A3E31" }}>
      
      {/* Sacred Ivory & Royal Maroon Hero Header */}
      <div className="relative pt-10 sm:pt-14 pb-10 px-4 sm:px-6 lg:px-10 border-b border-amber-900/15" style={{ background: "linear-gradient(135deg, #FAF6F0 0%, #F5EDE0 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-amber-900/60">
            <button onClick={() => navigate("/")} className="hover:underline text-[#5B1F24]">Home</button>
            <span>/</span>
            <span className="font-semibold text-[#5B1F24]">Database Astrologers</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-amber-900/15 bg-amber-900/5 text-[#5B1F24]">
                <Sparkles size={14} style={{ color: GOLD }} />
                <span>Verified Database Vedic Scholars</span>
              </div>
              <h1 className="tracking-tight text-[#5B1F24]" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}>
                Consult Verified <span style={{ color: GOLD }}>Vedic Astrologers</span>
              </h1>
              <p className="text-xs sm:text-sm mt-2 max-w-xl font-medium text-amber-900/70 leading-relaxed">
                Connect live with certified Vedic Astrologers registered in the Aroham database for Kundali, Gemstones, Rudraksha & Vastu remedies.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-amber-900/15 shadow-xs">
              <div className="flex -space-x-2">
                {astrologers.slice(0, 4).map(a => (
                  <img key={a.id} src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-300" />
                ))}
              </div>
              <div>
                <p className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  {onlineCount} Online Now
                </p>
                <p className="text-[11px] text-amber-900/60 font-semibold">Real-time DB Status Sync</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
        
        {/* Search & Topic Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-amber-900/15 shadow-xs">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-900/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search astrologer by name, title or specialty..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl text-xs bg-amber-50/50 border border-amber-900/15 outline-none focus:border-[#5B1F24] transition-all text-[#4A3E31]"
            />
          </div>

          {/* Topic Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {["All", "Online Now", "Kundali", "Rudraksha", "Gemstone", "Vastu", "Career", "Marriage"].map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedTopic === topic
                    ? "bg-[#5B1F24] text-white border-[#5B1F24] shadow-xs"
                    : "bg-amber-50/50 text-[#4A3E31] border-amber-900/15 hover:bg-amber-900/10"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Database Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAstrologers.length === 0 ? (
            <div className="col-span-full p-12 rounded-3xl bg-white border border-amber-900/15 text-center space-y-3 shadow-xs">
              <User size={36} className="mx-auto text-amber-900/40" />
              <h3 className="text-base font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>No Astrologers Match Your Search</h3>
              <p className="text-xs text-amber-900/60 max-w-sm mx-auto">
                No active astrologers found matching "{searchQuery || selectedTopic}". Try resetting your filter.
              </p>
              <button
                onClick={() => { setSelectedTopic("All"); setSearchQuery(""); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-900/10 text-[#5B1F24] border border-amber-900/15"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAstrologers.map(astro => (
              <div
                key={astro.id}
                className="bg-white rounded-3xl p-5 border border-amber-900/15 shadow-[0_4px_20px_rgba(91,31,36,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[4/3]">
                    <img src={astro.avatar} alt={astro.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Live Online Badge */}
                    {astro.status === "online" ? (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Online Now
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-600 text-white shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Offline
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 text-amber-300 border border-white/20 flex items-center gap-1">
                      <Star size={12} fill="#C8A044" stroke="none" /> {astro.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-bold text-base truncate" style={{ color: MAROON, fontFamily: SERIF }}>{astro.name}</h3>
                    <Award size={14} className="text-amber-600 shrink-0" />
                  </div>
                  <p className="text-xs font-semibold mb-3 text-amber-900/70">{astro.title}</p>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-amber-900/60 mb-4 pb-3 border-b border-amber-900/10">
                    <span className="flex items-center gap-1"><Clock size={13} /> {astro.experience}</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700">₹{astro.pricePerMin || 20}/min</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {astro.specialties.map((spec, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-900/5 text-[#5B1F24] border border-amber-900/10">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-900/10">
                  <button
                    onClick={() => startConsultation(astro)}
                    className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                  >
                    <MessageSquare size={14} />
                    <span>Start Live Chat</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Authentic Guidance Guarantee Footer Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white to-[#F5EDE0] border border-amber-900/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-900/10 text-[#5B1F24] flex-shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg" style={{ color: MAROON, fontFamily: SERIF }}>100% Temple-Energized Authentic Recommendations</h3>
              <p className="text-xs text-amber-900/70 mt-1">Our astrologers prescribe only genuine Vedic gemstones & energized Rudrakshas with certificates.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#5B1F24] border border-amber-900/20 bg-white hover:bg-amber-900/5 active:scale-95 transition-all whitespace-nowrap shadow-xs"
          >
            Explore Sacred Shop
          </button>
        </div>
      </div>
    </div>
  );
}
