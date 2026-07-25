import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { MAROON, GOLD, IVORY } from '../constants/theme';

interface HeaderProps {
  onSearchPress?: () => void;
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

  return (
    <SafeAreaView style={styles.safeArea}>
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
          </TouchableOpacity>

          <TouchableOpacity onPress={onCartPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>🛒</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sacred store..."
            placeholderTextColor="#8B7355"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      )}
    </SafeAreaView>
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
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  iconText: {
    fontSize: 18,
    color: '#3E3125',
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
