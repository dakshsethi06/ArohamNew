import { CartProvider } from "@aroham/shared-state";
import { AuthProvider } from "@aroham/shared-auth";
import { WishlistProvider } from "@aroham/shared-state";
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

