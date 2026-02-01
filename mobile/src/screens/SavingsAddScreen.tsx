import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '../components/common/Text';
import { PriceFormat } from '../constants/theme';
import { usePriceStore } from '../stores/priceStore';
import { pricesAPI } from '../services/api';
import { Price, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Transaction {
  id: string;
  type: 'add' | 'remove' | 'update';
  amount: number;
  priceAtTransaction: {
    alis: number;
    satis: number;
  };
  date: string;
  note?: string;
}

interface Saving {
  id: string;
  priceCode: string;
  priceName: string;
  amount: number;
  addedAt: string;
  purchasePrice: {
    alis: number;
    satis: number;
  };
  transactions: Transaction[];
}

const STORAGE_KEY = '@aka_savings';

export function SavingsAddScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { prices, setPrices } = usePriceStore();

  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [amount, setAmount] = useState('');
  const [showPriceList, setShowPriceList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Ekran acildiginda fiyatlar bossa API'den cek
  useEffect(() => {
    if (prices.length === 0) {
      fetchPrices();
    }
  }, []);

  const fetchPrices = async () => {
    setLoadingPrices(true);
    try {
      const response = await pricesAPI.getAll();
      if (response.data?.prices) {
        setPrices(response.data.prices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSelectPrice = useCallback((price: Price) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPrice(price);
    setShowPriceList(false);
  }, []);

  const handleAddSaving = useCallback(async () => {
    if (!selectedPrice || !amount) {
      Alert.alert('Hata', 'Lutfen varlik secin ve miktar girin.');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Gecerli bir miktar girin.');
      return;
    }

    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const savings: Saving[] = data ? JSON.parse(data) : [];
      const now = new Date().toISOString();

      const existingSavingIndex = savings.findIndex(s => s.priceCode === selectedPrice.code);

      if (existingSavingIndex !== -1) {
        const existingSaving = savings[existingSavingIndex];
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'add',
          amount: numAmount,
          priceAtTransaction: {
            alis: selectedPrice.alis,
            satis: selectedPrice.satis,
          },
          date: now,
        };

        savings[existingSavingIndex] = {
          ...existingSaving,
          amount: existingSaving.amount + numAmount,
          transactions: [...existingSaving.transactions, newTransaction],
        };
      } else {
        const initialTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'add',
          amount: numAmount,
          priceAtTransaction: {
            alis: selectedPrice.alis,
            satis: selectedPrice.satis,
          },
          date: now,
          note: 'Ilk ekleme',
        };

        const newSaving: Saving = {
          id: Date.now().toString(),
          priceCode: selectedPrice.code,
          priceName: selectedPrice.name,
          amount: numAmount,
          addedAt: now,
          purchasePrice: {
            alis: selectedPrice.alis,
            satis: selectedPrice.satis,
          },
          transactions: [initialTransaction],
        };

        savings.push(newSaving);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savings));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Basarili',
        'Birikim eklendi.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding saving:', error);
      Alert.alert('Hata', 'Birikim eklenirken bir hata olustu.');
    } finally {
      setLoading(false);
    }
  }, [selectedPrice, amount, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="semiBold">Birikim Ekle</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Price Selection */}
        <View style={styles.section}>
          <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
            Varlik Secin
          </Text>

          {showPriceList ? (
            <View style={styles.priceListContainer}>
              {loadingPrices ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#D4AF37" />
                  <Text variant="bodySmall" color="#6B7280" style={{ marginTop: 12 }}>
                    Fiyatlar yükleniyor...
                  </Text>
                </View>
              ) : prices.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color="#6B7280" />
                  <Text variant="bodySmall" color="#6B7280" style={{ marginTop: 12 }}>
                    Fiyat bulunamadı
                  </Text>
                  <Pressable style={styles.retryBtn} onPress={fetchPrices}>
                    <Text variant="labelSmall" color="#D4AF37">Tekrar Dene</Text>
                  </Pressable>
                </View>
              ) : prices.map((price) => (
                <Pressable
                  key={price.code}
                  style={[
                    styles.priceListItem,
                    selectedPrice?.code === price.code && styles.priceListItemSelected,
                  ]}
                  onPress={() => handleSelectPrice(price)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyMedium"
                      weight={selectedPrice?.code === price.code ? 'semiBold' : 'regular'}
                      color={selectedPrice?.code === price.code ? '#D4AF37' : '#374151'}
                    >
                      {price.name}
                    </Text>
                    <View style={styles.priceOptionPrices}>
                      <Text variant="bodySmall" color="#6B7280">
                        Alis: {PriceFormat.format(price.alis)}
                      </Text>
                      <Text variant="bodySmall" color="#6B7280">
                        {' | '}Satis: {PriceFormat.format(price.satis)}
                      </Text>
                    </View>
                  </View>
                  {selectedPrice?.code === price.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
                  )}
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
                  {selectedPrice?.name || 'Varlik secin'}
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
            {/* Amount Input */}
            <View style={styles.section}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={styles.sectionTitle}>
                Miktar
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Orn: 5 veya 2.5"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                />
                <Text variant="bodyMedium" color="#6B7280">
                  {selectedPrice.code?.includes('GRAM') || selectedPrice.code?.includes('ONS') ? 'gr' : 'adet'}
                </Text>
              </View>
            </View>

            {/* Preview */}
            {amount && (
              <View style={styles.preview}>
                <Text variant="labelSmall" color="#6B7280">Tahmini Deger</Text>
                <Text variant="titleLarge" weight="bold" color="#16A34A">
                  {PriceFormat.format(parseFloat(amount.replace(',', '.') || '0') * selectedPrice.satis)} TL
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleAddSaving}
              disabled={loading}
            >
              <Text variant="bodyLarge" weight="semiBold" color="#422D00">
                {loading ? 'Ekleniyor...' : 'Birikim Ekle'}
              </Text>
            </Pressable>

            {/* Info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <Text variant="bodySmall" color="#6B7280" style={styles.infoText}>
                Birikimleriniz cihazınızda yerel olarak saklanır. Güncel fiyatlarla değerinizi takip edebilirsiniz.
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
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
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
  priceOptionPrices: {
    flexDirection: 'row',
    marginTop: 2,
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
  preview: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
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
