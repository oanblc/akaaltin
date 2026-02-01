import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '../components/common/Text';
import { Header } from '../components/common/Header';
import { PriceFormat } from '../constants/theme';
import { usePriceStore } from '../stores/priceStore';
import { useAuthStore } from '../stores/authStore';
import { Price, RootStackParamList, MainTabParamList } from '../types';

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

type SavingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Branches'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function SavingsScreen() {
  const navigation = useNavigation<SavingsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { prices } = usePriceStore();
  const { isAuthenticated } = useAuthStore();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectPriceModal, setSelectPriceModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [amount, setAmount] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'add' | 'remove'>('add');

  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  // Load savings from storage when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSavings();
    }, [])
  );

  const loadSavings = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Eski verileri yeni yapıya dönüştür
        const migrated = parsed.map((saving: any) => {
          if (!saving.transactions) {
            // Eski veri yapısı - yeni yapıya dönüştür
            return {
              ...saving,
              addedAt: saving.addedAt || new Date().toISOString(),
              purchasePrice: saving.purchasePrice || { alis: 0, satis: 0 },
              transactions: [{
                id: saving.id + '_initial',
                type: 'add' as const,
                amount: saving.amount,
                priceAtTransaction: saving.purchasePrice || { alis: 0, satis: 0 },
                date: saving.addedAt || new Date().toISOString(),
                note: 'İlk ekleme',
              }],
            };
          }
          return saving;
        });
        setSavings(migrated);
        // Dönüştürülmüş veriyi kaydet
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch (error) {
      console.error('Error loading savings:', error);
    }
  };

  const saveSavings = async (newSavings: Saving[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSavings));
      setSavings(newSavings);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleAddSaving = () => {
    if (!selectedPrice || !amount) {
      Alert.alert('Hata', 'Lütfen varlık seçin ve miktar girin.');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar girin.');
      return;
    }

    const now = new Date().toISOString();

    // Aynı ürün zaten var mı kontrol et
    const existingSavingIndex = savings.findIndex(s => s.priceCode === selectedPrice.code);

    if (existingSavingIndex !== -1) {
      // Mevcut birikime ekle
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

      const updatedSaving: Saving = {
        ...existingSaving,
        amount: existingSaving.amount + numAmount,
        transactions: [...existingSaving.transactions, newTransaction],
      };

      const newSavings = [...savings];
      newSavings[existingSavingIndex] = updatedSaving;
      saveSavings(newSavings);
    } else {
      // Yeni birikim oluştur
      const initialTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'add',
        amount: numAmount,
        priceAtTransaction: {
          alis: selectedPrice.alis,
          satis: selectedPrice.satis,
        },
        date: now,
        note: 'İlk ekleme',
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

      const newSavings = [...savings, newSaving];
      saveSavings(newSavings);
    }

    setModalVisible(false);
    setSelectedPrice(null);
    setAmount('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEditSaving = () => {
    if (!selectedSaving || !editAmount) {
      Alert.alert('Hata', 'Lütfen miktar girin.');
      return;
    }

    const numAmount = parseFloat(editAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar girin.');
      return;
    }

    const currentPrice = getCurrentPrice(selectedSaving.priceCode);
    if (!currentPrice) {
      Alert.alert('Hata', 'Fiyat bilgisi bulunamadı.');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: editType,
      amount: numAmount,
      priceAtTransaction: {
        alis: currentPrice.alis,
        satis: currentPrice.satis,
      },
      date: new Date().toISOString(),
    };

    const newAmount = editType === 'add'
      ? selectedSaving.amount + numAmount
      : selectedSaving.amount - numAmount;

    if (newAmount < 0) {
      Alert.alert('Hata', 'Çıkartılacak miktar mevcut miktardan fazla olamaz.');
      return;
    }

    const updatedSaving: Saving = {
      ...selectedSaving,
      amount: newAmount,
      transactions: [...selectedSaving.transactions, newTransaction],
    };

    const newSavings = savings.map(s => s.id === selectedSaving.id ? updatedSaving : s);
    saveSavings(newSavings);

    setEditModal(false);
    setSelectedSaving(updatedSaving);
    setEditAmount('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteSaving = (id: string) => {
    Alert.alert(
      'Birikimi Sil',
      'Bu birikimi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const newSavings = savings.filter((s) => s.id !== id);
            saveSavings(newSavings);
            setDetailModal(false);
            setSelectedSaving(null);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const getCurrentValue = (saving: Saving): number => {
    const price = prices.find((p) => p.code === saving.priceCode);
    if (!price) return 0;
    return saving.amount * price.satis;
  };

  const getTotalValue = (): { alis: number; satis: number } => {
    return savings.reduce(
      (total, saving) => {
        const price = prices.find((p) => p.code === saving.priceCode);
        if (!price) return total;
        return {
          alis: total.alis + saving.amount * price.alis,
          satis: total.satis + saving.amount * price.satis,
        };
      },
      { alis: 0, satis: 0 }
    );
  };

  const getCurrentPrice = (priceCode: string): Price | undefined => {
    return prices.find((p) => p.code === priceCode);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_HEIGHT + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Card - Guest */}
          <View style={styles.userCard}>
            <View style={styles.userAvatarSection}>
              <View style={styles.userAvatar}>
                <Ionicons name="wallet" size={32} color="#D4AF37" />
              </View>
              <View style={styles.userInfo}>
                <Text variant="titleMedium" weight="bold" color="#111827">
                  Birikimlerim
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Altın birikimlerinizi takip edin
                </Text>
              </View>
            </View>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            <View style={styles.loginIconWrapper}>
              <Ionicons name="person-circle-outline" size={48} color="#D4AF37" />
            </View>
            <Text variant="titleMedium" weight="bold" align="center" style={{ marginTop: 12 }}>
              Giriş Yapın
            </Text>
            <Text variant="bodyMedium" color="#6B7280" align="center" style={{ marginTop: 8, paddingHorizontal: 16 }}>
              Birikimlerinizi görüntüleyebilmek için hesabınıza giriş yapmanız gerekmektedir.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={styles.loginButton}
            >
              <Ionicons name="log-in-outline" size={20} color="#422D00" />
              <Text variant="labelLarge" weight="semiBold" color="#422D00">
                Giriş Yap
              </Text>
            </Pressable>
          </View>

          {/* Features */}
          <Text variant="labelMedium" weight="semiBold" color="#6B7280" style={{ marginTop: 24, marginBottom: 12 }}>
            ÖZELLİKLER
          </Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">Anlık Değer Takibi</Text>
                <Text variant="bodySmall" color="#6B7280">Güncel fiyatlarla hesaplayın</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="pie-chart" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">Portföy Yönetimi</Text>
                <Text variant="bodySmall" color="#6B7280">Tüm varlıklarınız tek yerde</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="time" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">İşlem Geçmişi</Text>
                <Text variant="bodySmall" color="#6B7280">Alım satım kayıtlarınız</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const openDetail = (saving: Saving) => {
    setSelectedSaving(saving);
    setDetailModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEdit = () => {
    setEditType('add');
    setEditAmount('');
    setEditModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total Value Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardHeader}>
            <View style={styles.totalIconContainer}>
              <Ionicons name="wallet" size={24} color="#D4AF37" />
            </View>
            <View>
              <Text variant="titleMedium" weight="bold" color="#111827">Toplam Birikim Değeri</Text>
              <Text variant="labelSmall" color="#6B7280">{savings.length} varlık</Text>
            </View>
          </View>
          <View style={styles.totalValuesRow}>
            <View style={styles.totalValueItem}>
              <Text variant="labelSmall" color="#6B7280">Alış Değeri</Text>
              <Text variant="bodyLarge" weight="bold" color="#111827" numberOfLines={1} adjustsFontSizeToFit>
                {PriceFormat.format(getTotalValue().alis)} ₺
              </Text>
            </View>
            <View style={styles.totalValueItem}>
              <Text variant="labelSmall" color="#6B7280">Satış Değeri</Text>
              <Text variant="bodyLarge" weight="bold" color="#16A34A" numberOfLines={1} adjustsFontSizeToFit>
                {PriceFormat.format(getTotalValue().satis)} ₺
              </Text>
            </View>
          </View>
        </View>

        {/* Add Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('SavingsAdd');
          }}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text variant="labelLarge" weight="semiBold" color="#FFFFFF">Birikim Ekle</Text>
        </Pressable>

        {/* Savings List */}
        <View style={styles.listContainer}>
          <Text variant="titleMedium" weight="semiBold" color="#111827" style={styles.listTitle}>
            Birikimlerim
          </Text>

          {savings.length > 0 ? (
            savings.map((saving) => {
              const currentPrice = getCurrentPrice(saving.priceCode);
              const currentValue = getCurrentValue(saving);

              return (
                <Pressable key={saving.id} style={styles.savingCard} onPress={() => openDetail(saving)}>
                  <View style={styles.savingHeader}>
                    <View style={styles.savingInfo}>
                      <Text variant="bodyMedium" weight="semiBold" color="#111827">
                        {saving.priceName}
                      </Text>
                      <Text variant="bodySmall" color="#6B7280">
                        {saving.amount} {saving.priceCode?.includes('GRAM') || saving.priceCode?.includes('ONS') ? 'gr' : 'adet'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </View>

                  <View style={styles.savingDetails}>
                    <View style={styles.savingDetail}>
                      <Text variant="labelSmall" color="#6B7280">Alış</Text>
                      <Text variant="bodySmall" weight="medium" color="#111827">
                        {currentPrice ? PriceFormat.format(currentPrice.alis) : '-'} ₺
                      </Text>
                    </View>
                    <View style={styles.savingDetail}>
                      <Text variant="labelSmall" color="#6B7280">Satış</Text>
                      <Text variant="bodySmall" weight="medium" color="#111827">
                        {currentPrice ? PriceFormat.format(currentPrice.satis) : '-'} ₺
                      </Text>
                    </View>
                    <View style={styles.savingDetailRight}>
                      <Text variant="labelSmall" color="#6B7280">Toplam Değer</Text>
                      <Text variant="bodyMedium" weight="bold" color="#16A34A">
                        {PriceFormat.format(currentValue)} ₺
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
              <Text variant="bodyMedium" color="#6B7280">Henüz birikim eklemediniz</Text>
              <Text variant="bodySmall" color="#D1D5DB">Yukarıdaki butona tıklayarak ekleyin</Text>
            </View>
          )}
        </View>

        <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
      </ScrollView>

      {/* Add Saving Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" weight="bold" color="#111827">Birikim Ekle</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Select Price */}
            <Text variant="labelMedium" color="#374151" style={styles.inputLabel}>Varlık Seçin</Text>
            <Pressable
              style={styles.selectButton}
              onPress={() => setSelectPriceModal(true)}
            >
              <Text
                variant="bodyMedium"
                color={selectedPrice ? '#111827' : '#6B7280'}
              >
                {selectedPrice ? selectedPrice.name : 'Varlık seçmek için tıklayın'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>

            {/* Amount Input */}
            <Text variant="labelMedium" color="#374151" style={styles.inputLabel}>Miktar</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 5 veya 2.5"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            {/* Preview */}
            {selectedPrice && amount && (
              <View style={styles.preview}>
                <Text variant="labelSmall" color="#6B7280">Tahmini Değer</Text>
                <Text variant="titleLarge" weight="bold" color="#16A34A">
                  {PriceFormat.format(parseFloat(amount.replace(',', '.') || '0') * selectedPrice.satis)} ₺
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable style={styles.submitButton} onPress={handleAddSaving}>
              <Text variant="labelLarge" weight="semiBold" color="#422D00">Ekle</Text>
            </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Select Price Modal */}
      <Modal
        visible={selectPriceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.priceModalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" weight="bold" color="#111827">Varlık Seçin</Text>
              <Pressable onPress={() => setSelectPriceModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {prices.map((price) => (
                <Pressable
                  key={price.code}
                  style={[
                    styles.priceOption,
                    selectedPrice?.code === price.code && styles.priceOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedPrice(price);
                    setSelectPriceModal(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" weight="medium" color="#111827">{price.name}</Text>
                    <View style={styles.priceOptionPrices}>
                      <Text variant="bodySmall" color="#6B7280">Alış: {PriceFormat.format(price.alis)} ₺</Text>
                      <Text variant="bodySmall" color="#6B7280">  |  Satış: {PriceFormat.format(price.satis)} ₺</Text>
                    </View>
                  </View>
                  {selectedPrice?.code === price.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.detailModalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" weight="bold" color="#111827">Birikim Detayı</Text>
              <Pressable onPress={() => setDetailModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {selectedSaving && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.detailSummaryCard}>
                  <View style={styles.detailSummaryHeader}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="wallet" size={24} color="#D4AF37" />
                    </View>
                    <View style={styles.detailSummaryInfo}>
                      <Text variant="titleMedium" weight="bold" color="#111827">{selectedSaving.priceName}</Text>
                      <Text variant="bodySmall" color="#6B7280">
                        {selectedSaving.amount} {selectedSaving.priceCode?.includes('GRAM') || selectedSaving.priceCode?.includes('ONS') ? 'gram' : 'adet'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailValueRow}>
                    <View style={styles.detailValueItem}>
                      <Text variant="labelSmall" color="#6B7280">Güncel Alış</Text>
                      <Text variant="bodyMedium" weight="semiBold" color="#111827">
                        {getCurrentPrice(selectedSaving.priceCode) ? PriceFormat.format(getCurrentPrice(selectedSaving.priceCode)!.alis) : '-'} ₺
                      </Text>
                    </View>
                    <View style={styles.detailValueItem}>
                      <Text variant="labelSmall" color="#6B7280">Güncel Satış</Text>
                      <Text variant="bodyMedium" weight="semiBold" color="#111827">
                        {getCurrentPrice(selectedSaving.priceCode) ? PriceFormat.format(getCurrentPrice(selectedSaving.priceCode)!.satis) : '-'} ₺
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailTotalValue}>
                    <Text variant="labelSmall" color="#6B7280">Toplam Değer</Text>
                    <Text variant="headlineSmall" weight="bold" color="#16A34A">
                      {PriceFormat.format(getCurrentValue(selectedSaving))} ₺
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.detailActions}>
                  <Pressable style={styles.editButton} onPress={openEdit}>
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text variant="labelMedium" weight="semiBold" color="#FFFFFF">Güncelle</Text>
                  </Pressable>
                  <Pressable style={styles.deleteButton} onPress={() => handleDeleteSaving(selectedSaving.id)}>
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  </Pressable>
                </View>

                {/* Transaction History */}
                <View style={styles.historySection}>
                  <Text variant="titleSmall" weight="semiBold" color="#111827" style={styles.historyTitle}>
                    İşlem Geçmişi
                  </Text>

                  {(selectedSaving.transactions || []).length === 0 ? (
                    <View style={styles.emptyHistory}>
                      <Text variant="bodySmall" color="#6B7280">Henüz işlem yok</Text>
                    </View>
                  ) : (
                    (selectedSaving.transactions || []).slice().reverse().map((transaction, index) => (
                      <View key={transaction.id} style={[
                        styles.transactionCardNew,
                        index === 0 && styles.transactionCardFirst
                      ]}>
                        <View style={styles.transactionCardHeader}>
                          <View style={styles.transactionLeft}>
                            <View style={[
                              styles.transactionIcon,
                              transaction.type === 'add' ? styles.transactionIconAdd : styles.transactionIconRemove
                            ]}>
                              <Ionicons
                                name={transaction.type === 'add' ? 'arrow-down' : 'arrow-up'}
                                size={16}
                                color={transaction.type === 'add' ? '#16A34A' : '#DC2626'}
                              />
                            </View>
                            <View style={styles.transactionInfo}>
                              <Text variant="bodySmall" weight="semiBold" color="#111827">
                                {transaction.type === 'add' ? 'Ekleme' : 'Çıkarma'}
                              </Text>
                              <Text variant="labelSmall" color="#6B7280">
                                {formatDate(transaction.date)}
                              </Text>
                            </View>
                          </View>
                          <Text
                            variant="bodyMedium"
                            weight="bold"
                            color={transaction.type === 'add' ? '#16A34A' : '#DC2626'}
                          >
                            {transaction.type === 'add' ? '+' : '-'}{transaction.amount}
                          </Text>
                        </View>
                        <View style={styles.transactionPrices}>
                          <View style={styles.transactionPriceItem}>
                            <Text variant="labelSmall" color="#6B7280">Alış</Text>
                            <Text variant="bodySmall" weight="medium" color="#111827">
                              {PriceFormat.format(transaction.priceAtTransaction?.alis || 0)} ₺
                            </Text>
                          </View>
                          <View style={styles.transactionPriceItem}>
                            <Text variant="labelSmall" color="#6B7280">Satış</Text>
                            <Text variant="bodySmall" weight="medium" color="#111827">
                              {PriceFormat.format(transaction.priceAtTransaction?.satis || 0)} ₺
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleMedium" weight="bold" color="#111827">Birikim Güncelle</Text>
              <Pressable onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Edit Type Toggle */}
            <Text variant="labelMedium" color="#374151" style={styles.inputLabel}>İşlem Türü</Text>
            <View style={styles.toggleContainer}>
              <Pressable
                style={[styles.toggleButton, editType === 'add' && styles.toggleButtonActive]}
                onPress={() => setEditType('add')}
              >
                <Ionicons name="add" size={18} color={editType === 'add' ? '#FFFFFF' : '#374151'} />
                <Text
                  variant="labelMedium"
                  weight="semiBold"
                  color={editType === 'add' ? '#FFFFFF' : '#374151'}
                >
                  Ekle
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, editType === 'remove' && styles.toggleButtonActiveRemove]}
                onPress={() => setEditType('remove')}
              >
                <Ionicons name="remove" size={18} color={editType === 'remove' ? '#FFFFFF' : '#374151'} />
                <Text
                  variant="labelMedium"
                  weight="semiBold"
                  color={editType === 'remove' ? '#FFFFFF' : '#374151'}
                >
                  Çıkar
                </Text>
              </Pressable>
            </View>

            {/* Current Amount Info */}
            {selectedSaving && (
              <View style={styles.currentAmountInfo}>
                <Text variant="bodySmall" color="#6B7280">
                  Mevcut miktar: {selectedSaving.amount} {selectedSaving.priceCode?.includes('GRAM') || selectedSaving.priceCode?.includes('ONS') ? 'gr' : 'adet'}
                </Text>
              </View>
            )}

            {/* Amount Input */}
            <Text variant="labelMedium" color="#374151" style={styles.inputLabel}>
              {editType === 'add' ? 'Eklenecek Miktar' : 'Çıkarılacak Miktar'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 5 veya 2.5"
              placeholderTextColor="#6B7280"
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
            />

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, editType === 'remove' && styles.submitButtonRemove]}
              onPress={handleEditSaving}
            >
              <Text variant="labelLarge" weight="semiBold" color="#422D00">
                {editType === 'add' ? 'Ekle' : 'Çıkar'}
              </Text>
            </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // User Card (matching ProfileScreen)
  userCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  userAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },

  // Login Section
  loginSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
  },
  loginIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    width: '100%',
  },

  // Features
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },

  // Total Card
  totalCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  totalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValuesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  totalValueItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },

  // List
  listContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  listTitle: {
    marginBottom: 16,
  },

  // Saving Card
  savingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  savingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  savingInfo: {
    flex: 1,
    gap: 2,
  },
  savingDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  savingDetail: {
    gap: 2,
  },
  savingDetailRight: {
    gap: 2,
    flex: 1,
    alignItems: 'flex-end',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  priceModalContent: {
    maxHeight: '70%',
  },
  detailModalContent: {
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  // Form
  inputLabel: {
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  preview: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonRemove: {
    backgroundColor: '#DC2626',
  },

  // Price Options
  priceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceOptionSelected: {
    backgroundColor: '#FDF8E7',
  },
  priceOptionPrices: {
    flexDirection: 'row',
    marginTop: 2,
  },

  // Detail Modal
  detailSummaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailSummaryInfo: {
    flex: 1,
    gap: 2,
  },
  detailValueRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailValueItem: {
    flex: 1,
    gap: 4,
  },
  detailTotalValue: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  deleteButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    marginBottom: 12,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  // Transaction Card
  transactionCardNew: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  transactionCardFirst: {
    marginTop: 0,
  },
  transactionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIconAdd: {
    backgroundColor: '#DCFCE7',
  },
  transactionIconRemove: {
    backgroundColor: '#FEE2E2',
  },
  transactionInfo: {
    gap: 2,
  },
  transactionPrices: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  transactionPriceItem: {
    gap: 2,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#16A34A',
  },
  toggleButtonActiveRemove: {
    backgroundColor: '#DC2626',
  },
  currentAmountInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
});
