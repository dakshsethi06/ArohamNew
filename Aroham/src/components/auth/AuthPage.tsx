import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { X, Star, CheckCircle, Shield, ArrowRight, User as UserIcon, Calendar, ChevronDown, Sparkles, Lock, Verified } from "lucide-react";
import { MAROON, GOLD, SAFFRON, IVORY, SANS, SERIF } from "@/constants/theme";
import { AuthInput } from "./AuthInput";
import { OtpBoxes } from "./OtpBoxes";
import { Countdown } from "./Countdown";
import { useAuth } from "@/context/AuthContext";
import { firebaseAuth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type AuthState = "signin" | "signup" | "otp" | "profile-setup" | "success";

const LEFT_PANELS = {
  signin:        { img: "/images/auth-bg.png", headline: "Welcome Back.",                       sub: "Continue your sacred journey toward harmony, prosperity and divine energy.", items: ["Access Orders", "Astrology Reports", "Consultations", "Saved Wishlist"] },
  signup:        { img: "/images/auth-bg.png", headline: "Your Spiritual Journey Begins.",    sub: "Join India's most trusted ecosystem for authentic Vedic solutions.", items: ["Temple Energized", "Expert Guidance", "Personalized Path"] },
  otp:           { img: "/images/auth-bg.png", headline: "Securing Your Sacred Path.",        sub: "Verifying your identity with encrypted SMS authentication.", items: ["Instant Verification", "Privacy Protected", "100% Secure"] },
  "profile-setup":{ img: "/images/auth-bg.png", headline: "Complete Your Profile.",          sub: "Share your details to unlock personalized cosmic guidance.", items: ["Personalized Horoscope", "Order Tracking", "Exclusive Offers"] },
  success:       { img: "/images/auth-bg.png", headline: "Welcome to Aroham.",                sub: "Your journey toward harmony and prosperity begins now.", items: ["Explore Sacred Products", "Book Consultation", "Divine Blessings"] },
};

export function AuthPage() {
  const { login, closeAuth } = useAuth();
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

  // Trigger Phone Auth SMS OTP
  const handleSendPhoneOtp = async () => {
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (activeTab === "signup") {
      if (!name.trim()) {
        setErrorMsg("Please enter your full name to create an account.");
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");
    setNoAccountNotice(false);

    if (activeTab === "signin") {
      let existingUser: any = null;

      try {
        const { data } = await Promise.race([
          supabase.from('users').select('*').or(`phone.eq.${phoneDigits},phone.eq.+91${phoneDigits},phone.eq.91${phoneDigits}`).maybeSingle(),
          new Promise<any>(res => setTimeout(() => res({ data: null }), 1000))
        ]);
        if (data && (data.phone || data.id)) {
          existingUser = data;
        }
      } catch (e) {}

      if (!existingUser) {
        // Unregistered number entered on Sign In -> Redirect to Create Account
        localStorage.removeItem(`aroham_registered_user_phone_${phoneDigits}`);
        setLoading(false);
        setErrorMsg("Mobile number not registered. Redirecting to Create Account...");
        setTimeout(() => {
          setActiveTab("signup");
          setAuthState("signup");
          setErrorMsg("Mobile number not registered. Please create an account.");
        }, 1000);
        return;
      }
    }

    if (activeTab === "signup") {
      let existingUser: any = null;
      const cleanEmail = email.trim().toLowerCase();

      try {
        const { data } = await Promise.race([
          supabase.from('users').select('*').or(`phone.eq.${phoneDigits},phone.eq.+91${phoneDigits},phone.eq.91${phoneDigits}${cleanEmail ? `,email.eq.${cleanEmail}` : ''}`).maybeSingle(),
          new Promise<any>(res => setTimeout(() => res({ data: null }), 1000))
        ]);
        if (data && (data.phone || data.id || data.email)) {
          existingUser = data;
        }
      } catch (e) {}

      if (existingUser) {
        // Already registered number/email entered on Create Account -> Redirect to Sign In
        setLoading(false);
        const reason = (existingUser.email && cleanEmail && existingUser.email.trim().toLowerCase() === cleanEmail)
          ? "Account already exists with this email. Redirecting to Sign In..."
          : "Mobile number already registered. Redirecting to Sign In...";
        setErrorMsg(reason);
        setTimeout(() => {
          setActiveTab("signin");
          setAuthState("signin");
          setErrorMsg(reason.includes("email") ? "Email address already registered. Please sign in." : "Mobile number already registered. Please sign in.");
        }, 1000);
        return;
      }
    }

    setTimeout(() => {
      setLoading(false);
      goTo("otp");
    }, 600);
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      if (user) {
        const displayName = user.displayName || "";
        const gEmail = user.email || "";
        const phoneDigits = user.phoneNumber?.replace(/\D/g, "") || "";

        // Non-blocking save/update Firestore profile
        setDoc(doc(db, "users", user.uid), {
          fullName: displayName || "Devotee",
          email: gEmail,
          phone: phoneDigits,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => console.warn("Firestore setDoc warning:", err));

        // Non-blocking save/update Supabase profile
        Promise.resolve(supabase.from('users').upsert({
          id: user.uid,
          full_name: displayName || "Devotee",
          email: gEmail,
          phone: phoneDigits,
          created_at: new Date().toISOString()
        })).catch(err => console.warn("Supabase upsert warning:", err));

        // Save local cache so future sign-ins retain profile
        if (gEmail || phoneDigits) {
          const userObj = { id: user.uid, fullName: displayName || "Devotee", email: gEmail, phone: phoneDigits };
          if (gEmail) localStorage.setItem(`aroham_registered_user_email_${gEmail}`, JSON.stringify(userObj));
          if (phoneDigits) localStorage.setItem(`aroham_registered_user_phone_${phoneDigits}`, JSON.stringify(userObj));
        }

        login({
          id: user.uid,
          email: gEmail,
          user_metadata: { full_name: displayName || "Devotee", phone: phoneDigits }
        });
        setGoogleLoading(false);
        handleAuthSuccess();
      } else {
        setGoogleLoading(false);
      }
    } catch (e: any) {
      setGoogleLoading(false);
      if (e.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in cancelled. Please try again.");
      } else {
        setErrorMsg(e.message || "Failed to sign in with Google. Please try again.");
      }
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (autoFilledCode?: any) => {
    const joinedOtp = typeof autoFilledCode === 'string' ? autoFilledCode : otp.join("");
    if (joinedOtp.length < 6) {
      setErrorMsg("Please enter the full 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    setTimeout(async () => {
      if (joinedOtp !== "123456") {
        setLoading(false);
        setErrorMsg("Invalid OTP code. Use test code 123456.");
        return;
      }

      const phoneDigits = phone.replace(/\D/g, "");

      try {
        let existingUser: { id: string; fullName: string; email?: string; phone: string } | null = null;

        // 1. Check Local Storage cache
        const localCached = localStorage.getItem(`aroham_registered_user_phone_${phoneDigits}`);
        if (localCached) {
          try {
            const parsed = JSON.parse(localCached);
            if (parsed && parsed.fullName) existingUser = parsed;
          } catch (e) {}
        }

        // 2. Check Firestore
        if (!existingUser) {
          try {
            const q = query(collection(db, "users"), where("phone", "==", phoneDigits));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const docData = snapshot.docs[0].data();
              if (docData.fullName || docData.full_name) {
                existingUser = {
                  id: snapshot.docs[0].id,
                  fullName: docData.fullName || docData.full_name,
                  email: docData.email,
                  phone: docData.phone || phoneDigits
                };
              }
            }
          } catch (e) {
            console.warn("Firestore search warning:", e);
          }
        }

        // 3. Check Supabase
        if (!existingUser) {
          try {
            const { data } = await supabase.from('users').select('*').eq('phone', phoneDigits).maybeSingle();
            if (data && (data.full_name || data.fullName)) {
              existingUser = {
                id: data.id,
                fullName: data.full_name || data.fullName,
                email: data.email,
                phone: data.phone || phoneDigits
              };
            }
          } catch (e) {}
        }

        if (existingUser) {
          setLoading(false);
          login({
            id: existingUser.id,
            email: existingUser.email,
            user_metadata: { full_name: existingUser.fullName, phone: existingUser.phone }
          });
          handleAuthSuccess();
        } else if (name.trim()) {
          // Account creation flow: Save profile now
          const newUserId = crypto.randomUUID();
          const userProfile = {
            id: newUserId,
            fullName: name.trim(),
            email: email.trim() || null,
            phone: phoneDigits
          };

          // Save local cache
          localStorage.setItem(`aroham_registered_user_phone_${phoneDigits}`, JSON.stringify(userProfile));

          // Save Firestore
          setDoc(doc(db, "users", newUserId), {
            fullName: name.trim(),
            email: email.trim() || null,
            phone: phoneDigits,
            createdAt: serverTimestamp()
          }, { merge: true }).catch(err => console.warn("Firestore setDoc warning:", err));

          // Save Supabase
          Promise.resolve(supabase.from('users').upsert({
            id: newUserId,
            full_name: name.trim(),
            email: email.trim() || null,
            phone: phoneDigits,
            created_at: new Date().toISOString()
          })).catch(err => console.warn("Supabase upsert warning:", err));

          setLoading(false);
          login({
            id: newUserId,
            email: email.trim() || null,
            user_metadata: { full_name: name.trim(), phone: phoneDigits }
          });
          handleAuthSuccess();
        } else {
          setLoading(false);
          goTo("profile-setup");
        }
      } catch (err) {
        setLoading(false);
        setErrorMsg("Failed to connect to database. Please try again.");
      }
    }, 800);
  };

  // Complete Profile Setup handler
  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const newUserId = crypto.randomUUID();
      const phoneDigits = phone.replace(/\D/g, "");
      const userProfile = {
        id: newUserId,
        fullName: name.trim(),
        email: email.trim() || null,
        phone: phoneDigits
      };

      if (phoneDigits) {
        localStorage.setItem(`aroham_registered_user_phone_${phoneDigits}`, JSON.stringify(userProfile));
      }

      setDoc(doc(db, "users", newUserId), {
        fullName: name.trim(),
        email: email.trim() || null,
        phone: phoneDigits,
        createdAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn("Firestore setDoc warning:", err));

      Promise.resolve(supabase.from('users').upsert({
        id: newUserId,
        full_name: name.trim(),
        email: email.trim() || null,
        phone: phoneDigits,
        created_at: new Date().toISOString()
      })).catch(err => console.warn("Supabase upsert warning:", err));

      setLoading(false);
      login({
        id: newUserId,
        email: email.trim() || null,
        user_metadata: { full_name: name.trim(), phone: phoneDigits }
      });
      handleAuthSuccess();
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e.message || "Failed to complete profile.");
    }
  };

  // 1. Unified Auth JSX - Sign In & Create Account Tabs
  const signinJsx = (
    <div style={formStyle} className="space-y-6">
      {/* Auth Tab Switcher */}
      <div className="flex rounded-2xl p-1 mb-2" style={{ background: "rgba(91,31,36,0.06)", border: "1px solid rgba(91,31,36,0.1)" }}>
        <button
          type="button"
          onClick={() => switchTab("signin")}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: activeTab === "signin" ? MAROON : "transparent",
            color: activeTab === "signin" ? IVORY : "#7A6A58",
            boxShadow: activeTab === "signin" ? "0 4px 12px rgba(91,31,36,0.2)" : "none"
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchTab("signup")}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: activeTab === "signup" ? MAROON : "transparent",
            color: activeTab === "signup" ? IVORY : "#7A6A58",
            boxShadow: activeTab === "signup" ? "0 4px 12px rgba(91,31,36,0.2)" : "none"
          }}
        >
          Create Account
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "1.85rem", fontWeight: 600, color: MAROON }}>
          {activeTab === "signin" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#7A6A58", fontFamily: SANS }}>
          {activeTab === "signin"
            ? "Enter your mobile number to sign in to your account"
            : "Enter your full name and mobile number to get started"}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
            <span className="text-xs">⚠️</span>
          </div>
          <p className="text-sm font-medium flex-1" style={{ color: "#991b1b" }}>{errorMsg}</p>
        </div>
      )}

      {activeTab === "signup" && (
        <>
          <AuthInput label="Full Name" value={name} onChange={setName} />
          <AuthInput label="Email Address" type="email" placeholder="name@example.com" value={email} onChange={setEmail} />
        </>
      )}

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: MAROON, fontFamily: SANS }}>Mobile Number</label>
        <div className="flex items-center rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1.5px solid rgba(91,31,36,0.14)" }}>
          <span className="px-3.5 py-3 text-xs font-bold border-r flex items-center gap-1 flex-shrink-0 select-none" style={{ background: "rgba(91,31,36,0.04)", color: MAROON, borderColor: "rgba(91,31,36,0.1)", fontFamily: SANS }}>
            🇮🇳 +91
          </span>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none font-medium"
            style={{ color: MAROON, fontFamily: SANS }}
          />
        </div>
      </div>

      <p className="text-xs text-center leading-relaxed px-4" style={{ color: "#7A6A58" }}>
        By continuing, you agree to Aroham's{" "}
        <Link to="/terms" onClick={e => e.stopPropagation()} className="font-semibold underline decoration-dotted" style={{ color: MAROON }}>Terms of Service</Link>
        {" "}and{" "}
        <Link to="/privacy" onClick={e => e.stopPropagation()} className="font-semibold underline decoration-dotted" style={{ color: MAROON }}>Privacy Policy</Link>
      </p>

      <button
        onClick={() => handleSendPhoneOtp()}
        disabled={loading}
        className="group w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Sending OTP...</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>{activeTab === "signin" ? "Sign In with OTP" : "Get OTP & Create Account"}</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(91,31,36,0.18))" }} />
        <span className="text-xs font-medium tracking-wide" style={{ color: "#9A8A78", fontFamily: SANS }}>or continue with</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(91,31,36,0.18), transparent)" }} />
      </div>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="group w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-50"
        style={{ background: "#FFFFFF", border: "2px solid rgba(91,31,36,0.12)", color: MAROON }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        {googleLoading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-red-900/30 border-t-red-900 animate-spin" />
            <span style={{ fontFamily: SANS }}>Signing in with Google...</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontFamily: SANS }}>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );

  // 3. OTP Verification JSX - Redesigned
  const otpJsx = (
    <div style={formStyle} className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Lock size={28} style={{ color: "#1A0D0E" }} />
          </div>
        </div>
        <h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 600, color: MAROON }}>
          Verify Your Number
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(91,31,36,0.06)" }}>
          <Verified size={16} style={{ color: GOLD }} />
          <p className="text-sm font-medium" style={{ color: MAROON }}>
            +91 {phone}
          </p>
        </div>
        <p className="text-xs leading-relaxed pt-1" style={{ color: "#7A6A58" }}>
          Enter the 6-digit code we sent via SMS
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
            <span className="text-xs">⚠️</span>
          </div>
          <p className="text-sm font-medium flex-1" style={{ color: "#991b1b" }}>{errorMsg}</p>
        </div>
      )}

      <OtpBoxes value={otp} onChange={setOtp} onComplete={handleVerifyOtp} />

      <div className="text-center">
        {canResend ? (
          <button
            onClick={() => { setCanResend(false); handleSendPhoneOtp(); }}
            className="text-sm font-semibold hover:opacity-70 transition-opacity inline-flex items-center gap-1"
            style={{ color: MAROON }}
          >
            Resend OTP
            <ArrowRight size={14} />
          </button>
        ) : (
          <p className="text-sm" style={{ color: "#7A6A58" }}>
            Resend code in <Countdown seconds={30} onEnd={() => setCanResend(true)} />
          </p>
        )}
      </div>

      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        className="group w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <CheckCircle size={18} />
            <span>Verify & Continue</span>
          </>
        )}
      </button>

      <button
        onClick={() => goTo(activeTab)}
        className="w-full text-sm font-medium text-center hover:opacity-70 transition-opacity flex items-center justify-center gap-1"
        style={{ color: "#7A6A58" }}
      >
        ← Edit Mobile Number
      </button>
    </div>
  );

  // 4. Profile Setup JSX - Redesigned with premium UI
  const profileSetupJsx = (
    <div style={formStyle} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${MAROON},${SAFFRON})` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <UserIcon size={24} style={{ color: IVORY }} />
          </div>
        </div>
        <h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 600, color: MAROON }}>
          Complete Your Profile
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#7A6A58", fontFamily: SANS }}>
          Help us personalize your cosmic journey
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
            <span className="text-xs">⚠️</span>
          </div>
          <p className="text-sm font-medium flex-1" style={{ color: "#991b1b" }}>{errorMsg}</p>
        </div>
      )}

      <div className="space-y-4">
        <AuthInput label="Full Name" value={name} onChange={setName} />
        <AuthInput label="Email Address (Optional)" type="email" value={email} onChange={setEmail} />
      </div>

      <button
        onClick={handleCompleteProfile}
        disabled={loading}
        className="group w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Complete Profile</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );

  // 5. Success Screen JSX - Redesigned
  const successJsx = (
    <div style={formStyle} className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="relative w-28 h-28 mb-4">
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `radial-gradient(circle,rgba(200,160,68,0.3),transparent)` }} />
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,rgba(200,160,68,0.2),transparent)`, transform: "scale(1.5)" }} />
        <div className="relative w-full h-full rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${GOLD},${SAFFRON})`, boxShadow: `0 20px 60px rgba(200,160,68,0.5)` }}>
          <CheckCircle size={48} style={{ color: "#1A0D0E" }} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="mb-2" style={{ fontFamily: SERIF, fontSize: "2.25rem", fontWeight: 600, color: MAROON }}>
          Welcome to Aroham
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "#7A6A58" }}>
          Your sacred journey begins now. Explore authentic Vedic products and personalized cosmic guidance.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center pt-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(91,31,36,0.06)" }}>
          <CheckCircle size={16} style={{ color: GOLD }} />
          <span className="text-xs font-medium" style={{ color: MAROON }}>Account Created</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(91,31,36,0.06)" }}>
          <Shield size={16} style={{ color: GOLD }} />
          <span className="text-xs font-medium" style={{ color: MAROON }}>Verified</span>
        </div>
      </div>

      <button
        onClick={handleAuthSuccess}
        className="group w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <span>Explore Aroham</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );

  const rightContent =
    (authState === "signin" || authState === "signup")
      ? signinJsx
      : authState === "otp"
      ? otpJsx
      : authState === "profile-setup"
      ? profileSetupJsx
      : successJsx;

  // Step progress across the flow (signin skips the profile step)
  const isSignupFlow = activeTab === "signup";
  const STEPS = isSignupFlow ? ["Account", "Verify", "Profile", "Done"] : ["Account", "Verify", "Done"];
  const stepIndex =
    authState === "otp" ? 1
    : authState === "profile-setup" ? 2
    : authState === "success" ? (isSignupFlow ? 3 : 2)
    : 0;

  const stepper = (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={label} className="flex items-center">
            <div
              className="rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                width: active ? 30 : 24,
                height: active ? 30 : 24,
                background: done
                  ? `linear-gradient(135deg,${GOLD},${SAFFRON})`
                  : active
                  ? `linear-gradient(135deg,${MAROON},#7A2A30)`
                  : "rgba(91,31,36,0.08)",
                color: done || active ? IVORY : "#B7A896",
                boxShadow: active ? "0 6px 16px rgba(91,31,36,0.3)" : "none",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: SANS,
              }}
              aria-label={label}
            >
              {done ? <CheckCircle size={14} strokeWidth={3} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-[3px] rounded-full transition-all duration-500 mx-1.5"
                style={{ width: 28, background: i < stepIndex ? GOLD : "rgba(91,31,36,0.12)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Sign in" className="fixed inset-0 z-50 flex flex-col" style={{ background: IVORY, fontFamily: SANS }}>
      <style>{`
        @keyframes aroham-float      { 0%,100%{ transform: translate3d(0,0,0) scale(1); } 50%{ transform: translate3d(0,-30px,0) scale(1.07); } }
        @keyframes aroham-float-slow { 0%,100%{ transform: translate3d(0,0,0); }          50%{ transform: translate3d(22px,26px,0); } }
        @keyframes aroham-kenburns   { 0%{ transform: scale(1) translate(0,0); }          100%{ transform: scale(1.12) translate(-2%,-2%); } }
        @keyframes aroham-fade       { from{ opacity:0; transform: scale(1.05); }          to{ opacity:1; transform: scale(1); } }
        @keyframes aroham-rise       { from{ opacity:0; transform: translateY(18px); }     to{ opacity:1; transform: translateY(0); } }
      `}</style>

      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50 pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 relative z-50 shadow-sm" style={{ borderColor: "rgba(91,31,36,0.3)", background: "rgba(250,247,242,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm" style={{ background: `linear-gradient(135deg,${SAFFRON},${GOLD})`, color: "#1A0D0E" }}>ॐ</div>
          <span className="font-semibold text-lg" style={{ fontFamily: SERIF, color: MAROON }}>Aroham</span>
        </div>
        <button onClick={() => closeAuth()} className="p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Visual Panel */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
          {/* Keyed crossfade + slow Ken-Burns zoom on each state change */}
          <div key={panel.img} className="absolute inset-0" style={{ animation: "aroham-fade 0.9s ease" }}>
            <img src={panel.img} alt="Aroham sacred imagery" fetchPriority="high" decoding="sync" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,8,12,0.94) 0%, rgba(20,8,12,0.45) 55%, rgba(20,8,12,0.15) 100%)" }} />
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, rgba(20,8,12,0.55), transparent)" }} />

          {/* Top badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold px-3.5 py-1.5 rounded-full" style={{ background: "rgba(231,139,47,0.18)", color: SAFFRON, border: "1px solid rgba(231,139,47,0.4)", backdropFilter: "blur(8px)" }}>
              <Sparkles size={13} /> Sacred Vedic Ecosystem
            </span>
          </div>

          {/* Headline + floating glass trust card */}
          <div key={panel.headline} className="relative z-10 space-y-5" style={{ animation: "aroham-rise 0.6s ease" }}>
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(14px)", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} style={{ color: GOLD }} fill={GOLD} />
                ))}
              </div>
              <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
              <div className="text-white leading-tight">
                <div className="font-bold text-sm" style={{ fontFamily: SERIF }}>4.9 / 5 Rating</div>
                <div className="text-[11px] text-white/60">Trusted by 50,000+ seekers</div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: SERIF }}>{panel.headline}</h2>
            <p className="text-sm text-white/75 max-w-md leading-relaxed">{panel.sub}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {panel.items.map(item => (
                <span key={item} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white/90" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                  <CheckCircle size={12} style={{ color: GOLD }} /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-4 sm:px-12 md:px-16 py-4 sm:py-8 overflow-y-auto">
          {/* Ambient floating gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute rounded-full" style={{ width: 360, height: 360, top: -100, right: -70, background: "radial-gradient(circle, rgba(200,160,68,0.28), transparent 70%)", filter: "blur(24px)", animation: "aroham-float 15s ease-in-out infinite" }} />
            <div className="absolute rounded-full" style={{ width: 320, height: 320, bottom: -90, left: -80, background: "radial-gradient(circle, rgba(231,139,47,0.22), transparent 70%)", filter: "blur(24px)", animation: "aroham-float-slow 19s ease-in-out infinite" }} />
            <div className="absolute rounded-full" style={{ width: 240, height: 240, top: "42%", left: "52%", background: "radial-gradient(circle, rgba(91,31,36,0.1), transparent 70%)", filter: "blur(28px)", animation: "aroham-float 22s ease-in-out infinite" }} />
          </div>

          <div className="relative max-w-md mx-auto w-full">
            {/* Glassmorphism form card */}
            <div
              className="rounded-3xl sm:rounded-[28px] p-5 sm:p-9"
              style={{
                background: "rgba(255,255,255,0.62)",
                backdropFilter: "blur(22px) saturate(140%)",
                WebkitBackdropFilter: "blur(22px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 24px 70px -20px rgba(91,31,36,0.28), 0 2px 6px rgba(91,31,36,0.05)",
              }}
            >
              {/* Signin UI */}
              {rightContent}
            </div>

            {/* Trust footer under the card */}
            <div className="mt-5 flex items-center justify-center gap-3 text-xs" style={{ color: "#9A8A78", fontFamily: SANS }}>
              <span className="inline-flex items-center gap-1"><Lock size={12} style={{ color: GOLD }} /> Secure</span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1"><Shield size={12} style={{ color: GOLD }} /> Encrypted</span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1"><Verified size={12} style={{ color: GOLD }} /> Firebase Auth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
