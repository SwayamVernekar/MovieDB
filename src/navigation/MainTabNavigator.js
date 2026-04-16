import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TVShowsScreen from '../screens/TVShowsScreen';
import MoviesScreen from '../screens/MoviesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',     icon: '🏠',  label: 'Home'     },
  { name: 'Search',   icon: '🔍',  label: 'Search'   },
  { name: 'TVShows',  icon: '📺',  label: 'TV Shows' },
  { name: 'Movies',   icon: '🎬',  label: 'Movies'   },
  { name: 'Profile',  icon: '❤️',  label: 'My List'  },
];

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TABS[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {/* Active indicator dot */}
            {isFocused && <View style={styles.activeDot} />}

            {/* Icon */}
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {tab.icon}
            </Text>

            {/* Label */}
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Tab Navigator ────────────────────────────────────────────────────────
export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="Search"  component={SearchScreen}  />
      <Tab.Screen name="TVShows" component={TVShowsScreen} />
      <Tab.Screen name="Movies"  component={MoviesScreen}  />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  activeDot: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.red,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 3,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.tabInactive,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
