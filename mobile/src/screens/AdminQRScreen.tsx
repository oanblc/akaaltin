import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { CustomAlert, useCustomAlert } from '../components/common/CustomAlert';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

interface Category {
  id: number;
  name: string;
  tlPerPoint: number;
  isActive: boolean;
}

interface CategoryAmount {
  categoryId: number;
  amount: string; // Formatted string for display
}

interface CategoryBreakdownItem {
  categoryId: number;
  categoryName: string;
  amount: number;
  points: number;
}

export function AdminQRScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { customer } = useAuthStore();
  const { showAlert, alertProps } = useCustomAlert();

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state - multiple category amounts
  const [categoryAmounts, setCategoryAmounts] = useState<CategoryAmount[]>([]);
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // QR state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [earnPoints, setEarnPoints] = useState<number>(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(60);
  const [qrUsed, setQrUsed] = useState(false);
  const [usedByCustomer, setUsedByCustomer] = useState<{ name: string; phone: string } | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories?activeOnly=true');
        setCategories(response.data);
        // Initialize categoryAmounts with all categories (empty amounts)
        setCategoryAmounts(response.data.map((c: Category) => ({
          categoryId: c.id,
          amount: ''
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
        showAlert('Hata', 'Kategoriler yüklenemedi', undefined, 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Timer for countdown
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemainingTime(remaining);

      if (remaining <= 0) {
        // QR expired
        setQrCode(null);
        setExpiresAt(null);
        setEarnPoints(0);
        setDescription('');
        setQrUsed(false);
        setUsedByCustomer(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Polling for QR status (check if customer used the QR)
  useEffect(() => {
    if (!qrCode || qrUsed) return;

    const pollStatus = async () => {
      try {
        const response = await api.get(`/api/qrcodes/status/${qrCode}`);
        const { isUsed, customer } = response.data;

        if (isUsed && customer) {
          setQrUsed(true);
          setUsedByCustomer(customer);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showAlert(
            'İşlem Tamamlandı! ✓',
            `Müşteri QR kodu başarıyla taradı ve ${earnPoints} puan kazandı.\n\nMüşteri: ${customer.name}\nTelefon: ${customer.phone}`,
            [
              {
                text: 'Tamam',
                onPress: () => navigation.navigate('Main', { screen: 'QR' } as never),
              },
            ],
            'success'
          );
        }
      } catch (error) {
        // Ignore errors during polling
      }
    };

    // Poll every 2 seconds
    const pollInterval = setInterval(pollStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [qrCode, qrUsed, earnPoints]);

  const formatAmount = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format with thousands separator
    if (cleaned) {
      return parseInt(cleaned).toLocaleString('tr-TR');
    }
    return '';
  };

  const handleCategoryAmountChange = (categoryId: number, text: string) => {
    setCategoryAmounts(prev => prev.map(ca =>
      ca.categoryId === categoryId
        ? { ...ca, amount: formatAmount(text) }
        : ca
    ));
  };

  const getRawAmount = (formattedAmount: string) => parseInt(formattedAmount.replace(/\D/g, '')) || 0;

  // Calculate points for each category and totals
  const calculateBreakdown = () => {
    let totalPoints = 0;
    let totalAmount = 0;
    const breakdown: { categoryId: number; categoryName: string; amount: number; points: number }[] = [];

    for (const ca of categoryAmounts) {
      const rawAmount = getRawAmount(ca.amount);
      if (rawAmount <= 0) continue;

      const category = categories.find(c => c.id === ca.categoryId);
      if (!category) continue;

      const points = Math.floor(rawAmount / category.tlPerPoint);
      breakdown.push({
        categoryId: category.id,
        categoryName: category.name,
        amount: rawAmount,
        points
      });

      totalPoints += points;
      totalAmount += rawAmount;
    }

    return { totalPoints, totalAmount, breakdown };
  };

  const { totalPoints: expectedPoints, totalAmount: expectedTotalAmount, breakdown: expectedBreakdown } = calculateBreakdown();

  const handleCreateQR = async () => {
    if (expectedBreakdown.length === 0) {
      showAlert('Hata', 'En az bir kategoride tutar girin', undefined, 'error');
      return;
    }

    if (expectedPoints <= 0) {
      showAlert('Hata', 'Girilen tutarlar için puan kazanılamaz', undefined, 'error');
      return;
    }

    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Send categories array to API
      const categoriesPayload = expectedBreakdown.map(item => ({
        categoryId: item.categoryId,
        amount: item.amount
      }));

      const response = await api.post('/api/qrcodes/earn', {
        categories: categoriesPayload,
        description: description || undefined,
        createdBy: customer?.name,
      });

      const { code, points, expiresAt: expiry, categoryBreakdown: breakdown } = response.data;

      setQrCode(code);
      setEarnPoints(points);
      setCategoryBreakdown(breakdown || expectedBreakdown);
      setExpiresAt(new Date(expiry));
      setRemainingTime(60);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      showAlert('Hata', error.response?.data?.error || 'QR kod oluşturulamadı', undefined, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewQR = () => {
    setQrCode(null);
    setExpiresAt(null);
    setEarnPoints(0);
    setCategoryBreakdown([]);
    setDescription('');
    setRemainingTime(60);
    setQrUsed(false);
    setUsedByCustomer(null);
    // Reset all category amounts
    setCategoryAmounts(categories.map(c => ({
      categoryId: c.id,
      amount: ''
    })));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="semiBold">
          Puan QR Oluştur
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text variant="bodyMedium" color="#6B7280" style={{ marginTop: 12 }}>
              Kategoriler yükleniyor...
            </Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.noCategoryContainer}>
            <Ionicons name="warning" size={48} color="#F59E0B" />
            <Text variant="titleMedium" weight="semiBold" color="#111827" style={{ marginTop: 16 }}>
              Kategori Bulunamadı
            </Text>
            <Text variant="bodyMedium" color="#6B7280" align="center" style={{ marginTop: 8 }}>
              QR kod oluşturmak için önce admin panelden bir puan kategorisi eklemeniz gerekiyor.
            </Text>
          </View>
        ) : !qrCode ? (
          // Form view
          <>
            {/* Category Amount Inputs */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <View style={[styles.inputIconWrapper, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="pricetag" size={20} color="#6366F1" />
                </View>
                <Text variant="labelMedium" weight="semiBold" color="#374151">
                  Kategori Tutarları
                </Text>
              </View>
              <Text variant="bodySmall" color="#6B7280" style={{ marginBottom: 16 }}>
                Her kategoriden alışveriş tutarını girin
              </Text>

              {categories.map((category) => {
                const catAmount = categoryAmounts.find(ca => ca.categoryId === category.id);
                const rawAmount = getRawAmount(catAmount?.amount || '');
                const catPoints = rawAmount > 0 ? Math.floor(rawAmount / category.tlPerPoint) : 0;

                return (
                  <View key={category.id} style={styles.categoryInputRow}>
                    <View style={styles.categoryInfo}>
                      <Text variant="labelMedium" weight="semiBold" color="#374151">
                        {category.name}
                      </Text>
                      <Text variant="labelSmall" color="#6B7280">
                        {category.tlPerPoint.toLocaleString('tr-TR')} TL = 1 Puan
                      </Text>
                    </View>
                    <View style={styles.categoryAmountInput}>
                      <TextInput
                        style={styles.categoryAmountTextInput}
                        placeholder="0"
                        placeholderTextColor="#6B7280"
                        value={catAmount?.amount || ''}
                        onChangeText={(text) => handleCategoryAmountChange(category.id, text)}
                        keyboardType="number-pad"
                      />
                      <Text variant="labelSmall" color="#6B7280">TL</Text>
                    </View>
                    {catPoints > 0 && (
                      <View style={styles.categoryPointsBadge}>
                        <Text variant="labelSmall" weight="semiBold" color="#D4AF37">
                          +{catPoints}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Total Summary */}
              {expectedPoints > 0 && (
                <View style={styles.totalSummary}>
                  <View style={styles.totalRow}>
                    <Text variant="bodySmall" color="#6B7280">Toplam Tutar:</Text>
                    <Text variant="labelLarge" weight="bold" color="#111827">
                      {expectedTotalAmount.toLocaleString('tr-TR')} TL
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text variant="bodySmall" color="#6B7280">Toplam Puan:</Text>
                    <View style={styles.totalPointsBadge}>
                      <Ionicons name="star" size={14} color="#D4AF37" />
                      <Text variant="labelLarge" weight="bold" color="#D4AF37">
                        {expectedPoints}
                      </Text>
                    </View>
                  </View>
                  {/* Breakdown */}
                  {expectedBreakdown.length > 1 && (
                    <View style={styles.breakdownList}>
                      {expectedBreakdown.map((item, index) => (
                        <Text key={index} variant="labelSmall" color="#6B7280">
                          {item.categoryName}: {item.amount.toLocaleString('tr-TR')} TL → {item.points} puan
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Description Input Card */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <View style={[styles.inputIconWrapper, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="document-text" size={20} color="#6B7280" />
                </View>
                <Text variant="labelMedium" weight="semiBold" color="#374151">
                  Açıklama (Opsiyonel)
                </Text>
              </View>
              <View style={styles.descriptionInputContainer}>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Örnek: 22 Ayar Bilezik"
                  placeholderTextColor="#6B7280"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Create Button */}
            <Pressable
              onPress={handleCreateQR}
              style={[styles.createButton, (isCreating || expectedBreakdown.length === 0) && styles.buttonDisabled]}
              disabled={isCreating || expectedBreakdown.length === 0}
            >
              {isCreating ? (
                <ActivityIndicator color="#422D00" />
              ) : (
                <>
                  <View style={styles.createButtonIcon}>
                    <Ionicons name="qr-code" size={24} color="#422D00" />
                  </View>
                  <View style={styles.createButtonText}>
                    <Text variant="titleSmall" weight="semiBold" color="#422D00">
                      QR Kod Oluştur
                    </Text>
                    <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                      Müşteriye gösterin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </>
              )}
            </Pressable>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={{ marginBottom: 12 }}>
                Nasıl Çalışır?
              </Text>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">1</Text>
                </View>
                <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
                  Alışveriş tutarını girin
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">2</Text>
                </View>
                <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
                  QR kodu oluşturun ve müşteriye gösterin
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={styles.infoStepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">3</Text>
                </View>
                <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
                  Müşteri uygulamasından tarar ve puanı kazanır
                </Text>
              </View>
            </View>
          </>
        ) : (
          // QR Display view
          <>
            {/* Timer Badge */}
            <View style={styles.timerBadgeContainer}>
              {qrUsed ? (
                <View style={[styles.timerBadge, styles.timerBadgeSuccess]}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text variant="titleMedium" weight="bold" color="#16A34A">
                    İşlem Tamamlandı
                  </Text>
                </View>
              ) : (
                <View style={[styles.timerBadge, remainingTime <= 10 && styles.timerBadgeUrgent]}>
                  <Ionicons
                    name="time"
                    size={20}
                    color={remainingTime <= 10 ? '#DC2626' : '#D4AF37'}
                  />
                  <Text
                    variant="titleMedium"
                    weight="bold"
                    color={remainingTime <= 10 ? '#DC2626' : '#D4AF37'}
                  >
                    {remainingTime} saniye
                  </Text>
                </View>
              )}
            </View>

            {/* QR Card */}
            <View style={styles.qrDisplayCard}>
              {/* Used Badge */}
              {qrUsed && (
                <View style={styles.usedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text variant="labelMedium" weight="semiBold" color="#16A34A">
                    Kullanıldı
                  </Text>
                </View>
              )}

              {/* Points Badge */}
              <View style={[styles.pointsBadge, qrUsed && styles.pointsBadgeUsed]}>
                <Ionicons name="star" size={18} color={qrUsed ? '#6B7280' : '#D4AF37'} />
                <Text variant="labelMedium" weight="semiBold" color={qrUsed ? '#6B7280' : '#D4AF37'}>
                  {earnPoints} Puan
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrCode || ''}
                  size={220}
                  color="#111827"
                  backgroundColor="#FFFFFF"
                />
              </View>

              {/* Details */}
              <View style={styles.qrDetails}>
                {/* Category Breakdown */}
                {categoryBreakdown.length > 0 && (
                  <View style={styles.qrBreakdownSection}>
                    <Text variant="bodySmall" color="#6B7280" style={{ marginBottom: 8 }}>Kategoriler</Text>
                    {categoryBreakdown.map((item, index) => (
                      <View key={index} style={styles.qrBreakdownRow}>
                        <View style={styles.categoryBadgeSmall}>
                          <Text variant="labelSmall" weight="semiBold" color="#6366F1">{item.categoryName}</Text>
                        </View>
                        <Text variant="labelSmall" color="#6B7280">
                          {item.amount.toLocaleString('tr-TR')} TL → {item.points} puan
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.qrDetailRow}>
                  <Text variant="bodySmall" color="#6B7280">Toplam Tutar</Text>
                  <Text variant="labelLarge" weight="bold" color="#111827">
                    {categoryBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString('tr-TR')} TL
                  </Text>
                </View>
                {description && (
                  <View style={styles.qrDetailRow}>
                    <Text variant="bodySmall" color="#6B7280">Açıklama</Text>
                    <Text variant="labelMedium" weight="medium" color="#111827">{description}</Text>
                  </View>
                )}
              </View>

              <Text variant="labelSmall" color="#6B7280" align="center" style={{ marginTop: 12 }}>
                {qrCode}
              </Text>
            </View>

            {/* Instructions or Customer Info */}
            {qrUsed && usedByCustomer ? (
              <View style={styles.customerInfoCard}>
                <View style={styles.instructionHeader}>
                  <Ionicons name="person-circle" size={20} color="#16A34A" />
                  <Text variant="labelMedium" weight="semiBold" color="#374151">
                    Müşteri Bilgisi
                  </Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text variant="bodySmall" color="#6B7280">İsim</Text>
                  <Text variant="labelLarge" weight="semiBold" color="#111827">{usedByCustomer.name}</Text>
                </View>
                <View style={{ marginTop: 8 }}>
                  <Text variant="bodySmall" color="#6B7280">Telefon</Text>
                  <Text variant="labelLarge" weight="semiBold" color="#111827">{usedByCustomer.phone}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.instructionsCard}>
                <View style={styles.instructionHeader}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#D4AF37" />
                  <Text variant="labelMedium" weight="semiBold" color="#374151">
                    Müşteriye Söyleyin
                  </Text>
                </View>
                <Text variant="bodySmall" color="#6B7280" style={{ marginTop: 8 }}>
                  "Aka Kuyumculuk uygulamasını açın, QR sekmesinden 'Puan Kazan' seçin ve bu kodu tarayın"
                </Text>
              </View>
            )}

            {/* New QR Button */}
            <Pressable onPress={handleNewQR} style={[styles.newQRButton, qrUsed && styles.newQRButtonSuccess]}>
              <Ionicons name={qrUsed ? "add-circle" : "refresh"} size={20} color={qrUsed ? "#16A34A" : "#374151"} />
              <Text variant="labelLarge" weight="semiBold" color={qrUsed ? "#16A34A" : "#374151"}>
                {qrUsed ? 'Yeni İşlem Başlat' : 'Yeni QR Oluştur'}
              </Text>
            </Pressable>

            {/* Warning - only show if QR not used */}
            {!qrUsed && (
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={18} color="#DC2626" />
                <Text variant="bodySmall" color="#DC2626" style={{ flex: 1 }}>
                  QR kod 1 dakika içinde geçerlidir. Süre dolarsa yeni QR oluşturun.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert {...alertProps} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Input Cards
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    height: 60,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  currencyBadge: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  descriptionInput: {
    height: 52,
    fontSize: 16,
    color: '#111827',
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
    gap: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  createButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    flex: 1,
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noCategoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  // Category Input Rows
  categoryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
  },
  categoryAmountTextInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 60,
    textAlign: 'right',
  },
  categoryPointsBadge: {
    backgroundColor: '#FEF9E7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  totalSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF9E7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  breakdownList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 4,
  },
  qrBreakdownSection: {
    width: '100%',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  qrBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Timer Badge
  timerBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  timerBadgeUrgent: {
    backgroundColor: '#FEF2F2',
  },
  timerBadgeSuccess: {
    backgroundColor: '#ECFDF5',
  },

  // QR Display Card
  qrDisplayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEF9E7',
    marginBottom: 16,
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  pointsBadgeUsed: {
    backgroundColor: '#F3F4F6',
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  qrDetails: {
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  qrDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadgeSmall: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  // Instructions Card
  instructionsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  customerInfoCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // New QR Button
  newQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  newQRButtonSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#16A34A',
  },

  // Warning Card
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
});
