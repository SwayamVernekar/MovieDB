import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import MovieCard from './MovieCard';

export default function SectionRow({
  title,
  emoji,
  movies,
  loading,
  onSeeAll,
  onMoviePress,
}) {
  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Movie list */}
      {loading ? (
        <ActivityIndicator
          color={Colors.red}
          size="small"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={onMoviePress}
              showYear
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  seeAll: {
    color: Colors.red,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingLeft: 18,
    paddingRight: 6,
  },
  loader: {
    height: 185,
    justifyContent: 'center',
  },
});
