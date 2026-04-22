/**
 * AppNavigator
 * ─────────────────────────────────────────────────────────────────
 * Uses @react-navigation/native-stack for the authenticated routes.
 * native-stack does NOT use react-native-gesture-handler's PanGestureHandler
 * on web, which means scroll events are NOT intercepted and ScrollView
 * inside screens works correctly.
 *
 * @react-navigation/stack (JS-based) intercepts pointer/wheel events on web
 * via its gesture handler for swipe-back support, which breaks ScrollView.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { UserProvider, useUser } from '../context/UserContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainTabNavigator from './MainTabNavigator';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// ── Splash screen while Firebase checks auth ──────────────────────
function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator color={Colors.red} size="large" />
    </View>
  );
}

// ── Route switcher inside UserProvider ────────────────────────────
function RootNavigator() {
  const { user, authLoading } = useUser();

  if (authLoading) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'fade',
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      {user ? (
        // ── Authenticated ─────────────────────────────────────────
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ gestureEnabled: false, animation: 'none' }}
          />
          <Stack.Screen
            name="MovieDetail"
            component={MovieDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        // ── Unauthenticated ───────────────────────────────────────
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Root export ───────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
