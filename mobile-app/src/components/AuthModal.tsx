import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@logic/lib/supabase';
import { generateUUID } from '@logic/utils/uuid';
import { safeLocalStorage } from '@logic/utils/storage';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialRole?: 'user' | 'astrologer';
}

type AuthStep = 'signin' | 'signup' | 'otp';

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  initialRole = 'user'
}) => {
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isAstrologerMode, setIsAstrologerMode] = useState(initialRole === 'astrologer');
  const [step, setStep] = useState<AuthStep>('signin');

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [astroSpecialty, setAstroSpecialty] = useState('Vedic Kundali');
  const [astroExperience, setAstroExperience] = useState('5');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setStep(tab);
    setErrorMsg('');
    setOtp('');
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (activeTab === 'signup' && !isAstrologerMode && !name.trim()) {
      setErrorMsg('Please enter your full name to create an account.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const last10 = cleanPhone.slice(-10);

    if (isAstrologerMode) {
      try {
        const { data } = await supabase
          .from('astrologers')
          .select('status')
          .or(`phone.eq.${last10},phone.eq.+91${last10},phone.eq.91${last10},phone.ilike.%${last10}`)
          .limit(1);
        
        const astroObj = data && data.length > 0 ? data[0] : null;
        if (astroObj && String(astroObj.status).toUpperCase() === 'BLOCKED') {
          setLoading(false);
          setErrorMsg("Sorry, you are blocked. Can't login.");
          return;
        }
      } catch (e) {}

      setTimeout(() => {
        setLoading(false);
        setStep('otp');
      }, 400);
      return;
    }

    // Normal User Mode check in DB
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .or(`phone.eq.${last10},phone.eq.+91${last10},phone.eq.91${last10},phone.ilike.%${last10}`)
        .limit(1);

      const userObj = data && data.length > 0 ? data[0] : null;
      if (userObj && String(userObj.status).toUpperCase() === 'BLOCKED') {
        setLoading(false);
        setErrorMsg("Sorry, your account is blocked. Can't login.");
        return;
      }

      if (activeTab === 'signin' && (!userObj || !userObj.id)) {
        setLoading(false);
        setActiveTab('signup');
        setStep('signup');
        setErrorMsg('Mobile number not registered. Please enter your name to create an account.');
        return;
      }
    } catch (e) {}

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 400);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErrorMsg('Please enter valid 6-digit OTP code (Default: 111111 or 123456).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(async () => {
      if (otp !== '111111' && otp !== '123456' && otp.length < 6) {
        setLoading(false);
        setErrorMsg('Invalid OTP code. Use test code 111111.');
        return;
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const last10 = cleanPhone.slice(-10);

      try {
        if (isAstrologerMode) {
          const { data } = await supabase
            .from('astrologers')
            .select('*')
            .or(`phone.eq.${last10},phone.eq.+91${last10},phone.eq.91${last10},phone.ilike.%${last10}`)
            .limit(1);
          
          const astroData = data && data.length > 0 ? data[0] : null;
          
          if (astroData && String(astroData.status).toUpperCase() === 'BLOCKED') {
            setLoading(false);
            setErrorMsg("Sorry, you are blocked. Can't login.");
            return;
          }

          if (astroData && astroData.id) {
            const astroProfile = {
              id: astroData.id,
              name: astroData.full_name || astroData.name || 'Acharya Astrologer',
              title: astroData.title || 'Senior Vedic Jyotish Master',
              experience: `${astroData.experience_years || 5}+ Years Exp`,
              rating: Number(astroData.rating) || 5.0,
              consultations: astroData.consultations_count || 0,
              specialties: astroData.specialties || ['Vedic Kundali'],
              languages: astroData.languages || ['Hindi', 'English'],
              avatar: astroData.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
              status: astroData.is_online ? 'online' : 'offline',
              pricePerMin: Number(astroData.price_per_min) || 20,
              bio: astroData.bio || ''
            };

            setLoading(false);
            login({
              id: astroData.id,
              email: astroData.email || null,
              user_metadata: { full_name: astroProfile.name, phone: cleanPhone, role: 'astrologer' },
              role: 'astrologer',
              astrologerProfile: astroProfile
            });
            onClose();
            return;
          }

          // Create new Astrologer
          const astroId = generateUUID();
          const astroFullName = name.trim() || 'Acharya ' + (cleanPhone.slice(-4) || 'Ji');
          
          const newAstro = {
            id: astroId,
            full_name: astroFullName,
            email: email.trim() || null,
            phone: cleanPhone,
            title: `Vedic Jyotish & ${astroSpecialty} Specialist`,
            experience_years: parseInt(astroExperience) || 5,
            specialties: [astroSpecialty, 'Vedic Kundali', 'Sacred Remedies'],
            languages: ['Hindi', 'English'],
            rating: 5.0,
            is_online: true,
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
            price_per_min: 20,
            role: 'astrologer'
          };

          Promise.resolve(supabase.from('astrologers').upsert(newAstro)).catch(() => {});

          setLoading(false);
          login({
            id: astroId,
            email: email.trim() || null,
            user_metadata: { full_name: astroFullName, phone: cleanPhone, role: 'astrologer' },
            role: 'astrologer'
          });
          onClose();
          return;
        }

        // Normal User Mode
        let existingUser: any = null;
        const { data } = await supabase
          .from('users')
          .select('*')
          .or(`phone.eq.${last10},phone.eq.+91${last10},phone.eq.91${last10},phone.ilike.%${last10}`)
          .limit(1);

        if (data && data.length > 0) {
          existingUser = data[0];
        }

        if (existingUser) {
          setLoading(false);
          login({
            id: existingUser.id,
            email: existingUser.email,
            user_metadata: { full_name: existingUser.full_name || name.trim() || 'Devotee', phone: cleanPhone }
          });
          onClose();
          return;
        }

        // Create new user
        const newUserId = generateUUID();
        const userFullName = name.trim() || 'Devotee';

        Promise.resolve(supabase.from('users').upsert({
          id: newUserId,
          full_name: userFullName,
          email: email.trim() || null,
          phone: cleanPhone
        })).catch(() => {});

        setLoading(false);
        login({
          id: newUserId,
          email: email.trim() || null,
          user_metadata: { full_name: userFullName, phone: cleanPhone }
        });
        onClose();
      } catch (err: any) {
        setLoading(false);
        setErrorMsg('Authentication failed. Please try again.');
      }
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isAstrologerMode ? 'Aroham Astrologer Portal' : 'Sacred Login'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Tab Bar */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
                onPress={() => switchTab('signin')}
              >
                <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
                  SIGN IN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                onPress={() => switchTab('signup')}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                  CREATE ACCOUNT
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode Switcher */}
            <TouchableOpacity
              style={styles.modeBtn}
              onPress={() => setIsAstrologerMode(!isAstrologerMode)}
            >
              <Text style={styles.modeBtnText}>
                {isAstrologerMode ? '🔮 Switch to Devotee Account' : '✨ Are you a Certified Astrologer? Click here'}
              </Text>
            </TouchableOpacity>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            ) : null}

            {step !== 'otp' ? (
              <View style={styles.formGroup}>
                {activeTab === 'signup' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {isAstrologerMode ? 'Astrologer Full Name' : 'Full Name *'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor="#8B7355"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mobile Number *</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.flagPrefix}>
                      <Text style={styles.flagText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#8B7355"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
                    />
                  </View>
                </View>

                {activeTab === 'signup' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor="#8B7355"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={GOLD} />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {activeTab === 'signin' ? 'GET OTP CODE' : 'PROCEED TO VERIFY'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.otpHeaderTitle}>Enter 6-Digit OTP</Text>
                <Text style={styles.otpSub}>Sent via SMS to +91 {phone}</Text>
                <Text style={styles.testOtpBadge}>Test Code: 111111</Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="111111"
                  placeholderTextColor="#8B7355"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={GOLD} />
                  ) : (
                    <Text style={styles.actionBtnText}>VERIFY & LOGIN</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep('signin')} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>← Change Mobile Number</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: height * 0.85,
    backgroundColor: '#FCFAF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: MAROON,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#8B7355',
    fontWeight: '700',
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(91, 31, 36, 0.06)',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: MAROON,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B7355',
  },
  activeTabText: {
    color: GOLD,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(200, 160, 68, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MAROON,
  },
  errorBox: {
    backgroundColor: '#FDE8E8',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
  },
  formGroup: {
    gap: 12,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: MAROON,
    textTransform: 'uppercase',
  },
  input: {
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#3E3125',
  },
  phoneInputRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    overflow: 'hidden',
  },
  flagPrefix: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5D7C3',
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
    color: MAROON,
  },
  phoneInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#3E3125',
  },
  actionBtn: {
    backgroundColor: MAROON,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otpHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: MAROON,
    textAlign: 'center',
  },
  otpSub: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
  },
  testOtpBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    borderRadius: 8,
  },
  otpInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: MAROON,
    borderRadius: 14,
    fontSize: 22,
    fontWeight: '800',
    color: MAROON,
    textAlign: 'center',
    letterSpacing: 8,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 11,
    color: '#8B7355',
    fontWeight: '700',
  },
});
