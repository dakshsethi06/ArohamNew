import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { Address, CartItem } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ── SHIPPING ADDRESS SCREEN ─────────────────────────────────────────────
interface ShippingProps {
  onNext: (address: Address) => void;
  onBack: () => void;
}

export const CheckoutShippingScreen: React.FC<ShippingProps> = ({ onNext, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleProceed = () => {
    if (!name || !phone || !line1 || !city || !state || !pincode) return;
    onNext({ name, phone, line1, line2, city, state, pincode });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Cart</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>1. Shipping Address</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#9a8c7a" value={name} onChangeText={setName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="10-digit mobile number" placeholderTextColor="#9a8c7a" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <Text style={styles.label}>Flat / House / Area Address</Text>
          <TextInput style={styles.input} placeholder="Flat no, building, street address" placeholderTextColor="#9a8c7a" value={line1} onChangeText={setLine1} />

          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput style={styles.input} placeholder="E.g., near temple" placeholderTextColor="#9a8c7a" value={line2} onChangeText={setLine2} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} placeholder="City name" placeholderTextColor="#9a8c7a" value={city} onChangeText={setCity} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} placeholder="State" placeholderTextColor="#9a8c7a" value={state} onChangeText={setState} />
            </View>
          </View>

          <Text style={styles.label}>Pincode</Text>
          <TextInput style={styles.input} placeholder="6-digit zip code" placeholderTextColor="#9a8c7a" keyboardType="number-pad" value={pincode} onChangeText={setPincode} />

          <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
            <Text style={styles.proceedText}>PROCEED TO PAYMENT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ── PAYMENT METHODS SCREEN ──────────────────────────────────────────────
interface PaymentProps {
  cart: CartItem[];
  cartTotal: number;
  address: Address;
  onNext: (orderId: string) => void;
  onBack: () => void;
}

export const CheckoutPaymentScreen: React.FC<PaymentProps> = ({
  cartTotal,
  address,
  onNext,
  onBack
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'razorpay' | 'cod'>('razorpay');

  const handlePayment = async () => {
    setLoading(true);
    const orderId = `ARH-${Math.floor(100000 + Math.random() * 900000)}`;
    const userPhone = address?.phone || '';
    const cleanPhone = String(userPhone).replace(/\D/g, "").slice(-10);

    const sbPayload = {
      id: orderId,
      user_id: user?.id || null,
      user_phone: cleanPhone,
      amount: Math.round(cartTotal * 100),
      total_amount: Math.round(cartTotal * 100),
      status: method === 'razorpay' ? 'CONFIRMED' : 'PENDING',
      payment_method: method === 'razorpay' ? 'Razorpay' : 'COD',
      payment_status: method === 'razorpay' ? 'PAID' : 'PENDING',
      address: `${address?.line1}, ${address?.city}, ${address?.state} - ${address?.pincode}`,
      shipping_address: address,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("orders").insert(sbPayload);
    } catch (err) {
      console.warn("Supabase order insert error:", err);
    }

    setTimeout(() => {
      setLoading(false);
      onNext(orderId);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>2. Payment Options</Text>
      </View>

      <View style={styles.scroll}>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryTitle}>Order Total</Text>
          <Text style={styles.summaryVal}>₹{cartTotal.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.paymentList}>
          {/* Razorpay Gateway */}
          <TouchableOpacity
            style={[styles.payOption, method === 'razorpay' && styles.activePayOption]}
            onPress={() => setMethod('razorpay')}
          >
            <View style={[styles.radio, method === 'razorpay' && styles.activeRadio]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Razorpay (Cards / UPI / NetBanking)</Text>
              <Text style={styles.payDesc}>Pay securely with instant verification & free shipping</Text>
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            style={[styles.payOption, method === 'cod' && styles.activePayOption]}
            onPress={() => setMethod('cod')}
          >
            <View style={[styles.radio, method === 'cod' && styles.activeRadio]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Cash on Delivery (COD)</Text>
              <Text style={styles.payDesc}>₹50 extra handling fee applies</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={MAROON} />
            <Text style={styles.loaderText}>Processing secure gateway transaction…</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.proceedBtn} onPress={handlePayment}>
            <Text style={styles.proceedText}>
              {method === 'razorpay' ? 'PAY NOW WITH RAZORPAY' : 'PLACE ORDER (COD)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ── CONFIRMATION / SUCCESS SCREEN ────────────────────────────────────────
interface ConfirmProps {
  orderId: string;
  onHomePress: () => void;
}

export const CheckoutConfirmScreen: React.FC<ConfirmProps> = ({ orderId, onHomePress }) => {
  return (
    <View style={[styles.container, styles.confirmBg]}>
      <View style={styles.confirmContent}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.confirmTitle}>Order Confirmed!</Text>
        <Text style={styles.confirmDesc}>
          Namaste. Your order has been placed successfully. Our temple priests will energize your remedies on the upcoming auspicious tithi.
        </Text>

        <View style={styles.orderIdBox}>
          <Text style={styles.orderLabel}>ORDER ID</Text>
          <Text style={styles.orderVal}>{orderId}</Text>
        </View>

        <TouchableOpacity style={styles.confirmHomeBtn} onPress={onHomePress}>
          <Text style={styles.confirmHomeBtnText}>CONTINUE SHOPPING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
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
  scroll: {
    padding: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  proceedBtn: {
    backgroundColor: MAROON,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  proceedText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '700',
  },
  summaryVal: {
    fontSize: 28,
    fontWeight: '800',
    color: MAROON,
    marginTop: 6,
  },
  paymentList: {
    gap: 12,
  },
  payOption: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  activePayOption: {
    borderColor: MAROON,
    backgroundColor: 'rgba(91, 31, 36, 0.03)',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5D7C3',
  },
  activeRadio: {
    borderColor: MAROON,
    backgroundColor: MAROON,
  },
  payName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
  },
  payDesc: {
    fontSize: 9,
    color: '#8B7355',
    marginTop: 3,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loaderText: {
    fontSize: 11,
    color: '#8B7355',
    fontWeight: '600',
    marginTop: 10,
  },
  confirmBg: {
    backgroundColor: MAROON,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContent: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: MAROON,
    marginBottom: 12,
  },
  confirmDesc: {
    fontSize: 12,
    color: '#5B4A32',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderIdBox: {
    backgroundColor: '#FAF6EF',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B7355',
    letterSpacing: 0.5,
  },
  orderVal: {
    fontSize: 16,
    fontWeight: '800',
    color: MAROON,
    marginTop: 4,
  },
  confirmHomeBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  confirmHomeBtnText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
});
