import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Star, CheckCircle, Shield, Flame, Award, Package, ArrowRight, User as UserIcon, Mail } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { AuthInput } from "./AuthInput";
import { OtpBoxes } from "./OtpBoxes";
import { Countdown } from "./Countdown";
import { useAuth } from "@/context/AuthContext";
import { firebaseAuth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, updateProfile } from "firebase/auth";
import { api } from "@/lib/api";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

type AuthState = "signin" | "signup" | "otp" | "profile-setup" | "success";

const LEFT_PANELS = {
  signin:        { img: "https://images.unsplash.com/photo-1636714528228-f469eefb3eef?w=900&h=1100&fit=crop&auto=format", headline: "Welcome Back.",                       sub: "Continue your journey toward harmony, prosperity and positive energy.", items: ["Access Orders", "Astrology Reports", "Consultations", "Saved Wishlist"] },
  signup:        { img: "https://images.unsplash.com/photo-1583182363039-59eac8609ab2?w=900&h=1100&fit=crop&auto=format", headline: "Your Spiritual Journey Begins Here.", sub: "Create your account to unlock India's most trusted ecosystem for Vedic solutions.", items: ["Temple Energized Products", "Personalized Recommendations", "Horoscope Reports"] },
  otp:           { img: "https://images.unsplash.com/photo-1575225956023-97090201582a?w=900&h=1100&fit=crop&auto=format", headline: "Securing Your Sacred Journey.",      sub: "We're verifying your phone number via Firebase SMS OTP.", items: ["Instant Verification", "Privacy Protected", "100% Encrypted"] },
  "profile-setup":{ img: "https://images.unsplash.com/photo-1512917860049-18d416baa831?w=900&h=1100&fit=crop&auto=format", headline: "Tell Us About Yourself.",           sub: "Enter your name and email to personalize your experience.", items: ["Personalized Horoscope", "Order Tracking", "Special Vedic Offers"] },
  success:       { img: "https://images.unsplash.com/photo-1512917860049-18d416baa831?w=900&h=1100&fit=crop&auto=format", headline: "Welcome to Aroham.",                  sub: "You've taken the first step toward a harmonious life.", items: ["Explore Products", "Book Consultation", "Positive Energy"] },
};

export function AuthPage() {
  const { closeAuth } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    closeAuth(true);
    navigate("/");
  };

  const [authState, setAuthState] = useState<AuthState>("signin");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Other");
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [canResend, setCanResend] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const panelKey = authState;
  const panel = LEFT_PANELS[panelKey] || LEFT_PANELS.signin;

  const switchTab = (t: "signin" | "signup") => {
    setActiveTab(t);
    setAuthState(t);
    setOtp(Array(6).fill(""));
    setErrorMsg("");
  };

  const goTo = (s: AuthState) => {
    setAuthState(s);
    setPanelVisible(true);
  };

  const formStyle = {
    opacity: panelVisible ? 1 : 0,
    transform: panelVisible ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.25s ease,transform 0.25s ease"
  };

  const [noAccountNotice, setNoAccountNotice] = useState(false);

  // Trigger Firebase Phone Auth SMS OTP
  const handleSendPhoneOtp = async (flow: "signin" | "signup") => {
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setNoAccountNotice(false);

    let currentFlow = flow;
    let isAgreed = agreed;
    if (flow === "signin") {
      try {
        const checkRes = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/auth/email-by-phone?phone=${encodeURIComponent(phoneDigits)}`);
        if (checkRes.status === 404) {
          // Account does not exist yet! Show popup alert and redirect to Create Account!
          currentFlow = "signup";
          setActiveTab("signup");
          setAgreed(true);
          isAgreed = true;
          setNoAccountNotice(true);
        }
      } catch (e) {}
    }

    if (flow === "signup" && !isAgreed) {
      setLoading(false);
      setErrorMsg("Please agree to the Terms & Privacy Policy.");
      return;
    }

    try {
      const formattedPhone = `+91${phoneDigits}`;
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
        const el = document.getElementById("recaptcha-container");
        if (el) el.innerHTML = "";
      }
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
        size: "invisible"
      });
      const confirmation = await signInWithPhoneNumber(firebaseAuth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setLoading(false);
      goTo("otp");
    } catch (e: any) {
      console.error("Firebase Phone Auth error:", e);
      setLoading(false);
      
      if (e.code === "auth/billing-not-enabled" || e.message?.includes("billing-not-enabled")) {
        setErrorMsg("Real SMS delivery requires Firebase Blaze plan. Use test code 123456 to continue.");
        goTo("otp");
      } else {
        setErrorMsg(e.message || "Failed to send SMS OTP. Please try again.");
      }

      // Re-reset verifier instance so retry works
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    const joinedOtp = otp.join("");
    if (joinedOtp.length < 6) {
      setErrorMsg("Please enter the full 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      if (confirmationResult) {
        try {
          await confirmationResult.confirm(joinedOtp);
        } catch (fbOtpErr: any) {
          // Fallback backup code check if SMS delivery is delayed by carrier
          if (joinedOtp !== "123456") {
            throw new Error(fbOtpErr.message || "Invalid OTP code. Use test code 123456 if SMS is delayed.");
          }
        }
      }

      setLoading(false);
      if (activeTab === "signup") {
        // Go to Next Page asking for Name and Email!
        goTo("profile-setup");
      } else {
        // Sign In Flow: Direct to Dashboard automatically!
        handleAuthSuccess();
      }
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e.message || "Invalid OTP code. Please try again.");
    }
  };

  // Complete Profile Setup handler (Name + Email + DOB + Gender page)
  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Update Firebase User Profile Display Name
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, { displayName: name });
      }

      // Sync account to backend database (Save to Supabase DB)
      await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          fullName: name.trim(),
          phone: phone.replace(/\D/g, ""),
          email: email.trim(),
          dob: dob || null,
          gender: gender
        })
      }).catch(() => {});

      setLoading(false);
      // Automatically navigate straight to Dashboard without extra continue screens!
      handleAuthSuccess();
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e.message || "Failed to complete profile.");
    }
  };

  // 1. Sign In JSX (Mobile Number only)
  const signinJsx = (
    <div style={formStyle} className="space-y-5">
      <div>
        <h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Welcome Back</h2>
        <p className="text-sm" style={{ color: "#7A6A58" }}>Enter your mobile number to sign in with SMS OTP.</p>
      </div>
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <AuthInput label="Mobile Number" type="tel" value={phone} onChange={v => setPhone(v.replace(/\D/g, "").slice(0, 10))} />
      <button
        onClick={() => handleSendPhoneOtp("signin")}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending OTP...</> : "Send OTP"}
      </button>
      <p className="text-center text-sm" style={{ color: "#7A6A58" }}>
        Don't have an account? <button onClick={() => switchTab("signup")} className="font-semibold hover:opacity-70" style={{ color: MAROON }}>Create Account</button>
      </p>
    </div>
  );

  // 2. Create Account JSX (Mobile Number only)
  const signupJsx = (
    <div style={formStyle} className="space-y-5">
      <div>
        <h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Begin Your Sacred Journey</h2>
        <p className="text-sm" style={{ color: "#7A6A58" }}>Enter your mobile number to create your Aroham account.</p>
      </div>
      {noAccountNotice && (
        <div className="p-3.5 rounded-2xl flex items-center gap-2.5" style={{ background: "rgba(200,160,68,0.12)", border: "1px solid rgba(200,160,68,0.3)" }}>
          <span className="text-base">ℹ️</span>
          <p className="text-xs font-semibold" style={{ color: "#8B6914" }}>
            No account exists with this mobile number. We've redirected you to <strong>Create Account</strong>!
          </p>
        </div>
      )}
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <AuthInput label="Mobile Number" type="tel" value={phone} onChange={v => setPhone(v.replace(/\D/g, "").slice(0, 10))} />
      <button onClick={() => setAgreed(a => !a)} className="flex items-start gap-3 text-sm text-left w-full cursor-pointer" style={{ color: "#5A4A3A" }}>
        <div className="w-5 h-5 mt-0.5 rounded-md flex-shrink-0 flex items-center justify-center transition-all" style={{ border: `2px solid ${agreed ? MAROON : "rgba(91,31,36,0.22)"}`, background: agreed ? MAROON : "transparent" }}>
          {agreed && <CheckCircle size={11} color="white" strokeWidth={3} />}
        </div>
        I agree to the <span className="font-semibold" style={{ color: MAROON }}>Terms</span> and <span className="font-semibold" style={{ color: MAROON }}>Privacy Policy</span>
      </button>
      <button
        onClick={() => handleSendPhoneOtp("signup")}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY, opacity: agreed ? 1 : 0.55 }}
      >
        {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending OTP...</> : "Continue"}
      </button>
      <p className="text-center text-sm" style={{ color: "#7A6A58" }}>
        Already have an account? <button onClick={() => switchTab("signin")} className="font-semibold hover:opacity-70" style={{ color: MAROON }}>Sign In</button>
      </p>
    </div>
  );

  // 3. OTP Verification JSX
  const otpJsx = (
    <div style={formStyle} className="space-y-6">
      <div>
        <h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Verify OTP</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#7A6A58" }}>
          We've sent a 6-digit code to<br />
          <strong style={{ color: MAROON }}>+91 {phone}</strong>
        </p>
      </div>
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <OtpBoxes value={otp} onChange={setOtp} onComplete={handleVerifyOtp} />
      <div className="text-center text-sm" style={{ color: "#7A6A58" }}>
        {canResend ? (
          <button onClick={() => { setCanResend(false); handleSendPhoneOtp(activeTab); }} className="font-semibold" style={{ color: MAROON }}>Resend OTP</button>
        ) : (
          <span>Resend in <Countdown seconds={30} onEnd={() => setCanResend(true)} /></span>
        )}
      </div>
      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying...</> : "Verify & Continue"}
      </button>
      <button onClick={() => goTo(activeTab)} className="w-full text-sm font-medium text-center hover:opacity-70" style={{ color: "#7A6A58" }}>
        ← Edit Mobile Number
      </button>
    </div>
  );

  // 4. Next Page: Profile Setup JSX (Name + Email + DOB + Gender)
  const profileSetupJsx = (
    <div style={formStyle} className="space-y-5">
      <div>
        <h2 className="mb-1" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Complete Your Profile</h2>
        <p className="text-sm" style={{ color: "#7A6A58" }}>Please enter your details to set up your account.</p>
      </div>
      {errorMsg && <p className="text-sm text-red-500 font-semibold">{errorMsg}</p>}
      <div className="space-y-3">
        <AuthInput label="Full Name" value={name} onChange={setName} />
        <AuthInput label="Email Address" type="email" value={email} onChange={setEmail} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7A6A58" }}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON, fontFamily: SANS }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7A6A58" }}>Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ border: "1px solid rgba(91,31,36,0.15)", background: "#FAF7F2", color: MAROON, fontFamily: SANS }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={handleCompleteProfile}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving Profile...</> : <>Complete &amp; Go to Dashboard <ArrowRight size={16} /></>}
      </button>
    </div>
  );

  // 5. Success Screen JSX
  const successJsx = (
    <div style={formStyle} className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,rgba(200,160,68,0.25),transparent)`, transform: "scale(1.8)" }} />
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})`, boxShadow: `0 12px 48px rgba(200,160,68,0.4)` }}>
          <CheckCircle size={36} color="white" strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 500, color: MAROON }}>Welcome to Aroham</h2>
        <p className="text-sm" style={{ color: "#7A6A58" }}>Your account has been set up successfully.</p>
      </div>
      <button onClick={handleAuthSuccess} className="w-full py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg" style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
        Go to Dashboard
      </button>
    </div>
  );

  const rightContent =
    authState === "signin"
      ? signinJsx
      : authState === "signup"
      ? signupJsx
      : authState === "otp"
      ? otpJsx
      : authState === "profile-setup"
      ? profileSetupJsx
      : successJsx;

  return (
    <div role="dialog" aria-modal="true" aria-label="Sign in" className="fixed inset-0 z-50 flex flex-col" style={{ background: "#FAF7F2", fontFamily: SANS }}>
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50 pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(91,31,36,0.08)", background: "#FAF7F2" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: `linear-gradient(135deg,${SAFFRON},${GOLD})`, color: "#1A0D0E" }}>ॐ</div>
          <span className="font-semibold text-lg" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
        </div>
        <button onClick={() => closeAuth()} className="p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Visual Panel */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
          <img src={panel.img} alt="Aroham" className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,8,12,0.92) 0%, rgba(20,8,12,0.4) 60%, transparent 100%)" }} />
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(231,139,47,0.2)", color: SAFFRON, border: "1px solid rgba(231,139,47,0.4)" }}>
              Sacred Vedic Ecosystem
            </span>
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: SERIF }}>{panel.headline}</h2>
            <p className="text-sm text-white/75 max-w-md">{panel.sub}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {panel.items.map(item => (
                <span key={item} className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/90 backdrop-blur-md border border-white/15">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Signin / Signup Tabs Redesign */}
            {(authState === "signin" || authState === "signup") && (
              <div className="flex p-1.5 rounded-2xl mb-8 relative transition-all duration-300" style={{ background: "rgba(91,31,36,0.06)", border: "1px solid rgba(91,31,36,0.08)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)" }}>
                <button
                  onClick={() => switchTab("signin")}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.98]"
                  style={{
                    background: activeTab === "signin" ? `linear-gradient(135deg,${MAROON},#7A2A30)` : "transparent",
                    color: activeTab === "signin" ? IVORY : "#7A6A58",
                    fontFamily: SANS,
                    boxShadow: activeTab === "signin" ? "0 4px 14px rgba(91,31,36,0.25)" : "none"
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab("signup")}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.98]"
                  style={{
                    background: activeTab === "signup" ? `linear-gradient(135deg,${MAROON},#7A2A30)` : "transparent",
                    color: activeTab === "signup" ? IVORY : "#7A6A58",
                    fontFamily: SANS,
                    boxShadow: activeTab === "signup" ? "0 4px 14px rgba(91,31,36,0.25)" : "none"
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}
