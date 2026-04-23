import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { getMovieVideos } from '../../api/tmdb';
import { Colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export default function TrailerModal({ visible, movieId, title, onClose }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !movieId) return;

    setTrailerKey(null);
    setError(null);
    setLoading(true);

    getMovieVideos(movieId)
      .then((data) => {
        const videos = data.results || [];
        // Prefer official YouTube trailer, fallback to teaser or any clip
        const trailer =
          videos.find(
            (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
          ) ||
          videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
          videos.find((v) => v.site === 'YouTube');

        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setError('No trailer available for this title.');
        }
      })
      .catch(() => setError('Failed to load trailer. Check your connection.'))
      .finally(() => setLoading(false));
  }, [visible, movieId]);

  // Fade-in animation when the modal becomes visible
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

  const embedUri = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0&modestbranding=1`
    : null;

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
        {/* Header row */}
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
        <View style={styles.playerContainer}>
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

          {embedUri && !loading && (
            <WebView
              source={{ uri: embedUri }}
              style={styles.webview}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoader}>
                  <ActivityIndicator color={Colors.red} size="large" />
                </View>
              )}
            />
          )}
        </View>

        {/* Tap-outside-to-close backdrop (bottom area) */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      </Animated.View>
    </Modal>
  );
}

const PLAYER_HEIGHT = width * (9 / 16); // 16:9 aspect ratio

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
  playerContainer: {
    width,
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
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
  errorIcon: {
    fontSize: 48,
  },
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
  backdrop: {
    flex: 1,
  },
});
