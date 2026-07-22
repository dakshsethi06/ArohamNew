import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { GOLD, IVORY, SANS, SERIF, MAROON } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function ConsultPage() {
  const navigate = useNavigate();
  const { user, showAuth, openAuth } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const startConsultation = async () => {
    if (!user) { openAuth(); return; }
    const { data, error } = await supabase.from("chat_sessions").insert({ user_id: user.id, status: "pending" }).select("*").single();
    if (data) {
      setSession(data);
      supabase.channel(`messages-${data.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${data.id}` }, payload => {
          setMessages(prev => [...prev, payload.new]);
        }).subscribe();
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !session) return;
    await supabase.from("chat_messages").insert({ session_id: session.id, sender: "user", text });
    setText("");
  };

  if (session) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6" style={{ background: "#FAF7F2" }}>
        <div className="max-w-2xl mx-auto flex flex-col h-[70vh] bg-white rounded-xl shadow-lg border" style={{ borderColor: "rgba(91,31,36,0.1)" }}>
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "rgba(91,31,36,0.1)" }}>
            <h2 className="font-bold text-lg" style={{ color: MAROON, fontFamily: SERIF }}>Consultation (ID: {session.id})</h2>
            <span className="text-sm text-gray-500">Status: {session.status}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className={`mb-3 p-3 rounded-lg max-w-[80%] ${m.sender === "user" ? "ml-auto text-white" : "mr-auto"}`} style={{ background: m.sender === "user" ? MAROON : "#F5EDE0" }}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2" style={{ borderColor: "rgba(91,31,36,0.1)" }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Type your message..." className="flex-1 p-3 rounded-lg border outline-none" />
            <button onClick={sendMessage} className="px-6 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90" style={{ background: GOLD }}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16"
      style={{ background: `linear-gradient(170deg,#0D0508 0%,#1A0D10 60%,#0D0508 100%)` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,160,68,0.07) 0%, transparent 70%)" }} />
      <div className="relative text-center max-w-lg mx-auto flex flex-col items-center">
        <button onClick={() => navigate(-1)} className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 transition-all hover:opacity-80" style={{ color: GOLD, border: "1px solid rgba(200,160,68,0.3)", background: "rgba(255,255,255,0.05)" }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: "rgba(200,160,68,0.1)", border: "1px solid rgba(200,160,68,0.25)" }}>
          <span style={{ fontSize: 28 }}>🪬</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, color: IVORY, lineHeight: 1.15, marginBottom: 20 }}>
          Expert Guidance,<br />
          <em style={{ color: GOLD }}>Live Now.</em>
        </h1>
        <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(250,247,242,0.5)", fontFamily: SANS, maxWidth: 380, margin: "0 auto 40px" }}>
          Connect instantly with our certified Vedic astrologers for personalized readings, Vastu analysis, and sacred remedies.
        </p>
        <button onClick={startConsultation} className="px-8 py-4 rounded-full text-sm font-semibold transition-all hover:opacity-90 shadow-lg" style={{ background: GOLD, color: "#1A0D10" }}>
          Start Free Consultation
        </button>
      </div>
    </div>
  );
}
