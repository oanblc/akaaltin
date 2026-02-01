import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from './Text';
import { useSettingsStore } from '../../stores/settingsStore';
import { RootStackParamList } from '../../types';

interface HeaderProps {
  showNotification?: boolean;
}

export function Header({ showNotification = true }: HeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings.logoBase64) {
      fetchSettings();
    }
  }, []);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.logoContainer}>
        {settings.logoBase64 ? (
          <Image
            source={{ uri: settings.logoBase64 }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <>
            <Text variant="titleLarge" weight="bold" color="#D4AF37" style={{ fontWeight: '900' }}>AKA</Text>
            <Text variant="titleLarge" weight="regular" color="#111827"> Kuyumculuk</Text>
          </>
        )}
      </View>
      {showNotification && (
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationBtn}
        >
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 23,
    width: 'auto',
    aspectRatio: 3,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
