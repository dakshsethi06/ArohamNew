import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MAROON, GOLD } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useCartDrawer } from './CartDrawerContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { HomeScreen } from '../screens/HomeScreen';
import { ConsultScreen } from '../screens/ConsultScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProfileScreens } from '../screens/ProfileScreens';
import { TabParamList, TabScreenProps } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Header is shown above every root tab, same as the original `showHeader = flow === 'normal'`
// (screens pushed on top of the root stack — product detail, chat, checkout, etc. — don't get one).
function TabHeader({ navigation }: { navigation: TabScreenProps<keyof TabParamList>['navigation'] }) {
  return (
    <Header
      onWishlistPress={() => navigation.navigate('Wishlist')}
      onMenuPress={() => navigation.navigate('Profile')}
    />
  );
}

function HomeTab({ navigation }: TabScreenProps<'Home'>) {
  const { addToCart } = useCart();
  const cartDrawer = useCartDrawer();
  return (
    <>
      <TabHeader navigation={navigation} />
      <HomeScreen
        setTab={(tab, collection) => {
          if (tab === 'shop') navigation.navigate('Shop', collection ? { collection } : undefined);
          else if (tab === 'consult') navigation.navigate('Consult');
          else if (tab === 'profile') navigation.navigate('Profile');
        }}
        onProductPress={(product) => navigation.navigate('ProductDetail', { product })}
        onAddToCart={(p) => { if (addToCart(p, 1)) cartDrawer.open(); }}
      />
    </>
  );
}

function ConsultTab({ navigation }: TabScreenProps<'Consult'>) {
  return (
    <>
      <TabHeader navigation={navigation} />
      <ConsultScreen
        onAstrologerPress={(astrologer) => navigation.navigate('ChatRoom', { astrologer })}
        onHistoryPress={() => navigation.navigate('ChatHistory')}
      />
    </>
  );
}

function ShopTab({ navigation, route }: TabScreenProps<'Shop'>) {
  const { addToCart } = useCart();
  const cartDrawer = useCartDrawer();
  return (
    <>
      <TabHeader navigation={navigation} />
      {/* Remounts on each new search/collection so ShopScreen's initial-state values pick it
          up, matching the original behavior of switching to the Shop tab always applying it. */}
      <ShopScreen
        key={`${route.params?.searchQuery ?? ''}__${route.params?.collection ?? ''}`}
        onProductPress={(product) => navigation.navigate('ProductDetail', { product })}
        onAddToCart={(p) => { if (addToCart(p, 1)) cartDrawer.open(); }}
        searchQuery={route.params?.searchQuery ?? ''}
        collection={route.params?.collection ?? ''}
      />
    </>
  );
}

function ProfileTab({ navigation }: TabScreenProps<'Profile'>) {
  return (
    <>
      <TabHeader navigation={navigation} />
      <ProfileScreens
        onTrackOrder={() => navigation.navigate('TrackOrder')}
        onPolicies={() => navigation.navigate('Policies')}
        onWishlistPress={() => navigation.navigate('Wishlist')}
        onOrders={() => navigation.navigate('Orders')}
        onEditProfile={() => navigation.navigate('EditProfile')}
        onAddresses={() => navigation.navigate('Addresses')}
      />
    </>
  );
}

const TAB_META: Record<keyof TabParamList, { emoji: string; label: string }> = {
  Home: { emoji: '🏠', label: 'HOME' },
  Consult: { emoji: '🔮', label: 'CONSULT' },
  Shop: { emoji: '🛍️', label: 'SHOP' },
  Profile: { emoji: '👤', label: 'PROFILE' },
};

// Custom tab bar replicating the original hand-rolled one pixel-for-pixel
// (emoji + label + gold top indicator), rather than the default RN Navigation tab bar styling.
//
// The 4th slot (the "Profile" route) is dual-purpose: logged out, it reads PROFILE and jumps
// straight to sign-in instead of navigating (profile access moves to the header icon once
// signed in). Logged in, it reads CART and opens the cart drawer — Profile is only reachable
// from the header's profile icon at that point, matching the requested swap.
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { isLoggedIn, openAuth } = useAuth();
  const cartDrawer = useCartDrawer();
  const { cartCount } = useCart();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const isLastSlot = route.name === 'Profile';
        const meta = isLastSlot
          ? (isLoggedIn ? { emoji: '🛒', label: 'CART' } : { emoji: '👤', label: 'PROFILE' })
          : TAB_META[route.name as keyof TabParamList];
        const active = isActive && !isLastSlot;

        const handlePress = () => {
          if (isLastSlot) {
            if (!isLoggedIn) { openAuth(); return; }
            cartDrawer.open();
            return;
          }
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={handlePress}
          >
            <Text style={styles.tabIcon}>{meta.emoji}</Text>
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{meta.label}</Text>
            {isLastSlot && isLoggedIn && cartCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{cartCount}</Text>
              </View>
            )}
            {active && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      // Always returns to Home on Android back, matching the original
      // `if (activeTab !== 'home') { setActiveTab('home'); return true; }` behavior.
      backBehavior="initialRoute"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Consult" component={ConsultTab} />
      <Tab.Screen name="Shop" component={ShopTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
  tabBadge: {
    position: 'absolute',
    top: 2,
    right: '28%',
    backgroundColor: MAROON,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
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
