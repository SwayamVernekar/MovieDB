import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

const TABS = ['My List', 'Watched', 'Settings'];

export default function ProfileTabs({ activeTab, onTabChange }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => onTabChange && onTabChange(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {tab}
            </Text>
            {active && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerStrong,
    marginHorizontal: 18,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 24,
    position: 'relative',
    alignItems: 'center',
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: Colors.red,
    borderRadius: 2,
  },
});
