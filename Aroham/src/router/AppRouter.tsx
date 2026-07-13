import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { AuthPage } from "@/components/auth/AuthPage";
import { HomePage } from "@/pages/HomePage";
import { ShopPage } from "@/pages/ShopPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ShippingPage } from "@/pages/ShippingPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { ConsultPage } from "@/pages/ConsultPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AstrologerDashboard } from "@/pages/AstrologerDashboard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function MainLayout() {
  const { showCart } = useCart();
  const { showAuth } = useAuth();
  return (
    <>
      <ScrollToTop />
      <Nav />
      {showCart && <CartSidebar />}
      {showAuth && <AuthPage />}
      <Outlet />
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />
          <Route path="/consult" element={<ConsultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/checkout/shipping" element={<ShippingPage />} />
        <Route path="/checkout/payment" element={<PaymentPage />} />
        <Route path="/checkout/confirm" element={<ConfirmationPage />} />
        <Route path="/astrologer" element={<AstrologerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
