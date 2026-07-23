import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { ArohamProduct } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  wishlist: ArohamProduct[];
  addToWishlist: (product: ArohamProduct) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: ArohamProduct) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [wishlist, setWishlist] = useState<ArohamProduct[]>([]);
  
  // Track previous login state to detect logout
  const prevIsLoggedIn = useRef<boolean | null>(null);
  const isLoggingOut = useRef(false);

  // Load wishlist from local storage/db based on login status
  useEffect(() => {
    const justLoggedOut = prevIsLoggedIn.current === true && !isLoggedIn;
    if (justLoggedOut) isLoggingOut.current = true;
    prevIsLoggedIn.current = isLoggedIn;

    if (justLoggedOut) {
      setWishlist([]);
      localStorage.removeItem("aroham_wishlist");
      setTimeout(() => { isLoggingOut.current = false; }, 100);
    } else if (user?.id) {
      // 1. Load user-specific local storage cache first for instant load
      const userKey = `aroham_user_wishlist_${user.id}`;
      const userCached = localStorage.getItem(userKey);
      let initialList: ArohamProduct[] = [];
      if (userCached) {
        try { initialList = JSON.parse(userCached); } catch (e) {}
      } else {
        // Fallback to guest list to carry it over on login
        const guestCached = localStorage.getItem("aroham_wishlist");
        if (guestCached) {
          try { initialList = JSON.parse(guestCached); } catch (e) {}
        }
      }
      setWishlist(initialList);

      // 2. Fetch real-time wishlist from Supabase database to sync across devices
      supabase.from("user_wishlists")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && Array.isArray(data.items)) {
            // Merge local and remote wishlists, unique by ID
            setWishlist(prev => {
              const combined = [...prev];
              data.items.forEach((item: any) => {
                if (!combined.some(p => p.id === item.id)) {
                  combined.push(item);
                }
              });
              return combined;
            });
          }
        }).catch(() => {});
    } else {
      // Load guest wishlist
      const guestCached = localStorage.getItem("aroham_wishlist");
      if (guestCached) {
        try { setWishlist(JSON.parse(guestCached)); } catch (e) {}
      }
    }
  }, [isLoggedIn, user?.id]);

  // Persist changes
  useEffect(() => {
    if (isLoggingOut.current) return;

    localStorage.setItem("aroham_wishlist", JSON.stringify(wishlist));
    if (user?.id) {
      localStorage.setItem(`aroham_user_wishlist_${user.id}`, JSON.stringify(wishlist));
      // Upsert to Supabase
      Promise.resolve(
        supabase.from("user_wishlists").upsert({
          user_id: user.id,
          items: wishlist,
          updated_at: new Date().toISOString()
        })
      ).catch(() => {});
    }
  }, [wishlist, user?.id]);

  const addToWishlist = (product: ArohamProduct) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const toggleWishlist = (product: ArohamProduct) => {
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
