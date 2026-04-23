import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import { Dimensions } from 'react-native';

import ProfileHeader from '../components/profile/ProfileHeader';
import StatsBar from '../components/profile/StatsBar';
import ProfileTabs from '../components/profile/ProfileTabs';
import MovieListItem from '../components/profile/MovieListItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PAD = 18;
const GAP = 12;
const TARGET_CARD = 130;
const NUM_COLS = Math.max(2, Math.floor((SCREEN_WIDTH - SIDE_PAD * 2 + GAP) / (TARGET_CARD + GAP)));
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

function EmptyState({ message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎬</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function SettingsItem({ label, value, onToggle, isToggle, onPress }) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.bgCard2, true: Colors.red }}
          thumbColor={Colors.white}
        />
      ) : (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, myList, watched, avgRating, removeFromList, removeFromWatched, signOut } = useUser();
  const [activeTab, setActiveTab] = useState('My List');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const renderGrid = (items, onRemove) => {
    if (items.length === 0) {
      return <EmptyState message="Nothing here yet. Start adding movies!" />;
    }

    return (
      <View style={styles.grid}>
        {items.map((movie) => (
          <MovieListItem
            key={movie.id}
            movie={movie}
            onRemove={onRemove}
            cardWidth={CARD_WIDTH}
          />
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'My List':
        return (
          <>
            <View style={styles.listMeta}>
              <Text style={styles.listMetaText}>
                {myList.length} item{myList.length !== 1 ? 's' : ''} in your list
              </Text>
              <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
                <Text style={styles.sortText}>Sort ⊞</Text>
              </TouchableOpacity>
            </View>
            {renderGrid(myList, removeFromList)}
          </>
        );

      case 'Watched':
        return (
          <>
            <View style={styles.listMeta}>
              <Text style={styles.listMetaText}>
                {watched.length} movie{watched.length !== 1 ? 's' : ''} watched
              </Text>
            </View>
            {renderGrid(watched, removeFromWatched)}
          </>
        );

      case 'Settings':
        return (
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsSection}>Preferences</Text>
            <View style={styles.settingsCard}>
              <SettingsItem
                label="Push Notifications"
                value={notifications}
                onToggle={setNotifications}
                isToggle
              />
              <View style={styles.settingDivider} />
              <SettingsItem
                label="Dark Mode"
                value={darkMode}
                onToggle={setDarkMode}
                isToggle
              />
            </View>

            <Text style={styles.settingsSection}>Account</Text>
            <View style={styles.settingsCard}>
              <SettingsItem label="Change Password" onPress={() => {}} />
              <View style={styles.settingDivider} />
              <SettingsItem label="Privacy Settings" onPress={() => {}} />
              <View style={styles.settingDivider} />
              <SettingsItem label="Language" onPress={() => {}} />
            </View>

            <Text style={styles.settingsSection}>About</Text>
            <View style={styles.settingsCard}>
              <SettingsItem label="Rate the App" onPress={() => {}} />
              <View style={styles.settingDivider} />
              <SettingsItem label="Version 1.0.0" onPress={() => {}} />
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={signOut}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Fixed top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity style={styles.gearBtn} activeOpacity={0.7}
          onPress={() => setActiveTab('Settings')}>
          <Text style={styles.gearIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile header */}
        <ProfileHeader user={user} onEditPress={() => {}} />

        {/* Stats */}
        <StatsBar
          watchedCount={watched.length}
          listCount={myList.length}
          avgRating={avgRating}
        />

        {/* Tab switcher */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        {renderTabContent()}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  screenTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },

  // List meta
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  listMetaText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.bgCard2,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  sortText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Grid
  grid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  // Settings
  settingsContainer: {
    paddingHorizontal: 18,
  },
  settingsSection: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  settingArrow: {
    color: Colors.textMuted,
    fontSize: 20,
    fontWeight: '300',
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.dividerStrong,
    marginHorizontal: 16,
  },
  logoutBtn: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(229,57,53,0.12)',
    borderWidth: 1.5,
    borderColor: Colors.red,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.red,
    fontSize: 15,
    fontWeight: '700',
  },
});
