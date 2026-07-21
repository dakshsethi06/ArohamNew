import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { ArohamProduct } from "@/types/product";
import { CartItem } from "@/types/cart";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

export interface AppliedCoupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  label: string;
}

export const VALID_COUPONS: Record<string, { type: "percent" | "flat"; value: number; label: string }> = {
  AROHAM10: { type: "percent", value: 10, label: "10% OFF sacred items" },
  SACRED15: { type: "percent", value: 15, label: "15% OFF sacred items" },
  FIRST100: { type: "flat", value: 100, label: "₹100 Instant Discount" },
  DIVINE20: { type: "percent", value: 20, label: "20% OFF divine discount" },
};

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  showCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: ArohamProduct, qty?: number, openSidebar?: boolean) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  toast: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (productName: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(productName);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  const [showCart, setShowCart] = useState(false);
  const { isLoggedIn, cartSynced } = useAuth();

  // Track previous login state to detect logout
  const prevIsLoggedIn = useRef<boolean | null>(null);
  const isLoggingOut = useRef(false);

  // Load from LocalStorage or Backend
  useEffect(() => {
    const justLoggedOut = prevIsLoggedIn.current === true && !isLoggedIn;
    if (justLoggedOut) isLoggingOut.current = true;
    prevIsLoggedIn.current = isLoggedIn;

    if (justLoggedOut) {
      // User just logged out — clear cart and localStorage
      setItems([]);
      localStorage.removeItem("aroham_cart");
      localStorage.removeItem("aroham_buy_now_intent");
      setTimeout(() => { isLoggingOut.current = false; }, 100);
    } else {
      // Load from localStorage for all users (guests and logged in)
      const local = localStorage.getItem("aroham_cart");
      if (local) {
        try { setItems(JSON.parse(local)); } catch (e) { }
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggingOut.current) {
      localStorage.setItem("aroham_cart", JSON.stringify(items));
    }
  }, [items]);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = sessionStorage.getItem("aroham_applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === "percent") {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const gst = Math.round(taxableAmount * 0.05);
  const total = taxableAmount + gst;

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = VALID_COUPONS[cleanCode];
    if (!found) {
      return { success: false, message: "Invalid coupon code. Try AROHAM10 or FIRST100" };
    }
    const coupon: AppliedCoupon = {
      code: cleanCode,
      type: found.type,
      value: found.value,
      label: found.label
    };
    setAppliedCoupon(coupon);
    sessionStorage.setItem("aroham_applied_coupon", JSON.stringify(coupon));
    return { success: true, message: `Coupon ${cleanCode} applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem("aroham_applied_coupon");
  };

  const addToCart = async (product: ArohamProduct, qty: number = 1, openSidebar: boolean = false) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    if (openSidebar) {
      setShowCart(true);
    } else {
      showToast(product.name);
    }

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
      items, cartCount, subtotal, discount, total,
      appliedCoupon, applyCoupon, removeCoupon,
      showCart, openCart: () => setShowCart(true), closeCart: () => setShowCart(false),
      addToCart, removeFromCart, updateQty, clearCart, toast,
    }}>
      {children}
      {/* Add-to-cart toast */}
      <div
        style={{
          position: "fixed",
          top: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${toast ? "0" : "-120%"})`,
          opacity: toast ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 16,
            background: "rgba(91,31,36,0.95)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(91,31,36,0.3), 0 2px 8px rgba(0,0,0,0.1)",
            color: "#FAF7F2",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            maxWidth: "90vw",
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {toast} added to cart
          </span>
        </div>
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
