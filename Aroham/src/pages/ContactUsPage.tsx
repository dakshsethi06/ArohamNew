import { MAROON, GOLD, SERIF, SANS, IVORY } from "@/constants/theme";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { useState } from "react";
import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: form.name,
        email: form.email,
        message: form.message
      }]);
      
      if (error) throw error;
      setSubmitted(true);
    } catch (e: any) {
      console.error("Error sending message:", e);
      alert(`Failed to send message: ${e?.message || JSON.stringify(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C8A044] selection:text-[#0D0508] pb-10">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: SERIF, color: MAROON }} className="text-4xl md:text-5xl font-medium mb-4">Need Help?</h1>
          <div className="h-1 w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <p className="mt-6 text-[#7A6A58]">We are here to assist you with your orders, products, and spiritual journey.</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Contact Info Sidebar */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[rgba(91,31,36,0.05)] relative overflow-hidden flex flex-col justify-center">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A044] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <h3 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-8 relative z-10">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,160,68,0.1)", color: GOLD }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#9A8A78" }}>Email Support</div>
                    <a href="mailto:priyanshubansal720@gmail.com" className="text-sm font-medium hover:underline" style={{ color: MAROON }}>priyanshubansal720@gmail.com</a>
                    <div className="text-xs mt-1" style={{ color: "#7A6A58" }}>Expect a reply within 24 hrs.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,160,68,0.1)", color: GOLD }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#9A8A78" }}>Call Us</div>
                    <div className="text-sm font-medium" style={{ color: MAROON }}>+91 80001 53840</div>
                    <div className="text-xs mt-1" style={{ color: "#7A6A58" }}>Mon - Sat, 10 AM to 6 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,160,68,0.1)", color: GOLD }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#9A8A78" }}>Spiritual Center</div>
                    <div className="text-sm font-medium leading-relaxed" style={{ color: MAROON }}>
                      Aroham Vedic Center<br/>
                      Varanasi, Uttar Pradesh<br/>
                      India
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[rgba(91,31,36,0.05)] relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5B1F24] opacity-[0.02] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            <div className="relative z-10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 style={{ fontFamily: SERIF, color: MAROON }} className="text-2xl font-semibold mb-2">Message Sent Successfully</h3>
                  <p className="text-[#7A6A58]">Thank you for reaching out to Aroham. Our support team will get back to you shortly.</p>
                  <button onClick={() => { setSubmitted(false); setForm({name: "", email: "", message: ""}); }} className="mt-8 px-6 py-2 rounded-full border text-sm font-medium transition-all hover:bg-gray-50" style={{ borderColor: GOLD, color: MAROON }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: SERIF, color: MAROON }} className="text-xl font-semibold mb-6">Send us a Message</h3>
                  <div className="space-y-4">
                    <FloatingInput label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
                    <FloatingInput label="Email Address" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
                    
                    <div className="pt-2">
                      <textarea 
                        value={form.message} 
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="How can we help you?" 
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON, fontFamily: SANS }}
                        onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.background = "#fff"; }} 
                        onBlur={e => { e.target.style.borderColor = "rgba(91,31,36,0.15)"; e.target.style.background = "#FAF7F2"; }} 
                      />
                    </div>

                    <button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.message}
                      className="w-full py-4 rounded-xl mt-2 text-sm font-bold transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY, opacity: (loading || !form.name || !form.email || !form.message) ? 0.7 : 1 }}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Message"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
