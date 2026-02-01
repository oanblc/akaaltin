import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Colors, PriceFormat } from '../constants/theme';
import { RootStackParamList } from '../types';
import { pricesAPI } from '../services/api';
import { usePriceStore } from '../stores/priceStore';

type PriceDetailRouteProp = RouteProp<RootStackParamList, 'PriceDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PriceDetail {
  code: string;
  name: string;
  alis: number;
  satis: number;
  fark: number;
  farkOran: number;
  direction: 'up' | 'down' | 'same';
  dailyHighAlis: number | null;
  dailyLowAlis: number | null;
  dailyHighAlisTime: string | null;
  dailyLowAlisTime: string | null;
  dailyHighSatis: number | null;
  dailyLowSatis: number | null;
  dailyHighSatisTime: string | null;
  dailyLowSatisTime: string | null;
  dailyHigh: number | null;
  dailyLow: number | null;
  dailyHighTime: string | null;
  dailyLowTime: string | null;
  timestamp: string;
}

export function PriceDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PriceDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { code } = route.params;
  const { prices, isFavorite, addFavorite, removeFavorite } = usePriceStore();

  const [priceDetail, setPriceDetail] = useState<PriceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const livePrice = prices.find((p) => p.code === code);

  const fetchPriceDetail = useCallback(async () => {
    try {
      setError(null);
      const response = await pricesAPI.getDetail(code);
      setPriceDetail(response.data);
    } catch (err) {
      console.error('Error fetching price detail:', err);
      setError('Fiyat detayı alınamadı');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [code]);

  useEffect(() => {
    fetchPriceDetail();
  }, [fetchPriceDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchPriceDetail();
  }, [fetchPriceDetail]);

  const handleToggleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFavorite(code)) {
      removeFavorite(code);
    } else {
      addFavorite(code);
    }
  }, [code, isFavorite, addFavorite, removeFavorite]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayPrice = livePrice || priceDetail;
  const direction = displayPrice?.direction || 'same';

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text variant="bodyLarge" weight="semiBold">Fiyat Detayı</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </View>
    );
  }

  if (error || !displayPrice) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text variant="bodyLarge" weight="semiBold">Fiyat Detayı</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          <Text variant="bodyMedium" color="#DC2626">{error || 'Fiyat bulunamadı'}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchPriceDetail}>
            <Text variant="bodySmall" color="#422D00" weight="semiBold">Tekrar Dene</Text>
          </Pressable>
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
        <View style={styles.headerTitle}>
          <Text variant="bodyLarge" weight="semiBold" numberOfLines={1}>{displayPrice.name}</Text>
          <Text variant="labelSmall" color="#6B7280">{code}</Text>
        </View>
        <Pressable onPress={handleToggleFavorite} style={styles.headerBtn}>
          <Ionicons
            name={isFavorite(code) ? 'star' : 'star-outline'}
            size={22}
            color={isFavorite(code) ? '#D4AF37' : '#6B7280'}
          />
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
        {/* Current Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Text variant="labelSmall" color="#6B7280">Alis</Text>
              <Text variant="titleLarge" weight="bold" color="#111827">
                {PriceFormat.format(displayPrice.alis)}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text variant="labelSmall" color="#6B7280">Satis</Text>
              <Text variant="titleLarge" weight="bold" color="#111827">
                {PriceFormat.format(displayPrice.satis)}
              </Text>
            </View>
          </View>

          {/* Change Badge */}
          <View
            style={[
              styles.changeBadge,
              direction === 'up' && styles.changeBadgeUp,
              direction === 'down' && styles.changeBadgeDown,
            ]}
          >
            <Ionicons
              name={direction === 'up' ? 'caret-up' : direction === 'down' ? 'caret-down' : 'remove'}
              size={16}
              color={direction === 'up' ? '#16A34A' : direction === 'down' ? '#DC2626' : '#6B7280'}
            />
            <Text
              variant="bodySmall"
              weight="semiBold"
              color={direction === 'up' ? '#16A34A' : direction === 'down' ? '#DC2626' : '#6B7280'}
            >
              %{displayPrice.farkOran.toFixed(2)}
            </Text>
            <Text variant="labelSmall" color="#6B7280">
              ({PriceFormat.format(displayPrice.fark)})
            </Text>
          </View>
        </View>

        {/* Daily Stats */}
        <View style={styles.statsCard}>
          <Text variant="bodySmall" weight="bold" color="#111827" style={styles.statsTitle}>
            Günlük İstatistikler
          </Text>

          {/* Alış Stats */}
          <Text variant="labelSmall" weight="bold" color={Colors.neutral[500]} style={styles.statsSectionLabel}>
            ALIŞ
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <Ionicons name="arrow-up" size={18} color="#16A34A" />
              </View>
              <Text variant="labelSmall" color="#6B7280">En Yüksek</Text>
              <Text variant="bodyMedium" weight="bold" color="#16A34A">
                {priceDetail?.dailyHighAlis ? PriceFormat.format(priceDetail.dailyHighAlis) : '-'}
              </Text>
              <View style={styles.statTimeRow}>
                <Ionicons name="time-outline" size={10} color="#9CA3AF" />
                <Text variant="labelSmall" color="#9CA3AF">
                  {formatTime(priceDetail?.dailyHighAlisTime || null)}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, styles.statIconCircleDown]}>
                <Ionicons name="arrow-down" size={18} color="#DC2626" />
              </View>
              <Text variant="labelSmall" color="#6B7280">En Düşük</Text>
              <Text variant="bodyMedium" weight="bold" color="#DC2626">
                {priceDetail?.dailyLowAlis ? PriceFormat.format(priceDetail.dailyLowAlis) : '-'}
              </Text>
              <View style={styles.statTimeRow}>
                <Ionicons name="time-outline" size={10} color="#9CA3AF" />
                <Text variant="labelSmall" color="#9CA3AF">
                  {formatTime(priceDetail?.dailyLowAlisTime || null)}
                </Text>
              </View>
            </View>
          </View>

          {/* Satış Stats */}
          <Text variant="labelSmall" weight="bold" color={Colors.neutral[500]} style={[styles.statsSectionLabel, { marginTop: 16 }]}>
            SATIŞ
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <Ionicons name="arrow-up" size={18} color="#16A34A" />
              </View>
              <Text variant="labelSmall" color="#6B7280">En Yüksek</Text>
              <Text variant="bodyMedium" weight="bold" color="#16A34A">
                {priceDetail?.dailyHighSatis ? PriceFormat.format(priceDetail.dailyHighSatis) : '-'}
              </Text>
              <View style={styles.statTimeRow}>
                <Ionicons name="time-outline" size={10} color="#9CA3AF" />
                <Text variant="labelSmall" color="#9CA3AF">
                  {formatTime(priceDetail?.dailyHighSatisTime || null)}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, styles.statIconCircleDown]}>
                <Ionicons name="arrow-down" size={18} color="#DC2626" />
              </View>
              <Text variant="labelSmall" color="#6B7280">En Düşük</Text>
              <Text variant="bodyMedium" weight="bold" color="#DC2626">
                {priceDetail?.dailyLowSatis ? PriceFormat.format(priceDetail.dailyLowSatis) : '-'}
              </Text>
              <View style={styles.statTimeRow}>
                <Ionicons name="time-outline" size={10} color="#9CA3AF" />
                <Text variant="labelSmall" color="#9CA3AF">
                  {formatTime(priceDetail?.dailyLowSatisTime || null)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
          <Text variant="labelSmall" color="#9CA3AF">
            Günlük veriler gece 00:00'da sıfırlanır.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Math.max(30, insets.bottom + 16) }} />
      </ScrollView>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  retryBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  changeBadgeUp: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  changeBadgeDown: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  statsCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginTop: 10,
    borderRadius: 16,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsSectionLabel: {
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    height: 140,
    gap: 4,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIconCircleDown: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  statTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
});
