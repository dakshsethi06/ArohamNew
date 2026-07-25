import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, BackHandler } from 'react-native';
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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Root ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#5B1F24', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🕉️</Text>
          <Text style={{ color: '#C8A044', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
            Aroham Sacred App
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
            {this.state.error?.message || "Something went wrong. Tap to reload."}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#C8A044', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#5B1F24', fontSize: 13, fontWeight: '800' }}>RETRY AGAIN</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainAppShell() {
  const { user } = useAuth();
  const { cart, addToCart, cartTotal, clearCart } = useCart();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<ArohamProduct | null>(null);
  const [selectedAstro, setSelectedAstro] = useState<Astrologer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [flow, setFlow] = useState<'normal' | 'productDetail' | 'chatRoom' | 'checkoutShipping' | 'checkoutPayment' | 'checkoutConfirm' | 'trackOrder' | 'policies'>('normal');
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Hardware Back Button Interceptor for Android / mobile devices
  useEffect(() => {
    const backAction = () => {
      if (cartVisible) {
        setCartVisible(false);
        return true;
      }
      if (flow !== 'normal') {
        if (flow === 'checkoutPayment') {
          setFlow('checkoutShipping');
        } else {
          setFlow('normal');
        }
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [flow, activeTab, cartVisible]);

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

  const handleSearchHeader = (query: string) => {
    setSearchQuery(query);
    setActiveTab('shop');
    setFlow('normal');
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
          onNext={(orderId) => { setPlacedOrderId(orderId); setFlow('checkoutConfirm'); }}
          onBack={() => setFlow('checkoutShipping')}
        />
      );
    }

    if (flow === 'checkoutConfirm') {
      return (
        <CheckoutConfirmScreen
          orderId={placedOrderId}
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
        return (
          <ShopScreen
            onProductPress={handleProductPress}
            onAddToCart={(p) => { addToCart(p, 1); setCartVisible(true); }}
            searchQuery={searchQuery}
          />
        );
      case 'profile':
        return (
          <ProfileScreens
            onTrackOrder={() => setFlow('trackOrder')}
            onPolicies={() => setFlow('policies')}
            onWishlistPress={() => { setActiveTab('shop'); setFlow('normal'); }}
          />
        );
      default:
        return <HomeScreen setTab={setActiveTab} onProductPress={handleProductPress} />;
    }
  };

  const showHeader = flow === 'normal';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Shared Header (only on root tabs) */}
      {showHeader && (
        <Header
          onSearchPress={handleSearchHeader}
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
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainAppShell />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
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
