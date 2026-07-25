import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import { MAROON, GOLD, SPACE_BLACK } from '../constants/theme';
import { ArohamProduct } from '../types';
import { fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['All', 'Rudraksha', 'Gemstones', 'Yantras', 'Bracelet', 'Mala'];
const SORTS = ['Popular', 'Price: Low', 'Price: High', 'Reviews'];

interface ShopScreenProps {
  onProductPress: (p: ArohamProduct) => void;
  onAddToCart: (p: ArohamProduct) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onProductPress, onAddToCart }) => {
  const [products, setProducts] = useState<ArohamProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');

  useEffect(() => {
    (async () => {
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    })();
  }, []);

  const filtered = selectedCat === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCat.toLowerCase());

  const sorted = [...filtered].sort((a, b) => {
    if (selectedSort === 'Price: Low') return a.price - b.price;
    if (selectedSort === 'Price: High') return b.price - a.price;
    if (selectedSort === 'Reviews') return (b.reviews ?? 0) - (a.reviews ?? 0);
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={MAROON} />
        <Text style={styles.loaderText}>Loading sacred catalog…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Chips Bar */}
      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCat === cat && styles.activeChip]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.chipText, selectedCat === cat && styles.activeChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Row */}
      <View style={styles.sortBar}>
        <Text style={styles.countText}>{sorted.length} Products Found</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, selectedSort === s && styles.activeSortChip]}
              onPress={() => setSelectedSort(s)}
            >
              <Text style={[styles.sortText, selectedSort === s && styles.activeSortText]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List Grid */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => onProductPress(item)}
            onAddToCart={() => onAddToCart(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  chipBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4A32',
  },
  activeChipText: {
    color: GOLD,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B7355',
    marginRight: 10,
  },
  sortScroll: {
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FAF8F5',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeSortChip: {
    borderColor: MAROON,
    backgroundColor: 'rgba(91, 31, 36, 0.06)',
  },
  sortText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B7355',
  },
  activeSortText: {
    color: MAROON,
    fontWeight: '800',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 80,
  },
});
