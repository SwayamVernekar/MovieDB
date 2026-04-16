/**
 * AppNavigator
 * ─────────────────────────────────────────────────────────────────
 * Auth-driven routing:
 *  - Checks Firebase auth state via UserContext
 *  - Shows a splash/loading screen while auth is being verified
 *  - Routes to Login/SignUp if unauthenticated
 *  - Routes to MainTabs if authenticated
 */

import React from 'react';
import {
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { UserProvider, useUser } from '../context/UserContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainTabNavigator from './MainTabNavigator';
import { Colors } from '../theme/colors';

const Stack = createStackNavigator();

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
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.08, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      {user ? (
        // ── Authenticated ──────────────────────────────────────────
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
        />
      ) : (
        // ── Unauthenticated ────────────────────────────────────────
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
