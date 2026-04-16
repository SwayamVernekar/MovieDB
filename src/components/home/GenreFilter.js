import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';

const STATIC_GENRES = [
  { id: 0, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 878, name: 'Sci-Fi' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
];

export default function GenreFilter({ genres, selectedId, onSelect }) {
  const list = genres && genres.length > 0
    ? [{ id: 0, name: 'All' }, ...genres]
    : STATIC_GENRES;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {list.map((g) => {
          const active = selectedId === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelect && onSelect(g.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 18,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  pillActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.white,
  },
});
