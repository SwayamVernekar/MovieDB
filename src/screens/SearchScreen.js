import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { searchMulti, imgUrl } from '../api/tmdb';
import MovieCard from '../components/home/MovieCard';

export default function SearchScreen() {
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

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Text style={styles.title}>Search</Text>

      <View style={styles.searchContainer}>
        <Text style={styles.icon}>🔍</Text>
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
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.red} style={styles.loader} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MovieCard movie={item} showYear />
          )}
        />
      ) : query.length > 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    marginHorizontal: 18,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  icon: { fontSize: 15, opacity: 0.6 },
  input: { flex: 1, color: Colors.white, fontSize: 14 },
  clear: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 18, paddingBottom: 20 },
  row: { gap: 10, marginBottom: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
