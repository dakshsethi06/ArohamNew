import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { CartItem } from '../types';
import { MAROON, GOLD } from '../constants/theme';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  visible,
  onClose,
  onCheckout
}) => {
  const { cart, updateQty, removeFromCart, cartTotal } = useCart();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Sacred Cart ({cart.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptyDesc}>Explore our sacred Vedic store to add energized remedies.</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={onClose}>
                <Text style={styles.shopBtnText}>START SHOPPING</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Scrollable list */}
              <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartCard}>
                    <Image source={{ uri: item.img }} style={styles.img} />
                    
                    <View style={styles.info}>
                      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.subtitle}>{item.subtitle}</Text>
                      <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                    </View>

                    {/* Quantity selectors & Delete */}
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={styles.trashBtn} 
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Text style={styles.trashIcon}>🗑️</Text>
                      </TouchableOpacity>

                      <View style={styles.qtyRow}>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.qtyText}>{item.qty}</Text>
                        
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQty(item.id, item.qty + 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Total & Checkout button */}
              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalVal}>₹{cartTotal.toLocaleString('en-IN')}</Text>
                </View>
                <Text style={styles.taxLabel}>* Free Express Shipping & Pooja Consecration Included</Text>

                <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
                  <Text style={styles.checkoutText}>PROCEED TO SHIPPING</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    height: height * 0.75,
    backgroundColor: '#FCFAF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#5B1F24',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E3125',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3E3125',
  },
  emptyDesc: {
    fontSize: 11,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 16,
  },
  shopBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    marginTop: 10,
  },
  shopBtnText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollList: {
    flex: 1,
    padding: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E3125',
  },
  subtitle: {
    fontSize: 9,
    color: '#8B7355',
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: MAROON,
    marginTop: 4,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  trashBtn: {
    padding: 4,
  },
  trashIcon: {
    fontSize: 14,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E3125',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3E3125',
    paddingHorizontal: 8,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    padding: 16,
    paddingBottom: 28,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E3125',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: MAROON,
  },
  taxLabel: {
    fontSize: 9,
    color: '#8B7355',
    fontWeight: '600',
    marginBottom: 16,
  },
  checkoutBtn: {
    backgroundColor: MAROON,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
