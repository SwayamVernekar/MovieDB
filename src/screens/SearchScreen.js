import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { searchMulti } from '../api/tmdb';
import MovieCard from '../components/home/MovieCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Target ~130px cards (same as home screen), minimum 3 columns
const SIDE_PAD = 16;
const GAP = 10;
const TARGET_CARD = 130;
const NUM_COLS = Math.max(3, Math.floor((SCREEN_WIDTH - SIDE_PAD * 2 + GAP) / (TARGET_CARD + GAP)));
// Actual card width so MovieCard fills each column exactly
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMulti(query);
        setResults((data.results || []).filter((r) => r.poster_path));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handlePress = useCallback(
    (item) => {
      if (item.media_type === 'tv') {
        navigation?.navigate('TVShowDetail', { tvId: item.id, show: item });
      } else {
        navigation?.navigate('MovieDetail', { movieId: item.id, movie: item });
      }
    },
    [navigation]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Title */}
      <Text style={styles.title}>Search</Text>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search movies, series, shows..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* States */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.red} size="large" />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={handlePress}
              showYear
              cardWidth={CARD_WIDTH}
            />
          )}
        />
      ) : query.length > 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyText}>Search for your favourite movies & shows</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: SIDE_PAD,
    paddingTop: 12,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    marginHorizontal: SIDE_PAD,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchIcon: { fontSize: 15, opacity: 0.6 },
  input: { flex: 1, color: Colors.white, fontSize: 15 },
  clear: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  grid: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 32,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  loadingText: { color: Colors.textSecondary, fontSize: 14, marginTop: 8 },
  emptyEmoji: { fontSize: 44 },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
