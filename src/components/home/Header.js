import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default function Header({ onNotificationPress, onProfilePress }) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>
        <Text style={styles.logoWhite}>MOVIE</Text>
        <Text style={styles.logoRed}>DB</Text>
      </Text>

      {/* Right icons */}
      <View style={styles.icons}>
        {/* Notification bell */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>🔔</Text>
        </TouchableOpacity>

        {/* Profile button — tapping takes you to Profile tab */}
        <TouchableOpacity
          style={[styles.iconBtn, styles.profileBtn]}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoWhite: {
    color: Colors.white,
  },
  logoRed: {
    color: Colors.red,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    backgroundColor: 'rgba(229,57,53,0.18)',
    borderColor: 'rgba(229,57,53,0.45)',
  },
  iconText: {
    fontSize: 17,
  },
  profileIcon: {
    fontSize: 17,
  },
});
