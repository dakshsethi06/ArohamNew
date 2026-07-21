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
  login: (userData?: any) => void;
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
    // Mock Session initialization
    const mockSession = localStorage.getItem("aroham_mock_session");
    if (mockSession) {
      try {
        const parsed = JSON.parse(mockSession);
        setUser(parsed);
        setIsLoggedIn(true);
        setSession({ user: parsed });
        handleCartSync();
      } catch (e) {
        localStorage.removeItem("aroham_mock_session");
      }
    } else {
      setUser(null);
      setSession(null);
      setIsLoggedIn(false);
      setCartSynced(false);
    }
  }, []);

  const login = (userData?: any) => {
    setIsLoggedIn(true);
    if (userData) {
      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem("aroham_mock_session", JSON.stringify(userData));
      handleCartSync();
    }
  };
  
  const logout = async () => {
    try { await firebaseSignOut(firebaseAuth); } catch (e) {}
    try { await supabase.auth.signOut(); } catch (e) {}
    localStorage.removeItem("aroham_mock_session");
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
