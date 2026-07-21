import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { api } from "@/lib/api";

interface UnifiedUser {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

interface AuthContextValue {
  isLoggedIn: boolean;
  showAuth: boolean;
  user: UnifiedUser | null;
  session: any | null;
  cartSynced: boolean;
  login: () => void;
  logout: () => Promise<void>;
  openAuth: () => void;
  closeAuth: (loggedIn?: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [cartSynced, setCartSynced] = useState(false);

  // Sync cart helper
  const handleCartSync = async () => {
    setCartSynced(false);
    const localCart = localStorage.getItem("aroham_cart");
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const item of parsed) {
            await api("/cart", {
              method: "POST",
              body: JSON.stringify({ productId: item.product.id, qty: item.qty }),
            }).catch(() => {});
          }
        }
        localStorage.removeItem("aroham_cart");
      } catch (e) {
        console.error("Failed to sync cart", e);
      }
    }
    setCartSynced(true);
  };

  useEffect(() => {
    // 1. Firebase Auth listener
    const unsubscribeFirebase = onAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        const mappedUser: UnifiedUser = {
          id: fbUser.uid,
          email: fbUser.email,
          user_metadata: {
            full_name: fbUser.displayName || "",
            phone: fbUser.phoneNumber || ""
          }
        };
        setUser(mappedUser);
        setSession({ access_token: token, user: mappedUser });
        setIsLoggedIn(true);
        await handleCartSync();
      } else {
        // Fallback check for Supabase session if not in Firebase
        const { data: { session: supaSession } } = await supabase.auth.getSession();
        if (supaSession) {
          setSession(supaSession);
          setUser(supaSession.user ? {
            id: supaSession.user.id,
            email: supaSession.user.email,
            user_metadata: supaSession.user.user_metadata
          } : null);
          setIsLoggedIn(true);
          setCartSynced(true);
        } else {
          setUser(null);
          setSession(null);
          setIsLoggedIn(false);
          setCartSynced(false);
        }
      }
    });

    // 2. Supabase Auth listener fallback
    const { data: { subscription: supaSub } } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (!firebaseAuth.currentUser) {
        if (supaSession) {
          setSession(supaSession);
          setUser(supaSession.user ? {
            id: supaSession.user.id,
            email: supaSession.user.email,
            user_metadata: supaSession.user.user_metadata
          } : null);
          setIsLoggedIn(true);
          await handleCartSync();
        } else {
          setUser(null);
          setSession(null);
          setIsLoggedIn(false);
          setCartSynced(false);
        }
      }
    });

    return () => {
      unsubscribeFirebase();
      supaSub.unsubscribe();
    };
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = async () => {
    try { await firebaseSignOut(firebaseAuth); } catch (e) {}
    try { await supabase.auth.signOut(); } catch (e) {}
    sessionStorage.removeItem("aroham_user_profile");
    setIsLoggedIn(false);
    setUser(null);
    setSession(null);
    setCartSynced(false);
  };
  const openAuth = () => setShowAuth(true);
  const closeAuth = (loggedIn?: boolean) => {
    setShowAuth(false);
    if (loggedIn) setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, showAuth, user, session, cartSynced, login, logout, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
