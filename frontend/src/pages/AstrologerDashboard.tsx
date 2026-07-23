import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Send, UserCheck, ShieldCheck, Sparkles, MessageCircle, Clock } from "lucide-react";

export function AstrologerDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
    const sub = supabase
      .channel("incoming-requests-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => {
        fetchSessions();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await supabase.from("chat_sessions").select("*").order("created_at", { ascending: false });
      if (data) setSessions(data);
    } catch {
      // Fallback
    }
  };

  const selectSession = async (s: any) => {
    setActiveSession(s);
    try {
      const { data } = await supabase.from("chat_messages").select("*").eq("session_id", s.id).order("created_at", { ascending: true });
      if (data) setMessages(data);

      await supabase.from("chat_sessions").update({ status: "active", astrologer_id: user?.id }).eq("id", s.id);

      supabase
        .channel(`messages-${s.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${s.id}` }, payload => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();
    } catch {
      // Fallback
    }
  };

  const sendMessage = async () => {
    if (!reply.trim() || !activeSession) return;
    try {
      await supabase.from("chat_messages").insert({ session_id: activeSession.id, sender: "astrologer", text: reply });
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), sender: "astrologer", text: reply }]);
    }
    setReply("");
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      await supabase.from("chat_sessions").update({ status: "completed" }).eq("id", activeSession.id);
    } catch {
      // Fallback
    }
    setActiveSession(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: SANS, background: "#1A0D10", color: IVORY }}>
      
      {/* Sidebar Consultation Requests List */}
      <div className="w-1/3 border-r p-6 bg-[#0D0508]" style={{ borderColor: "rgba(200,160,68,0.2)" }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: SERIF }}>Astrologer Portal</h2>
            <p className="text-xs text-amber-200/60">Live User Requests</p>
          </div>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-amber-100/60">
              No pending consultation requests. Users joining will appear here live.
            </div>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                onClick={() => selectSession(s)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeSession?.id === s.id
                    ? "bg-amber-900/30 border-amber-500/50 shadow-md"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-200 truncate">User #{s.user_id?.slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/60 flex items-center gap-1">
                  <Clock size={11} /> {new Date(s.created_at || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Workstation */}
      <div className="w-2/3 p-6 flex flex-col justify-between bg-[#1A0D10]">
        {activeSession ? (
          <>
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: SERIF }}>Active Session #{activeSession.id}</h2>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Real-time Live Consultation
                </p>
              </div>
              <button
                onClick={endSession}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-900/40 text-red-200 border border-red-500/30 hover:bg-red-900/60 active:scale-95 transition-all"
              >
                End Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl max-w-[75%] text-xs leading-relaxed ${
                    m.sender === "astrologer"
                      ? "ml-auto bg-gradient-to-r from-[#5B1F24] to-[#7A2A30] text-white"
                      : "mr-auto bg-white/10 text-amber-100 border border-white/10"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type your astrological remedy or response..."
                className="flex-1 h-12 px-4 rounded-xl text-xs bg-white/10 border border-white/15 text-white outline-none focus:border-amber-400 transition-all"
              />
              <button
                onClick={sendMessage}
                className="h-12 px-6 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-md active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${MAROON}, #7A2A30)` }}
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-amber-100/40 space-y-3">
            <MessageCircle size={40} className="text-amber-500/30" />
            <p className="text-sm font-semibold">Select a consultation request from the left panel to begin guiding users.</p>
          </div>
        )}
      </div>
    </div>
  );
}
