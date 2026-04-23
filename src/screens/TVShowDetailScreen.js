import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  backdropUrl,
  imgUrl,
  getTVShowDetails,
  getTVShowCredits,
  getTVShowVideos,
} from '../api/tmdb';
import { useUser } from '../context/UserContext';

// ─── Helpers ──────────────────────────────────────────────────────

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

const SCREEN_W = Dimensions.get('window').width;
const TRAILER_H = Math.round((SCREEN_W - 32) * (9 / 16));
const HERO_H = 280;
const POSTER_W = 110;
const POSTER_H = 165;

// ─── Inline Trailer (same pattern as MovieDetailScreen) ──────────
function InlineTrailer({ trailerKey, title }) {
  const embedUrl = `https://www.youtube.com/embed/${trailerKey}?controls=1&modestbranding=1&playsinline=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
  const thumbUrl = `https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg`;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.trailerBox}>
        {React.createElement('iframe', {
          src: embedUrl,
          title: title || 'Trailer',
          frameBorder: '0',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowFullScreen: true,
          style: { width: '100%', height: '100%', border: 'none', display: 'block' },
        })}
      </View>
    );
  }

  const openYouTube = () => {
    const appUrl = `youtube://watch?v=${trailerKey}`;
    Linking.canOpenURL(appUrl)
      .then((can) => Linking.openURL(can ? appUrl : watchUrl))
      .catch(() => Linking.openURL(watchUrl));
  };

  return (
    <TouchableOpacity style={styles.trailerBox} onPress={openYouTube} activeOpacity={0.88}>
      <Image source={{ uri: thumbUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.trailerOverlay} />
      <View style={styles.playCircle}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
      <View style={styles.trailerLabel}>
        <Text style={styles.trailerLabelText}>Tap to watch trailer</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function TVShowDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { addToList, removeFromList, isInList, markWatched, removeFromWatched, isWatched } = useUser();

  const params = route?.params || {};
  const tvId = params.tvId ?? params.show?.id ?? params.movieId;

  const [detail, setDetail] = useState(params.show || params.movie || null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    async function load() {
      if (!tvId) { setError('TV show not found.'); setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const [det, cred, vids] = await Promise.all([
          getTVShowDetails(tvId),
          getTVShowCredits(tvId),
          getTVShowVideos(tvId),
        ]);
        if (!live) return;
        setDetail(det);
        setCredits(cred);
        setTrailer(pickTrailer(vids?.results || []));
      } catch {
        if (live) setError('Could not load TV show details.');
      } finally {
        if (live) setLoading(false);
      }
    }
    load();
    return () => { live = false; };
  }, [tvId]);

  // ── Derived ────────────────────────────────────────────────────
  const name        = detail?.name || detail?.original_name || 'TV Show';
  const tagline     = detail?.tagline || '';
  const overview    = detail?.overview || '';
  const rating      = detail?.vote_average ? detail.vote_average.toFixed(1) : null;
  const firstAir    = (detail?.first_air_date || '').slice(0, 4);
  const lastAir     = (detail?.last_air_date || '').slice(0, 4);
  const airRange    = firstAir && lastAir && firstAir !== lastAir ? `${firstAir}–${lastAir}` : firstAir;
  const seasons     = detail?.number_of_seasons;
  const episodes    = detail?.number_of_episodes;
  const status      = detail?.status || null;
  const genres      = detail?.genres || [];
  const networks    = (detail?.networks || []).map((n) => n.name).join(', ') || null;
  const createdBy   = (detail?.created_by || []).map((c) => c.name).join(', ') || null;
  const langs       = (detail?.spoken_languages || []).map((l) => l.english_name).join(', ') || null;
  const cast        = useMemo(() => (credits?.cast || []).slice(0, 12), [credits]);
  const backdrop    = backdropUrl(detail?.backdrop_path) || imgUrl(detail?.poster_path, 'w780');
  const poster      = imgUrl(detail?.poster_path, 'w342');
  const inList      = detail ? isInList(detail.id) : false;
  const hasWatched  = detail ? isWatched(detail.id) : false;

  const ratingColor =
    rating && parseFloat(rating) >= 7.5
      ? '#4CAF50'
      : rating && parseFloat(rating) >= 6
      ? Colors.gold
      : '#FF7043';

  const BackBtn = () => (
    <TouchableOpacity
      style={[styles.backBtn, { top: insets.top + 12 }]}
      onPress={() => navigation.goBack()}
      activeOpacity={0.8}
    >
      <Text style={styles.backBtnText}>←</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <BackBtn />
        <ActivityIndicator color={Colors.red} size="large" />
        <Text style={styles.loadingLabel}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <BackBtn />
        <Text style={styles.errorMsg}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.scrollerContent}
        showsVerticalScrollIndicator={false}
      >
        <BackBtn />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {backdrop ? (
            <Image source={{ uri: backdrop }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: Colors.bgCard2 }]} />
          )}
          <LinearGradient
            colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.5)', Colors.bg]}
            locations={[0.15, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* TV Show badge */}
          <View style={styles.tvBadge}>
            <Text style={styles.tvBadgeText}>📺 TV SHOW</Text>
          </View>
        </View>

        {/* ── Poster + Title Row ───────────────────────────────── */}
        <View style={styles.titleRow}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterFallback]}>
              <Text style={{ fontSize: 32 }}>📺</Text>
            </View>
          )}

          <View style={styles.titleCol}>
            <Text style={styles.showTitle} numberOfLines={3}>{name}</Text>

            {/* Rating · Air dates */}
            <View style={styles.pillRow}>
              {rating && (
                <View style={[styles.ratingPill, { borderColor: ratingColor }]}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={[styles.ratingVal, { color: ratingColor }]}>{rating}</Text>
                </View>
              )}
              {airRange ? <Text style={styles.metaPill}>{airRange}</Text> : null}
              {seasons ? (
                <Text style={styles.metaPill}>
                  {seasons} {seasons === 1 ? 'Season' : 'Seasons'}
                </Text>
              ) : null}
              {episodes ? <Text style={styles.metaPill}>{episodes} Eps</Text> : null}
            </View>

            {/* Genres */}
            {genres.length > 0 && (
              <View style={styles.genreRow}>
                {genres.slice(0, 3).map((g) => (
                  <View key={g.id} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{g.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons Row */}
            <View style={styles.actionBtnRow}>
              {/* My List Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => (inList ? removeFromList(detail.id) : addToList(detail))}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={inList ? ['#2a2a2a', '#1a1a1a'] : [Colors.red, Colors.redDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtnGrad}
                >
                  <Text style={styles.actionBtnText}>{inList ? '✓ In List' : '+ My List'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Watched Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => (hasWatched ? removeFromWatched(detail.id) : markWatched(detail))}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={hasWatched ? ['#2a2a2a', '#1a1a1a'] : [Colors.red, Colors.redDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtnGrad}
                >
                  <Text style={styles.actionBtnText}>{hasWatched ? '✓ Watched' : '👁 Watched'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Tagline ──────────────────────────────────────────── */}
        {tagline ? <Text style={styles.tagline}>"{tagline}"</Text> : null}

        {/* ── Overview ─────────────────────────────────────────── */}
        {overview ? (
          <View style={styles.section}>
            <SectionHead label="Overview" />
            <Text style={styles.overviewText}>{overview}</Text>
          </View>
        ) : null}

        {/* ── Trailer ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHead label="Trailer" />
          {trailer?.key ? (
            <InlineTrailer trailerKey={trailer.key} title={name} />
          ) : (
            <View style={styles.noTrailer}>
              <Text style={styles.noTrailerText}>No trailer available</Text>
            </View>
          )}
        </View>

        {/* ── Details Grid ─────────────────────────────────────── */}
        {(status || networks || createdBy || langs) ? (
          <View style={styles.section}>
            <SectionHead label="Details" />
            <View style={styles.detailGrid}>
              {status     ? <DetailCard label="Status"     value={status} /> : null}
              {networks   ? <DetailCard label="Network"    value={networks} /> : null}
              {createdBy  ? <DetailCard label="Created By" value={createdBy} /> : null}
              {langs      ? <DetailCard label="Language"   value={langs} /> : null}
              {seasons    ? <DetailCard label="Seasons"    value={String(seasons)} /> : null}
              {episodes   ? <DetailCard label="Episodes"   value={String(episodes)} /> : null}
            </View>
          </View>
        ) : null}

        {/* ── Cast ─────────────────────────────────────────────── */}
        {cast.length > 0 ? (
          <View style={styles.section}>
            <SectionHead label="Top Cast" />
            <FlatList
              data={cast}
              keyExtractor={(p) => String(p.id)}
              renderItem={({ item }) => <CastCard person={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castRow}
              nestedScrollEnabled
            />
          </View>
        ) : null}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Small Sub-Components ─────────────────────────────────────────

function SectionHead({ label }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

function DetailCard({ label, value }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function CastCard({ person }) {
  const photo = imgUrl(person.profile_path, 'w185');
  return (
    <View style={styles.castCard}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.castPhoto} />
      ) : (
        <View style={[styles.castPhoto, styles.castPhotoEmpty]}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
      )}
      <Text style={styles.castName} numberOfLines={2}>{person.name}</Text>
      <Text style={styles.castChar} numberOfLines={1}>{person.character}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingLabel: { color: Colors.textMuted, fontSize: 13, marginTop: 8 },
  errorMsg: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: 'center', paddingHorizontal: 32,
  },

  // Back button
  backBtn: {
    position: 'absolute', left: 16, zIndex: 99,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1, borderColor: Colors.dividerStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: Colors.white, fontSize: 20, fontWeight: '700', lineHeight: 22 },

  // ScrollView
  scroller: { flex: 1 },
  scrollerContent: { paddingBottom: 32 },

  // Hero
  hero: { height: HERO_H, width: '100%', backgroundColor: Colors.bgCard },
  heroImage: { width: '100%', height: HERO_H },
  tvBadge: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: 'rgba(229,57,53,0.9)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  tvBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Poster + title
  titleRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    marginTop: -(POSTER_H / 2), gap: 14, alignItems: 'flex-end',
  },
  poster: {
    width: POSTER_W, height: POSTER_H, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.dividerStrong,
    backgroundColor: Colors.bgCard,
  },
  posterFallback: { alignItems: 'center', justifyContent: 'center' },
  titleCol: { flex: 1, gap: 8, paddingBottom: 4 },
  showTitle: {
    color: Colors.white, fontSize: 22, fontWeight: '800',
    lineHeight: 28, letterSpacing: 0.2,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ratingStar: { fontSize: 11 },
  ratingVal: { fontSize: 13, fontWeight: '800' },
  metaPill: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    backgroundColor: Colors.bgCard2, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.dividerStrong,
  },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  genreChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: Colors.redLight,
    borderWidth: 1, borderColor: Colors.redGlow,
  },
  genreChipText: { color: Colors.red, fontSize: 11, fontWeight: '700' },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionBtnGrad: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Tagline
  tagline: {
    color: Colors.textSecondary, fontSize: 14, fontStyle: 'italic',
    textAlign: 'center', marginTop: 20, marginHorizontal: 24, lineHeight: 20,
  },

  // Sections
  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 14,
  },
  sectionBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: Colors.red },
  sectionLabel: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  // Overview
  overviewText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },

  // Trailer
  trailerBox: {
    width: '100%', height: TRAILER_H, borderRadius: 14,
    overflow: 'hidden', backgroundColor: '#000',
    borderWidth: 1, borderColor: Colors.dividerStrong,
  },
  noTrailer: {
    height: 120, borderRadius: 14, backgroundColor: Colors.bgCard2,
    borderWidth: 1, borderColor: Colors.dividerStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  noTrailerText: { color: Colors.textMuted, fontSize: 13 },
  trailerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  playCircle: {
    position: 'absolute', top: '50%', left: '50%',
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 2, borderColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -30, marginTop: -30,
  },
  playIcon: { color: Colors.white, fontSize: 22, marginLeft: 3 },
  trailerLabel: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  trailerLabelText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

  // Details grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailCard: {
    flex: 1, minWidth: '44%', padding: 14,
    borderRadius: 14, backgroundColor: Colors.bgCard2,
    borderWidth: 1, borderColor: Colors.dividerStrong,
  },
  detailLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  detailValue: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  // Cast
  castRow: { gap: 12, paddingRight: 4 },
  castCard: { width: 84, alignItems: 'center' },
  castPhoto: {
    width: 72, height: 96, borderRadius: 12,
    backgroundColor: Colors.bgCard, marginBottom: 6,
  },
  castPhotoEmpty: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.dividerStrong,
  },
  castName: {
    color: Colors.white, fontSize: 11, fontWeight: '700',
    textAlign: 'center', lineHeight: 14, marginBottom: 2,
  },
  castChar: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
});
