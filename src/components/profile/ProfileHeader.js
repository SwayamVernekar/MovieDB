import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';

export default function ProfileHeader({ user, onEditPress }) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SV';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>
      </View>

      {/* Name & email */}
      <Text style={styles.name}>{user?.name || 'User'}</Text>
      <Text style={styles.email}>{user?.email || ''}</Text>

      {/* Edit button */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={onEditPress}
        activeOpacity={0.8}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatarWrapper: {
    marginBottom: 14,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(229,57,53,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(229,57,53,0.4)',
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 34,
  },
  name: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  editBtn: {
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.bgCard2,
  },
  editText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
