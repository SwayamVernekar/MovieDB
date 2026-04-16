import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { imgUrl } from '../../api/tmdb';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 130;
const CARD_HEIGHT = 185;

export default function MovieCard({ movie, onPress, showYear }) {
  if (!movie) return null;

  const imageUri = imgUrl(movie.poster_path, 'w342');
  const title = movie.title || movie.name || '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(movie)}
      activeOpacity={0.85}
    >
      {/* Poster */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <Text style={styles.fallbackText}>🎬</Text>
        </View>
      )}

      {/* Gradient overlay at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        locations={[0.5, 1]}
        style={styles.gradient}
      />

      {/* Rating badge top-left */}
      {rating && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>⭐</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      )}

      {/* Title & year below card */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {showYear && year ? (
        <Text style={styles.year}>{year}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  fallbackText: {
    fontSize: 32,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.3)',
  },
  ratingStar: {
    fontSize: 10,
  },
  ratingText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    width: CARD_WIDTH,
  },
  year: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
