import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  type: 'price_alert' | 'campaign' | 'system' | 'points';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    priceCode?: string;
    campaignId?: number;
  };
}

// Ornek bildirimler
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'campaign',
    title: 'AKA Kuyumculuk\'a Hoşgeldiniz!',
    message: 'Altın fiyatlarını anlık takip edin, fiyat alarmları kurun ve birikimlerinizi yönetin.',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simule refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const handleNotificationPress = useCallback((notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAsRead(notification.id);

    if (notification.type === 'price_alert' && notification.data?.priceCode) {
      navigation.navigate('PriceDetail', { code: notification.data.priceCode });
    } else if (notification.type === 'campaign' && notification.data?.campaignId) {
      navigation.navigate('CampaignDetail', { id: notification.data.campaignId });
    }
  }, [navigation, markAsRead]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return { name: 'trending-up', color: '#16A34A' };
      case 'campaign':
        return { name: 'megaphone', color: '#D4AF37' };
      case 'points':
        return { name: 'star', color: '#D4AF37' };
      case 'system':
      default:
        return { name: 'diamond', color: '#D4AF37' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) {
      return `${minutes} dk once`;
    } else if (hours < 24) {
      return `${hours} saat once`;
    } else if (days < 7) {
      return `${days} gun once`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="semiBold">Bildirimler</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text variant="labelSmall" color="#D4AF37">Tümü Okundu</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const icon = getIcon(notification.type);
            return (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                  <Ionicons name={icon.name as any} size={24} color={icon.color} />
                </View>
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <Text
                      variant="bodyMedium"
                      weight={notification.isRead ? 'medium' : 'bold'}
                      color="#111827"
                      style={{ flex: 1 }}
                    >
                      {notification.title}
                    </Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text variant="bodySmall" color="#6B7280" numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text variant="labelSmall" color="#6B7280" style={styles.dateText}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
            </View>
            <Text variant="titleSmall" weight="semiBold" color="#374151" style={{ marginTop: 16 }}>
              Bildirim Yok
            </Text>
            <Text variant="bodySmall" color="#6B7280" align="center" style={{ marginTop: 8 }}>
              Yeni bildirimleriniz burada gorunecek
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  notificationCardUnread: {
    backgroundColor: '#FDF8E7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  dateText: {
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
