import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Send, Sparkles, Star, MessageSquare, ShieldCheck,
  Clock, CheckCircle2, User, RefreshCw, ShoppingBag, PhoneCall,
  Video, Image, Smile, Lock
} from "lucide-react";
import { GOLD, IVORY, SANS, SERIF, MAROON } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { DEFAULT_PRODUCTS } from "@/constants/products";
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

const FEATURED_ASTROLOGERS: Astrologer[] = [
  {
    id: "astro-1",
    name: "Acharya Devrat Sharma",
    title: "Vedic Jyotish & Rudraksha Specialist",
    experience: "18+ Years Exp",
    rating: 4.9,
    consultations: 2450,
    specialties: ["Kundali Matchmaking", "Rudraksha Remedy", "Career & Wealth"],
    languages: ["Hindi", "English", "Sanskrit"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    status: "online",
    pricePerMin: 0
  },
  {
    id: "astro-2",
    name: "Dr. Ananya Shastri",
    title: "Astro-Gemology & Vastu Expert",
    experience: "14+ Years Exp",
    rating: 4.9,
    consultations: 1890,
    specialties: ["Gemstone Recommendation", "Vastu Shastra", "Marriage"],
    languages: ["English", "Hindi", "Marathi"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    status: "online",
    pricePerMin: 0
  },
  {
    id: "astro-3",
    name: "Pandit Harishchandra Ji",
    title: "Senior Jyotish & Prashna Kundali Master",
    experience: "24+ Years Exp",
    rating: 5.0,
    consultations: 4120,
    specialties: ["Life Horoscope", "Mahadasha Remedies", "Business Growth"],
    languages: ["Hindi", "Gujarati"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    status: "online",
    pricePerMin: 0
  },
  {
    id: "astro-4",
    name: "Sadhvi Radhika Devi",
    title: "Spiritual Healer & Chakra Balancing Expert",
    experience: "12+ Years Exp",
    rating: 4.8,
    consultations: 1420,
    specialties: ["Chakra Alignment", "Meditation Yantras", "Mental Peace"],
    languages: ["English", "Hindi"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    status: "online",
    pricePerMin: 0
  }
];

const STARTER_QUESTIONS = [
  "Which Rudraksha bead is best suited for my Rashi?",
  "Which Gemstone should I wear for career growth & wealth?",
  "How do I balance negative planetary influences (Graha Dosha)?",
  "Which Vastu product will bring peace to my home?"
];

const getMergedAstrologers = (): Astrologer[] => {
  try {
    const customRegistered = JSON.parse(localStorage.getItem("aroham_registered_astrologers") || "[]");
    if (Array.isArray(customRegistered) && customRegistered.length > 0) {
      const merged = [...customRegistered];
      FEATURED_ASTROLOGERS.forEach(fa => {
        if (!merged.some(m => m.id === fa.id)) merged.push(fa);
      });
      return merged;
    }
  } catch (e) {}
  return FEATURED_ASTROLOGERS;
};

export function ConsultPage() {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const { addToCart } = useCart();

  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [astrologers, setAstrologers] = useState<Astrologer[]>(getMergedAstrologers);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time status changes and sync newly registered astrologers
  useEffect(() => {
    const syncAstrologers = () => {
      setAstrologers(getMergedAstrologers());
    };

    window.addEventListener("storage", syncAstrologers);
    window.addEventListener("focus", syncAstrologers);

    const fetchRealtimeAstrologers = async () => {
      try {
        const { data } = await supabase.from("astrologers").select("*");
        if (data && data.length > 0) {
          setAstrologers(prev => {
            const updatedList = [...prev];
            data.forEach(liveData => {
              const idx = updatedList.findIndex(d => d.id === liveData.id);
              if (idx !== -1) {
                updatedList[idx] = { ...updatedList[idx], status: liveData.is_online ? "online" : "offline" };
              } else {
                // Add newly registered astrologer from Supabase
                updatedList.unshift({
                  id: liveData.id,
                  name: liveData.full_name || liveData.name || "Acharya Astrologer",
                  title: liveData.title || "Vedic Jyotish Specialist",
                  experience: `${liveData.experience_years || 5}+ Years Exp`,
                  rating: Number(liveData.rating) || 5.0,
                  consultations: liveData.consultations_count || 0,
                  specialties: liveData.specialties || ["Vedic Kundali", "Gemstones"],
                  languages: liveData.languages || ["Hindi", "English"],
                  avatar: liveData.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
                  status: liveData.is_online ? "online" : "offline",
                  pricePerMin: 0
                });
              }
            });
            return updatedList;
          });
        }
      } catch (err) {}
    };

    fetchRealtimeAstrologers();

    const channel = supabase
      .channel("public:astrologers-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "astrologers" }, payload => {
        if (payload.new && (payload.new as any).id) {
          const updated = payload.new as any;
          setAstrologers(prev => {
            const exists = prev.some(a => a.id === updated.id);
            if (exists) {
              return prev.map(a => a.id === updated.id ? { ...a, status: updated.is_online ? "online" : "offline" } : a);
            } else {
              return [
                {
                  id: updated.id,
                  name: updated.full_name || updated.name || "Acharya Astrologer",
                  title: updated.title || "Vedic Jyotish Specialist",
                  experience: `${updated.experience_years || 5}+ Years Exp`,
                  rating: 5.0,
                  consultations: 0,
                  specialties: updated.specialties || ["Vedic Kundali"],
                  languages: ["Hindi", "English"],
                  avatar: updated.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
                  status: updated.is_online ? "online" : "offline",
                  pricePerMin: 0
                },
                ...prev
              ];
            }
          });
        }
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
    } catch {
      // Supabase fallback mode
    }

    try {
      localStorage.setItem("aroham_latest_live_session", JSON.stringify(createdSession));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setSession(createdSession);

    // Initial greeting message from Astrologer
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

    // Subscribe to Supabase real-time if session exists
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

  // Live listener for real-time human astrologer messages
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

    // Send to Supabase DB and local cross-tab sync if live
    try {
      await supabase.from("chat_messages").insert({
        session_id: session.id,
        sender: "user",
        text: messageText
      });
    } catch (err) {
      console.warn("Supabase insert error:", err);
    }

    try {
      const existingMsgs = JSON.parse(localStorage.getItem(`aroham_live_chat_${session.id}`) || "[]");
      const updatedMsgs = [...existingMsgs, userMsg];
      localStorage.setItem(`aroham_live_chat_${session.id}`, JSON.stringify(updatedMsgs));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  };

  const endSession = () => {
    setSession(null);
    setMessages([]);
    setSelectedAstrologer(null);
  };

  // If in Active Chat Session
  if (session && selectedAstrologer) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 pb-6 px-3 sm:px-6 flex flex-col" style={{ background: "#FAF7F2", fontFamily: SANS }}>
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col bg-white rounded-3xl shadow-[0_8px_32px_rgba(91,31,36,0.08)] border border-amber-900/10 overflow-hidden h-[85vh]">
          
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-amber-900/10 flex items-center justify-between bg-gradient-to-r from-[#F9F3EA] to-[#F5EDE0]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={selectedAstrologer.avatar} alt={selectedAstrologer.name} className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm sm:text-base" style={{ color: MAROON, fontFamily: SERIF }}>{selectedAstrologer.name}</h2>
                  <ShieldCheck size={15} className="text-amber-600 flex-shrink-0" />
                </div>
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span>● Verified Vedic Astrologer</span>
                  <span className="text-amber-900/40">·</span>
                  <span className="text-amber-900/70">{selectedAstrologer.experience}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={endSession}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-red-200 text-red-700 hover:bg-red-50 active:scale-95"
              >
                End Chat
              </button>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF7F2]/50">
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
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-2xs leading-relaxed ${
                      isUser
                        ? "rounded-tr-xs bg-gradient-to-r from-[#5B1F24] to-[#7A2A30] text-white"
                        : "rounded-tl-xs bg-white text-[#4A3E31] border border-amber-900/10"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    
                    {/* Recommended Product Widget inside Chat */}
                    {m.recommendedProduct && (
                      <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-amber-900/15 text-[#4A3E31]">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900/70 mb-1.5 flex items-center gap-1">
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
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-2xs active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap"
                            style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
                          >
                            <ShoppingBag size={11} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-amber-900/40 px-1">{m.timestamp || "Just now"}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900/60 p-2 bg-white/80 rounded-xl w-fit border border-amber-900/10">
                <RefreshCw size={13} className="animate-spin text-amber-600" />
                <span>{selectedAstrologer.name} is typing remedy...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Question Chips inside Chat */}
          {messages.length < 3 && (
            <div className="p-2 border-t border-amber-900/10 bg-white flex gap-2 overflow-x-auto">
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

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-amber-900/10 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about Kundali, Rudraksha, Gemstones or Vastu..."
              className="flex-1 h-11 px-4 rounded-xl text-xs sm:text-sm border border-amber-900/15 outline-none focus:border-amber-900 transition-all bg-[#FAF7F2]/50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="h-11 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
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

  // Main Consultation Landing Page
  const filteredAstrologers = selectedTopic === "All"
    ? astrologers
    : astrologers.filter(a => a.specialties.some(s => s.toLowerCase().includes(selectedTopic.toLowerCase())));

  const onlineCount = astrologers.filter(a => a.status === "online").length;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }}>
      
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-10 border-b border-amber-900/10" style={{ background: "linear-gradient(135deg, #1A0D10 0%, #2D1418 100%)" }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-amber-200/60">
            <button onClick={() => navigate("/")} className="hover:underline transition-all text-amber-300">Home</button>
            <span>/</span>
            <span className="font-semibold text-amber-400">Astrologer Consultation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <Sparkles size={14} style={{ color: GOLD }} />
                <span>100% Confidential & Authentic Vedic Guidance</span>
              </div>
              <h1 className="tracking-tight text-white" style={{ fontFamily: SERIF, fontSize: "clamp(1.85rem, 4vw, 3rem)", fontWeight: 600 }}>
                Consult Verified <span style={{ color: GOLD }}>Vedic Astrologers</span>
              </h1>
              <p className="text-xs sm:text-sm mt-2 max-w-xl font-medium text-amber-100/70">
                Get real-time live consultations for Kundali matchmaking, Gemstone selection, Rudraksha remedies, and Vastu Shastra.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-amber-100/90 text-xs">
              <div className="flex -space-x-2">
                {astrologers.map(a => (
                  <img key={a.id} src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full object-cover border-2 border-amber-900" />
                ))}
              </div>
              <div>
                <p className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineCount} Astrologers Online Now
                </p>
                <p className="text-[11px] text-amber-200/60">Over 9,500+ verified sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Topics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900/80">Available Astrologers ({filteredAstrologers.length})</h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" /> Realtime Status Sync
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {["All", "Kundali", "Rudraksha", "Gemstone", "Vastu", "Career", "Marriage"].map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                selectedTopic === topic
                  ? "bg-[#5B1F24] text-white border-[#5B1F24] shadow-xs"
                  : "bg-white text-[#4A3E31] border-amber-900/15 hover:bg-amber-900/5"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAstrologers.map(astro => (
            <div
              key={astro.id}
              className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-[0_4px_20px_rgba(91,31,36,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[4/3]">
                  <img src={astro.avatar} alt={astro.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Live Status Badge */}
                  {astro.status === "online" ? (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Online Now
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-600 text-white shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Offline
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1">
                    <Star size={12} fill="#C8A044" stroke="none" /> {astro.rating}
                  </div>
                </div>

                <h3 className="font-bold text-base mb-1 truncate" style={{ color: MAROON, fontFamily: SERIF }}>{astro.name}</h3>
                <p className="text-xs font-semibold mb-3 text-amber-900/70">{astro.title}</p>
                
                <div className="flex items-center justify-between text-xs font-medium text-amber-900/60 mb-4 pb-3 border-b border-amber-900/10">
                  <span className="flex items-center gap-1"><Clock size={13} /> {astro.experience}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={13} /> {astro.consultations}+ Sessions</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {astro.specialties.map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-900/5 text-[#5B1F24]">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
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
          ))}
        </div>

        {/* Why Consult Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F9F3EA] to-[#F5EDE0] border border-amber-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-900/10 text-amber-900 flex-shrink-0">
              <ShieldCheck size={28} style={{ color: MAROON }} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg" style={{ color: MAROON, fontFamily: SERIF }}>100% Temple-Energized Authentic Recommendations</h3>
              <p className="text-xs sm:text-sm text-amber-900/70 mt-1">Our astrologers prescribe only genuine Vedic gemstones & energized Rudrakshas with certificates.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-900/20 bg-white hover:bg-amber-900/5 active:scale-95 transition-all whitespace-nowrap"
          >
            Explore Sacred Shop
          </button>
        </div>
      </div>
    </div>
  );
}
