import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { MAROON, GOLD, STATUS_ONLINE } from '../constants/theme';
import { Astrologer } from '../types';
import { fetchAstrologers } from '../services/api';
import { AstrologerCard } from '../components/AstrologerCard';

const TOPICS = ['All', 'Kundali', 'Gemstones', 'Rudraksha', 'Vastu', 'Remedies'];

interface ConsultScreenProps {
  onAstrologerPress: (a: Astrologer) => void;
  onHistoryPress: () => void;
}

export const ConsultScreen: React.FC<ConsultScreenProps> = ({
  onAstrologerPress,
  onHistoryPress
}) => {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('All');

  useEffect(() => {
    (async () => {
      const data = await fetchAstrologers();
      setAstrologers(data);
      setLoading(false);
    })();
  }, []);

  const filtered = activeTopic === 'All'
    ? astrologers
    : astrologers.filter(a =>
        a.specialties.some(s => s.toLowerCase().includes(activeTopic.toLowerCase()))
      );

  // Sort: online first, busy next, offline last
  const sorted = [...filtered].sort((a, b) => {
    const order = { online: 0, busy: 1, offline: 2 };
    return order[a.status] - order[b.status];
  });

  const onlineCount = astrologers.filter(a => a.status === 'online').length;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={MAROON} />
        <Text style={styles.loaderText}>Connecting to Vedic scholars…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>✨ VERIFIED TEMPLE SCHOLARS</Text>
        </View>
        <Text style={styles.heroTitle}>
          Consult Verified{'\n'}
          <Text style={styles.heroTitleGold}>Vedic Acharyas</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Connect live with certified Vedic Astrologers for Kundali, Gemstone prescriptions, Rudraksha analysis & authentic remedies.
        </Text>
        
        <View style={styles.onlineStatusRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{onlineCount} Scholars Active</Text>
          <Text style={styles.onlineSub}> • Instant live chat available</Text>
        </View>
      </View>

      {/* Topics Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[styles.chip, activeTopic === topic && styles.activeChip]}
              onPress={() => setActiveTopic(topic)}
            >
              <Text style={[styles.chipText, activeTopic === topic && styles.activeChipText]}>
                {topic}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Astrologers Directory List */}
      <View style={styles.list}>
        <Text style={styles.countLabel}>{sorted.length} Scholars Available</Text>
        {sorted.map((a) => (
          <AstrologerCard
            key={a.id}
            astrologer={a}
            onChatPress={() => onAstrologerPress(a)}
          />
        ))}
      </View>

      {/* Saved Chat History Button */}
      <View style={styles.historyContainer}>
        <TouchableOpacity style={styles.historyBtn} onPress={onHistoryPress} activeOpacity={0.85}>
          <Text style={styles.historyIcon}>📋</Text>
          <View>
            <Text style={styles.historyTitle}>My Saved Chat History</Text>
            <Text style={styles.historyDesc}>View previous consultations and prescriptions</Text>
          </View>
          <Text style={styles.historyArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Guarantee Banner */}
      <View style={styles.guarantee}>
        <Text style={styles.guaranteeText}>
          🛡️ 100% Verified Scholars • Temple Certified • Secure & Private
        </Text>
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
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  hero: {
    backgroundColor: '#FAF6EF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 160, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.25)',
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#92400E',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MAROON,
    lineHeight: 30,
  },
  heroTitleGold: {
    color: GOLD,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#5B4A32',
    lineHeight: 16,
    marginTop: 6,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FAF3E8',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: STATUS_ONLINE,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: STATUS_ONLINE,
  },
  onlineSub: {
    fontSize: 9,
    color: '#8B7355',
    fontWeight: '600',
  },
  filterBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5D7C3',
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
  list: {
    padding: 16,
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B7355',
    marginBottom: 12,
  },
  historyContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.15)',
    gap: 12,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  historyDesc: {
    fontSize: 9,
    color: '#8B7355',
    marginTop: 2,
  },
  historyArrow: {
    fontSize: 20,
    color: MAROON,
    fontWeight: '300',
    marginLeft: 'auto',
  },
  guarantee: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(91, 31, 36, 0.04)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  guaranteeText: {
    fontSize: 9,
    color: '#8B7355',
    fontWeight: '700',
  },
});
