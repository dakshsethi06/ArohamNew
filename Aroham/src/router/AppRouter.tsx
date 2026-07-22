import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate, useNavigationType } from "react-router";
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
import { ShippingPolicyPage } from "@/pages/ShippingPolicyPage";
import { ReturnPolicyPage } from "@/pages/ReturnPolicyPage";
import { FAQPage } from "@/pages/FAQPage";
import { ContactUsPage } from "@/pages/ContactUsPage";
import { TrackOrderPage } from "@/pages/TrackOrderPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { WishlistPage } from "@/pages/WishlistPage";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  // Enable native browser scroll restoration for smooth gesture navigation on mobile
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }
  }, []);

  // Reset scroll on forward navigation only
  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, navType]);

  return null;
}

function MainLayout() {
  const { showCart } = useCart();
  const { showAuth } = useAuth();
  return (
    <>
      <Nav />
      {showCart && <CartSidebar />}
      {showAuth && <AuthPage />}
      <Outlet />
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function ProtectedRoute() {
  const { isLoggedIn, openAuth } = useAuth();

  if (!isLoggedIn) {
    // If not logged in, immediately redirect to home and pop open the auth modal
    setTimeout(() => openAuth(), 0);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/consult" element={<ConsultPage />} />
          <Route path="/shipping" element={<ShippingPolicyPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          
          <Route path="/checkout/shipping" element={<ShippingPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/checkout/confirm" element={<ConfirmationPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        
        <Route path="/astrologer" element={<AstrologerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
