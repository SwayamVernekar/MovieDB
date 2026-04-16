// ─────────────────────────────────────────────
//  TMDB API Client
//  Key: 94bfd32e9610bd6db53936e6f1afc944
// ─────────────────────────────────────────────

const API_KEY = '94bfd32e9610bd6db53936e6f1afc944';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Helper: build full image URL
export const imgUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

// Helper: backdrop URL (wider)
export const backdropUrl = (path) =>
  path ? `${IMAGE_BASE}/w780${path}` : null;

// Generic fetcher
async function tmdbFetch(endpoint, params = {}) {
  const query = new URLSearchParams({ api_key: API_KEY, language: 'en-US', ...params });
  const url = `${BASE_URL}${endpoint}?${query}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// ─── Endpoints ────────────────────────────────

/** Trending movies & TV for the week */
export const getTrending = (page = 1) =>
  tmdbFetch('/trending/all/week', { page });

/** Trending movies for the day (hero banner) */
export const getTrendingMovies = (page = 1) =>
  tmdbFetch('/trending/movie/day', { page });

/** Popular movies */
export const getPopularMovies = (page = 1) =>
  tmdbFetch('/movie/popular', { page });

/** Top rated movies */
export const getTopRatedMovies = (page = 1) =>
  tmdbFetch('/movie/top_rated', { page });

/** Movie genres list */
export const getGenres = () =>
  tmdbFetch('/genre/movie/list');

/** Movie details (includes runtime) */
export const getMovieDetails = (movieId) =>
  tmdbFetch(`/movie/${movieId}`);

/** Movie images */
export const getMovieImages = (movieId) =>
  tmdbFetch(`/movie/${movieId}/images`, { include_image_language: 'en,null' });

/** Search multi */
export const searchMulti = (query, page = 1) =>
  tmdbFetch('/search/multi', { query, page });

/** Popular TV shows */
export const getPopularTV = (page = 1) =>
  tmdbFetch('/tv/popular', { page });

/** Trending TV */
export const getTrendingTV = (page = 1) =>
  tmdbFetch('/trending/tv/week', { page });

/** Movie credits */
export const getMovieCredits = (movieId) =>
  tmdbFetch(`/movie/${movieId}/credits`);

/** Movie reviews */
export const getMovieReviews = (movieId) =>
  tmdbFetch(`/movie/${movieId}/reviews`);
