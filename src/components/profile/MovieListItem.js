import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { imgUrl } from '../../api/tmdb';

const { width } = Dimensions.get('window');

export default function MovieListItem({ movie, onRemove, cardWidth }) {
  if (!movie) return null;

  // Use provided width or fallback to a default (e.g. 130)
  const W = cardWidth || 130;
  const H = W * 1.4;

  const imageUri = imgUrl(movie.poster_path, 'w342');
  const title = movie.title || movie.name || '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const genre = movie.genre_names ? movie.genre_names[0] : '';

  return (
    <View style={[styles.wrapper, { width: W }]}>
      {/* Poster card */}
      <View style={[styles.card, { width: W, height: H }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Text style={styles.fallbackText}>🎬</Text>
          </View>
        )}

        {/* Rating badge */}
        {rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemove && onRemove(movie.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Info below poster */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.meta}>{[year, genre].filter(Boolean).join(' • ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    marginBottom: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
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
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  ratingStar: {
    fontSize: 10,
  },
  ratingText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  removeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
