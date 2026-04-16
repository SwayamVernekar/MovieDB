import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

export const USER_DATA = {
  name: 'Harshit Gupta',
  email: 'harshit.gupta@gmail.com',
  avatar: null, // will show initials or icon
};

export function UserProvider({ children }) {
  const [user] = useState(USER_DATA);
  const [myList, setMyList] = useState([]);
  const [watched, setWatched] = useState([]);

  // Add movie to My List
  const addToList = useCallback((movie) => {
    setMyList((prev) => {
      if (prev.find((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  }, []);

  // Remove movie from My List
  const removeFromList = useCallback((movieId) => {
    setMyList((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  // Check if movie is in list
  const isInList = useCallback(
    (movieId) => myList.some((m) => m.id === movieId),
    [myList]
  );

  // Mark movie as watched
  const markWatched = useCallback((movie) => {
    setWatched((prev) => {
      if (prev.find((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  }, []);

  // Remove from watched
  const removeFromWatched = useCallback((movieId) => {
    setWatched((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  // Compute average rating from watched list
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
        addToList,
        removeFromList,
        isInList,
        markWatched,
        removeFromWatched,
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
