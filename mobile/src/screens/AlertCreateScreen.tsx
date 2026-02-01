import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Colors, PriceFormat } from '../constants/theme';
import { RootStackParamList } from '../types';
import { usePriceStore } from '../stores/priceStore';
import { alertsAPI } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AlertCreateRouteProp = RouteProp<RootStackParamList, 'AlertCreate'>;

type AlertType = 'above' | 'below';
type PriceField = 'alis' | 'satis';

export function AlertCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AlertCreateRouteProp>();
  const insets = useSafeAreaInsets();
  const { prices } = usePriceStore();

  const initialPriceCode = route.params?.priceCode || '';

  const [selectedPriceCode, setSelectedPriceCode] = useState(initialPriceCode);
  const [alertType, setAlertType] = useState<AlertType>('above');
  const [priceField, setPriceField] = useState<PriceField>('satis');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPriceList, setShowPriceList] = useState(!initialPriceCode);

  const selectedPrice = useMemo(() => {
    return prices.find(p => p.code === selectedPriceCode);
  }, [prices, selectedPriceCode]);

  const currentPrice = useMemo(() => {
    if (!selectedPrice) return 0;
    return priceField === 'alis' ? selectedPrice.alis : selectedPrice.satis;
  }, [selectedPrice, priceField]);

  const handleSelectPrice = useCallback((code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPriceCode(code);
    setShowPriceList(false);
    // Auto-suggest target price based on current price
    const price = prices.find(p => p.code === code);
    if (price) {
      const current = priceField === 'alis' ? price.alis : price.satis;
      const suggested = alertType === 'above'
        ? Math.ceil(current * 1.01) // 1% higher
        : Math.floor(current * 0.99); // 1% lower
      setTargetPrice(suggested.toString());
    }
  }, [prices, priceField, alertType]);

  const handleAlertTypeChange = useCallback((type: AlertType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAlertType(type);
    // Update suggested price
    if (currentPrice) {
      const suggested = type === 'above'
        ? Math.ceil(currentPrice * 1.01)
        : Math.floor(currentPrice * 0.99);
      setTargetPrice(suggested.toString());
    }
  }, [currentPrice]);

  const handlePriceFieldChange = useCallback((field: PriceField) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPriceField(field);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPriceCode || !selectedPrice) {
      Alert.alert('Hata', 'Lutfen bir fiyat secin');
      return;
    }

    const target = parseFloat(targetPrice);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Hata', 'Gecerli bir hedef fiyat girin');
      return;
    }

    // Validate target makes sense
    if (alertType === 'above' && target <= currentPrice) {
      Alert.alert('Hata', 'Yukaris alarm icin hedef fiyat mevcut fiyattan yuksek olmali');
      return;
    }
    if (alertType === 'below' && target >= currentPrice) {
      Alert.alert('Hata', 'Duşuş alarmi icin hedef fiyat mevcut fiyattan dusuk olmali');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await alertsAPI.create({
        priceCode: selectedPriceCode,
        priceName: selectedPrice.name,
        alertType,
        targetPrice: target,
        priceField,
      });

      Alert.alert(
        'Basarili',
        'Fiyat alarmi olusturuldu. Hedef fiyata ulasinca bildirim alacaksiniz.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error creating alert:', error);
      const message = error.response?.data?.error || 'Alarm olusturulamadi';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  }, [selectedPriceCode, selectedPrice, targetPrice, alertType, priceField, currentPrice, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="semiBold">Alarm Oluştur</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Price Selection */}
        <View style={styles.section}>
          <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
            Fiyat Secin
          </Text>

          {showPriceList ? (
            <View style={styles.priceListContainer}>
              {prices.map((price) => (
                <Pressable
                  key={price.code}
                  style={[
                    styles.priceListItem,
                    selectedPriceCode === price.code && styles.priceListItemSelected,
                  ]}
                  onPress={() => handleSelectPrice(price.code)}
                >
                  <Text
                    variant="bodyMedium"
                    weight={selectedPriceCode === price.code ? 'semiBold' : 'regular'}
                    color={selectedPriceCode === price.code ? '#D4AF37' : '#374151'}
                  >
                    {price.name}
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    {PriceFormat.format(price.satis)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Pressable
              style={styles.selectedPriceCard}
              onPress={() => setShowPriceList(true)}
            >
              <View style={styles.selectedPriceInfo}>
                <Text variant="titleSmall" weight="semiBold" color="#111827">
                  {selectedPrice?.name || 'Fiyat secin'}
                </Text>
                {selectedPrice && (
                  <View style={styles.currentPriceRow}>
                    <Text variant="bodySmall" color="#6B7280">Alis: </Text>
                    <Text variant="bodySmall" weight="semiBold" color="#D4AF37">
                      {PriceFormat.format(selectedPrice.alis)}
                    </Text>
                    <Text variant="bodySmall" color="#6B7280">  Satis: </Text>
                    <Text variant="bodySmall" weight="semiBold" color="#D4AF37">
                      {PriceFormat.format(selectedPrice.satis)}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>
          )}
        </View>

        {selectedPrice && !showPriceList && (
          <>
            {/* Price Field Selection */}
            <View style={styles.section}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
                Fiyat Turu
              </Text>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleBtn, priceField === 'satis' && styles.toggleBtnActive]}
                  onPress={() => handlePriceFieldChange('satis')}
                >
                  <Text
                    variant="bodyMedium"
                    weight={priceField === 'satis' ? 'semiBold' : 'regular'}
                    color={priceField === 'satis' ? '#422D00' : '#374151'}
                  >
                    Satis Fiyati
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, priceField === 'alis' && styles.toggleBtnActive]}
                  onPress={() => handlePriceFieldChange('alis')}
                >
                  <Text
                    variant="bodyMedium"
                    weight={priceField === 'alis' ? 'semiBold' : 'regular'}
                    color={priceField === 'alis' ? '#422D00' : '#374151'}
                  >
                    Alis Fiyati
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Alert Type Selection */}
            <View style={styles.section}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
                Alarm Tipi
              </Text>
              <View style={styles.alertTypeRow}>
                <Pressable
                  style={[styles.alertTypeBtn, alertType === 'above' && styles.alertTypeBtnActiveUp]}
                  onPress={() => handleAlertTypeChange('above')}
                >
                  <Ionicons
                    name="trending-up"
                    size={24}
                    color={alertType === 'above' ? '#16A34A' : '#6B7280'}
                  />
                  <Text
                    variant="bodyMedium"
                    weight={alertType === 'above' ? 'semiBold' : 'regular'}
                    color={alertType === 'above' ? '#16A34A' : '#374151'}
                  >
                    Yukselince
                  </Text>
                  <Text variant="labelSmall" color="#6B7280">
                    Fiyat hedefin ustune cikinca
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.alertTypeBtn, alertType === 'below' && styles.alertTypeBtnActiveDown]}
                  onPress={() => handleAlertTypeChange('below')}
                >
                  <Ionicons
                    name="trending-down"
                    size={24}
                    color={alertType === 'below' ? '#DC2626' : '#6B7280'}
                  />
                  <Text
                    variant="bodyMedium"
                    weight={alertType === 'below' ? 'semiBold' : 'regular'}
                    color={alertType === 'below' ? '#DC2626' : '#374151'}
                  >
                    Dusunce
                  </Text>
                  <Text variant="labelSmall" color="#6B7280">
                    Fiyat hedefin altina dusunce
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Target Price Input */}
            <View style={styles.section}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
                Hedef Fiyat
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder="Ornegin: 3000"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
                <Text variant="bodyMedium" color="#6B7280">TL</Text>
              </View>
              <View style={styles.priceCompare}>
                <Text variant="labelSmall" color="#6B7280">
                  Mevcut {priceField === 'alis' ? 'alis' : 'satis'}: {PriceFormat.format(currentPrice)}
                </Text>
                {targetPrice && !isNaN(parseFloat(targetPrice)) && (
                  <Text
                    variant="labelSmall"
                    color={parseFloat(targetPrice) > currentPrice ? '#16A34A' : '#DC2626'}
                  >
                    {parseFloat(targetPrice) > currentPrice ? '+' : ''}
                    {((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(2)}%
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text variant="bodyLarge" weight="semiBold" color="#422D00">
                {loading ? 'Oluşturuluyor...' : 'Alarm Oluştur'}
              </Text>
            </Pressable>

            {/* Info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <Text variant="bodySmall" color="#6B7280" style={styles.infoText}>
                Hedef fiyata ulaştığında telefonunuza bildirim gönderilecektir. Alarm tetiklendikten sonra otomatik olarak pasif hale gelir.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  priceListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 300,
  },
  priceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceListItemSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  selectedPriceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPriceInfo: {
    gap: 4,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  alertTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertTypeBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  alertTypeBtnActiveUp: {
    backgroundColor: 'rgba(22, 163, 74, 0.05)',
    borderColor: '#16A34A',
  },
  alertTypeBtnActiveDown: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderColor: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  priceCompare: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    flex: 1,
  },
});
