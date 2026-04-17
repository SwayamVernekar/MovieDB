/**
 * LoginScreen
 * ─────────────────────────────────────────────────────────────────
 * Google Sign-In:
 *   Web    → signInWithPopup (Firebase) — works immediately
 *   Native → expo-auth-session/providers/google (needs webClientId)
 *
 * On successful sign-in, Firebase auth state changes → AppNavigator
 * automatically routes to MainTabs. No manual navigation needed here.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import {
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import AnimatedBackground from '../components/AnimatedBackground';
import { Colors } from '../theme/colors';
import {
  signInWithGoogleWeb,
  signInWithGoogleNative,
  signInWithEmail,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} from '../services/authService';

// ── Input Field ───────────────────────────────────────────────────
function InputField({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType }) {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const handleBlur = () =>
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.bgInputBorder, Colors.red],
  });

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
        />
      </Animated.View>
    </View>
  );
}

// ── Login Screen ──────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // expo-auth-session Google hook (for native only)
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Handle native Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      setGoogleLoading(true);
      signInWithGoogleNative(id_token, access_token)
        .catch((e) => Alert.alert('Sign In Error', e.message))
        .finally(() => setGoogleLoading(false));
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Error', response.error?.message || 'Unknown error');
    }
  }, [response]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Google Sign-In handler ─────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      setGoogleLoading(true);
      try {
        await signInWithGoogleWeb();
        // AppNavigator handles routing after auth state change
      } catch (e) {
        Alert.alert('Google Sign-In Failed', e.message);
      } finally {
        setGoogleLoading(false);
      }
    } else {
      // Trigger native Google OAuth flow
      promptAsync();
    }
  };

  // ── Email Sign-In handler ──────────────────────────────────────
  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (e) {
      Alert.alert('Sign In Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || googleLoading;

  return (
    <View style={styles.root}>
      <AnimatedBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View
            style={[styles.logoSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.logoText}>
              <Text style={styles.logoWhite}>MOVIE</Text>
              <Text style={styles.logoRed}>DB</Text>
            </Text>
            <Text style={styles.tagline}>Your Personal Cinema</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.cardTitle}>Welcome Back!</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue watching</Text>

            <View style={styles.form}>
              <InputField
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryBtn}
                onPress={handleEmailSignIn}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[Colors.red, Colors.redDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Image
                    source={require('../../assets/google-logo.png')}
                    style={styles.googleLogo}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoText: { fontSize: 34, fontWeight: '900', letterSpacing: 3 },
  logoWhite: { color: Colors.white },
  logoRed: { color: Colors.red },
  tagline: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, letterSpacing: 1 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(20,20,20,0.92)',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  cardTitle: { color: Colors.white, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 28 },
  form: { gap: 4 },
  fieldWrapper: { marginBottom: 16 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  inputContainer: { backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1.5, overflow: 'hidden' },
  input: { color: Colors.white, fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { color: Colors.red, fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { color: Colors.textMuted, fontSize: 12, marginHorizontal: 12 },
  googleBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.socialBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.socialBorder,
    paddingVertical: 10,
    marginBottom: 24,
    minHeight: 64,
  },
  googleLogo: {
    width: 36,
    height: 36,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.red, fontSize: 14, fontWeight: '700' },
});
