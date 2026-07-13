import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { ArohamProduct } from "@/types/product";
import { CartItem } from "@/types/cart";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  total: number;
  showCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: ArohamProduct, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { isLoggedIn } = useAuth();

  // Track previous login state to detect logout
  const prevIsLoggedIn = useRef<boolean | null>(null);

  // Load from LocalStorage or Backend
  useEffect(() => {
    const justLoggedOut = prevIsLoggedIn.current === true && !isLoggedIn;
    prevIsLoggedIn.current = isLoggedIn;

    if (isLoggedIn) {
      api("/cart").then(data => {
        // Assume backend returns array of cart items mapping to our structure
        if (Array.isArray(data)) {
          setItems(data.map((item: any) => {
            const p = item.product || item;
            return {
              product: {
                id: p.id || p.product_id || item.product_id || item.id,
                name: p.name || "Product",
                price: p.price || 0,
                slug: p.slug || "",
                subtitle: p.subtitle || "",
                category: p.category || "",
                purpose: p.purpose || "",
                original: p.original || p.original_price || p.price || 0,
                rating: p.rating || 5,
                reviews: p.reviews || 0,
                img: p.img || "",
                badges: p.badges || [],
                shortDesc: p.shortDesc || p.short_desc || "",
                benefits: p.benefits || [],
                size: p.size || "",
                material: p.material || "",
                useFor: p.useFor || p.use_for || []
              },
              qty: item.qty || item.quantity || 1
            };
          }));
        }
      }).catch(e => console.error("Error fetching cart:", e));
    } else if (justLoggedOut) {
      // User just logged out — clear cart and localStorage
      setItems([]);
      localStorage.removeItem("aroham_cart");
      localStorage.removeItem("aroham_buy_now_intent");
    } else {
      // Guest session — load from localStorage
      const local = localStorage.getItem("aroham_cart");
      if (local) {
        try { setItems(JSON.parse(local)); } catch (e) { }
      }
    }
  }, [isLoggedIn]);

  // Save to LocalStorage if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("aroham_cart", JSON.stringify(items));
    }
  }, [items, isLoggedIn]);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = subtotal + 99 + Math.round(subtotal * 0.05);

  const addToCart = async (product: ArohamProduct, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    setShowCart(true);

    if (isLoggedIn) {
      await api("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, qty })
      }).catch(e => console.error("Error adding to cart", e));
    }
  };

  const removeFromCart = async (id: number) => {
    setItems(prev => prev.filter(i => i.product.id !== id));
    if (isLoggedIn) {
      await api(`/cart/${id}`, { method: "DELETE" }).catch(e => console.error("Error removing from cart", e));
    }
  };

  const updateQty = async (id: number, delta: number) => {
    let newQty = 1;
    setItems(prev => prev.map(i => {
      if (i.product.id === id) {
        newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
    
    if (isLoggedIn) {
      // Backend likely supports PUT /cart/:id or we just POST with relative quantity/overwrite
      // Assuming PUT updates the exact quantity
      await api(`/cart/${id}`, {
        method: "PUT",
        body: JSON.stringify({ qty: newQty })
      }).catch(e => console.error("Error updating cart", e));
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (isLoggedIn) {
      await api("/cart", { method: "DELETE" }).catch(e => console.error("Error clearing cart", e));
    } else {
      localStorage.removeItem("aroham_cart");
    }
  };

  return (
    <CartContext.Provider value={{
      items, cartCount, subtotal, total,
      showCart, openCart: () => setShowCart(true), closeCart: () => setShowCart(false),
      addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
