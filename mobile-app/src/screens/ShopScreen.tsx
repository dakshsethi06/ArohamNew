import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, TextInput
} from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { ArohamProduct } from '../types';
import { useProducts } from '@logic/hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['All', 'Rudraksha', 'Gemstones', 'Yantras', 'Bracelet', 'Mala'];
const SORTS = ['Popular', 'Price: Low', 'Price: High', 'Reviews'];

interface ShopScreenProps {
  onProductPress: (p: ArohamProduct) => void;
  onAddToCart: (p: ArohamProduct) => void;
  searchQuery?: string;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onProductPress, onAddToCart, searchQuery = '' }) => {
  const { products, loading } = useProducts();
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');
  const [search, setSearch] = useState(searchQuery);

  const filteredByCat = selectedCat === 'All'
    ? products
    : products.filter(p => (p.category || '').toLowerCase().includes(selectedCat.toLowerCase()));

  const filteredBySearch = search.trim() === ''
    ? filteredByCat
    : filteredByCat.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.purpose || '').toLowerCase().includes(search.toLowerCase())
      );

  const sorted = [...filteredBySearch].sort((a, b) => {
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
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, purpose, or category..."
          placeholderTextColor="#8B7355"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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
        <Text style={styles.countText}>{sorted.length} Remedies</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No Remedies Found</Text>
            <Text style={styles.emptyText}>Try selecting another category or search term.</Text>
          </View>
        }
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    height: 38,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 19,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#3E3125',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 28,
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '700',
  },
  chipBar: {
    paddingVertical: 10,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3E3125',
  },
  emptyText: {
    fontSize: 11,
    color: '#8B7355',
  },
});
