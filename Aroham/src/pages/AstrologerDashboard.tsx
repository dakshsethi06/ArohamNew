import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export function AstrologerDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
    const sub = supabase.channel("incoming-requests-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, payload => {
        fetchSessions();
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchSessions = async () => {
    const { data } = await supabase.from("chat_sessions").select("*").order("created_at", { ascending: false });
    if (data) setSessions(data);
  };

  const selectSession = async (s: any) => {
    setActiveSession(s);
    const { data } = await supabase.from("chat_messages").select("*").eq("session_id", s.id).order("created_at", { ascending: true });
    if (data) setMessages(data);
    
    // update status to active
    await supabase.from("chat_sessions").update({ status: "active", astrologer_id: user?.id }).eq("id", s.id);

    supabase.channel(`messages-${s.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${s.id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();
  };

  const sendMessage = async () => {
    if (!reply.trim() || !activeSession) return;
    await supabase.from("chat_messages").insert({ session_id: activeSession.id, sender: "astrologer", text: reply });
    setReply("");
  };

  const endSession = async () => {
    if (!activeSession) return;
    await supabase.from("chat_sessions").update({ status: "completed" }).eq("id", activeSession.id);
    setActiveSession(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: SANS, background: "#FAF7F2" }}>
      <div className="w-1/3 border-r bg-white p-4" style={{ borderColor: "rgba(91,31,36,0.1)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: MAROON, fontFamily: SERIF }}>Consultation Requests</h2>
        {sessions.map(s => (
          <div key={s.id} onClick={() => selectSession(s)} className="p-3 mb-2 rounded border cursor-pointer hover:bg-gray-50" style={{ borderColor: activeSession?.id === s.id ? GOLD : "rgba(91,31,36,0.1)" }}>
            <div className="font-semibold">{s.user_id}</div>
            <div className="text-xs text-gray-500">{s.status}</div>
          </div>
        ))}
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        {activeSession ? (
          <>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-bold" style={{ color: MAROON, fontFamily: SERIF }}>Session {activeSession.id}</h2>
              <button onClick={endSession} className="px-4 py-1 text-sm rounded bg-red-100 text-red-600">End Session</button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded bg-white" style={{ border: "1px solid rgba(91,31,36,0.1)" }}>
              {messages.map(m => (
                <div key={m.id} className={`mb-2 p-2 rounded max-w-[70%] ${m.sender === "astrologer" ? "ml-auto text-right text-white" : "mr-auto text-left"}`} style={{ background: m.sender === "astrologer" ? MAROON : "#eee" }}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 rounded border" />
              <button onClick={sendMessage} className="px-4 py-2 rounded text-white" style={{ background: MAROON }}>Send</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a session to view chat</div>
        )}
      </div>
    </div>
  );
}
