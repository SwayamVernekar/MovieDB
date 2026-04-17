# MovieDB

MovieDB is a React Native (Expo) app that lets users discover trending movies and TV shows, search across titles, and manage a profile with watch activity. It integrates TMDB for media data and Firebase for authentication and user data.

## Features
- Trending, popular, and top-rated movies
- Trending and popular TV shows
- Search across movies and TV (multi-search)
- Hero banner, genre filtering, and curated sections
- Firebase authentication (Google sign-in) and Firestore-backed profile data

## Tech Stack
- React Native + Expo
- React Navigation
- TMDB API
- Firebase (Auth + Firestore)

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- Expo CLI (optional, `npm i -g expo-cli`)

### Install
```bash
npm install
```

### Run
```bash
npm run start
```

### Run on Devices
```bash
npm run android
npm run ios
npm run web
```

## Configuration
This project currently includes API keys in source files for local development. For production use, move them to environment variables or a secure secrets manager.

- TMDB key: see `src/api/tmdb.js`
- Firebase config: see `src/config/firebase.js`

## Project Structure
```
assets/
src/
  api/            # TMDB client
  components/     # UI components
  config/         # Firebase config
  context/        # App context
  navigation/     # App navigators
  screens/        # App screens
  services/       # Auth and Firestore helpers
  theme/          # Theme tokens
```

## Scripts
- `npm run start` - start the Expo dev server
- `npm run android` - run on Android
- `npm run ios` - run on iOS
- `npm run web` - run on web

## Notes
- API rate limits apply for TMDB.
- Firebase project settings may need to be updated for your own app IDs.

## License
This project is private and not licensed for redistribution.
