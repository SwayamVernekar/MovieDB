import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TVShowsScreen from '../screens/TVShowsScreen';
import MoviesScreen from '../screens/MoviesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SeeAllScreen from '../screens/SeeAllScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// ─── Home Stack (keeps tab bar visible on SeeAll) ──────────────────────────────
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SeeAll" component={SeeAllScreen} options={{ animation: 'slide_from_right' }} />
    </HomeStack.Navigator>
  );
}

// ─── TV Shows Stack ────────────────────────────────────────────────────────────
const TVStack = createNativeStackNavigator();
function TVShowsStackNavigator() {
  return (
    <TVStack.Navigator screenOptions={{ headerShown: false }}>
      <TVStack.Screen name="TVShowsMain" component={TVShowsScreen} />
      <TVStack.Screen name="SeeAll" component={SeeAllScreen} options={{ animation: 'slide_from_right' }} />
    </TVStack.Navigator>
  );
}

// ─── Movies Stack ──────────────────────────────────────────────────────────────
const MoviesStack = createNativeStackNavigator();
function MoviesStackNavigator() {
  return (
    <MoviesStack.Navigator screenOptions={{ headerShown: false }}>
      <MoviesStack.Screen name="MoviesMain" component={MoviesScreen} />
      <MoviesStack.Screen name="SeeAll" component={SeeAllScreen} options={{ animation: 'slide_from_right' }} />
    </MoviesStack.Navigator>
  );
}

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
      <Tab.Screen name="Home"    component={HomeStackNavigator} />
      <Tab.Screen name="Search"  component={SearchScreen}  />
      <Tab.Screen name="TVShows" component={TVShowsStackNavigator} />
      <Tab.Screen name="Movies"  component={MoviesStackNavigator}  />
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
