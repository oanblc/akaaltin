import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Colors, PriceFormat } from '../constants/theme';
import { RootStackParamList } from '../types';
import { alertsAPI } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PriceAlert {
  id: number;
  priceCode: string;
  priceName: string;
  alertType: 'above' | 'below';
  targetPrice: number;
  priceField: string;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export function AlertsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await alertsAPI.getAll();
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Refresh when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAlerts();
    });
    return unsubscribe;
  }, [navigation, fetchAlerts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchAlerts();
  }, [fetchAlerts]);

  const handleToggle = useCallback(async (alert: PriceAlert) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await alertsAPI.toggle(alert.id);
      setAlerts(prev =>
        prev.map(a =>
          a.id === alert.id ? { ...a, isActive: !a.isActive, triggeredAt: null } : a
        )
      );
    } catch (error) {
      console.error('Error toggling alert:', error);
      Alert.alert('Hata', 'Alarm durumu degistirilemedi');
    }
  }, []);

  const handleDelete = useCallback((alert: PriceAlert) => {
    Alert.alert(
      'Alarmı Sil',
      `${alert.priceName} için olan alarmı silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await alertsAPI.delete(alert.id);
              setAlerts(prev => prev.filter(a => a.id !== alert.id));
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Hata', 'Alarm silinemedi');
            }
          },
        },
      ]
    );
  }, []);

  const handleCreateAlert = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AlertCreate', {});
  }, [navigation]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertStatusBadge = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return { text: 'Tetiklendi', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.1)' };
    }
    if (alert.isActive) {
      return { text: 'Aktif', color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.1)' };
    }
    return { text: 'Pasif', color: '#6B7280', bg: 'rgba(156, 163, 175, 0.1)' };
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text variant="titleMedium" weight="semiBold">Fiyat Alarmlari</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="semiBold">Fiyat Alarmlari</Text>
        <Pressable onPress={handleCreateAlert} style={styles.headerBtn}>
          <Ionicons name="add-circle" size={28} color="#D4AF37" />
        </Pressable>
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
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={64} color="#D4AF37" />
            </View>
            <Text variant="titleMedium" weight="semiBold" color="#111827">
              Henuz alarm yok
            </Text>
            <Text variant="bodyMedium" color="#6B7280" style={styles.emptyText}>
              Fiyat alarmları olusturarak hedef fiyata ulasinca bildirim alin.
            </Text>
            <Pressable style={styles.createButton} onPress={handleCreateAlert}>
              <Ionicons name="add" size={20} color="#422D00" />
              <Text variant="bodyMedium" color="#422D00" weight="semiBold">
                Alarm Oluştur
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {alerts.map((alert) => {
              const status = getAlertStatusBadge(alert);
              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertInfo}>
                      <Text variant="titleSmall" weight="semiBold" color="#111827">
                        {alert.priceName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text variant="labelSmall" color={status.color} weight="medium">
                          {status.text}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={alert.isActive}
                      onValueChange={() => handleToggle(alert)}
                      trackColor={{ false: '#E5E7EB', true: 'rgba(212, 175, 55, 0.3)' }}
                      thumbColor={alert.isActive ? '#D4AF37' : '#6B7280'}
                    />
                  </View>

                  <View style={styles.alertDetails}>
                    <View style={styles.alertRow}>
                      <Ionicons
                        name={alert.alertType === 'above' ? 'trending-up' : 'trending-down'}
                        size={18}
                        color={alert.alertType === 'above' ? '#16A34A' : '#DC2626'}
                      />
                      <Text variant="bodyMedium" color="#374151">
                        {alert.priceField === 'alis' ? 'Alis' : 'Satis'} fiyati{' '}
                        <Text weight="bold" color={alert.alertType === 'above' ? '#16A34A' : '#DC2626'}>
                          {PriceFormat.format(alert.targetPrice)}
                        </Text>
                        {alert.alertType === 'above' ? "'in ustune cikinca" : "'in altina dusunce"}
                      </Text>
                    </View>

                    <View style={styles.alertMeta}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text variant="labelSmall" color="#6B7280">
                        {formatDate(alert.createdAt)}
                      </Text>
                    </View>

                    {alert.triggeredAt && (
                      <View style={styles.triggeredInfo}>
                        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                        <Text variant="labelSmall" color="#16A34A">
                          {formatDate(alert.triggeredAt)} tarihinde tetiklendi
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(alert)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Add Button */}
      {alerts.length > 0 && (
        <Pressable style={styles.fab} onPress={handleCreateAlert}>
          <Ionicons name="add" size={28} color="#422D00" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertDetails: {
    gap: 8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  triggeredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
