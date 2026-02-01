import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { HomeScreen } from '../screens/HomeScreen';
import { PricesScreen } from '../screens/PricesScreen';
import { QRScreen } from '../screens/QRScreen';
import { SavingsScreen } from '../screens/SavingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  // Samsung/iPhone navigasyon çakışmasını önlemek için dinamik tab bar yüksekliği
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) + 8;
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: true,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Prices':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'QR':
              iconName = 'qr-code';
              break;
            case 'Branches':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          // QR ikonu çember içinde - daha büyük
          if (route.name === 'QR') {
            return (
              <View style={[styles.qrIconCircle, focused && styles.qrIconCircleActive]}>
                <Ionicons name={iconName} size={28} color={focused ? '#FFFFFF' : '#111827'} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Prices"
        component={PricesScreen}
        options={{ tabBarLabel: 'Fiyatlar' }}
      />
      <Tab.Screen
        name="QR"
        component={QRScreen}
        options={{ tabBarShowLabel: false, tabBarLabel: () => null }}
      />
      <Tab.Screen
        name="Branches"
        component={SavingsScreen}
        options={{ tabBarLabel: 'Birikim' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  qrIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  qrIconCircleActive: {
    backgroundColor: '#111827',
  },
});
