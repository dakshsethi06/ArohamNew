import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { api } from "@/lib/api";

interface AuthContextValue {
  isLoggedIn: boolean;
  showAuth: boolean;
  user: User | null;
  session: Session | null;
  login: () => void;
  logout: () => Promise<void>;
  openAuth: () => void;
  closeAuth: (loggedIn?: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      
      if (session) {
        // Sync local cart after login
        const localCart = localStorage.getItem("aroham_cart");
        if (localCart) {
          try {
            const parsed = JSON.parse(localCart);
            for (const item of parsed) {
              await api("/cart", {
                method: "POST",
                body: JSON.stringify({ productId: item.product.id, qty: item.qty }),
              });
            }
            localStorage.removeItem("aroham_cart");
          } catch (e) {
            console.error("Failed to sync cart", e);
          }
        }
        
        // Buy Now intent check
        const intent = localStorage.getItem("aroham_buy_now_intent");
        if (intent) {
          // You can redirect to cart or trigger buy now logic
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setSession(null);
  };
  const openAuth = () => setShowAuth(true);
  const closeAuth = (loggedIn?: boolean) => {
    setShowAuth(false);
    if (loggedIn) setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, showAuth, user, session, login, logout, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
