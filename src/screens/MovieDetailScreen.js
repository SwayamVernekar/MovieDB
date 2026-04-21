import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';
import {
  backdropUrl,
  imgUrl,
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
} from '../api/tmdb';

const { width } = Dimensions.get('window');
const POSTER_WIDTH = 120;
const POSTER_HEIGHT = 180;

function formatRuntime(minutes) {
  if (!minutes || Number.isNaN(minutes)) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs <= 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function formatMoney(value) {
  if (!value || Number.isNaN(value)) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  } catch (err) {
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }
}

function pickBestTrailer(videos = []) {
  if (!videos.length) return null;
  const isYouTube = (v) => v?.site === 'YouTube' && v?.key;
  const isTrailer = (v) => (v?.type || '').toLowerCase() === 'trailer';
  const isTeaser = (v) => (v?.type || '').toLowerCase() === 'teaser';

  const officialTrailer = videos.find((v) => isYouTube(v) && isTrailer(v) && v.official);
  if (officialTrailer) return officialTrailer;

  const trailer = videos.find((v) => isYouTube(v) && isTrailer(v));
  if (trailer) return trailer;

  const teaser = videos.find((v) => isYouTube(v) && isTeaser(v));
  if (teaser) return teaser;

  return videos.find((v) => isYouTube(v)) || null;
}

export default function MovieDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const movieId = params.movieId || params.movie?.id;

  const [detail, setDetail] = useState(params.movie || null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!movieId) {
        if (mounted) {
          setError('Movie not found.');
          setLoading(false);
        }
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const [detailData, creditsData, videosData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getMovieVideos(movieId),
        ]);
        if (mounted) {
          setDetail(detailData);
          setCredits(creditsData);
          setTrailer(pickBestTrailer(videosData?.results || []));
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Could not load movie details.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [movieId]);

  const title = detail?.title || detail?.name || 'Movie';
  const backdrop = backdropUrl(detail?.backdrop_path) || backdropUrl(detail?.poster_path);
  const poster = imgUrl(detail?.poster_path, 'w342');
  const rating = detail?.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
  const year = (detail?.release_date || detail?.first_air_date || '').slice(0, 4);
  const runtime = formatRuntime(detail?.runtime);
  const genres = (detail?.genres || []).map((g) => g.name).join(', ');
  const cast = useMemo(() => (credits?.cast || []).slice(0, 10), [credits]);
  const trailerUrl = trailer?.key
    ? `https://www.youtube.com/embed/${trailer.key}?controls=1&modestbranding=1&playsinline=1`
    : null;

  const content = (
    <>
      <View style={styles.heroWrap}>
        {backdrop ? (
          <Image source={{ uri: backdrop }} style={styles.backdrop} resizeMode="cover" />
        ) : (
          <View style={[styles.backdrop, styles.backdropFallback]} />
        )}

        <LinearGradient
          colors={Colors.gradientHero}
          locations={[0.1, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.posterFallback]}>
              <Text style={styles.posterEmoji}>🎬</Text>
            </View>
          )}

          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.rating}>⭐ {rating}</Text>
              {year ? <Text style={styles.metaText}>{year}</Text> : null}
              {runtime ? <Text style={styles.metaText}>{runtime}</Text> : null}
            </View>
            {genres ? <Text style={styles.genres}>{genres}</Text> : null}
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.red} size="large" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.body}>
          {detail?.tagline ? (
            <Text style={styles.tagline}>"{detail.tagline}"</Text>
          ) : null}

          {detail?.overview ? (
            <Text style={styles.overview}>{detail.overview}</Text>
          ) : null}

          <View style={styles.infoGrid}>
            {detail?.status ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{detail.status}</Text>
              </View>
            ) : null}
            {detail?.budget ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Budget</Text>
                <Text style={styles.infoValue}>{formatMoney(detail.budget)}</Text>
              </View>
            ) : null}
            {detail?.revenue ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Revenue</Text>
                <Text style={styles.infoValue}>{formatMoney(detail.revenue)}</Text>
              </View>
            ) : null}
          </View>

          {cast.length > 0 ? (
            <View style={styles.castSection}>
              <Text style={styles.sectionTitle}>Top Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((person) => {
                  const profile = imgUrl(person.profile_path, 'w185');
                  return (
                    <View key={person.id} style={styles.castCard}>
                      {profile ? (
                        <Image source={{ uri: profile }} style={styles.castImg} />
                      ) : (
                        <View style={[styles.castImg, styles.castFallback]}>
                          <Text style={styles.castEmoji}>👤</Text>
                        </View>
                      )}
                      <Text style={styles.castName} numberOfLines={1}>
                        {person.name}
                      </Text>
                      <Text style={styles.castRole} numberOfLines={1}>
                        {person.character}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.trailerSection}>
            <Text style={styles.sectionTitle}>Trailer</Text>
            {trailerUrl ? (
              <TouchableOpacity
                style={styles.trailerCard}
                onPress={() => setTrailerOpen((prev) => !prev)}
                activeOpacity={0.85}
              >
                {backdrop ? (
                  <Image source={{ uri: backdrop }} style={styles.trailerPoster} />
                ) : (
                  <View style={styles.trailerPosterFallback} />
                )}
                <View style={styles.trailerOverlay} />
                <View style={styles.trailerPlay}>
                  <Text style={styles.trailerPlayIcon}>▶</Text>
                </View>
                <Text style={styles.trailerCardText}>
                  {Platform.OS === 'web' && trailerOpen ? 'Hide Trailer' : 'Play Trailer'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.trailerFallback}>
                <Text style={styles.trailerFallbackText}>Trailer not available.</Text>
              </View>
            )}
            {Platform.OS === 'web' && trailerOpen && trailerUrl ? (
              <View style={styles.trailerInlineFrame}>
                {React.createElement('iframe', {
                  src: trailerUrl,
                  title: `${title} trailer`,
                  style: styles.trailerWebFrame,
                  frameBorder: '0',
                  allow:
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                  allowFullScreen: true,
                })}
              </View>
            ) : null}
          </View>
        </View>
      )}

      <View style={{ height: 24 }} />
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>

      {trailerOpen && Platform.OS !== 'web' ? (
        <Modal
          visible={trailerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setTrailerOpen(false)}
        >
          <View style={styles.trailerModalBackdrop}>
            <View style={styles.trailerModalCard}>
              <TouchableOpacity
                style={styles.trailerClose}
                onPress={() => setTrailerOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.trailerCloseText}>✕</Text>
              </TouchableOpacity>

              {trailerUrl ? (
                <WebView
                  source={{ uri: trailerUrl }}
                  style={styles.trailerModalWebView}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction
                />
              ) : null}
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    ...(Platform.OS === 'web' ? { height: '100vh' } : null),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  heroWrap: {
    position: 'relative',
    height: 280,
    marginBottom: 10,
  },
  backdrop: {
    width,
    height: 280,
    backgroundColor: Colors.bgCard,
  },
  backdropFallback: {
    backgroundColor: Colors.bgCard2,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  heroContent: {
    position: 'absolute',
    bottom: -30,
    left: 18,
    right: 18,
    flexDirection: 'row',
    gap: 14,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  posterEmoji: {
    fontSize: 30,
  },
  meta: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  rating: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  genres: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  loader: {
    marginTop: 60,
  },
  errorBox: {
    marginHorizontal: 18,
    marginTop: 50,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  body: {
    paddingTop: 48,
    paddingHorizontal: 18,
  },
  tagline: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  overview: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  infoItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  castSection: {
    marginTop: 6,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  trailerSection: {
    marginTop: 22,
  },
  trailerCard: {
    height: 210,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.bgCard,
    justifyContent: 'flex-end',
  },
  trailerPoster: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  trailerPosterFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgCard2,
  },
  trailerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  trailerPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  trailerPlayIcon: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 2,
  },
  trailerCardText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  trailerFallback: {
    height: 210,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailerFallbackText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  trailerInlineFrame: {
    marginTop: 12,
    height: 360,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.bgCard,
  },
  trailerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  trailerModalCard: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  trailerModalWebView: {
    height: 360,
    backgroundColor: Colors.bgCard,
  },
  trailerClose: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  trailerCloseText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  trailerWebFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  castCard: {
    width: 92,
    marginRight: 12,
  },
  castImg: {
    width: 92,
    height: 120,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
  },
  castFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  castEmoji: {
    fontSize: 20,
  },
  castName: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  castRole: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
