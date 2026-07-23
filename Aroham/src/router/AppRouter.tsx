import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate, useNavigationType } from "react-router";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { AuthPage } from "@/components/auth/AuthPage";
import { ArohamLogoLoader } from "@/components/layout/ArohamLogoLoader";
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
    if (navType === "PUSH") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, navType]);

  return null;
}

function MainLayout() {
  const { showCart } = useCart();
  const { showAuth } = useAuth();
  const location = useLocation();

  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor network status for slow internet / offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Trigger smooth sacred logo transition on route change
  useEffect(() => {
    setIsRouteLoading(true);
    const timer = setTimeout(() => {
      setIsRouteLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      <Nav />
      {showCart && <CartSidebar />}
      {showAuth && <AuthPage />}
      
      {/* Slow network / Offline loader */}
      {isOffline && (
        <ArohamLogoLoader text="Connecting to Sacred Database... Please check internet connection" fullScreen={true} />
      )}

      {/* Route transition loader */}
      {isRouteLoading && !isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden pointer-events-none">
          <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse" />
        </div>
      )}

      {/* Main page content with smooth fade-in transition */}
      <main key={location.pathname + location.search} className="page-transition-enter flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function ProtectedRoute() {
  const { isLoggedIn, openAuth } = useAuth();

  if (!isLoggedIn) {
    setTimeout(() => openAuth(), 0);
    return null;
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
