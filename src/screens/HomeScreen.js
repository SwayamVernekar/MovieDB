import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getGenres,
  getMovieDetails,
  getMoviesByGenre,
} from '../api/tmdb';
import { useUser } from '../context/UserContext';

import Header from '../components/home/Header';
import GenreFilter from '../components/home/GenreFilter';
import HeroBanner from '../components/home/HeroBanner';
import SectionRow from '../components/home/SectionRow';
import TrailerModal from '../components/common/TrailerModal';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addToList, removeFromList, isInList } = useUser();

  const [hero, setHero] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [error, setError] = useState(null);

  // Genre-filtered results
  const [genreMovies, setGenreMovies] = useState([]);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const genreFetchId = useRef(0);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // Genres (non-blocking, don't fail if this fails)
      getGenres()
        .then((d) => setGenres(d.genres || []))
        .catch(() => {});

      // Hero + Trending
      setLoadingTrending(true);
      setLoadingHero(true);
      const trendingData = await getTrendingMovies();
      const results = (trendingData.results || []).filter(
        (r) => r.poster_path || r.backdrop_path
      );
      setTrending(results.slice(0, 10));
      setLoadingTrending(false);

      // Set hero from first result immediately, then enrich with details
      if (results.length > 0) {
        setHero(results[0]);
        setLoadingHero(false);
        // Try to get runtime in background
        getMovieDetails(results[0].id)
          .then((detail) => setHero(detail))
          .catch(() => {}); // keep basic data if detail fails
      } else {
        setLoadingHero(false);
      }

      // Popular
      setLoadingPopular(true);
      const popularData = await getPopularMovies();
      setPopular(
        (popularData.results || [])
          .filter((r) => r.poster_path)
          .slice(0, 10)
      );
      setLoadingPopular(false);

      // Top Rated
      setLoadingTopRated(true);
      const topRatedData = await getTopRatedMovies();
      setTopRated(
        (topRatedData.results || [])
          .filter((r) => r.poster_path)
          .slice(0, 10)
      );
      setLoadingTopRated(false);
    } catch (err) {
      console.error('HomeScreen fetch error:', err);
      setError('Could not load content. Pull down to retry.');
      setLoadingHero(false);
      setLoadingTrending(false);
      setLoadingPopular(false);
      setLoadingTopRated(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch movies by selected genre
  useEffect(() => {
    if (selectedGenre === 0) {
      setGenreMovies([]);
      setLoadingGenre(false);
      return;
    }

    const fetchId = ++genreFetchId.current;
    setLoadingGenre(true);
    setGenreMovies([]);

    getMoviesByGenre(selectedGenre)
      .then((data) => {
        if (fetchId !== genreFetchId.current) return; // stale
        const results = (data.results || []).filter(
          (r) => r.poster_path || r.backdrop_path
        );
        setGenreMovies(results.slice(0, 20));
        // Update hero to first genre result (enrich in background)
        if (results.length > 0) {
          setHero(results[0]);
          getMovieDetails(results[0].id)
            .then((detail) => {
              if (fetchId !== genreFetchId.current) return;
              setHero(detail);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (fetchId !== genreFetchId.current) return;
        setGenreMovies([]);
      })
      .finally(() => {
        if (fetchId !== genreFetchId.current) return;
        setLoadingGenre(false);
      });
  }, [selectedGenre]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddToList = (movie) => {
    if (isInList(movie.id)) {
      removeFromList(movie.id);
    } else {
      addToList(movie);
    }
  };

  const handlePlay = (movie) => {
    if (movie) setTrailerMovie(movie);
  };

  const handleSeeAll = ({ title, emoji, fetchType, genreId }) => {
    navigation.navigate('SeeAll', { title, emoji, fetchType, genreId });
  };

  const handleMoviePress = (movie) => {
    if (!movie) return;
    navigation.navigate('MovieDetail', { movieId: movie.id, movie });
  };

  // Navigate to Profile tab (within bottom tab navigator)
  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.red}
            colors={[Colors.red]}
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Header onProfilePress={handleProfilePress} />

        {/* Genre filter */}
        <GenreFilter
          genres={genres}
          selectedId={selectedGenre}
          onSelect={setSelectedGenre}
        />

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Banner */}
        {loadingHero ? (
          <View style={styles.heroSkeleton}>
            <ActivityIndicator color={Colors.red} size="large" />
          </View>
        ) : (
          <HeroBanner
            movie={hero}
            onPlay={handlePlay}
            onAddToList={handleAddToList}
            isInList={hero ? isInList(hero.id) : false}
          />
        )}

        {/* Genre-filtered results OR default sections */}
        {selectedGenre !== 0 ? (
          <SectionRow
            title="Genre Results"
            emoji="🎭"
            movies={genreMovies}
            loading={loadingGenre}
            onMoviePress={handleMoviePress}
            onSeeAll={() =>
              handleSeeAll({
                title: 'Genre Results',
                emoji: '🎭',
                fetchType: 'genre',
                genreId: selectedGenre,
              })
            }
          />
        ) : (
          <>
            {/* Top Trending Now */}
            <SectionRow
              title="Top Trending Now"
              emoji="🔥"
              movies={trending}
              loading={loadingTrending}
              onMoviePress={handleMoviePress}
              onSeeAll={() =>
                handleSeeAll({ title: 'Top Trending Now', emoji: '🔥', fetchType: 'trending' })
              }
            />

            {/* Popular This Week */}
            <SectionRow
              title="Popular This Week"
              emoji="🗓️"
              movies={popular}
              loading={loadingPopular}
              onMoviePress={handleMoviePress}
              onSeeAll={() =>
                handleSeeAll({ title: 'Popular This Week', emoji: '🗓️', fetchType: 'popular' })
              }
            />

            {/* Recommended For You */}
            <SectionRow
              title="Recommended For You"
              emoji="✨"
              movies={topRated}
              loading={loadingTopRated}
              onMoviePress={handleMoviePress}
              onSeeAll={() =>
                handleSeeAll({ title: 'Recommended For You', emoji: '✨', fetchType: 'topRated' })
              }
            />
          </>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Trailer Modal */}
      <TrailerModal
        visible={!!trailerMovie}
        movieId={trailerMovie?.id}
        title={trailerMovie?.title || trailerMovie?.name}
        onClose={() => setTrailerMovie(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  heroSkeleton: {
    height: 300,
    marginHorizontal: 18,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.red,
    marginLeft: 10,
  },
  retryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
