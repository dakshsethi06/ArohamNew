import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { FAQ_ITEMS, trackOrder as apiTrackOrder } from '../services/api';
import { AuthModal } from '../components/AuthModal';

interface ProfileMainProps {
  onTrackOrder: () => void;
  onPolicies: () => void;
  onWishlistPress?: () => void;
}

export const ProfileScreens: React.FC<ProfileMainProps> = ({ onTrackOrder, onPolicies, onWishlistPress }) => {
  const { user, logout, isLoggedIn } = useAuth();
  const { wishlist } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const userName = user?.user_metadata?.full_name || (user as any)?.name || 'Devotee';
  const userPhone = user?.user_metadata?.phone || (user as any)?.phone || '';
  const userEmail = user?.email || '';

  if (!isLoggedIn) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>🕉️ Welcome to Aroham</Text>
          <Text style={styles.authDesc}>Join India's most trusted ecosystem for authentic Vedic solutions & remedies.</Text>

          <TouchableOpacity style={styles.loginBtn} onPress={() => setShowAuthModal(true)}>
            <Text style={styles.loginBtnText}>SIGN IN / CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <View style={styles.guestLinksRow}>
            <TouchableOpacity style={styles.guestLinkItem} onPress={onTrackOrder}>
              <Text style={styles.guestLinkIcon}>📦</Text>
              <Text style={styles.guestLinkText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestLinkItem} onPress={onPolicies}>
              <Text style={styles.guestLinkIcon}>📜</Text>
              <Text style={styles.guestLinkText}>Policies & FAQs</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{user?.role === 'astrologer' ? '🔮' : '👤'}</Text>
        </View>
        <Text style={styles.profileGreeting}>Namaste, {userName}!</Text>
        {userPhone ? <Text style={styles.profileContact}>📱 +91 {userPhone}</Text> : null}
        {userEmail ? <Text style={styles.profileContact}>✉️ {userEmail}</Text> : null}
        <Text style={styles.profileRole}>
          Account Type: {user?.role === 'astrologer' ? 'Certified Astrologer' : 'Sacred Seeker'}
        </Text>
      </View>

      {/* Profile Navigation Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Account</Text>
        
        {onWishlistPress && (
          <TouchableOpacity style={styles.menuItem} onPress={onWishlistPress}>
            <Text style={styles.menuIcon}>❤️</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>My Saved Wishlist ({wishlist.length})</Text>
              <Text style={styles.menuDesc}>View your saved sacred remedies</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={onTrackOrder}>
          <Text style={styles.menuIcon}>📦</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Track Order & Shipments</Text>
            <Text style={styles.menuDesc}>Monitor Shiprocket package shipment</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onPolicies}>
          <Text style={styles.menuIcon}>📜</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Policies & Help Center</Text>
            <Text style={styles.menuDesc}>FAQs, shipping policies, returns</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Sign Out</Text>
            <Text style={styles.menuDesc}>Logout from your account</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ── TRACK ORDER SCREEN ──────────────────────────────────────────────────
export const TrackOrderScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const handleTrack = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    const data = await apiTrackOrder(orderId.trim());
    setStatus(data);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Track Shiprocket Order</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Shiprocket / Order ID</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., ARH-81395"
            placeholderTextColor="#9a8c7a"
            value={orderId}
            onChangeText={setOrderId}
          />
          <TouchableOpacity style={styles.trackBtn} onPress={handleTrack} disabled={loading}>
            <Text style={styles.trackBtnText}>{loading ? 'FETCHING...' : 'TRACK STATUS'}</Text>
          </TouchableOpacity>
        </View>

        {status && (
          <View style={styles.statusCard}>
            <Text style={styles.statusHeading}>Shipment Status: <Text style={styles.statusHighlight}>{status.status}</Text></Text>
            <Text style={styles.statusLabel}>Courier: {status.courier}</Text>
            <Text style={styles.statusLabel}>Estimated Delivery: {status.eta}</Text>

            <Text style={styles.timelineHeader}>Tracking Updates</Text>
            {(status.updates || []).map((u: any, idx: number) => (
              <View key={idx} style={styles.timelineItem}>
                <Text style={styles.timelineTime}>{u.time}</Text>
                <Text style={styles.timelineMsg}>{u.status || u.msg}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── POLICIES & HELP SCREEN (WITH FAQ ACCORDIONS) ────────────────────────
export const PoliciesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [faqIndex, setFaqIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Policies</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.secHeading}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((faq, i) => (
          <View key={i} style={styles.faqBlock}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => setFaqIndex(faqIndex === i ? null : i)}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqArrow}>{faqIndex === i ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {faqIndex === i && (
              <View style={styles.faqAnswerBox}>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            )}
          </View>
        ))}

        <Text style={[styles.secHeading, { marginTop: 24 }]}>Policy Details</Text>
        
        <View style={styles.policyTextCard}>
          <Text style={styles.policyTitle}>7-Day Return Policy</Text>
          <Text style={styles.policyBody}>
            We stand by the authenticity of our sacred artifacts. If you wish to return your energized products, returns are accepted within 7 days of delivery. Original lab certifications must be included.
          </Text>
        </View>

        <View style={styles.policyTextCard}>
          <Text style={styles.policyTitle}>Shipping & Consecration Timeline</Text>
          <Text style={styles.policyBody}>
            Every remedy is personalized & energized based on your specific zodiac. Consecration takes 24-48 hours. Orders are then dispatched via Express Delhivery and typically arrive in 3-5 days.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
  centerScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.16)',
    alignItems: 'center',
    gap: 12,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: MAROON,
  },
  authDesc: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: MAROON,
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginBtnText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guestLinksRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  guestLinkItem: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    gap: 4,
  },
  guestLinkIcon: {
    fontSize: 20,
  },
  guestLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E3125',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    gap: 4,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: MAROON,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3E3125',
  },
  profileContact: {
    fontSize: 11,
    color: '#8B7355',
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 11,
    color: MAROON,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B7355',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  menuDesc: {
    fontSize: 10,
    color: '#8B7355',
  },
  menuArrow: {
    fontSize: 18,
    color: '#C8A044',
  },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    gap: 12,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: MAROON,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E3125',
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    gap: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
  },
  input: {
    height: 42,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#3E3125',
  },
  trackBtn: {
    backgroundColor: MAROON,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    gap: 8,
  },
  statusHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E3125',
  },
  statusHighlight: {
    color: MAROON,
    fontWeight: '800',
  },
  statusLabel: {
    fontSize: 11,
    color: '#8B7355',
  },
  timelineHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
    marginTop: 10,
  },
  timelineItem: {
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: MAROON,
  },
  timelineTime: {
    fontSize: 10,
    fontWeight: '700',
    color: MAROON,
  },
  timelineMsg: {
    fontSize: 11,
    color: '#3E3125',
  },
  secHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: MAROON,
    textTransform: 'uppercase',
  },
  faqBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
    flex: 1,
    paddingRight: 10,
  },
  faqArrow: {
    fontSize: 10,
    color: '#8B7355',
  },
  faqAnswerBox: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 11,
    color: '#8B7355',
    lineHeight: 16,
  },
  policyTextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    gap: 4,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: MAROON,
  },
  policyBody: {
    fontSize: 11,
    color: '#8B7355',
    lineHeight: 16,
  },
});
