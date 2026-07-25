import { CartProvider } from "@logic/context/CartContext";
import { AuthProvider } from "@logic/context/AuthContext";
import { WishlistProvider } from "@logic/context/WishlistContext";
import { AppRouter } from "@visual/router/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRouter />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
