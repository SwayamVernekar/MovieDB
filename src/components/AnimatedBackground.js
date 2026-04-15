import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// A single floating orb that slowly drifts and pulses
function FloatingOrb({ x, y, size, color, delay, duration }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    floatAnim.start();
    return () => floatAnim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
}

// Shooting star / line particle
function ShootingStar({ delay }) {
  const translateX = useRef(new Animated.Value(-200)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const startY = Math.random() * height * 0.6;

  useEffect(() => {
    const shoot = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: width + 200,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.8, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1700, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(translateX, { toValue: -200, duration: 0, useNativeDriver: true }),
      ])
    );
    shoot.start();
    return () => shoot.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          top: startY,
          opacity,
          transform: [{ translateX }, { rotate: '-15deg' }],
        },
      ]}
    />
  );
}

const ORBS = [
  { x: -60, y: height * 0.1, size: 200, color: 'rgba(229,57,53,0.18)', delay: 0, duration: 5000 },
  { x: width - 80, y: height * 0.05, size: 160, color: 'rgba(229,57,53,0.12)', delay: 1000, duration: 6500 },
  { x: width * 0.2, y: height * 0.75, size: 140, color: 'rgba(183,28,28,0.15)', delay: 500, duration: 7000 },
  { x: -40, y: height * 0.55, size: 120, color: 'rgba(229,57,53,0.1)', delay: 1500, duration: 5500 },
  { x: width * 0.6, y: height * 0.88, size: 180, color: 'rgba(229,57,53,0.08)', delay: 800, duration: 8000 },
];

export default function AnimatedBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#0A0A0A', '#110808', '#0A0A0A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Vignette overlay */}
      <LinearGradient
        colors={[
          'rgba(229,57,53,0.05)',
          'transparent',
          'transparent',
          'rgba(229,57,53,0.05)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Floating orbs */}
      {ORBS.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
      {/* Shooting stars */}
      {[0, 3000, 6000, 9000, 12000].map((delay, i) => (
        <ShootingStar key={i} delay={delay} />
      ))}
      {/* Subtle grid pattern overlay */}
      <View style={styles.gridOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    // Blur is simulated via large border-radius + low opacity
  },
  star: {
    position: 'absolute',
    width: 120,
    height: 1.5,
    backgroundColor: 'rgba(229,57,53,0.6)',
    borderRadius: 2,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
    // Visual noise/grain effect would need a canvas; keeping it subtle
  },
});
