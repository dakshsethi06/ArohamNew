import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { firebaseAuth } from "@/lib/firebase";
import { api } from "@/lib/api";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

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
  const [user, setUser] = useState<UnifiedUser | null>(() => {
    try {
      const mockSession = localStorage.getItem("aroham_mock_session") || getCookie("aroham_session");
      return mockSession ? JSON.parse(mockSession) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!(localStorage.getItem("aroham_mock_session") || getCookie("aroham_session"));
  });
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<any | null>(() => {
    try {
      const mockSession = localStorage.getItem("aroham_mock_session") || getCookie("aroham_session");
      return mockSession ? { user: JSON.parse(mockSession) } : null;
    } catch (e) {
      return null;
    }
  });
  const [cartSynced, setCartSynced] = useState(false);

  // Sync cart and orders helper
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

  const handleOrderSync = (userId: string) => {
    if (!userId) return;
    try {
      const guestOrdersStr = localStorage.getItem("aroham_guest_orders");
      if (guestOrdersStr) {
        const guestOrders = JSON.parse(guestOrdersStr);
        if (Array.isArray(guestOrders) && guestOrders.length > 0) {
          const userOrdersKey = `aroham_user_orders_${userId}`;
          const existingUserOrdersStr = localStorage.getItem(userOrdersKey);
          const existingUserOrders = existingUserOrdersStr ? JSON.parse(existingUserOrdersStr) : [];
          const merged = [...existingUserOrders];

          guestOrders.forEach((go: any) => {
            if (!merged.some((u: any) => String(u.id) === String(go.id))) {
              const updatedGo = { ...go, user_id: userId };
              merged.push(updatedGo);
              if (go.id) {
                Promise.resolve(
                  supabase.from("orders").update({ user_id: userId }).eq("id", go.id)
                ).catch(() => {});
              }
            }
          });
          localStorage.setItem(userOrdersKey, JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.error("Failed to migrate guest orders", e);
    }
  };

  const handleUserSupabaseSync = (userData: any) => {
    if (!userData?.id) return;
    const fullName = userData.user_metadata?.full_name || userData.fullName || userData.name || null;
    const phone = userData.user_metadata?.phone || userData.phone || null;
    const email = userData.email || null;

    if (fullName || phone || email) {
      Promise.resolve(
        supabase.from("users").upsert({
          id: userData.id,
          full_name: fullName,
          phone: phone,
          email: email
        })
      ).catch(err => console.warn("Supabase user sync error:", err));
    }
  };

  useEffect(() => {
    const rawSession = localStorage.getItem("aroham_mock_session") || getCookie("aroham_session");
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        setUser(parsed);
        setIsLoggedIn(true);
        setSession({ user: parsed });
        // Sync cookie & local storage
        localStorage.setItem("aroham_mock_session", JSON.stringify(parsed));
        setCookie("aroham_session", JSON.stringify(parsed), 365);

        handleCartSync();
        if (parsed?.id) {
          handleOrderSync(parsed.id);
          handleUserSupabaseSync(parsed);
        }
      } catch (e) {
        localStorage.removeItem("aroham_mock_session");
        deleteCookie("aroham_session");
      }
    }
  }, []);

  const login = (userData?: any) => {
    setIsLoggedIn(true);
    if (userData) {
      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem("aroham_mock_session", JSON.stringify(userData));
      setCookie("aroham_session", JSON.stringify(userData), 365);

      handleCartSync();
      if (userData?.id) {
        handleOrderSync(userData.id);
        handleUserSupabaseSync(userData);
      }
    }
  };
  
  const logout = async () => {
    try { await firebaseAuth.signOut(); } catch (e) {}
    try { await supabase.auth.signOut(); } catch (e) {}
    localStorage.removeItem("aroham_mock_session");
    deleteCookie("aroham_session");
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
