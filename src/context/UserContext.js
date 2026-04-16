/**
 * UserContext
 * ─────────────────────────────────────────────────────────────────
 * Source of truth for all user state:
 *   - Firebase Auth (onAuthStateChanged listener)
 *   - Firestore (myList, watched, profile)
 *   - AsyncStorage (cache for instant load + offline support)
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChange, signOut } from '../services/authService';
import {
  getUserProfile,
  getMyList,
  getWatched,
  addToMyList as fsAddToMyList,
  removeFromMyList as fsRemoveFromMyList,
  addToWatched as fsAddToWatched,
  removeFromWatched as fsRemoveFromWatched,
} from '../services/firestoreService';

const UserContext = createContext(null);

// AsyncStorage cache keys
const CACHE = {
  USER: '@moviedb:user',
  MY_LIST: '@moviedb:myList',
  WATCHED: '@moviedb:watched',
};

async function saveCache(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

async function loadCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

async function clearCache() {
  try {
    await AsyncStorage.multiRemove(Object.values(CACHE));
  } catch (_) {}
}

// ── Provider ───────────────────────────────────────────────────────

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);          // { uid, name, email, avatar }
  const [myList, setMyList] = useState([]);
  const [watched, setWatched] = useState([]);
  const [authLoading, setAuthLoading] = useState(true); // true while Firebase checks session

  // ── Step 1: Hydrate from AsyncStorage cache immediately ──────────
  useEffect(() => {
    (async () => {
      const [cachedUser, cachedList, cachedWatched] = await Promise.all([
        loadCache(CACHE.USER),
        loadCache(CACHE.MY_LIST),
        loadCache(CACHE.WATCHED),
      ]);
      if (cachedUser) setUser(cachedUser);
      if (cachedList) setMyList(cachedList);
      if (cachedWatched) setWatched(cachedWatched);
    })();
  }, []);

  // ── Step 2: Subscribe to Firebase Auth state ─────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch fresh data from Firestore in background
        try {
          const [profile, list, watchedData] = await Promise.all([
            getUserProfile(firebaseUser.uid),
            getMyList(firebaseUser.uid),
            getWatched(firebaseUser.uid),
          ]);

          const userData = profile || {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || null,
          };

          setUser(userData);
          setMyList(list);
          setWatched(watchedData);

          // Update AsyncStorage cache
          await Promise.all([
            saveCache(CACHE.USER, userData),
            saveCache(CACHE.MY_LIST, list),
            saveCache(CACHE.WATCHED, watchedData),
          ]);
        } catch (err) {
          console.warn('Firestore load error:', err);
          // Keep cached data if Firestore fails
        }
      } else {
        // Logged out → clear everything
        setUser(null);
        setMyList([]);
        setWatched([]);
        await clearCache();
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── My List Actions ──────────────────────────────────────────────

  const addToList = useCallback(
    async (movie) => {
      if (!user?.uid) return;
      setMyList((prev) => {
        if (prev.find((m) => m.id === movie.id)) return prev;
        const next = [movie, ...prev];
        saveCache(CACHE.MY_LIST, next);
        return next;
      });
      try {
        await fsAddToMyList(user.uid, movie);
      } catch (err) {
        console.error('addToList Firestore error:', err);
      }
    },
    [user]
  );

  const removeFromList = useCallback(
    async (movieId) => {
      if (!user?.uid) return;
      setMyList((prev) => {
        const next = prev.filter((m) => m.id !== movieId);
        saveCache(CACHE.MY_LIST, next);
        return next;
      });
      try {
        await fsRemoveFromMyList(user.uid, movieId);
      } catch (err) {
        console.error('removeFromList Firestore error:', err);
      }
    },
    [user]
  );

  const isInList = useCallback(
    (movieId) => myList.some((m) => m.id === movieId),
    [myList]
  );

  // ── Watched Actions ──────────────────────────────────────────────

  const markWatched = useCallback(
    async (movie) => {
      if (!user?.uid) return;
      setWatched((prev) => {
        if (prev.find((m) => m.id === movie.id)) return prev;
        const next = [movie, ...prev];
        saveCache(CACHE.WATCHED, next);
        return next;
      });
      try {
        await fsAddToWatched(user.uid, movie);
      } catch (err) {
        console.error('markWatched Firestore error:', err);
      }
    },
    [user]
  );

  const removeFromWatched = useCallback(
    async (movieId) => {
      if (!user?.uid) return;
      setWatched((prev) => {
        const next = prev.filter((m) => m.id !== movieId);
        saveCache(CACHE.WATCHED, next);
        return next;
      });
      try {
        await fsRemoveFromWatched(user.uid, movieId);
      } catch (err) {
        console.error('removeFromWatched Firestore error:', err);
      }
    },
    [user]
  );

  // ── Sign Out ─────────────────────────────────────────────────────

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  // ── Computed ─────────────────────────────────────────────────────

  const avgRating =
    watched.length > 0
      ? (
          watched.reduce((sum, m) => sum + (m.vote_average || 0), 0) /
          watched.length
        ).toFixed(1)
      : '0.0';

  return (
    <UserContext.Provider
      value={{
        user,
        myList,
        watched,
        avgRating,
        authLoading,
        addToList,
        removeFromList,
        isInList,
        markWatched,
        removeFromWatched,
        signOut: handleSignOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
