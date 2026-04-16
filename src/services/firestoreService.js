/**
 * Firestore Service
 * ─────────────────────────────────────────────────────────────────
 * All database operations for user data:
 *   - User profile (create on first login, read)
 *   - My List    (add / remove / get)
 *   - Watched    (add / remove / get)
 */

import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

// ── User Profile ───────────────────────────────────────────────────

/**
 * Creates a Firestore user document on first sign-in.
 * Does nothing if the user already exists.
 */
export async function createUserProfile(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || null,
      createdAt: serverTimestamp(),
    });
  }
}

/** Returns the user profile object from Firestore */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

// ── My List ────────────────────────────────────────────────────────

export async function addToMyList(uid, movie) {
  // Use movie.id as the document ID so we can easily check/remove
  const ref = doc(db, 'users', uid, 'myList', String(movie.id));
  await setDoc(ref, {
    id: movie.id,
    title: movie.title || movie.name || '',
    poster_path: movie.poster_path || null,
    vote_average: movie.vote_average || 0,
    release_date: movie.release_date || movie.first_air_date || '',
    media_type: movie.media_type || 'movie',
    addedAt: serverTimestamp(),
  });
}

export async function removeFromMyList(uid, movieId) {
  await deleteDoc(doc(db, 'users', uid, 'myList', String(movieId)));
}

export async function getMyList(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'myList'));
  return snap.docs.map((d) => d.data());
}

// ── Watched ────────────────────────────────────────────────────────

export async function addToWatched(uid, movie) {
  const ref = doc(db, 'users', uid, 'watched', String(movie.id));
  await setDoc(ref, {
    id: movie.id,
    title: movie.title || movie.name || '',
    poster_path: movie.poster_path || null,
    vote_average: movie.vote_average || 0,
    release_date: movie.release_date || movie.first_air_date || '',
    media_type: movie.media_type || 'movie',
    watchedAt: serverTimestamp(),
  });
}

export async function removeFromWatched(uid, movieId) {
  await deleteDoc(doc(db, 'users', uid, 'watched', String(movieId)));
}

export async function getWatched(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'watched'));
  return snap.docs.map((d) => d.data());
}
