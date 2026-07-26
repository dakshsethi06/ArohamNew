import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { TabNavigator } from './TabNavigator';
import { CartDrawerProvider, useCartDrawer } from './CartDrawerContext';
import { CartDrawer } from '../components/CartDrawer';
import { AuthModal } from '../components/AuthModal';
import { AstrologerPortal } from '../screens/AstrologerPortal';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { CheckoutShippingScreen, CheckoutPaymentScreen, CheckoutConfirmScreen } from '../screens/CheckoutScreens';
import { TrackOrderScreen, PoliciesScreen, OrdersScreen, EditProfileScreen, AddressesScreen } from '../screens/ProfileScreens';
import { WishlistScreen } from '../screens/WishlistScreen';
import { ChatHistoryScreen } from '../screens/ChatHistoryScreen';
import { RootStackParamList, RootStackScreenProps } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// CartDrawer renders as a sibling of Stack.Navigator, not as a screen inside it, so its
// checkout button needs a way to navigate without a `navigation` prop of its own — this is
// React Navigation's documented pattern for navigating from outside the navigator tree.
const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

function ProductDetailRoute({ route, navigation }: RootStackScreenProps<'ProductDetail'>) {
  const { addToCart } = useCart();
  const cartDrawer = useCartDrawer();
  return (
    <ProductDetailScreen
      product={route.params.product}
      onBack={() => navigation.goBack()}
      onAddToCart={(p, qty) => { if (addToCart(p, qty)) cartDrawer.open(); }}
      onBuyNow={(p, qty) => { if (addToCart(p, qty)) navigation.navigate('CheckoutShipping'); }}
    />
  );
}

function ChatRoomRoute({ route, navigation }: RootStackScreenProps<'ChatRoom'>) {
  return (
    <ChatRoomScreen
      astrologer={route.params.astrologer}
      onBack={() => navigation.goBack()}
      onProductPress={(product) => navigation.navigate('ProductDetail', { product })}
    />
  );
}

function CheckoutShippingRoute({ navigation }: RootStackScreenProps<'CheckoutShipping'>) {
  return (
    <CheckoutShippingScreen
      onNext={(address) => navigation.navigate('CheckoutPayment', { address })}
      onBack={() => navigation.goBack()}
    />
  );
}

function CheckoutPaymentRoute({ route, navigation }: RootStackScreenProps<'CheckoutPayment'>) {
  const { cart, cartTotal } = useCart();
  return (
    <CheckoutPaymentScreen
      cart={cart}
      cartTotal={cartTotal}
      address={route.params.address}
      onNext={(orderId, items, total) =>
        navigation.navigate('CheckoutConfirm', { orderId, items, total, createdAt: new Date().toISOString() })
      }
      onBack={() => navigation.goBack()}
    />
  );
}

function CheckoutConfirmRoute({ route, navigation }: RootStackScreenProps<'CheckoutConfirm'>) {
  const { clearCart } = useCart();
  return (
    <CheckoutConfirmScreen
      orderId={route.params.orderId}
      items={route.params.items}
      total={route.params.total}
      createdAt={route.params.createdAt}
      onHomePress={() => {
        clearCart();
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }}
    />
  );
}

function TrackOrderRoute({ navigation }: RootStackScreenProps<'TrackOrder'>) {
  return <TrackOrderScreen onBack={() => navigation.goBack()} />;
}

function PoliciesRoute({ navigation }: RootStackScreenProps<'Policies'>) {
  return <PoliciesScreen onBack={() => navigation.goBack()} />;
}

function WishlistRoute({ navigation }: RootStackScreenProps<'Wishlist'>) {
  return (
    <WishlistScreen
      onBack={() => navigation.goBack()}
      onProductPress={(product) => navigation.navigate('ProductDetail', { product })}
      onShopPress={() => navigation.navigate('Tabs', { screen: 'Shop' })}
    />
  );
}

function OrdersRoute({ navigation }: RootStackScreenProps<'Orders'>) {
  return <OrdersScreen onBack={() => navigation.goBack()} />;
}

function EditProfileRoute({ navigation }: RootStackScreenProps<'EditProfile'>) {
  return <EditProfileScreen onBack={() => navigation.goBack()} />;
}

function AddressesRoute({ navigation }: RootStackScreenProps<'Addresses'>) {
  return <AddressesScreen onBack={() => navigation.goBack()} />;
}

function ChatHistoryRoute({ navigation }: RootStackScreenProps<'ChatHistory'>) {
  return <ChatHistoryScreen onBack={() => navigation.goBack()} />;
}

function AppShell() {
  const { user, isLoggedIn, showAuth, openAuth, closeAuth } = useAuth();
  const cartDrawer = useCartDrawer();

  // Gate the whole app behind sign-in on cold launch — shown once per launch;
  // tapping "Skip" (closeAuth) just dismisses it for the rest of this session.
  React.useEffect(() => {
    if (!isLoggedIn) openAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.role === 'astrologer') {
    // Standalone shell, no navigator — matches the original behavior of
    // AstrologerPortal replacing the whole app outside the normal tab/stack flow.
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AstrologerPortal />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailRoute} />
        <Stack.Screen name="ChatRoom" component={ChatRoomRoute} />
        <Stack.Screen name="CheckoutShipping" component={CheckoutShippingRoute} />
        <Stack.Screen name="CheckoutPayment" component={CheckoutPaymentRoute} />
        <Stack.Screen name="CheckoutConfirm" component={CheckoutConfirmRoute} />
        <Stack.Screen name="TrackOrder" component={TrackOrderRoute} />
        <Stack.Screen name="Policies" component={PoliciesRoute} />
        <Stack.Screen name="Wishlist" component={WishlistRoute} />
        <Stack.Screen name="Orders" component={OrdersRoute} />
        <Stack.Screen name="EditProfile" component={EditProfileRoute} />
        <Stack.Screen name="Addresses" component={AddressesRoute} />
        <Stack.Screen name="ChatHistory" component={ChatHistoryRoute} />
      </Stack.Navigator>
      <CartDrawer
        visible={cartDrawer.visible}
        onClose={cartDrawer.close}
        onCheckout={() => {
          cartDrawer.close();
          // Navigates from whatever screen is currently focused, same as the
          // original root-level `setFlow('checkoutShipping')` call.
          if (rootNavigationRef.isReady()) {
            rootNavigationRef.navigate('CheckoutShipping');
          }
        }}
      />
      {/* Mounted once at the root so any screen can gate an action behind login via
          useAuth().openAuth(), instead of every screen owning its own modal instance. */}
      <AuthModal visible={showAuth} onClose={() => closeAuth()} />
    </SafeAreaView>
  );
}

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <CartDrawerProvider>
          <NavigationContainer ref={rootNavigationRef}>
            <AppShell />
          </NavigationContainer>
        </CartDrawerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
});
