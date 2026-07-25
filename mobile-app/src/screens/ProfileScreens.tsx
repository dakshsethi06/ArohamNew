import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { FAQ_ITEMS } from '../services/api';

// ── PROFILE SUMMARY SCREEN ──────────────────────────────────────────────
interface ProfileMainProps {
  onTrackOrder: () => void;
  onPolicies: () => void;
}

export const ProfileScreens: React.FC<ProfileMainProps> = ({ onTrackOrder, onPolicies }) => {
  const { user, login, logout, isLoggedIn } = useAuth();
  
  // Auth state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'user' | 'astrologer'>('user');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(59);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Start countdown when OTP is sent
  React.useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (activeTab === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    }
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setCountdown(59);
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otpCode === '123456' || otpCode === '111111' || otpCode === '000000') {
        const finalName = name.trim() || (role === 'astrologer' ? 'Pandit Raghav' : 'Seeker Rajesh');
        const finalEmail = email.trim() || (role === 'astrologer' ? 'raghav@aroham.com' : 'rajesh@gmail.com');
        login(finalName, finalEmail, role);
      } else {
        setErrorMsg('Incorrect OTP code. Try 123456 to verify.');
      }
    }, 800);
  };

  if (!isLoggedIn) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>🕉️ Welcome to Aroham</Text>
          <Text style={styles.authDesc}>Join India's most trusted ecosystem for authentic Vedic solutions.</Text>

          {/* Sign In vs Sign Up Tabs */}
          {!otpSent && (
            <View style={styles.tabHeader}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'signin' && styles.activeTabBtn]}
                onPress={() => { setActiveTab('signin'); setErrorMsg(''); }}
              >
                <Text style={[styles.tabBtnText, activeTab === 'signin' && styles.activeTabBtnText]}>SIGN IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'signup' && styles.activeTabBtn]}
                onPress={() => { setActiveTab('signup'); setErrorMsg(''); }}
              >
                <Text style={[styles.tabBtnText, activeTab === 'signup' && styles.activeTabBtnText]}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Role Switcher */}
          {!otpSent && (
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'user' && styles.activeRoleBtn]}
                onPress={() => setRole('user')}
              >
                <Text style={[styles.roleBtnText, role === 'user' && styles.activeRoleBtnText]}>👤 I am a Seeker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'astrologer' && styles.activeRoleBtn]}
                onPress={() => setRole('astrologer')}
              >
                <Text style={[styles.roleBtnText, role === 'astrologer' && styles.activeRoleBtnText]}>🔮 Vedic Scholar</Text>
              </TouchableOpacity>
            </View>
          )}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* FORM FIELDS */}
          {!otpSent ? (
            <View style={styles.formFields}>
              {activeTab === 'signup' && (
                <>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#9a8c7a"
                    value={name}
                    onChangeText={setName}
                  />

                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@domain.com"
                    placeholderTextColor="#9a8c7a"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </>
              )}

              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="10-digit number"
                  placeholderTextColor="#9a8c7a"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity style={styles.loginBtn} onPress={handleSendOtp} disabled={loading}>
                <Text style={styles.loginBtnText}>{loading ? 'SENDING OTP...' : 'SEND SMS OTP'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formFields}>
              <Text style={styles.otpHeader}>Verify Mobile Number</Text>
              <Text style={styles.otpSub}>Enter the 6-digit OTP code sent to +91 {phone}</Text>

              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="0 0 0 0 0 0"
                placeholderTextColor="#9a8c7a"
                keyboardType="number-pad"
                value={otpCode}
                onChangeText={(val) => setOtpCode(val.replace(/\D/g, ''))}
                maxLength={6}
              />

              <TouchableOpacity style={styles.loginBtn} onPress={handleVerifyOtp} disabled={loading}>
                <Text style={styles.loginBtnText}>{loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}</Text>
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={() => { setOtpSent(false); handleSendOtp(); }}>
                    <Text style={styles.resendTextBtn}>Resend SMS OTP</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setOtpSent(false)}>
                  <Text style={styles.changePhoneText}>Change Number</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
        <Text style={styles.profileGreeting}>Namaste, {user?.name}!</Text>
        <Text style={styles.profileRole}>Role: {user?.role === 'astrologer' ? 'Vedic Scholar' : 'Seeker'}</Text>
      </View>

      {/* Profile Navigation Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Account</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={onTrackOrder}>
          <Text style={styles.menuIcon}>📦</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Track Order</Text>
            <Text style={styles.menuDesc}>Monitor Shiprocket package shipment</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onPolicies}>
          <Text style={styles.menuIcon}>📜</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Policies & Help</Text>
            <Text style={styles.menuDesc}>FAQs, shipping policies, returns</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Sign Out</Text>
            <Text style={styles.menuDesc}>Logout from your session</Text>
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
  const [status, setStatus] = useState<any>(null);

  const handleTrack = () => {
    if (!orderId) return;
    setStatus({
      status: 'In Transit',
      courier: 'Delhivery Express',
      eta: 'July 28, 2026',
      updates: [
        { time: '10:30 AM', msg: 'Package departed local sorting facility.' },
        { time: 'Yesterday', msg: 'Sacred item energized & packed at Noida Ashram.' }
      ]
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Profile</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Track Shiprocket Order</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Shiprocket / Order ID</Text>
          <TextInput style={styles.input} placeholder="E.g., ARH-81395" placeholderTextColor="#9a8c7a" value={orderId} onChangeText={setOrderId} />
          <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
            <Text style={styles.trackBtnText}>TRACK STATUS</Text>
          </TouchableOpacity>
        </View>

        {status && (
          <View style={styles.statusCard}>
            <Text style={styles.statusHeading}>Shipment Status: <Text style={styles.statusHighlight}>{status.status}</Text></Text>
            <Text style={styles.statusLabel}>Courier: {status.courier}</Text>
            <Text style={styles.statusLabel}>Estimated Delivery: {status.eta}</Text>

            <Text style={styles.timelineHeader}>Tracking Timeline</Text>
            {status.updates.map((u: any, idx: number) => (
              <View key={idx} style={styles.timelineItem}>
                <Text style={styles.timelineTime}>{u.time}</Text>
                <Text style={styles.timelineMsg}>{u.msg}</Text>
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
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Profile</Text></TouchableOpacity>
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
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    gap: 16,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
    textTransform: 'uppercase',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.15)',
    shadowColor: '#5B1F24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MAROON,
    textAlign: 'center',
    marginBottom: 8,
  },
  authDesc: {
    fontSize: 11,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4A32',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#3E3125',
    backgroundColor: '#FAF8F5',
  },
  loginBtn: {
    backgroundColor: MAROON,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginBtnText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    marginVertical: 14,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    backgroundColor: MAROON,
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7355',
  },
  activeTabBtnText: {
    color: GOLD,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoleBtn: {
    borderColor: MAROON,
    backgroundColor: 'rgba(91, 31, 36, 0.04)',
  },
  roleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4A32',
  },
  activeRoleBtnText: {
    color: MAROON,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  formFields: {
    gap: 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefixBox: {
    width: 50,
    height: 40,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
  },
  phoneInput: {
    flex: 1,
  },
  otpHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: MAROON,
    textAlign: 'center',
    marginTop: 10,
  },
  otpSub: {
    fontSize: 10,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 2,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: '800',
    height: 46,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  countdownText: {
    fontSize: 10,
    color: '#9a8c7a',
    fontWeight: '600',
  },
  resendTextBtn: {
    fontSize: 10,
    color: MAROON,
    fontWeight: '800',
  },
  changePhoneText: {
    fontSize: 10,
    color: GOLD,
    fontWeight: '800',
  },
  profileHeader: {
    backgroundColor: MAROON,
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(200, 160, 68, 0.15)',
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileRole: {
    fontSize: 10,
    color: GOLD,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.08)',
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E3125',
  },
  menuDesc: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: GOLD,
    marginLeft: 'auto',
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
    marginBottom: 10,
  },
  trackBtn: {
    backgroundColor: MAROON,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
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
    marginTop: 16,
    gap: 6,
  },
  statusHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  statusHighlight: {
    color: MAROON,
  },
  statusLabel: {
    fontSize: 11,
    color: '#8B7355',
    fontWeight: '600',
  },
  timelineHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3E3125',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    paddingTop: 12,
  },
  timelineItem: {
    marginVertical: 6,
    paddingLeft: 8,
    borderLeftWidth: 1.5,
    borderLeftColor: GOLD,
  },
  timelineTime: {
    fontSize: 9,
    fontWeight: '700',
    color: GOLD,
  },
  timelineMsg: {
    fontSize: 10,
    color: '#5B4A32',
    marginTop: 2,
    fontWeight: '500',
  },
  secHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E3125',
    marginBottom: 12,
  },
  faqBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E3125',
    flex: 1,
  },
  faqArrow: {
    fontSize: 9,
    color: '#8B7355',
  },
  faqAnswerBox: {
    backgroundColor: '#FAF8F5',
    padding: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#E5D7C3',
  },
  faqAnswer: {
    fontSize: 11,
    color: '#5B4A32',
    lineHeight: 16,
    fontWeight: '500',
  },
  policyTextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    marginBottom: 10,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: MAROON,
    marginBottom: 6,
  },
  policyBody: {
    fontSize: 11,
    color: '#5B4A32',
    lineHeight: 16,
    fontWeight: '500',
  },
});
