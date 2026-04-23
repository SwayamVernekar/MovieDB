import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  imgUrl,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMoviesByGenre,
} from '../api/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLS = 3;
const SIDE_PAD = 16;
const GAP = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - SIDE_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;
const ITEM_HEIGHT = ITEM_WIDTH * 1.52;

// ─── Grid tile ────────────────────────────────────────────────────────────────
function GridItem({ movie, onPress }) {
  const uri = imgUrl(movie.poster_path, 'w342');
  const title = movie.title || movie.name || '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => onPress(movie)}
      activeOpacity={0.82}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <Text style={styles.fallbackIcon}>🎬</Text>
        </View>
      )}

      {rating && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {rating}</Text>
        </View>
      )}

      <Text style={styles.tileTitle} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
function makeFetcher(fetchType, genreId) {
  switch (fetchType) {
    case 'trending':
      return (page) => getTrendingMovies(page);
    case 'popular':
      return (page) => getPopularMovies(page);
    case 'topRated':
      return (page) => getTopRatedMovies(page);
    case 'genre':
      return (page) => getMoviesByGenre(genreId, page);
    default:
      return (page) => getPopularMovies(page);
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SeeAllScreen({ navigation, route }) {
  const { title, emoji, fetchType, genreId } = route.params || {};
  const insets = useSafeAreaInsets();

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetcher = makeFetcher(fetchType, genreId);

  const loadPage = useCallback(
    async (p) => {
      const data = await fetcher(p);
      const results = (data.results || []).filter(
        (r) => r.poster_path || r.backdrop_path
      );
      setTotalPages(data.total_pages || 1);
      return results;
    },
    [fetchType, genreId]
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    setError(null);
    setMovies([]);
    setPage(1);
    loadPage(1)
      .then((results) => setMovies(results))
      .catch(() => setError('Failed to load. Pull down to retry.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    loadPage(next)
      .then((results) => setMovies((prev) => [...prev, ...results]))
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movieId: movie.id, movie });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
          <Text style={styles.screenTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Spacer to balance the back button */}
        <View style={styles.backBtn} />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.red} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              setError(null);
              loadPage(1)
                .then((r) => setMovies(r))
                .catch(() => setError('Failed to load.'))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <GridItem movie={item} onPress={handleMoviePress} />
          )}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={Colors.red}
                size="small"
                style={styles.moreLoader}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  screenTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.red,
  },
  retryText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Grid
  grid: {
    paddingHorizontal: SIDE_PAD,
    paddingTop: 16,
    paddingBottom: 32,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    width: ITEM_WIDTH,
  },
  poster: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  fallbackIcon: { fontSize: 28 },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.25)',
  },
  ratingText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  tileTitle: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    width: ITEM_WIDTH,
  },

  // Load more
  moreLoader: {
    marginVertical: 24,
  },
});
