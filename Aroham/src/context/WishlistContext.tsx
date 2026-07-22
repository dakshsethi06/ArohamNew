import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ArohamProduct } from "@/types/product";

interface WishlistContextValue {
  wishlist: ArohamProduct[];
  addToWishlist: (product: ArohamProduct) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: ArohamProduct) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<ArohamProduct[]>(() => {
    try {
      const saved = localStorage.getItem("aroham_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("aroham_wishlist", JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

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
