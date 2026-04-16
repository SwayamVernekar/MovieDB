/**
 * Firebase Configuration
 * ─────────────────────────────────────────────────────────────────
 * Auth:      Firebase Authentication (Google Sign-In)
 * DB:        Cloud Firestore
 * Persist:   AsyncStorage (native) | IndexedDB (web) via Firebase default
 */

import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCsBkVVe2bJtCTYuzWmcxtYGELvOZGKQ1Q',
  authDomain: 'moviedb-87cda.firebaseapp.com',
  projectId: 'moviedb-87cda',
  storageBucket: 'moviedb-87cda.firebasestorage.app',
  messagingSenderId: '252341094396',
  appId: '1:252341094396:web:c855480d7d30c309581479',
  measurementId: 'G-2WEN2VDV05',
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ── Auth: Platform-aware persistence ──────────────────────────────
let auth;
if (Platform.OS === 'web') {
  // Web: Firebase uses IndexedDB by default (no extra setup needed)
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  // Native: Use AsyncStorage for auth token persistence (stays logged in)
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

// ── Firestore DB ───────────────────────────────────────────────────
export const db = getFirestore(app);

export default app;
