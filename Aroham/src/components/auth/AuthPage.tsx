import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Star, CheckCircle, Shield, Flame, Award, Package } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { AuthInput } from "./AuthInput";
import { PasswordInput } from "./PasswordInput";
import { OtpBoxes } from "./OtpBoxes";
import { Countdown } from "./Countdown";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

type AuthState = "signin" | "signup" | "otp" | "success" | "forgot-phone" | "forgot-otp" | "forgot-newpass" | "forgot-success";

const LEFT_PANELS = {
  signin:  { img: "https://images.unsplash.com/photo-1636714528228-f469eefb3eef?w=900&h=1100&fit=crop&auto=format", headline: "Welcome Back.",                       sub: "Continue your journey toward harmony, prosperity and positive energy.",                                                                         items: ["Access Orders", "Astrology Reports", "Consultations", "Saved Wishlist", "Track Poojas"],                                    itemIcon: "✓",  extra: "testimonial" },
  signup:  { img: "https://images.unsplash.com/photo-1583182363039-59eac8609ab2?w=900&h=1100&fit=crop&auto=format", headline: "Your Spiritual Journey Begins Here.", sub: "Create your account to unlock India's most trusted ecosystem for Vedic solutions.",                                                           items: ["Temple Energized Products", "Personalized Recommendations", "Horoscope Reports", "Astrology Consultations", "Online Poojas", "Spiritual Learning"], itemIcon: "✨", extra: "badges"      },
  otp:     { img: "https://images.unsplash.com/photo-1575225956023-97090201582a?w=900&h=1100&fit=crop&auto=format", headline: "Securing Your Sacred Journey.",      sub: "We're verifying your phone number to ensure every member enjoys a secure experience.",                                                         items: ["Secure Verification", "Encrypted Authentication", "Privacy Protected"],                                                     itemIcon: "✓",  extra: "progress"    },
  success: { img: "https://images.unsplash.com/photo-1512917860049-18d416baa831?w=900&h=1100&fit=crop&auto=format", headline: "Welcome to Aroham.",                  sub: "You've taken the first step toward a harmonious and spiritually enriched life.",                                                              items: ["Explore Products", "Discover Remedies", "Book Consultation", "Receive Personalized Guidance", "Positive Transformation"],   itemIcon: "→",  extra: "quote"       },
};

const TRUST_ITEMS = [
  { icon: Flame,       label: "Temple Energized"       },
  { icon: CheckCircle, label: "50,000+ Customers"      },
  { icon: Star,        label: "Astrologer Recommended" },
  { icon: Shield,      label: "Secure & Encrypted"     },
  { icon: Package,     label: "Premium Packaging"      },
  { icon: Award,       label: "Trusted Across India"   },
];

export function AuthPage() {
  const { closeAuth } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    closeAuth(true);
    navigate("/profile");
  };
  const [authState, setAuthState] = useState<AuthState>("signin");
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [canResend, setCanResend] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [panelVisible, setPanelVisible] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const panelKey = authState === "signup" ? "signup" : (authState === "otp" || authState === "forgot-otp" || authState === "forgot-newpass") ? "otp" : (authState === "success" || authState === "forgot-success") ? "success" : "signin";
  const panel = LEFT_PANELS[panelKey];
  const switchTab = (t: "signin" | "signup") => { setTab(t); setAuthState(t); setOtp(Array(6).fill("")); };
  const goTo = (s: AuthState) => { setPanelVisible(false); setTimeout(() => { setAuthState(s); setPanelVisible(true); }, 220); };
  const formStyle = { opacity: panelVisible ? 1 : 0, transform: panelVisible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.25s ease,transform 0.25s ease" };
  const showTabs = authState === "signin" || authState === "signup";
  const otpPhone = phone ? `+91 ${phone}` : "+91 98765 43210";
  const fgtPhone = forgotPhone ? `+91 ${forgotPhone}` : "+91 98765 43210";

  const signinJsx = (
    <div style={formStyle} className="space-y-5">
      <div><h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Welcome Back</h2><p className="text-sm" style={{ color: "#7A6A58" }}>Continue your journey toward harmony and positive energy.</p></div>
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <div className="space-y-3"><AuthInput label="Phone Number" type="tel" value={phone} onChange={v => setPhone(v.replace(/\D/g, "").slice(0, 10))} /><PasswordInput label="Password" value={password} onChange={setPassword} /></div>
      <div className="flex items-center justify-between">
        <button onClick={() => setRememberMe(v => !v)} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "#5A4A3A" }}>
          <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all" style={{ border: `2px solid ${rememberMe ? MAROON : "rgba(91,31,36,0.25)"}`, background: rememberMe ? MAROON : "transparent" }}>
            {rememberMe && <CheckCircle size={10} color="white" strokeWidth={3} />}
          </div>
          Remember me
        </button>
        <button onClick={() => goTo("forgot-phone")} className="text-xs font-semibold hover:opacity-70" style={{ color: MAROON }}>Forgot Password?</button>
      </div>
      <button onClick={async () => {
        if (!phone || !password) { setErrorMsg("Please enter phone and password."); return; }
        setLoading(true); setErrorMsg("");
        // Look up the email associated with this phone number from the backend
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/auth/email-by-phone?phone=${encodeURIComponent(phone)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Account not found for this phone number.");
          const { error } = await supabase.auth.signInWithPassword({ email: data.email, password });
          setLoading(false);
          if (error) setErrorMsg(error.message);
          else handleAuthSuccess();
        } catch (e: any) {
          setLoading(false);
          setErrorMsg(e.message || "Sign in failed.");
        }
      }} disabled={loading} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>{loading ? "Signing In..." : "Sign In"}</button>
      <div className="flex items-center gap-3"><div className="flex-1 h-px" style={{ background: "rgba(91,31,36,0.1)" }} /><span className="text-xs" style={{ color: "#9A8A78" }}>OR</span><div className="flex-1 h-px" style={{ background: "rgba(91,31,36,0.1)" }} /></div>
      <button className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 border hover:bg-gray-50" style={{ borderColor: "rgba(91,31,36,0.14)", color: "#3A3A3A" }}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Continue with Google
      </button>
      <p className="text-center text-sm" style={{ color: "#7A6A58" }}>Don't have an account? <button onClick={() => switchTab("signup")} className="font-semibold hover:opacity-70" style={{ color: MAROON }}>Create Account</button></p>
    </div>
  );
  const signupJsx = (
    <div style={formStyle} className="space-y-5">
      <div><h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Begin Your Spiritual Journey</h2><p className="text-sm" style={{ color: "#7A6A58" }}>Create your secure Aroham account.</p></div>
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <div className="space-y-3">
        <AuthInput label="Full Name" value={name} onChange={setName} />
        <AuthInput label="Phone Number" type="tel" value={phone} onChange={v => { const digits = v.replace(/\D/g, "").slice(0, 10); setPhone(digits); setEmail(`${digits}@aroham.in`); }} />
        <AuthInput label="Email (optional)" type="email" value={email} onChange={setEmail} />
        <PasswordInput label="Password" value={password} onChange={setPassword} />
        <PasswordInput label="Confirm Password" value={confirmPass} onChange={setConfirmPass} />
      </div>
      <button onClick={() => setAgreed(a => !a)} className="flex items-start gap-3 text-sm text-left w-full" style={{ color: "#5A4A3A" }}>
        <div className="w-5 h-5 mt-0.5 rounded-md flex-shrink-0 flex items-center justify-center transition-all" style={{ border: `2px solid ${agreed ? MAROON : "rgba(91,31,36,0.22)"}`, background: agreed ? MAROON : "transparent" }}>
          {agreed && <CheckCircle size={11} color="white" strokeWidth={3} />}
        </div>
        I agree to the <span className="font-semibold" style={{ color: MAROON }}>Terms</span> and <span className="font-semibold" style={{ color: MAROON }}>Privacy Policy</span>
      </button>
      <button onClick={async () => {
        if (!agreed) { setErrorMsg("Please agree to the Terms."); return; }
        if (!name || !phone || !password) { setErrorMsg("Please fill in all required fields."); return; }
        if (password !== confirmPass) { setErrorMsg("Passwords do not match."); return; }
        if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
        if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) { setErrorMsg("Password must contain at least one letter and one number."); return; }
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) { setErrorMsg("Phone number must be exactly 10 digits."); return; }
        setLoading(true); setErrorMsg("");
        try {
          // Call backend signup — creates Supabase auth user + inserts into users table
          await api("/auth/signup", {
            method: "POST",
            body: JSON.stringify({
              fullName: name,
              phone: phoneDigits,
              email: email || `${phoneDigits}@aroham.in`,
              password,
              otp: "1234" // backend currently accepts 1234 as valid OTP
            })
          });
          // Auto sign in after successful signup
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email || `${phoneDigits}@aroham.in`,
            password
          });
          setLoading(false);
          if (signInErr) { setErrorMsg("Account created! Please sign in."); goTo("signin"); }
          else handleAuthSuccess();
        } catch (e: any) {
          setLoading(false);
          setErrorMsg(e.message || "Signup failed. Please try again.");
        }
      }} disabled={loading} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY, opacity: agreed ? 1 : 0.55 }}>{loading ? "Creating Account..." : "Create Account"}</button>
      <p className="text-center text-sm" style={{ color: "#7A6A58" }}>Already have an account? <button onClick={() => switchTab("signin")} className="font-semibold hover:opacity-70" style={{ color: MAROON }}>Sign In</button></p>
    </div>
  );

  const makeOtpJsx = (onVerify: () => void, onBack: () => void, headingPhone: string) => (
    <div style={formStyle} className="space-y-6">
      <div><h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Verify Your Phone</h2><p className="text-sm leading-relaxed" style={{ color: "#7A6A58" }}>We've sent a 6-digit code to<br /><strong style={{ color: MAROON }}>{headingPhone}</strong></p></div>
      <OtpBoxes value={otp} onChange={setOtp} onComplete={onVerify} />
      <div className="text-center text-sm" style={{ color: "#7A6A58" }}>{canResend ? <button onClick={() => { setCanResend(false); setOtp(Array(6).fill("")); }} className="font-semibold" style={{ color: MAROON }}>Resend OTP</button> : <span>Resend in <Countdown seconds={30} onEnd={() => setCanResend(true)} /></span>}</div>
      <button onClick={onVerify} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>Verify &amp; Create Account</button>
      <button onClick={onBack} className="w-full text-sm font-medium text-center hover:opacity-70" style={{ color: "#7A6A58" }}>← Edit Phone Number</button>
    </div>
  );

  const successJsx = (
    <div style={formStyle} className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,rgba(200,160,68,0.25),transparent)`, transform: "scale(1.8)" }} />
        <div className="absolute inset-0 rounded-full" style={{ border: `2px solid rgba(200,160,68,0.3)`, transform: "scale(1.3)" }} />
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})`, boxShadow: `0 12px 48px rgba(200,160,68,0.4)` }}><CheckCircle size={36} color="white" strokeWidth={2.5} /></div>
      </div>
      <div><h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Welcome to Aroham</h2><p className="text-sm" style={{ color: "#7A6A58" }}>Your spiritual journey begins today.</p></div>
      <button onClick={() => closeAuth(true)} className="w-full py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>Continue to Dashboard</button>
      <button onClick={() => closeAuth(true)} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{ borderColor: "rgba(91,31,36,0.2)", color: MAROON }}>Explore Products</button>
    </div>
  );

  const forgotPhoneJsx = (<div style={formStyle} className="space-y-5"><div><h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Reset Password</h2><p className="text-sm" style={{ color: "#7A6A58" }}>Enter your registered phone number.</p></div><AuthInput label="Phone Number" type="tel" value={forgotPhone} onChange={setForgotPhone} /><button onClick={() => goTo("forgot-otp")} className="w-full py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>Send OTP</button><button onClick={() => goTo("signin")} className="w-full text-sm font-medium text-center hover:opacity-70" style={{ color: "#7A6A58" }}>← Back to Sign In</button></div>);
  const forgotNewPassJsx = (<div style={formStyle} className="space-y-5"><div><h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Create New Password</h2><p className="text-sm" style={{ color: "#7A6A58" }}>Choose a strong password.</p></div><PasswordInput label="New Password" value={newPass} onChange={setNewPass} /><PasswordInput label="Confirm New Password" value={confirmPass} onChange={setConfirmPass} /><button onClick={() => goTo("forgot-success")} className="w-full py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>Update Password</button></div>);
  const forgotSuccessJsx = (<div style={formStyle} className="flex flex-col items-center text-center space-y-6 py-4"><div className="relative w-20 h-20"><div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,rgba(200,160,68,0.2),transparent)`, transform: "scale(1.8)" }} /><div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})`, boxShadow: `0 8px 32px rgba(200,160,68,0.4)` }}><CheckCircle size={30} color="white" strokeWidth={2.5} /></div></div><div><h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 500, color: MAROON }}>Password Updated</h2><p className="text-sm" style={{ color: "#7A6A58" }}>You can now sign in with your new password.</p></div><button onClick={() => goTo("signin")} className="w-full py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>Sign In</button></div>);

  const rightContent = authState === "signin" ? signinJsx : authState === "signup" ? signupJsx : authState === "otp" ? makeOtpJsx(handleAuthSuccess, () => goTo("signup"), otpPhone) : authState === "success" ? successJsx : authState === "forgot-phone" ? forgotPhoneJsx : authState === "forgot-otp" ? makeOtpJsx(() => goTo("forgot-newpass"), () => goTo("forgot-phone"), fgtPhone) : authState === "forgot-newpass" ? forgotNewPassJsx : forgotSuccessJsx;

  return (
    <div role="dialog" aria-modal="true" aria-label="Sign in" className="fixed inset-0 z-50 flex flex-col" style={{ background: "#FAF7F2", fontFamily: SANS }}>
      <div className="flex-shrink-0 flex items-center justify-between px-6 lg:px-10 h-16 border-b" style={{ borderColor: "rgba(91,31,36,0.08)", background: "rgba(250,247,242,0.97)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => closeAuth()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${MAROON},${SAFFRON})` }}><span className="text-[10px] font-bold" style={{ color: IVORY, fontFamily: SERIF }}>ॐ</span></div>
          <span className="text-lg font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:block" style={{ color: "#7A6A58" }}>Need help?</span>
          <a href="#" className="text-xs font-semibold hover:opacity-70" style={{ color: MAROON }}>Contact Support</a>
          <button aria-label="Close sign in" onClick={() => closeAuth()} className="p-1.5 rounded-full hover:bg-black/5" style={{ color: "#7A6A58" }}><X size={18} /></button>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="flex-shrink-0 lg:w-[45%]">
          <div className="hidden lg:flex flex-col justify-between h-full px-10 py-10 relative overflow-hidden"
            style={{ background: `linear-gradient(160deg,#0D0608,#1A0D0E 30%,${MAROON} 70%,#3A1520)`, opacity: panelVisible ? 1 : 0, transform: panelVisible ? "translateX(0)" : "translateX(-16px)", transition: "opacity 0.25s ease,transform 0.25s ease" }}>
            <img src={panel.img} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.08, mixBlendMode: "luminosity" }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
            <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 220, background: "radial-gradient(ellipse 70% 100% at 50% -10%, rgba(200,160,68,0.13) 0%, rgba(91,31,36,0.08) 55%, transparent 100%)" }} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})` }}><span className="text-xs font-bold" style={{ color: "#1A0D0E", fontFamily: SERIF }}>ॐ</span></div>
                <span className="text-lg font-semibold" style={{ fontFamily: SERIF, color: IVORY }}>Aroham</span>
              </div>
              <div className="flex-1 flex flex-col justify-end pb-10" style={{ paddingTop: "30%" }}>
                <div className="h-px w-10 mb-6" style={{ background: GOLD }} />
                <h2 className="mb-3 leading-tight" style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 500, color: IVORY }}>{panel.headline}</h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.6)", maxWidth: 340 }}>{panel.sub}</p>
                <div className="space-y-2.5 mb-8">{panel.items.map(item => <div key={item} className="flex items-center gap-3"><span className="text-sm" style={{ color: GOLD }}>{panel.itemIcon}</span><span className="text-sm" style={{ color: "rgba(250,247,242,0.82)" }}>{item}</span></div>)}</div>
                {panel.extra === "testimonial" && (
                  <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="flex mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={GOLD} stroke={GOLD} />)}</div>
                    <p className="text-xs leading-relaxed mb-3 italic" style={{ color: "rgba(250,247,242,0.75)" }}>"Aroham has become my trusted destination for authentic Vedic guidance."</p>
                    <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})`, color: "#1A0D0E" }}>P</div><div><div className="text-xs font-semibold" style={{ color: IVORY }}>Priya Mehta</div><div className="text-[10px]" style={{ color: "rgba(250,247,242,0.45)" }}>Mumbai</div></div></div>
                  </div>
                )}
                {panel.extra === "badges" && <div className="flex flex-wrap gap-2">{["Temple Energized", "Expert Recommended", "Premium Craftsmanship"].map(b => <div key={b} className="px-3 py-1.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(200,160,68,0.15)", color: GOLD, border: "1px solid rgba(200,160,68,0.3)" }}>{b}</div>)}</div>}
                {panel.extra === "progress" && <div className="relative"><div className="w-16 h-16 mx-auto"><svg viewBox="0 0 64 64" className="w-full h-full" style={{ animation: "spin 3s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="32" cy="32" r="28" fill="none" stroke="rgba(200,160,68,0.15)" strokeWidth="3" /><circle cx="32" cy="32" r="28" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="90 86" strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><Shield size={20} style={{ color: GOLD }} /></div></div></div>}
                {panel.extra === "quote" && <div className="p-5 rounded-2xl" style={{ background: "rgba(200,160,68,0.1)", border: "1px solid rgba(200,160,68,0.2)" }}><div className="text-2xl mb-3" style={{ color: GOLD, fontFamily: SERIF }}>"</div><p className="text-sm leading-relaxed italic" style={{ color: "rgba(250,247,242,0.8)" }}>Every journey begins with the right intention. We're honoured to be a part of yours.</p><div className="mt-3 text-xs font-semibold" style={{ color: GOLD }}>— Aroham Team</div></div>}
              </div>
              <div className="grid grid-cols-3 gap-2">{TRUST_ITEMS.slice(0, 3).map(({ icon: Icon, label }) => <div key={label} className="flex flex-col items-center gap-1.5 text-center"><Icon size={14} style={{ color: "rgba(200,160,68,0.6)" }} strokeWidth={1.5} /><span className="text-[9px] leading-tight" style={{ color: "rgba(250,247,242,0.4)" }}>{label}</span></div>)}</div>
            </div>
          </div>
          <div className="lg:hidden px-6 py-6 sm:px-8" style={{ background: `linear-gradient(135deg,${MAROON},#3A1520)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})` }}><span className="text-[9px] font-bold" style={{ color: "#1A0D0E", fontFamily: SERIF }}>ॐ</span></div>
              <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: IVORY }}>Aroham</span>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ fontFamily: SERIF, color: GOLD }}>{panel.headline}</h3>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.65)" }}>{panel.sub}</p>
          </div>
        </div>
        <div className="flex-1 lg:overflow-y-auto" style={{ background: "#FAF7F2" }}>
          <div className="flex flex-col justify-center items-center px-5 sm:px-8 py-8 lg:min-h-full">
            <div className="w-full max-w-[460px]">
              <div className="rounded-3xl p-6 sm:p-8 lg:p-10" style={{ background: "#FFFFFF", boxShadow: "0 8px 60px rgba(91,31,36,0.1)", border: "1px solid rgba(91,31,36,0.07)" }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${MAROON},${SAFFRON})` }}><span style={{ fontSize: "9px", color: IVORY, fontFamily: SERIF }}>ॐ</span></div>
                  <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
                </div>
                {showTabs && (
                  <div className="flex p-1 rounded-2xl mb-7 relative" style={{ background: "rgba(91,31,36,0.06)" }}>
                    <div className="absolute top-1 bottom-1 rounded-xl transition-all duration-300" style={{ left: tab === "signin" ? "4px" : "calc(50% + 2px)", width: "calc(50% - 6px)", background: MAROON }} />
                    {(["signin", "signup"] as const).map(t => (
                      <button key={t} onClick={() => switchTab(t)} className="flex-1 py-2.5 text-sm font-semibold relative z-10 rounded-xl transition-colors duration-300"
                        style={{ color: tab === t ? IVORY : MAROON }}>{t === "signin" ? "Sign In" : "Create Account"}</button>
                    ))}
                  </div>
                )}
                {rightContent}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {TRUST_ITEMS.slice(0, 4).map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[10px]" style={{ color: "#9A8A78" }}><Icon size={11} style={{ color: GOLD }} strokeWidth={1.5} /> {label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 border-t overflow-x-auto hidden sm:block" style={{ background: "#FFFFFF", borderColor: "rgba(91,31,36,0.07)" }}>
        <div className="flex items-center gap-8 px-8 py-3 min-w-max mx-auto">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 flex-shrink-0"><Icon size={13} style={{ color: GOLD }} strokeWidth={1.5} /><span className="text-[10px] font-medium whitespace-nowrap" style={{ color: "#7A6A58" }}>{label}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
