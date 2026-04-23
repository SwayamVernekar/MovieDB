import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { getPopularMovies, getTopRatedMovies } from '../api/tmdb';
import SectionRow from '../components/home/SectionRow';

export default function MoviesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingT, setLoadingT] = useState(true);

  useEffect(() => {
    getPopularMovies().then((d) => { setPopular((d.results || []).slice(0, 10)); setLoadingP(false); });
    getTopRatedMovies().then((d) => { setTopRated((d.results || []).slice(0, 10)); setLoadingT(false); });
  }, []);

  const handleMoviePress = (movie) => {
    if (!movie) return;
    navigation.navigate('MovieDetail', { movieId: movie.id, movie });
  };

  const handleSeeAll = ({ title, emoji, fetchType }) => {
    navigation.navigate('SeeAll', { title, emoji, fetchType });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Text style={styles.title}>Movies</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionRow
          title="Popular Movies"
          emoji="🎬"
          movies={popular}
          loading={loadingP}
          onMoviePress={handleMoviePress}
          onSeeAll={() => handleSeeAll({ title: 'Popular Movies', emoji: '🎬', fetchType: 'popular' })}
        />
        <SectionRow
          title="Top Rated"
          emoji="⭐"
          movies={topRated}
          loading={loadingT}
          onMoviePress={handleMoviePress}
          onSeeAll={() => handleSeeAll({ title: 'Top Rated', emoji: '⭐', fetchType: 'topRated' })}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
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
});
