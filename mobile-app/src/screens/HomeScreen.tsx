import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, FlatList
} from 'react-native';
import { MAROON, GOLD, IVORY, SPACE_BLACK, BORDER_COLOR, CARD_BG } from '../constants/theme';
import { ArohamProduct, ActiveTab } from '../types';
import { fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const { width } = Dimensions.get('window');

// 20 mock coordinates for stars
const STAR_COORDS = [
  { x: 30, y: 50 }, { x: 280, y: 30 }, { x: 120, y: 90 }, { x: 220, y: 110 },
  { x: 70, y: 150 }, { x: 320, y: 140 }, { x: 190, y: 180 }, { x: 40, y: 220 },
  { x: 260, y: 240 }, { x: 110, y: 280 }, { x: 310, y: 310 }, { x: 160, y: 350 },
  { x: 80, y: 400 }, { x: 230, y: 430 }, { x: 290, y: 470 }, { x: 50, y: 510 },
  { x: 180, y: 540 }, { x: 130, y: 590 }, { x: 270, y: 620 }, { x: 90, y: 670 }
];

interface HomeScreenProps {
  setTab: (tab: ActiveTab) => void;
  onProductPress: (p: ArohamProduct) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setTab, onProductPress }) => {
  const [products, setProducts] = useState<ArohamProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(1); // highlighted active card

  useEffect(() => {
    (async () => {
      const prods = await fetchProducts();
      setProducts(prods);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loaderText}>Loading sacred offerings…</Text>
      </View>
    );
  }

  // 3D Carousel Data (representing the highlighted items in "Explore Our Sacred Store")
  const carouselItems = [
    { id: 26, name: 'Brass Sun for East Wall', desc: 'Vedic Energized & Authentic', img: 'https://images.unsplash.com/photo-1596394723269-e5e2dbdbf4db?w=400' },
    { id: 21, name: 'Khatu Shyam Murti Dome', desc: 'Authentic & Energized', img: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400' },
    { id: 20, name: 'Dhan Labh Tortoise', desc: 'Authentic & Energized', img: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400' }
  ];

  const consecrationCards = [
    { id: 4, title: 'PYRITE SUN RING', desc: 'Consecrated through 108 mantra rounds', tags: ['Certificate', 'Vedic Pandit'] },
    { id: 2, title: 'NEPAL 1 MUKHI', desc: 'Siddha sanctified on Pradosham tithi', tags: ['Lab Certified', 'Nepali Bead'] }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section & Background */}
      <View style={styles.heroSection}>
        {/* Starry night backgrounds */}
        {STAR_COORDS.map((coord, idx) => (
          <View
            key={idx}
            style={[
              styles.starDot,
              { left: coord.x, top: coord.y, opacity: idx % 2 === 0 ? 0.3 : 0.6 }
            ]}
          />
        ))}
        {/* Gold Glow Center */}
        <View style={styles.radialGlow} />

        <View style={styles.heroContent}>
          <Text style={styles.heroSubtitle}>• VEDIC ASTROLOGY & VASTU</Text>
          <Text style={styles.heroTitle}>100% Authentic{'\n'}<Text style={styles.heroTitleGold}>Astro Solution</Text></Text>
          <Text style={styles.heroDesc}>
            Authentic Vedic products & expert consultations to align your life with cosmic energy. Temple energized. Astrologer recommended.
          </Text>

          <View style={styles.heroBtnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setTab('shop')}>
              <Text style={styles.primaryBtnText}>🛍️ Shop Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setTab('consult')}>
              <Text style={styles.secondaryBtnText}>🔮 Talk to Astrologer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Grid (2x2) */}
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🙏</Text>
            <View>
              <Text style={styles.featureVal}>12,000+</Text>
              <Text style={styles.featureLabel}>Happy Customers</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>📦</Text>
            <View>
              <Text style={styles.featureVal}>500+</Text>
              <Text style={styles.featureLabel}>Products</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>⭐</Text>
            <View>
              <Text style={styles.featureVal}>98%</Text>
              <Text style={styles.featureLabel}>Satisfaction</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔥</Text>
            <View>
              <Text style={styles.featureVal}>Temple</Text>
              <Text style={styles.featureLabel}>Energized</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3D Sacred Store Carousel Section */}
      <View style={styles.carouselSection}>
        <Text style={styles.carouselSubTitle}>SACRED COLLECTION</Text>
        <Text style={styles.carouselTitle}>Explore Our{'\n'}<Text style={styles.carouselTitleGold}>Sacred Store</Text></Text>

        <View style={styles.carouselContainer}>
          {carouselItems.map((item, idx) => {
            const isCenter = idx === carouselIndex;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.carouselCard,
                  isCenter ? styles.carouselCardCenter : styles.carouselCardSide,
                  idx === 0 && { transform: [{ rotateY: '15deg' }, { scale: 0.95 }] },
                  idx === 2 && { transform: [{ rotateY: '-15deg' }, { scale: 0.95 }] }
                ]}
                activeOpacity={0.9}
                onPress={() => setCarouselIndex(idx)}
              >
                <Image source={{ uri: item.img }} style={styles.carouselImg} />
                <View style={styles.carouselTag}>
                  <Text style={styles.carouselTagText}>AUTHENTIC</Text>
                </View>
                <View style={styles.carouselInfo}>
                  <Text style={styles.carouselCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.carouselCardDesc}>{item.desc}</Text>
                </View>
                {isCenter && (
                  <View style={styles.carouselExpandBadge}>
                    <Text style={styles.carouselExpandText}>TAP TO EXPAND ↓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsRow}>
          {carouselItems.map((_, i) => (
            <View key={i} style={[styles.dot, i === carouselIndex && styles.activeDot]} />
          ))}
        </View>
      </View>

      {/* Craftsmanship Section */}
      <View style={styles.craftSection}>
        <Text style={styles.craftSub}>CRAFTSMANSHIP</Text>
        <Text style={styles.craftTitle}>From Earth to Sacred Artifact</Text>
        <Text style={styles.craftDesc}>
          Every Aroham product follows a sacred 5-step ritual: sourcing pristine natural elements, strict quality purification, lab verification, astrologer customization, and authentic temple consecration under mantra rounds.
        </Text>
      </View>

      {/* Bestselling Products */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionSub}>TOP PICKS</Text>
            <Text style={styles.sectionTitle}>🔥 Bestselling Products</Text>
          </View>
          <TouchableOpacity onPress={() => setTab('shop')}>
            <Text style={styles.viewAllText}>View all ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => onProductPress(item)}
              onAddToCart={() => {}}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </View>

      {/* Fan Favourites / Fav Items */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionSub}>FAN FAVOURITES</Text>
            <Text style={styles.sectionTitle}>❤️ Fav Items</Text>
          </View>
          <TouchableOpacity onPress={() => setTab('shop')}>
            <Text style={styles.viewAllText}>View all ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={[...products].reverse()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => onProductPress(item)}
              onAddToCart={() => {}}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </View>

      {/* The Aroham Difference (Why Choose Us) */}
      <View style={styles.differenceSection}>
        <Text style={styles.diffSub}>THE AROHAM DIFFERENCE</Text>
        <Text style={styles.diffTitle}>Not just products.{'\n'}<Text style={styles.diffTitleGold}>Sacred instruments.</Text></Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diffScroll}>
          {consecrationCards.map((c) => (
            <View key={c.id} style={styles.diffCard}>
              <View style={styles.diffImagePlaceholder}>
                <Text style={styles.diffCardCategory}>TEMPLE ENERGIZED</Text>
                <Text style={styles.diffCardTitle}>{c.title}</Text>
                <Text style={styles.diffCardDesc}>{c.desc}</Text>
                <View style={styles.tagRow}>
                  {c.tags.map((t, idx) => (
                    <Text key={idx} style={styles.tagLabel}>{t}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 4-Box Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>12,000+</Text>
            <Text style={styles.statLabel}>Families Served</Text>
            <Text style={styles.statSub}>Across 18 states</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>100%</Text>
            <Text style={styles.statLabel}>Temple Energized</Text>
            <Text style={styles.statSub}>No exceptions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>4.9 / 5</Text>
            <Text style={styles.statLabel}>Customer Rating</Text>
            <Text style={styles.statSub}>3,200+ reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>7 Days</Text>
            <Text style={styles.statLabel}>Return Window</Text>
            <Text style={styles.statSub}>No questions asked</Text>
          </View>
        </View>
      </View>

      {/* Expert Guidance Section */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceSub}>EXPERT GUIDANCE</Text>
        <Text style={styles.guidanceTitle}>Confused? Let Us Help You Choose.</Text>
        <Text style={styles.guidanceDesc}>
          Every individual planetary chart is unique. Speak directly with our certified scholars to find the correct gemstone, rudraksha mukhi, or vastu yantra tailored specifically for your zodiac stars.
        </Text>
        <TouchableOpacity style={styles.guidanceBtn} onPress={() => setTab('consult')}>
          <Text style={styles.guidanceBtnText}>💬 Consult Vedic Pandit</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
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
    backgroundColor: SPACE_BLACK,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: GOLD,
    fontWeight: '600',
  },
  heroSection: {
    backgroundColor: SPACE_BLACK,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  starDot: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
  },
  radialGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(200, 160, 68, 0.12)',
    top: 60,
    left: width / 2 - 120,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  heroSubtitle: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  heroTitleGold: {
    color: GOLD,
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: SPACE_BLACK,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    zIndex: 10,
  },
  featureCard: {
    width: (width - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 10,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureVal: {
    fontSize: 13,
    fontWeight: '800',
    color: GOLD,
  },
  featureLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginTop: 1,
  },
  carouselSection: {
    backgroundColor: SPACE_BLACK,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  carouselSubTitle: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  carouselTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 32,
  },
  carouselTitleGold: {
    color: GOLD,
  },
  carouselContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 320,
    width: '100%',
    marginTop: 15,
  },
  carouselCard: {
    backgroundColor: '#16120F',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 160, 68, 0.25)',
    position: 'relative',
  },
  carouselCardCenter: {
    width: width * 0.55,
    height: 280,
    zIndex: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  carouselCardSide: {
    width: width * 0.20,
    height: 240,
    opacity: 0.4,
    zIndex: 5,
  },
  carouselImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  carouselTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: MAROON,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  carouselTagText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  carouselInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(22, 18, 15, 0.85)',
    padding: 12,
  },
  carouselCardName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  carouselCardDesc: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  carouselExpandBadge: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  carouselExpandText: {
    color: SPACE_BLACK,
    fontSize: 9,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    backgroundColor: GOLD,
    width: 14,
  },
  craftSection: {
    backgroundColor: '#FAF8F5',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D5',
  },
  craftSub: {
    fontSize: 9,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  craftTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: MAROON,
    marginVertical: 8,
  },
  craftDesc: {
    fontSize: 12,
    color: '#5B4A32',
    lineHeight: 18,
    fontWeight: '500',
  },
  productsSection: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionSub: {
    fontSize: 9,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3E3125',
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: MAROON,
  },
  differenceSection: {
    backgroundColor: SPACE_BLACK,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  diffSub: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  diffTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
    marginVertical: 12,
  },
  diffTitleGold: {
    color: GOLD,
  },
  diffScroll: {
    marginVertical: 16,
  },
  diffCard: {
    width: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.15)',
    padding: 16,
    marginRight: 12,
  },
  diffCardCategory: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '800',
  },
  diffCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 8,
  },
  diffCardDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    lineHeight: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  tagLabel: {
    backgroundColor: 'rgba(200, 160, 68, 0.12)',
    color: GOLD,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(200, 160, 68, 0.25)',
  },
  diffImagePlaceholder: {
    minHeight: 140,
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  statBox: {
    width: (width - 40) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.15)',
    borderRadius: 14,
    padding: 16,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: GOLD,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  statSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  guidanceSection: {
    backgroundColor: '#FAF8F5',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0E5D5',
  },
  guidanceSub: {
    fontSize: 9,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  guidanceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: MAROON,
    marginVertical: 10,
    textAlign: 'center',
  },
  guidanceDesc: {
    fontSize: 12,
    color: '#5B4A32',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  guidanceBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  guidanceBtnText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
  },
});
