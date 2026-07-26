import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Astrologer } from '../types';
import { MAROON, GOLD, STATUS_ONLINE, STATUS_BUSY, STATUS_OFFLINE } from '../constants/theme';
import { Stars } from './Stars';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onChatPress?: () => void;
}

export const AstrologerCard: React.FC<AstrologerCardProps> = ({ astrologer, onChatPress }) => {
  const statusColor =
    astrologer.status === 'online' ? STATUS_ONLINE :
    astrologer.status === 'busy' ? STATUS_BUSY : STATUS_OFFLINE;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{astrologer.name}</Text>
          <Text style={styles.title} numberOfLines={1}>{astrologer.title}</Text>

          <View style={styles.metaRow}>
            <Stars rating={astrologer.rating} />
            <Text style={styles.ratingText}>{astrologer.rating}</Text>
            <View style={styles.divider} />
            <Text style={styles.consultations}>{astrologer.consultations}+ chats</Text>
          </View>
        </View>

        <Text style={styles.expText}>{astrologer.experience}</Text>
      </View>

      <View style={styles.tagRow}>
        {astrologer.specialties.map((s, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.price}>₹{astrologer.pricePerMin}/min</Text>
          <Text style={styles.statusLabel}>
            {astrologer.status === 'online' ? '🟢 Online' : astrologer.status === 'busy' ? '🟡 Busy' : '⚪ Offline'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.chatBtn, astrologer.status === 'offline' && styles.disabledBtn]}
          disabled={astrologer.status === 'offline'}
          onPress={onChatPress}
          activeOpacity={0.8}
        >
          <Text style={styles.chatBtnText}>
            {astrologer.status === 'online' ? 'Chat Now' : astrologer.status === 'busy' ? 'In Queue' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    shadowColor: '#5B1F24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E3125',
  },
  title: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  divider: {
    width: 1,
    height: 8,
    backgroundColor: '#E5D7C3',
  },
  consultations: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9a8c7a',
  },
  expText: {
    fontSize: 9,
    fontWeight: '700',
    color: MAROON,
    backgroundColor: '#FAF3E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#5B4A32',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    marginTop: 12,
    paddingTop: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: MAROON,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8B7355',
    marginTop: 2,
  },
  chatBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledBtn: {
    backgroundColor: '#E5D7C3',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
