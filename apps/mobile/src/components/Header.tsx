import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  onSearchPress?: (query: string) => void;
  onCartPress?: () => void;
  onWishlistPress?: () => void;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onCartPress,
  onWishlistPress,
  onMenuPress,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const handleSearchSubmit = () => {
    if (onSearchPress) onSearchPress(query);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          {/* Logo Disc */}
          <View style={styles.logoDisc}>
            <Text style={styles.logoOm}>🕉️</Text>
          </View>
          <Text style={styles.title}>Aroham</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconBtn}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onWishlistPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>❤️</Text>
            {wishlist.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlist.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onCartPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sacred Store..."
            placeholderTextColor="#8B7355"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (onSearchPress) onSearchPress(text);
            }}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 160, 68, 0.12)',
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoDisc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MAROON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOm: {
    fontSize: 14,
    color: GOLD,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: MAROON,
    letterSpacing: 0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
    color: '#3E3125',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: MAROON,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
  },
  searchBox: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE0',
  },
  searchInput: {
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#3E3125',
  },
});
