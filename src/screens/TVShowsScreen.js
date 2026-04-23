import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { getPopularTV, getTrendingTV } from '../api/tmdb';
import SectionRow from '../components/home/SectionRow';
import { ScrollView } from 'react-native';

export default function TVShowsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingT, setLoadingT] = useState(true);

  useEffect(() => {
    getPopularTV().then((d) => { setPopular((d.results || []).slice(0, 10)); setLoadingP(false); });
    getTrendingTV().then((d) => { setTrending((d.results || []).slice(0, 10)); setLoadingT(false); });
  }, []);

  const handlePress = (show) => {
    navigation.navigate('TVShowDetail', { tvId: show.id, show });
  };

  const handleSeeAll = ({ title, emoji, fetchType }) => {
    navigation.navigate('SeeAll', { title, emoji, fetchType });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Text style={styles.title}>TV Shows</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionRow
          title="Popular TV Shows"
          emoji="📺"
          movies={popular}
          loading={loadingP}
          onMoviePress={handlePress}
          onSeeAll={() => handleSeeAll({ title: 'Popular TV Shows', emoji: '📺', fetchType: 'popularTV' })}
        />
        <SectionRow
          title="Trending TV"
          emoji="🔥"
          movies={trending}
          loading={loadingT}
          onMoviePress={handlePress}
          onSeeAll={() => handleSeeAll({ title: 'Trending TV', emoji: '🔥', fetchType: 'trendingTV' })}
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
