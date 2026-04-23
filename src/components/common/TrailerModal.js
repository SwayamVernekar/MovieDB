/**
 * TrailerModal
 * ─────────────────────────────────────────────────────────────────
 * Platform-aware — mirrors the InlineTrailer approach in MovieDetailScreen:
 *
 *  Web    → <iframe> embedded YouTube player. Fades in over dark overlay.
 *  Native → YouTube thumbnail + play button. Tapping opens the YouTube
 *            app (deep-link) or browser. WebView is NOT used because
 *            YouTube blocks embedding in WebView on mobile.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { getMovieVideos } from '../../api/tmdb';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(width * (9 / 16));

// ─── Pick best trailer from TMDB video list ──────────────────────
function pickTrailer(videos = []) {
  const yt = (v) => v?.site === 'YouTube' && v?.key;
  return (
    videos.find((v) => yt(v) && v.type === 'Trailer' && v.official) ||
    videos.find((v) => yt(v) && v.type === 'Trailer') ||
    videos.find((v) => yt(v) && v.type === 'Teaser') ||
    videos.find((v) => yt(v)) ||
    null
  );
}

// ─── Player: web = iframe, native = thumbnail + deep-link ────────
function TrailerPlayer({ trailerKey, title }) {
  const embedUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
  const thumbUrl = `https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg`;

  if (Platform.OS === 'web') {
    // Web: inline iframe — always works
    return (
      <View style={styles.playerContainer}>
        {React.createElement('iframe', {
          src: embedUrl,
          title: title || 'Trailer',
          frameBorder: '0',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#000',
          },
        })}
      </View>
    );
  }

  // Native: thumbnail card → opens YouTube app / browser
  const openYouTube = () => {
    const appUrl = `youtube://watch?v=${trailerKey}`;
    Linking.canOpenURL(appUrl)
      .then((can) => Linking.openURL(can ? appUrl : watchUrl))
      .catch(() => Linking.openURL(watchUrl));
  };

  return (
    <TouchableOpacity
      style={styles.playerContainer}
      onPress={openYouTube}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: thumbUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Dark scrim */}
      <View style={styles.scrim} />
      {/* Play circle */}
      <View style={styles.playCircle}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
      {/* Label */}
      <View style={styles.tapLabel}>
        <Text style={styles.tapLabelText}>Tap to watch on YouTube</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Modal ───────────────────────────────────────────────────────
export default function TrailerModal({ visible, movieId, title, onClose }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch trailer when modal opens
  useEffect(() => {
    if (!visible || !movieId) return;

    setTrailerKey(null);
    setError(null);
    setLoading(true);

    getMovieVideos(movieId)
      .then((data) => {
        const trailer = pickTrailer(data.results || []);
        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setError('No trailer available for this title.');
        }
      })
      .catch(() => setError('Failed to load trailer. Check your connection.'))
      .finally(() => setLoading(false));
  }, [visible, movieId]);

  // Fade-in / reset animation
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title || 'Trailer'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Player area */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.red} size="large" />
            <Text style={styles.loadingText}>Loading trailer…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.center}>
            <Text style={styles.errorIcon}>🎬</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {trailerKey && !loading && (
          <TrailerPlayer trailerKey={trailerKey} title={title} />
        )}

        {/* Tap-outside-to-close area */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 14,
    gap: 12,
  },
  titleText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Player
  playerContainer: {
    width,
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  playCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -32,
    marginTop: -32,
  },
  playIcon: {
    color: Colors.white,
    fontSize: 24,
    marginLeft: 4,
  },
  tapLabel: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapLabelText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  // States
  center: {
    height: PLAYER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  errorIcon: { fontSize: 48 },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  dismissBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.red,
  },
  dismissText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  backdrop: { flex: 1 },
});
