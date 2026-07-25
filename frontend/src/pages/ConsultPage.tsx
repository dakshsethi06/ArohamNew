import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import {
  ChevronLeft, Send, Sparkles, Star, MessageSquare, ShieldCheck,
  Clock, CheckCircle2, User, RefreshCw, ShoppingBag, PhoneCall,
  Video, Image, Smile, Lock, Search, Filter, Award, X
} from "lucide-react";
import { GOLD, IVORY, SANS, SERIF, MAROON } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PRODUCTS } from "@/constants/products";
import { useProducts } from "@/hooks/useProducts";

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
  bio?: string;
  lastActiveAt?: string | null;
  workingHours?: { enabled: boolean; start: string; end: string } | null;
}

const DEFAULT_DB_ASTROLOGER: Astrologer = {
  id: "d57acc94-b68d-4831-b493-ed548fe1f1f8",
  name: "genz babaji",
  title: "Senior Vedic Jyotish & Prashna Kundali Master",
  experience: "8+ Years Exp",
  rating: 5.0,
  consultations: 120,
  specialties: ["Vedic Kundali", "Sacred Remedies"],
  languages: ["Hindi", "English", "Sanskrit", "Gujarati"],
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  status: "online",
  pricePerMin: 10
};

const STARTER_QUESTIONS = [
  "Which Rudraksha bead is best suited for my Rashi?",
  "Which Gemstone should I wear for career growth & wealth?",
  "How do I balance negative planetary influences (Graha Dosha)?",
  "Which Vastu product will bring peace to my home?"
];

const isAstrologerActive = (isOnline: boolean, workingHours: any) => {
  if (!isOnline) return false;

  if (workingHours && workingHours.enabled) {
    const { start, end } = workingHours;
    if (start && end) {
      const nowTime = new Date();
      const hrs = String(nowTime.getHours()).padStart(2, "0");
      const mins = String(nowTime.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${hrs}:${mins}`;

      if (start <= end) {
        if (currentTimeStr < start || currentTimeStr > end) {
          return false;
        }
      } else {
        if (currentTimeStr < start && currentTimeStr > end) {
          return false;
        }
      }
    }
  }

  return true;
};

const formatChatDate = (dateInput: string | Date | number | undefined) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

  if (dDate === dToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (dDate === dYesterday) {
    return "Yesterday";
  }

  const diffTime = dToday - dDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }

  return date.toLocaleDateString([], { day: "numeric", month: "numeric", year: "numeric" });
};

const formatMessageHeaderDate = (dateInput: any) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

  if (dDate === dToday) {
    return "Today";
  } else if (dDate === dYesterday) {
    return "Yesterday";
  }

  const diffTime = dToday - dDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }

  return date.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
};

// Strictly fetch database & registered astrologers
const getDatabaseAstrologers = (): Astrologer[] => {
  try {
    const customRegistered = JSON.parse(localStorage.getItem("aroham_registered_astrologers") || "[]");
    if (Array.isArray(customRegistered)) {
      return customRegistered.filter((a: any) => a.bio && a.bio !== "PENDING_WIZARD_COMPLETION" && a.bio.trim() !== "");
    }
  } catch (e) {}
  return [];
};

import { generateUUID } from "@/utils/uuid";

export function ConsultPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, openAuth } = useAuth();
  const { addToCart } = useCart();

  const { products } = useProducts();

  const findProduct = (slug: string) => {
    return products.find(p => p.slug === slug) || DEFAULT_PRODUCTS.find(p => p.slug === slug);
  };

  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [astrologers, setAstrologers] = useState<Astrologer[]>(getDatabaseAstrologers);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [localCartToast, setLocalCartToast] = useState<string | null>(null);
  const localToastTimer = useRef<any>(null);

  const handleAddToCart = (product: any) => {
    if (!product) return;
    addToCart(product, 1);
    if (localToastTimer.current) clearTimeout(localToastTimer.current);
    setLocalCartToast(product.name);
    localToastTimer.current = setTimeout(() => {
      setLocalCartToast(null);
    }, 2200);
  };

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  const [showUserHistoryModal, setShowUserHistoryModal] = useState(false);
  const [userHistorySessions, setUserHistorySessions] = useState<any[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<any | null>(null);
  const [historySessionMessages, setHistorySessionMessages] = useState<any[]>([]);

  const scrollToHistoryBottom = () => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (selectedHistorySession) {
      const timer = setTimeout(() => {
        scrollToHistoryBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [historySessionMessages, selectedHistorySession]);

  const openUserHistoryModal = async () => {
    if (!isLoggedIn || !user?.id) {
      openAuth();
      return;
    }
    setShowUserHistoryModal(true);
    try {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setUserHistorySessions(data);
        if (window.innerWidth >= 768) {
          viewPastSessionChat(data[0]);
        } else {
          setSelectedHistorySession(null);
        }
      }
    } catch (e) {}
  };

  const viewPastSessionChat = async (sess: any) => {
    setSelectedHistorySession(sess);
    try {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sess.id)
        .order("created_at", { ascending: true });

      if (data) {
        setHistorySessionMessages(data.map(m => ({
          id: m.id,
          sender: m.sender || m.sender_type,
          text: m.text || m.message_text,
          timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: m.created_at,
          recommended_product_slug: m.recommended_product_slug,
          recommendedProduct: m.recommended_product_slug ? findProduct(m.recommended_product_slug) : null
        })));
      }
    } catch (e) {}
  };

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
              return { 
                ...a, 
                status: (parsed.isOnline ? "online" : "offline") as "online" | "offline" | "busy",
                lastActiveAt: parsed.isOnline ? new Date().toISOString() : a.lastActiveAt
              };
            }
            return a;
          });
        }
      } catch (e) {}

      const computedList = list.map(a => ({
        ...a,
        status: (isAstrologerActive(a.status === "online" || a.status === "busy", a.workingHours)
          ? (a.status === "busy" ? "busy" : "online")
          : "offline") as "online" | "offline" | "busy"
      }));
      setAstrologers(computedList);
    };

    window.addEventListener("storage", syncAstrologers);
    window.addEventListener("focus", syncAstrologers);

    const fetchRealtimeAstrologers = async () => {
      try {
        const { data } = await supabase.from("astrologers").select("*");
        if (data) {
          const completedData = data.filter(liveData => liveData.bio && liveData.bio !== "PENDING_WIZARD_COMPLETION" && liveData.bio.trim() !== "");
          const dbFormatted: Astrologer[] = completedData.map(liveData => ({
            id: liveData.id,
            name: liveData.full_name || liveData.name || "Acharya Astrologer",
            title: liveData.title || "Senior Vedic Jyotish Master",
            experience: `${liveData.experience_years || 5}+ Years Exp`,
            rating: Number(liveData.rating) || 4.95,
            consultations: liveData.consultations_count || 120,
            specialties: liveData.specialties || ["Vedic Kundali", "Gemstones"],
            languages: liveData.languages || ["Hindi", "English"],
            avatar: liveData.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            status: (isAstrologerActive(liveData.is_online, liveData.working_hours) ? "online" : "offline") as "online" | "offline" | "busy",
            pricePerMin: Number(liveData.price_per_min) || 20,
            bio: liveData.bio,
            lastActiveAt: liveData.last_active_at,
            workingHours: liveData.working_hours
          }));
          setAstrologers(dbFormatted);
          try {
            localStorage.setItem("aroham_registered_astrologers", JSON.stringify(dbFormatted));
          } catch (e) {}
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

    const checkInterval = setInterval(() => {
      setAstrologers(prevList => prevList.map(a => ({
        ...a,
        status: (isAstrologerActive(a.status === "online" || a.status === "busy", a.workingHours) 
          ? (a.status === "busy" ? "busy" : "online") 
          : "offline") as "online" | "offline" | "busy"
      })));
    }, 10000);

    return () => {
      window.removeEventListener("storage", syncAstrologers);
      window.removeEventListener("focus", syncAstrologers);
      clearInterval(checkInterval);
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
    if (!isLoggedIn || !user?.id) {
      openAuth();
      return;
    }

    const activeUser = user;
    setSelectedAstrologer(astro);

    let sessionUuid = generateUUID();
    let isExisting = false;
    let existingStatus = "pending";
    let existingCreatedAt = new Date().toISOString();

    try {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", activeUser.id)
        .eq("astrologer_id", astro.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        sessionUuid = existing[0].id;
        const prevStatus = existing[0].status;
        existingStatus = "pending";
        existingCreatedAt = existing[0].created_at || new Date().toISOString();
        isExisting = true;

        try {
          await supabase
            .from("chat_sessions")
            .update({ status: "pending" })
            .eq("id", sessionUuid);
        } catch (e) {}
      }
    } catch (e) {}

    let createdSession: any = {
      id: sessionUuid,
      user_id: activeUser.id,
      astrologer_id: astro.id,
      status: existingStatus,
      topic: "Vedic Kundali & Horoscope",
      created_at: existingCreatedAt
    };

    setSession(createdSession);

    if (!isExisting) {
      setMessages([]);

      try {
        localStorage.setItem("aroham_latest_live_session", JSON.stringify(createdSession));
        localStorage.setItem(`aroham_live_chat_${createdSession.id}`, JSON.stringify([]));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}

      try {
        await supabase
          .from("chat_sessions")
          .insert({
            id: sessionUuid,
            user_id: activeUser.id,
            status: "pending",
            astrologer_id: astro.id,
            topic: "Vedic Kundali & Horoscope"
          });
      } catch {}
    } else {
      try {
        const { data: pastMsgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessionUuid)
          .order("created_at", { ascending: true });

        if (pastMsgs && pastMsgs.length > 0) {
          const filtered = pastMsgs.filter(m => (m.text || m.message_text) !== "Namaste! Astrologer will join your chat soon.");
          setMessages(filtered.map(m => ({
            id: m.id,
            sender: m.sender || m.sender_type,
            text: m.text || m.message_text,
            timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommended_product_slug: m.recommended_product_slug,
            recommendedProduct: m.recommended_product_slug ? DEFAULT_PRODUCTS.find(p => p.slug === m.recommended_product_slug) : null
          })));
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!session?.id) return;

    const fetchLiveMessages = async () => {
      try {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        if (data && data.length > 0) {
          const filtered = data.filter(m => (m.text || m.message_text) !== "Namaste! Astrologer will join your chat soon.");
          const dbFormatted = filtered.map(m => ({
            id: m.id,
            sender: m.sender || m.sender_type,
            text: m.text || m.message_text,
            timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommended_product_slug: m.recommended_product_slug,
            recommendedProduct: m.recommended_product_slug ? findProduct(m.recommended_product_slug) : null
          }));

          setMessages(prev => {
            const merged = [...prev];
            dbFormatted.forEach(dm => {
              const index = merged.findIndex(p => {
                if (p.id === dm.id) return true;
                if (dm.sender === "user" && p.sender === "user" && p.text?.trim() === dm.text?.trim()) {
                  return true;
                }
                return false;
              });
              if (index !== -1) {
                merged[index] = dm;
              } else {
                merged.push(dm);
              }
            });
            return merged;
          });
        }
      } catch (e) {}
    };

    fetchLiveMessages();
    const pollInterval = setInterval(fetchLiveMessages, 2000);

    const syncLiveMessages = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(`aroham_live_chat_${session.id}`) || "[]");
        if (Array.isArray(stored) && stored.length > 0) {
          const filteredStored = stored.filter(m => m.text !== "Namaste! Astrologer will join your chat soon.");
          setMessages(prev => {
            const merged = [...prev];
            filteredStored.forEach(m => {
              const index = merged.findIndex(p => {
                if (p.id === m.id) return true;
                if (m.sender === "user" && p.sender === "user" && p.text?.trim() === m.text?.trim()) {
                  return true;
                }
                return false;
              });
              if (index !== -1) {
                merged[index] = m;
              } else {
                merged.push(m);
              }
            });
            return merged;
          });
        }
      } catch (e) {}
    };

    const checkSessionStatus = async () => {
      try {
        const { data } = await supabase
          .from("chat_sessions")
          .select("status")
          .eq("id", session.id)
          .maybeSingle();

        if (data && data.status !== session.status) {
          setSession(prev => prev ? { ...prev, status: data.status } : null);
        }
      } catch (e) {}
    };

    const statusInterval = setInterval(checkSessionStatus, 2000);

    window.addEventListener("storage", syncLiveMessages);

    const channel = supabase
      .channel(`live-session-${session.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${session.id}` }, payload => {
        if (payload.new) {
          const newMsg = {
            id: payload.new.id,
            sender: payload.new.sender || payload.new.sender_type,
            text: payload.new.text || payload.new.message_text,
            timestamp: new Date(payload.new.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommended_product_slug: payload.new.recommended_product_slug,
            recommendedProduct: payload.new.recommended_product_slug ? findProduct(payload.new.recommended_product_slug) : null
          };
          setMessages(prev => {
            const index = prev.findIndex(m => {
              if (m.id === newMsg.id) return true;
              if (newMsg.sender === "user" && m.sender === "user" && m.text?.trim() === newMsg.text?.trim()) {
                return true;
              }
              return false;
            });
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    const sessionChannel = supabase
      .channel(`session-status-${session.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_sessions", filter: `id=eq.${session.id}` }, payload => {
        if (payload.new && payload.new.status !== session.status) {
          setSession(prev => prev ? { ...prev, status: payload.new.status } : null);
        }
      })
      .subscribe();

    const typingChannel = supabase
      .channel(`typing-${session.id}`)
      .on("broadcast", { event: "typing" }, payload => {
        if (payload.payload?.sender === "astrologer") {
          setIsTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .on("broadcast", { event: "end-chat" }, () => {
        setSession(prev => prev ? { ...prev, status: "completed" } : null);
      })
      .subscribe();

    const syncTypingStorage = () => {
      try {
        const lastTyping = localStorage.getItem(`aroham_typing_${session.id}_astrologer`);
        if (lastTyping && Date.now() - Number(lastTyping) < 3000) {
          setIsTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      } catch (e) {}
    };

    window.addEventListener("storage", syncTypingStorage);

    return () => {
      clearInterval(pollInterval);
      clearInterval(statusInterval);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      window.removeEventListener("storage", syncLiveMessages);
      window.removeEventListener("storage", syncTypingStorage);
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [session?.id]);

  useEffect(() => {
    if (session && (session.status === "completed" || session.status === "ended" || session.status === "declined")) {
      const timer = setTimeout(() => {
        setSession(null);
        setSelectedAstrologer(null);
        setMessages([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session?.status]);

  const typingTimerRef = useRef<any>(null);

  const handleInputChange = (val: string) => {
    setInputMessage(val);
    if (!session?.id) return;

    try {
      localStorage.setItem(`aroham_typing_${session.id}_user`, String(Date.now()));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    try {
      supabase.channel(`typing-${session.id}`).send({
        type: "broadcast",
        event: "typing",
        payload: { sender: "user", timestamp: Date.now() }
      });
    } catch (e) {}
  };

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
        sender_type: "user",
        text: messageText,
        message_text: messageText
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

  const endSession = async () => {
    if (session?.id) {
      try {
        await supabase
          .from("chat_sessions")
          .update({ status: "completed", ended_at: new Date().toISOString() })
          .eq("id", session.id);
      } catch (e) {}

      try {
        await supabase.channel(`typing-${session.id}`).send({
          type: "broadcast",
          event: "end-chat",
          payload: { sessionId: session.id }
        });
      } catch (e) {}
      
      setSession(prev => prev ? { ...prev, status: "completed" } : null);
    }
  };

  if (session && selectedAstrologer) {
    return createPortal(
      <div className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-[#1C0608]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" style={{ fontFamily: SANS }}>
        {/* Animated Main Chat Container */}
        <div className="w-full max-w-5xl bg-[#FCFAF7] rounded-[32px] border-2 border-amber-900/15 shadow-2xl flex flex-col h-[90vh] max-h-[880px] overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
          
          {/* Subtle spiritual background mandala pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${MAROON} 1px, transparent 1px), radial-gradient(circle at 0 0, ${MAROON} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
          
          {/* Luxury Top Bar Header */}
          <div className="p-4 sm:px-6 border-b border-amber-900/15 flex items-center justify-between shadow-lg shrink-0 z-10" style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4D1418 100%)` }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSession(null);
                  setSelectedAstrologer(null);
                  setMessages([]);
                }}
                className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                title="Back to Consultations"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="relative">
                <img src={selectedAstrologer.avatar} alt={selectedAstrologer.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shadow-md" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#4D1418] bg-emerald-400 animate-pulse shadow-sm" />
              </div>
              
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 leading-tight" style={{ fontFamily: SERIF }}>
                  <span className="truncate">{selectedAstrologer.name}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-amber-400/25 text-amber-200 border border-amber-400/30 tracking-wider uppercase w-fit">
                    Vedic Certified
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-amber-200/70 font-semibold flex items-center gap-1 mt-0.5 truncate max-w-[125px] sm:max-w-none">
                  <Sparkles size={10} className="text-amber-400" />
                  {selectedAstrologer.title}
                </p>
              </div>
            </div>

            <button
              onClick={endSession}
              className="px-4.5 py-2 rounded-2xl text-xs font-bold transition-all bg-red-950/40 text-red-200 border border-red-500/30 hover:bg-red-950/70 hover:border-red-400/50 active:scale-95"
            >
              End Chat
            </button>
          </div>

          {session.status === "pending" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAF6F0]/60 relative z-10 text-center space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Spiritual spinning ring */}
                <div className="w-20 h-20 rounded-full border-4 border-amber-900/10 border-t-[#5B1F24] animate-spin duration-1000" />
                <Sparkles size={24} className="absolute text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2.5 max-w-md px-4">
                <h3 className="text-base sm:text-lg font-bold text-[#5B1F24]" style={{ fontFamily: SERIF }}>Connecting to {selectedAstrologer.name}...</h3>
                <p className="text-xs font-semibold text-amber-900/60 leading-relaxed">
                  Please wait while the astrologer joins your chat. Do not close or refresh this page.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-800 border border-amber-400/30 tracking-widest animate-pulse">
                    Awaiting Scholar
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Premium Chat Messages Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8F4ED]/60 relative z-10 scrollbar-thin">
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-900/5 text-[#5B1F24] border border-amber-900/10 shadow-xs">
                    <Lock size={11} className="text-amber-700" /> Secure Live consultation
                  </span>
                </div>

                 {messages.map(m => {
                   const isUser = m.sender === "user";
                   const resolvedProduct = m.recommendedProduct || (m.recommended_product_slug ? findProduct(m.recommended_product_slug) : null);
                   return (
                     <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                       <div
                         className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm shadow-xs leading-relaxed ${
                           isUser
                             ? "rounded-tr-xs text-white"
                             : "rounded-tl-xs bg-white text-[#3E3125] border border-amber-900/10"
                         }`}
                         style={isUser ? { background: `linear-gradient(135deg, ${MAROON} 0%, #802B31 100%)`, boxShadow: "0 4px 15px rgba(91,31,36,0.08)" } : { boxShadow: "0 4px 12px rgba(45,11,14,0.02)" }}
                       >
                         <p className="whitespace-pre-line font-medium">{m.text}</p>
                         
                         {resolvedProduct && (
                           <div 
                             onClick={() => navigate(`/product/${resolvedProduct.slug}`)}
                             className="mt-3.5 p-3.5 rounded-2xl bg-[#FCFAF7] border border-amber-400/40 text-[#4A3E31] shadow-sm hover:border-amber-400 cursor-pointer transition-all duration-300 group/prod"
                           >
                             <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1 border-b border-amber-900/5 pb-1">
                               <Sparkles size={12} className="text-amber-500 fill-amber-500" /> Sacred Prescribed Remedy
                             </p>
                             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                               <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <img src={resolvedProduct.img || resolvedProduct.image} alt={resolvedProduct.name} className="w-12 h-12 rounded-xl object-cover border border-amber-900/10 group-hover/prod:scale-105 transition-transform duration-300 flex-shrink-0" />
                                 <div className="flex-1 min-w-0">
                                   <h4 className="font-bold text-xs text-[#5B1F24] leading-tight truncate sm:whitespace-normal">{resolvedProduct.name}</h4>
                                   <div className="flex items-baseline gap-2 mt-0.5">
                                     <span className="text-xs font-extrabold text-amber-700">₹{resolvedProduct.price.toLocaleString("en-IN")}</span>
                                     <span className="text-[9px] text-amber-900/50 font-bold">⭐ {resolvedProduct.rating || 5}</span>
                                   </div>
                                 </div>
                               </div>
                               <button
                                 onClick={(e) => { e.stopPropagation(); handleAddToCart(resolvedProduct); }}
                                 className="w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-extrabold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#6D2025] to-[#8C1D24] hover:brightness-110 shadow-[#6D2025]/20 shrink-0"
                               >
                                 <ShoppingBag size={11} /> Add to Cart
                               </button>
                             </div>
                           </div>
                         )}
                       </div>
                       <span className="text-[10px] font-bold text-amber-900/40 px-2">{m.timestamp || "Just now"}</span>
                     </div>
                   );
                 })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900/70 p-3 bg-white/95 rounded-2xl w-fit border border-amber-900/10 shadow-md animate-pulse">
                    <RefreshCw size={13} className="animate-spin text-amber-600" />
                    <span>pandit ji is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Pills */}
              {messages.length < 3 && (
                <div className="px-5 py-3.5 border-t border-amber-900/10 bg-[#FAF8F5] flex flex-wrap gap-2 shrink-0 z-10">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="px-4 py-2 rounded-full text-xs font-bold transition-all border border-amber-900/15 bg-white hover:bg-amber-900/5 hover:border-amber-600 text-[#5B1F24] active:scale-95 shadow-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Box Footer Bar */}
              {session.status === "completed" || session.status === "ended" || session.status === "declined" ? (
                <div className="p-4 border-t border-amber-900/15 bg-amber-50 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2 shrink-0 z-10 shadow-xs rounded-b-[30px]">
                  <CheckCircle2 size={16} className="text-amber-700 animate-pulse" />
                  <span>Chat ended. Redirecting to consult page...</span>
                </div>
              ) : (
                <div className="p-3 sm:p-5 border-t border-amber-900/15 bg-white flex items-center gap-2.5 shrink-0 z-10 shadow-[0_-5px_15px_rgba(45,11,14,0.02)]">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask scholar..."
                    className="flex-1 h-12 px-4 rounded-2xl text-xs sm:text-sm border border-amber-900/20 outline-none focus:border-[#5B1F24] focus:ring-2 focus:ring-[#5B1F24]/10 transition-all bg-[#FAF6F0]/50 text-[#3C3024] font-medium"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="h-12 w-12 sm:w-auto sm:px-6 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 shrink-0 bg-gradient-to-r from-[#6D2025] to-[#8C1D24] hover:brightness-110 shadow-[#6D2025]/20"
                  >
                    <span className="hidden sm:inline">Ask Scholar</span>
                    <Send size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart toast inside portal */}
        {localCartToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#5B1F24]/95 backdrop-blur-md border border-amber-400/30 text-amber-100 shadow-xl font-bold text-xs sm:text-sm tracking-wide">
              <span className="text-emerald-400 text-lg">✓</span>
              <span>{localCartToast} added to cart!</span>
            </div>
          </div>
        )}
      </div>,
      document.body
    );
  }

  // Filter Astrologers strictly from DB — hide offline astrologers
  const filteredAstrologers = astrologers.filter(a => {
    // Always hide offline astrologers from the directory
    if (a.status === "offline") return false;

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
    <div className="bg-[#FCFAF7] min-h-screen" style={{ fontFamily: SANS, color: "#3E3125" }}>
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Luxury Sacred Hero Header with radial starry glow */}
      <div className="relative pt-4 sm:pt-16 pb-4 sm:pb-12 px-4 sm:px-6 lg:px-10 border-b border-amber-900/10 overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F4ED 0%, #FCFAF7 100%)" }}>
        
        {/* Decorative Golden Ambient Orbs */}
        <div className="absolute top-12 right-1/4 w-80 h-80 rounded-full bg-amber-200/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 rounded-full bg-red-100/30 blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-2 sm:mb-4 text-xs font-semibold text-amber-900/50">
            <button onClick={() => navigate("/")} className="hover:underline hover:text-[#5B1F24] transition-colors">Home</button>
            <span>/</span>
            <span className="font-bold text-[#5B1F24]">Vedic Consultations</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2.5 sm:mb-4 border border-amber-400/30 bg-amber-400/10 text-amber-800">
                <Sparkles size={13} className="text-amber-600 fill-amber-600/30 animate-pulse" />
                <span>Verified Temple Scholars</span>
              </div>
              <h1 className="tracking-tight text-[#5B1F24]" style={{ fontFamily: SERIF, fontSize: "clamp(2.0rem, 5vw, 3.6rem)", fontWeight: 800 }}>
                Consult Verified <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">Vedic Acharyas</span>
              </h1>
              <p className="text-xs sm:text-sm mt-2 sm:mt-3 max-w-2xl font-medium text-amber-950/70 leading-relaxed">
                Connect live with certified Vedic Astrologers and scholars registered in the Aroham database for Kundali, Gemstone prescriptions, Rudraksha analysis, and authentic remedies.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 bg-white/70 backdrop-blur-md p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-amber-900/10 shadow-[0_8px_30px_rgb(91,31,36,0.02)] shrink-0 self-start lg:self-auto">
              <div className="flex -space-x-3">
                {astrologers.slice(0, 4).map((a, i) => (
                  <img key={a.id} src={a.avatar} alt={a.name} className="w-8.5 h-8.5 sm:w-10.5 sm:h-10.5 rounded-full object-cover border-2 border-white shadow-md z-10" style={{ zIndex: 40 - i }} />
                ))}
              </div>
              <div>
                <p className="font-extrabold text-emerald-600 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} Scholars Active
                </p>
                <p className="text-[10px] sm:text-[11px] text-amber-900/60 font-bold">Instant live chat available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-1 pb-10 sm:py-10 space-y-5 sm:space-y-8">
        
        {/* Search & Topic Filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-amber-900/10 shadow-[0_4px_25px_rgba(91,31,36,0.02)]">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scholar by name, specialty..."
              className="w-full h-10 sm:h-11.5 pl-11 pr-4 rounded-xl sm:rounded-2xl text-xs bg-amber-50/20 border border-amber-900/10 outline-none focus:border-[#5B1F24] focus:ring-2 focus:ring-[#5B1F24]/5 focus:bg-white transition-all text-[#3C3024] font-medium"
            />
          </div>

          {/* Action and Filter Row */}
          <div className="flex flex-row items-center gap-2 flex-1 justify-end min-w-0">
            {/* Topic Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-w-0 w-full">
              {["All", "Online Now", "Kundali", "Rudraksha", "Gemstone", "Vastu", "Career", "Marriage"].map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedTopic === topic
                      ? "bg-[#5B1F24] text-white border-[#5B1F24] shadow-md shadow-[#5B1F24]/10"
                      : "bg-[#FAF8F5] text-[#4A3E31] border-amber-900/10 hover:bg-amber-900/5 hover:border-amber-900/20"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Database Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6.5">
          {filteredAstrologers.length === 0 ? (
            <div className="col-span-full p-16 rounded-[32px] bg-white border border-amber-900/10 text-center space-y-4 shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-900/30">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#5B1F24]" style={{ fontFamily: SERIF }}>No Scholars Found</h3>
                <p className="text-xs text-amber-900/60 mt-1 max-w-sm mx-auto font-medium leading-relaxed">
                  No active Vedic Astrologers match "{searchQuery || selectedTopic}". Try adjusting your filters.
                </p>
              </div>
              <button
                onClick={() => { setSelectedTopic("All"); setSearchQuery(""); }}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#5B1F24] text-white hover:bg-[#72272D] transition-colors shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredAstrologers.map(astro => (
              <div key={astro.id} className="w-full">
                {/* Desktop Grid Card */}
                <div onClick={() => startConsultation(astro)} className="hidden md:flex flex-col justify-between h-full bg-white rounded-3xl p-5 border border-amber-900/10 shadow-[0_4px_22px_rgba(91,31,36,0.02)] hover:shadow-xl hover:border-amber-500/20 transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                  <div>
                    <div className="relative mb-4.5 overflow-hidden rounded-2xl aspect-[4/3] shadow-xs">
                      <img src={astro.avatar} alt={astro.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                      

                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/65 text-amber-300 border border-white/10 flex items-center gap-1 backdrop-blur-xs shadow-md">
                        <Star size={11} fill="#C8A044" stroke="none" /> {astro.rating.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1 justify-between">
                      <h3 className="font-bold text-base truncate pr-1" style={{ color: MAROON, fontFamily: SERIF }}>{astro.name}</h3>
                      <Award size={15} className="text-amber-500 shrink-0" />
                    </div>
                    <p className="text-[11px] font-semibold text-amber-900/60 mb-3.5 tracking-wide leading-relaxed">{astro.title}</p>
                    
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-950/70 mb-4 pb-3 border-b border-amber-900/5">
                      <span className="flex items-center gap-1 text-amber-900/60"><Clock size={13.5} /> {astro.experience}</span>
                      <span className="flex items-center gap-1 font-extrabold text-emerald-700">₹{astro.pricePerMin || 20}/min</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {astro.specialties.map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-900/5 text-[#5B1F24] border border-amber-900/5">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-900/5">
                    <button
                      onClick={(e) => { e.stopPropagation(); startConsultation(astro); }}
                      className="w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#6D2025] to-[#8C1D24] hover:brightness-110 shadow-[#6D2025]/15 hover:shadow-[#6D2025]/25"
                    >
                      <MessageSquare size={14.5} />
                      <span>Start Live Chat</span>
                    </button>
                  </div>
                </div>

                {/* Mobile List Card */}
                <div onClick={() => startConsultation(astro)} className="flex md:hidden bg-white rounded-2xl p-3.5 border border-amber-900/10 shadow-xs gap-3.5 items-center w-full cursor-pointer hover:shadow-md hover:border-amber-500/20 transition-all duration-300">
                  {/* Left Side: Circular Avatar, Status Dot, Stars & Orders */}
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[85px]">
                    <div className="relative">
                      <img
                        src={astro.avatar}
                        alt={astro.name}
                        className="w-16 h-16 rounded-full object-cover border border-amber-900/15"
                      />

                    </div>

                    {/* Star ratings */}
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={9}
                          fill={i < Math.round(astro.rating || 5) ? "#C8A044" : "none"}
                          stroke="#C8A044"
                          strokeWidth={1}
                        />
                      ))}
                    </div>

                    {/* Consultations Count */}
                    <span className="text-[9px] font-semibold text-amber-900/50 mt-1 whitespace-nowrap">
                      1.2k+ orders
                    </span>
                  </div>

                  {/* Middle Section: Scholar Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-sm text-[#5B1F24] truncate" style={{ fontFamily: SERIF }}>
                        {astro.name}
                      </h4>
                      <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-100 flex-shrink-0 animate-pulse" />
                    </div>

                    <p className="text-[10px] font-bold text-amber-900/70 truncate mt-0.5">
                      {astro.specialties.join(", ")}
                    </p>

                    <p className="text-[9px] font-medium text-amber-900/50 mt-0.5">
                      Hindi, English
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-amber-900/60">
                      <span>Exp: {astro.experience}</span>
                    </div>

                    <p className="text-xs font-extrabold text-[#5B1F24] mt-1">
                      ₹{astro.pricePerMin || 20}/min
                    </p>
                  </div>

                  {/* Right Side: Chat Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); startConsultation(astro); }}
                      className="px-5 py-2 rounded-xl text-xs font-bold border border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Saved Chat History Button at the bottom of the listings */}
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={openUserHistoryModal}
            className="px-6 py-3 rounded-2xl text-xs font-extrabold transition-all bg-amber-900/10 hover:bg-amber-900/15 text-[#5B1F24] border border-amber-900/20 flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
          >
            <Clock size={14} className="text-amber-700" />
            <span>My Saved Chat History</span>
          </button>
        </div>

        {/* Authentic Guidance Guarantee Footer Banner */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-white via-white to-[#F6F1EA] border border-amber-900/10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_4px_25px_rgba(91,31,36,0.01)]">
          <div className="flex items-center gap-4.5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-400/10 text-amber-800 border border-amber-400/20 flex-shrink-0 shadow-sm">
              <ShieldCheck size={28} className="text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg" style={{ color: MAROON, fontFamily: SERIF }}>100% Temple-Energized Remedial Guarantee</h3>
              <p className="text-xs text-amber-900/60 mt-1 font-semibold">Our registered scholars prescribe only genuine Vedic gemstones & energized Rudrakshas with certificates.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-[#5B1F24] border border-amber-900/20 bg-white hover:bg-amber-950/5 active:scale-95 transition-all whitespace-nowrap shadow-xs"
          >
            Explore Sacred Shop
          </button>
        </div>
      </div>

      {showUserHistoryModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" style={{ fontFamily: SANS }}>
          <div className="bg-[#FCFAF7] border-2 border-amber-900/20 rounded-[32px] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 flex items-center justify-between shadow-md text-white shrink-0" style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4D1418 100%)` }}>
              <div className="flex items-center gap-2.5">
                <Clock size={20} className="text-amber-300 animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold" style={{ fontFamily: SERIF }}>My Saved Consultation & Chat History</h3>
              </div>
              <button
                onClick={() => {
                  setShowUserHistoryModal(false);
                  setSelectedHistorySession(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Sessions List */}
              <div className={`w-full md:w-1/3 border-r border-amber-900/15 overflow-y-auto p-4 space-y-3 bg-[#F9F5EF] scrollbar-thin ${selectedHistorySession ? "hidden md:block" : "block"}`}>
                <p className="text-[10px] font-extrabold text-[#5B1F24] uppercase tracking-wider mb-2">Past Consultations</p>
                {userHistorySessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-amber-900/50 bg-white rounded-2xl border border-amber-900/10">
                    No past consultations recorded in database yet.
                  </div>
                ) : (
                  userHistorySessions.map(s => {
                    const isSelected = selectedHistorySession?.id === s.id;
                    const astroName = s.astrologer_name || astrologers.find(a => a.id === s.astrologer_id)?.name || "Vedic Scholar";
                    return (
                      <button
                        key={s.id}
                        onClick={() => viewPastSessionChat(s)}
                        className={`w-full p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? "bg-white border-amber-600 shadow-md ring-2 ring-amber-600/10 scale-102"
                            : "bg-white/60 hover:bg-white border-amber-900/10 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-xs text-[#5B1F24] line-clamp-1">
                            Consultation with {astroName}
                          </p>
                          <p className="text-[10px] text-amber-900/60 font-semibold mt-0.5">{s.topic || "Vedic Consultation"}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-amber-900/5 text-[9px] w-full font-bold">
                          <span className="text-amber-900/50">{formatChatDate(s.created_at)}</span>
                          <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                            {s.status}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Messages View */}
              <div className={`flex-1 flex flex-col bg-white overflow-hidden p-4 sm:p-5 ${!selectedHistorySession ? "hidden md:flex" : "flex"}`}>
                {selectedHistorySession ? (
                  <>
                    <div className="pb-3.5 mb-3.5 border-b border-amber-900/10 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Mobile Back button */}
                        <button
                          onClick={() => setSelectedHistorySession(null)}
                          className="md:hidden p-2 rounded-xl bg-amber-900/10 text-amber-900 hover:bg-amber-900/20 transition-all active:scale-95 shrink-0"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#5B1F24] truncate" style={{ fontFamily: SERIF }}>
                            Consultation with {selectedHistorySession.astrologer_name || astrologers.find(a => a.id === selectedHistorySession.astrologer_id)?.name || "Vedic Scholar"}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-amber-900/60 truncate">Topic: {selectedHistorySession.topic || "Vedic Guidance"}</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      ref={historyContainerRef}
                      className="flex-1 overflow-y-auto space-y-3.5 p-4 bg-[#FAF6F0]/60 rounded-2xl border border-amber-900/10 scrollbar-thin"
                    >
                      {historySessionMessages.length === 0 ? (
                        <div className="p-8 text-center text-xs text-amber-900/50">Loading saved messages...</div>
                      ) : (() => {
                        let lastDateStr = "";
                        return historySessionMessages.map(m => {
                          const isUser = m.sender === "user";
                          const messageDate = new Date(m.created_at || Date.now());
                          const dateStr = messageDate.toDateString();
                          const showDateHeader = dateStr !== lastDateStr;
                          lastDateStr = dateStr;

                          return (
                            <div key={m.id} className="w-full">
                              {showDateHeader && (
                                <div className="flex justify-center my-4">
                                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-900/10 text-[#5B1F24] border border-amber-900/5 shadow-2xs">
                                    {formatMessageHeaderDate(m.created_at)}
                                  </span>
                                </div>
                              )}
                              <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1 mt-2.5`}>
                                <div
                                  className={`p-3.5 rounded-3xl max-w-[80%] text-xs leading-relaxed ${
                                    isUser
                                      ? "bg-[#5B1F24] text-white rounded-tr-xs shadow-xs"
                                      : "bg-white text-[#4A3E31] border border-amber-900/15 rounded-tl-xs shadow-xs"
                                  }`}
                                  style={isUser ? { background: `linear-gradient(135deg, ${MAROON} 0%, #802B31 100%)` } : {}}
                                >
                                  <p className="whitespace-pre-line font-medium">{m.text}</p>
                                  {m.recommendedProduct && (
                                    <div 
                                      onClick={() => navigate(`/product/${m.recommendedProduct.slug}`)}
                                      className="mt-2.5 p-3 rounded-xl bg-[#FCFAF7] border border-amber-400/40 text-[#4A3E31] shadow-sm hover:border-amber-400 cursor-pointer transition-all duration-300 group/prod text-left"
                                    >
                                      <p className="text-[8px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1 border-b border-amber-900/5 pb-1">
                                        <Sparkles size={10} className="text-amber-500 fill-amber-500" /> Sacred Prescribed Remedy
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <img src={m.recommendedProduct.img} alt={m.recommendedProduct.name} className="w-10 h-10 rounded-lg object-cover border-amber-900/10 group-hover/prod:scale-105 transition-transform duration-300" />
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-[11px] truncate text-[#5B1F24]">{m.recommendedProduct.name}</h4>
                                          <p className="text-[10px] font-extrabold text-amber-700">₹{m.recommendedProduct.price.toLocaleString("en-IN")}</p>
                                        </div>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleAddToCart(m.recommendedProduct); }}
                                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-white shadow-md active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap bg-gradient-to-r from-[#6D2025] to-[#8C1D24] hover:brightness-110"
                                        >
                                          <ShoppingBag size={10} /> Buy
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-amber-900/40 px-2">{m.timestamp}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-xs text-amber-900/40 p-8 text-center space-y-3">
                    <Clock size={32} className="text-amber-700/50" />
                    <p className="font-bold">Select a consultation from the left to view full chat history transcript.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {localCartToast && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#5B1F24]/95 backdrop-blur-md border border-amber-400/30 text-amber-100 shadow-xl font-bold text-xs sm:text-sm tracking-wide">
            <span className="text-emerald-400 text-lg">✓</span>
            <span>{localCartToast} added to cart!</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
