import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default function Header({ onNotificationPress, onProfilePress }) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../../assets/moviedb_intab_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

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
    width: 130,
    height: 40,
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
