import React from 'react';
import { CartProvider as BaseCartProvider, useCart as useBaseCart, AppliedCoupon } from '@logic/context/CartContext';
import { ArohamProduct } from '@logic/types/product';
import { CartItem } from '@logic/types/cart';

interface CustomCartContextType {
  items: CartItem[];
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  total: number;
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  showCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: ArohamProduct, qty?: number, openSidebar?: boolean) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, deltaOrQty: number) => void;
  clearCart: () => void;
  toast: string | null;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseCartProvider>{children}</BaseCartProvider>;
};

export const useCart = (): CustomCartContextType => {
  const base = useBaseCart();

  const updateQty = (id: number, deltaOrQty: number) => {
    const existing = base.items.find(i => i.product.id === id);
    if (!existing) return;
    let delta = deltaOrQty;
    if (deltaOrQty > 0 && deltaOrQty !== 1 && deltaOrQty !== -1) {
      delta = deltaOrQty - existing.qty;
    }
    if (delta === 0) return;
    base.updateQty(id, delta);
  };

  return {
    ...base,
    cart: base.items,
    cartTotal: base.total,
    updateQty,
  };
};
