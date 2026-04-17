/**
 * Auth Service
 * ─────────────────────────────────────────────────────────────────
 * Google Sign-In:
 *   - Web  → signInWithPopup (no extra config needed)
 *   - Native → expo-auth-session + signInWithCredential
 *              (requires GOOGLE_WEB_CLIENT_ID below)
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';
import { createUserProfile } from './firestoreService';

/**
 * GOOGLE_WEB_CLIENT_ID — needed only for native (iOS/Android) Google Sign-In.
 * Find it in: Firebase Console → Authentication → Sign-in method
 *             → Google → Web SDK configuration → Web client ID
 * Looks like: 252341094396-xxxxxxxxxxxx.apps.googleusercontent.com
 */
export const GOOGLE_WEB_CLIENT_ID =
  '252341094396-REPLACE_WITH_REAL_WEB_CLIENT_ID.apps.googleusercontent.com';

/**
 * Native client IDs (required for Expo Go / native Google Sign-In).
 * Create these in Google Cloud Console (OAuth 2.0 Client IDs).
 */
export const GOOGLE_ANDROID_CLIENT_ID =
  '252341094396-REPLACE_WITH_ANDROID_CLIENT_ID.apps.googleusercontent.com';

export const GOOGLE_IOS_CLIENT_ID =
  '252341094396-REPLACE_WITH_IOS_CLIENT_ID.apps.googleusercontent.com';

// ── Web: signInWithPopup ───────────────────────────────────────────

export async function signInWithGoogleWeb() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  await createUserProfile(result.user);
  return result.user;
}

// ── Native: called after expo-auth-session returns tokens ──────────

export async function signInWithGoogleNative(idToken, accessToken) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  await createUserProfile(result.user);
  return result.user;
}

// ── Sign Out ───────────────────────────────────────────────────────

export async function signOut() {
  await firebaseSignOut(auth);
}

// ── Auth State Listener ────────────────────────────────────────────

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function (call in useEffect cleanup).
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Email/Password (future use) ────────────────────────────────────

export async function signInWithEmail(email, password) {
  const { signInWithEmailAndPassword } = require('firebase/auth');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password, displayName) {
  const {
    createUserWithEmailAndPassword,
    updateProfile,
  } = require('firebase/auth');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  await createUserProfile({ ...result.user, displayName });
  return result.user;
}
