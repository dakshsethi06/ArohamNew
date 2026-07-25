import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StarsProps {
  rating: number;
}

export const Stars: React.FC<StarsProps> = ({ rating }) => {
  const rounded = Math.round(rating);
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={[styles.star, i < rounded ? styles.active : styles.inactive]}>
          ★
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 1,
  },
  star: {
    fontSize: 12,
  },
  active: {
    color: '#D97706',
  },
  inactive: {
    color: '#E5D7C3',
  },
});
