import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartDrawerContextValue {
  visible: boolean;
  open: () => void;
  close: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

// Cart stays a Modal overlay (not a stack route) so CartDrawer.tsx is untouched —
// this just lifts its visibility into context so screens nested inside the tab/stack
// navigators can open it, the same way `cartVisible` in the old root component did.
export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ visible, open: () => setVisible(true), close: () => setVisible(false) }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error('useCartDrawer must be used within CartDrawerProvider');
  return ctx;
}
