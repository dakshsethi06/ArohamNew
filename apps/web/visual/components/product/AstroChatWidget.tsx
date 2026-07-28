import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, ChevronUp, Sparkles } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF } from "@aroham/shared-config/theme";
import { useAuth } from "@aroham/shared-auth";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export function AstroChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Namaste! I am your AstroGuide. How can I help you align your stars and find the perfect supportive remedies today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const parseMarkdown = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Format headers
    html = html.replace(/^### (.*?)$/gm, '<h5 style="margin-top: 6px; margin-bottom: 3px; font-weight: bold; color: #C8A044;">$1</h5>');
    html = html.replace(/^## (.*?)$/gm, '<h4 style="margin-top: 8px; margin-bottom: 4px; font-weight: bold; color: #C8A044;">$1</h4>');
    html = html.replace(/^# (.*?)$/gm, '<h3 style="margin-top: 10px; margin-bottom: 5px; font-weight: bold; color: #C8A044;">$1</h3>');

    // Format bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #C8A044; font-weight: 700;">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong style="color: #C8A044; font-weight: 700;">$1</strong>');

    // Format line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  const handleSendMessage = async () => {
    const text = inputVal.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "anonymous_user",
          message: text,
        }),
      });

      if (!res.ok) throw new Error("Cosmos API unreachable");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: "msg-res-" + Date.now(),
          sender: "bot",
          text: data.reply || "I cannot reach the cosmos right now.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-err-" + Date.now(),
          sender: "bot",
          text: "I had trouble reading the stars. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]" style={{ fontFamily: SANS }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`,
            boxShadow: "0 8px 32px rgba(91,31,36,0.3)",
          }}
        >
          <MessageSquare className="w-6 h-6" style={{ color: IVORY }} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className="w-[360px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-amber-900/10 animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{
            boxShadow: "0 12px 40px rgba(91,31,36,0.15)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between shadow-md shrink-0"
            style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4D1418 100%)` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white" style={{ fontFamily: SERIF }}>
                  Aroham AstroGuide
                </h3>
                <span className="text-[9px] text-green-400 font-bold tracking-wider uppercase block">
                  Online Advisor
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FCFAF7]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "text-white rounded-br-none"
                      : "text-[#3C3024] bg-white border border-amber-900/10 rounded-bl-none"
                  }`}
                  style={{
                    background: m.sender === "user" ? `linear-gradient(135deg, ${MAROON}, #7A2A30)` : undefined,
                  }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl text-xs text-amber-900/60 border border-amber-900/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                <span className="font-semibold text-[10px] ml-1">Consulting the cosmos...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-amber-900/10 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about remedies, career stability..."
              className="flex-1 h-10 px-4 rounded-xl text-xs border border-amber-900/20 outline-none focus:border-[#5B1F24] bg-[#FAF6F0]/50 text-[#3C3024] font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputVal.trim() || loading}
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${MAROON}, #7A2A30)`,
              }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
