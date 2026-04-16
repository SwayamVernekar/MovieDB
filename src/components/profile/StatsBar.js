import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

function StatItem({ value, label, highlight }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatsBar({ watchedCount, listCount, avgRating }) {
  return (
    <View style={styles.container}>
      <StatItem value={watchedCount} label="Watched" highlight />
      <View style={styles.divider} />
      <StatItem value={listCount} label="My List" highlight />
      <View style={styles.divider} />
      <StatItem value={avgRating} label="Avg Rating" highlight />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 24,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statValueHighlight: {
    color: Colors.red,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.dividerStrong,
  },
});
