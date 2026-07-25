import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { CartProvider, useCart } from './src/context/CartContext';
import { WishlistProvider, useWishlist } from './src/context/WishlistContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ConsultScreen } from './src/screens/ConsultScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ChatRoomScreen } from './src/screens/ChatRoomScreen';
import { CheckoutShippingScreen, CheckoutPaymentScreen, CheckoutConfirmScreen } from './src/screens/CheckoutScreens';
import { ProfileScreens, TrackOrderScreen, PoliciesScreen } from './src/screens/ProfileScreens';
import { AstrologerPortal } from './src/screens/AstrologerPortal';
import { Header } from './src/components/Header';
import { CartDrawer } from './src/components/CartDrawer';
import { MAROON, GOLD } from './src/constants/theme';
import { ActiveTab, ArohamProduct, Astrologer, Address } from './src/types';

function MainAppShell() {
  const { user } = useAuth();
  const { cart, addToCart, cartTotal, clearCart } = useCart();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<ArohamProduct | null>(null);
  const [selectedAstro, setSelectedAstro] = useState<Astrologer | null>(null);
  
  const [flow, setFlow] = useState<'normal' | 'productDetail' | 'chatRoom' | 'checkoutShipping' | 'checkoutPayment' | 'checkoutConfirm' | 'trackOrder' | 'policies'>('normal');
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [cartVisible, setCartVisible] = useState(false);

  // Navigation handlers
  const handleProductPress = (p: ArohamProduct) => {
    setSelectedProduct(p);
    setFlow('productDetail');
  };

  const handleAstroPress = (a: Astrologer) => {
    setSelectedAstro(a);
    setFlow('chatRoom');
  };

  const handleBuyNow = (p: ArohamProduct) => {
    addToCart(p, 1);
    setFlow('checkoutShipping');
  };

  // Render Screens based on active tabs & stack navigation flows
  const renderContent = () => {
    if (user?.role === 'astrologer') {
      return <AstrologerPortal />;
    }

    if (flow === 'productDetail' && selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onBack={() => setFlow('normal')}
          onAddToCart={(p) => { addToCart(p, 1); setCartVisible(true); }}
          onBuyNow={handleBuyNow}
        />
      );
    }

    if (flow === 'chatRoom' && selectedAstro) {
      return (
        <ChatRoomScreen
          astrologer={selectedAstro}
          onBack={() => setFlow('normal')}
          onProductPress={handleProductPress}
        />
      );
    }

    if (flow === 'checkoutShipping') {
      return (
        <CheckoutShippingScreen
          onNext={(addr) => { setShippingAddress(addr); setFlow('checkoutPayment'); }}
          onBack={() => setFlow('normal')}
        />
      );
    }

    if (flow === 'checkoutPayment' && shippingAddress) {
      return (
        <CheckoutPaymentScreen
          cart={cart}
          cartTotal={cartTotal}
          address={shippingAddress}
          onNext={() => setFlow('checkoutConfirm')}
          onBack={() => setFlow('checkoutShipping')}
        />
      );
    }

    if (flow === 'checkoutConfirm') {
      return (
        <CheckoutConfirmScreen
          onHomePress={() => { clearCart(); setFlow('normal'); setActiveTab('home'); }}
        />
      );
    }

    if (flow === 'trackOrder') {
      return <TrackOrderScreen onBack={() => setFlow('normal')} />;
    }

    if (flow === 'policies') {
      return <PoliciesScreen onBack={() => setFlow('normal')} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen setTab={setActiveTab} onProductPress={handleProductPress} />;
      case 'consult':
        return <ConsultScreen onAstrologerPress={handleAstroPress} onHistoryPress={() => {}} />;
      case 'shop':
        return <ShopScreen onProductPress={handleProductPress} onAddToCart={(p) => { addToCart(p, 1); setCartVisible(true); }} />;
      case 'profile':
        return (
          <ProfileScreens
            onTrackOrder={() => setFlow('trackOrder')}
            onPolicies={() => setFlow('policies')}
          />
        );
      default:
        return <HomeScreen setTab={setActiveTab} onProductPress={handleProductPress} />;
    }
  };

  const showHeader = flow === 'normal';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B1F24" />

      {/* Shared Header (only on root tabs) */}
      {showHeader && (
        <Header
          onCartPress={() => setCartVisible(true)}
          onWishlistPress={() => setActiveTab('profile')}
          onMenuPress={() => setActiveTab('profile')}
        />
      )}

      {/* Dynamic Body content */}
      <View style={styles.body}>
        {renderContent()}
      </View>

      {/* Cart bottom sheet modal overlay */}
      <CartDrawer
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        onCheckout={() => {
          setCartVisible(false);
          setFlow('checkoutShipping');
        }}
      />

      {/* Custom Bottom Navigation Bar */}
      {flow === 'normal' && user?.role !== 'astrologer' && (
        <View style={styles.tabBar}>
          {(['home', 'consult', 'shop', 'profile'] as ActiveTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const emoji = tab === 'home' ? '🏠' : tab === 'consult' ? '🔮' : tab === 'shop' ? '🛍️' : '👤';
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => { setActiveTab(tab); setFlow('normal'); }}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{emoji}</Text>
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.toUpperCase()}
                </Text>
                {isActive && <View style={styles.indicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainAppShell />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 160, 68, 0.12)',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#5B1F24',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9a8c7a',
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: MAROON,
  },
  indicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: MAROON,
  },
});
