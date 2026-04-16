import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { backdropUrl } from '../../api/tmdb';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 280;

export default function HeroBanner({ movie, onPlay, onAddToList, isInList }) {
  if (!movie) return null;

  const imageUri = backdropUrl(movie.backdrop_path) || backdropUrl(movie.poster_path);
  const title = movie.title || movie.name || 'Unknown';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime = movie.runtime ? `${movie.runtime} min` : '';
  const overview = movie.overview || '';

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.image}
        imageStyle={styles.imageBg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.7)', '#0A0A0A']}
          locations={[0.1, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Meta info */}
        <View style={styles.meta}>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{rating}</Text>
            {year ? <Text style={styles.separator}>•</Text> : null}
            {year ? <Text style={styles.year}>{year}</Text> : null}
            {runtime ? <Text style={styles.separator}>•</Text> : null}
            {runtime ? <Text style={styles.runtime}>{runtime}</Text> : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.overview} numberOfLines={2}>{overview}</Text>
        </View>
      </ImageBackground>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => onPlay && onPlay(movie)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.red, Colors.redDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playGradient}
          >
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playText}>Play Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, isInList && styles.addBtnActive]}
          onPress={() => onAddToList && onAddToList(movie)}
          activeOpacity={0.85}
        >
          <Text style={styles.addIcon}>{isInList ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT,
    justifyContent: 'flex-end',
  },
  imageBg: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  meta: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  star: {
    fontSize: 13,
  },
  rating: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  separator: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  year: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  runtime: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  overview: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: Colors.bgCard,
  },
  playBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  playIcon: {
    color: Colors.white,
    fontSize: 14,
  },
  playText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1.5,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: Colors.redLight,
    borderColor: Colors.red,
  },
  addIcon: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
