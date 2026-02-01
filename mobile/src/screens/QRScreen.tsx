import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Card } from '../components/common/Card';
import { Header } from '../components/common/Header';
import { CustomAlert, useCustomAlert } from '../components/common/CustomAlert';
import { RootStackParamList, MainTabParamList } from '../types';
import { useAuthStore, useIsAdmin, useIsCustomer } from '../stores/authStore';
import { api } from '../services/api';

type TabType = 'myqr' | 'scan' | 'spend';

type QRScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'QR'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function QRScreen() {
  const navigation = useNavigation<QRScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { customer, isAuthenticated, logout, refreshProfile } = useAuthStore();
  const isAdmin = useIsAdmin();
  const isCustomer = useIsCustomer();
  const [activeTab, setActiveTab] = useState<TabType>('myqr');
  const { showAlert, alertProps } = useCustomAlert();

  // Spend QR state
  const [spendPoints, setSpendPoints] = useState('');
  const [spendQRCode, setSpendQRCode] = useState<string | null>(null);
  const [spendExpiresAt, setSpendExpiresAt] = useState<Date | null>(null);
  const [isCreatingSpendQR, setIsCreatingSpendQR] = useState(false);
  const [spendQRUsed, setSpendQRUsed] = useState(false);

  // Transaction history state
  interface Transaction {
    id: number;
    type: string;
    points: number;
    amount: number | null;
    description: string | null;
    createdAt: string;
  }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  // Countdown timer for spend QR
  useEffect(() => {
    if (!spendExpiresAt) return;

    const interval = setInterval(() => {
      if (new Date() > spendExpiresAt) {
        setSpendQRCode(null);
        setSpendExpiresAt(null);
        setSpendPoints('');
        setSpendQRUsed(false);
        // Refresh profile when spend QR expires (points may have been used)
        refreshProfile();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [spendExpiresAt, refreshProfile]);

  // Polling for spend QR status (check if admin used the QR)
  useEffect(() => {
    if (!spendQRCode || spendQRUsed) return;

    const pollStatus = async () => {
      try {
        const response = await api.get(`/api/qrcodes/status/${spendQRCode}`);
        const { isUsed, points } = response.data;

        if (isUsed) {
          setSpendQRUsed(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Refresh profile to get updated points
          await refreshProfile();
          showAlert(
            'İşlem Tamamlandı! ✓',
            `${points} puanınız başarıyla kullanıldı.`,
            [
              {
                text: 'Tamam',
                onPress: () => {
                  setSpendQRCode(null);
                  setSpendExpiresAt(null);
                  setSpendPoints('');
                  setSpendQRUsed(false);
                  setActiveTab('myqr');
                },
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
  }, [spendQRCode, spendQRUsed, refreshProfile]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (customerId: number) => {
    setLoadingTransactions(true);
    try {
      const response = await api.get(`/api/transactions/customer/${customerId}?limit=10`);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Auto-refresh profile and transactions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && customer) {
        refreshProfile();
        if (isCustomer) {
          fetchTransactions(customer.id);
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isCustomer])
  );

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleCreateSpendQR = async () => {
    if (!customer) return;

    const points = parseInt(spendPoints);
    if (!points || points <= 0) {
      showAlert('Hata', 'Geçerli bir puan değeri girin', undefined, 'error');
      return;
    }

    const availablePoints = customer.totalPoints - customer.usedPoints;
    if (points > availablePoints) {
      showAlert('Yetersiz Puan', `Kullanılabilir puanınız: ${availablePoints}`, undefined, 'warning');
      return;
    }

    setIsCreatingSpendQR(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await api.post('/api/qrcodes/spend', {
        customerId: customer.id,
        points,
      });

      const { code, expiresAt } = response.data;
      setSpendQRCode(code);
      setSpendExpiresAt(new Date(expiresAt));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      showAlert('Hata', error.response?.data?.error || 'QR kod oluşturulamadı', undefined, 'error');
    } finally {
      setIsCreatingSpendQR(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
      'warning'
    );
  };

  const availablePoints = customer ? customer.totalPoints - customer.usedPoints : 0;

  // Calculate remaining time for spend QR
  const getRemainingTime = () => {
    if (!spendExpiresAt) return '';
    const remaining = Math.max(0, Math.floor((spendExpiresAt.getTime() - Date.now()) / 1000));
    return `${remaining} saniye`;
  };

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Card - Guest */}
          <View style={styles.userCard}>
            <View style={styles.userAvatarSection}>
              <View style={styles.userAvatar}>
                <Ionicons name="qr-code" size={32} color="#D4AF37" />
              </View>
              <View style={styles.userInfo}>
                <Text variant="titleMedium" weight="bold" color="#111827">
                  QR Kod ile Puan Sistemi
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Alışverişlerinizde puan kazanın ve harcayın
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
              QR kod sayfasını görüntüleyebilmek için hesabınıza giriş yapmanız gerekmektedir.
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
                <Ionicons name="star" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">Her alışverişte puan kazanın</Text>
                <Text variant="bodySmall" color="#6B7280">Her 100₺ = 1 Puan</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="gift" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">Puanlarınızı harcayın</Text>
                <Text variant="bodySmall" color="#6B7280">İndirim ve hediyeler</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#D4AF37" />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" weight="medium" color="#111827">Güvenli işlem</Text>
                <Text variant="bodySmall" color="#6B7280">QR kod ile hızlı ve güvenli</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Admin logged in - show admin QR screen
  if (isAdmin && customer) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
        >
          {/* Welcome Card */}
          <View style={styles.adminWelcomeCard}>
            <View style={styles.adminWelcomeAvatar}>
              <Ionicons name="storefront" size={28} color="#D4AF37" />
            </View>
            <View style={styles.adminWelcomeInfo}>
              <Text variant="bodySmall" color="#6B7280">Kasiyer Paneli</Text>
              <Text variant="titleMedium" weight="bold" color="#111827">
                {customer.name}
              </Text>
            </View>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              <Text variant="labelSmall" weight="semiBold" color="#16A34A">Yetkili</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.adminActionsContainer}>
            {/* Create Earn QR Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('AdminQR');
              }}
              style={styles.adminActionButtonNew}
            >
              <View style={styles.adminActionButtonIcon}>
                <Ionicons name="add-circle" size={28} color="#422D00" />
              </View>
              <View style={styles.adminActionButtonText}>
                <Text variant="titleMedium" weight="semiBold" color="#422D00">
                  Puan QR Oluştur
                </Text>
                <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                  Alışveriş sonrası puan kazandır
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
            </Pressable>

            {/* Scan Spend QR Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('AdminScanner');
              }}
              style={styles.adminScanButtonNew}
            >
              <View style={styles.adminScanButtonIcon}>
                <Ionicons name="scan" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.adminActionButtonText}>
                <Text variant="titleMedium" weight="semiBold" color="#FFFFFF">
                  Puan Harcama Tara
                </Text>
                <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                  Müşteri QR kodunu okut
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>

          {/* How it works */}
          <View style={styles.adminInfoCard}>
            <Text variant="labelMedium" weight="semiBold" color="#374151" style={{ marginBottom: 16 }}>
              Nasıl Çalışır?
            </Text>

            <View style={styles.adminInfoItem}>
              <View style={[styles.adminInfoNumber, { backgroundColor: '#D4AF37' }]}>
                <Text variant="labelSmall" weight="bold" color="#422D00">1</Text>
              </View>
              <View style={styles.adminInfoContent}>
                <Text variant="bodyMedium" weight="medium" color="#111827">
                  Müşteri alışverişini tamamlar
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Ödeme aldıktan sonra
                </Text>
              </View>
            </View>

            <View style={styles.adminInfoDivider} />

            <View style={styles.adminInfoItem}>
              <View style={[styles.adminInfoNumber, { backgroundColor: '#D4AF37' }]}>
                <Text variant="labelSmall" weight="bold" color="#422D00">2</Text>
              </View>
              <View style={styles.adminInfoContent}>
                <Text variant="bodyMedium" weight="medium" color="#111827">
                  QR kod oluşturun
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Tutarı girin, QR oluşturun
                </Text>
              </View>
            </View>

            <View style={styles.adminInfoDivider} />

            <View style={styles.adminInfoItem}>
              <View style={[styles.adminInfoNumber, { backgroundColor: '#D4AF37' }]}>
                <Text variant="labelSmall" weight="bold" color="#422D00">3</Text>
              </View>
              <View style={styles.adminInfoContent}>
                <Text variant="bodyMedium" weight="medium" color="#111827">
                  Müşteri tarar ve kazanır
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Puanlar anında yüklenir
                </Text>
              </View>
            </View>
          </View>

          {/* Tip Card */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={20} color="#D4AF37" />
            <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
              Puan harcamak isteyen müşteri size QR kodunu gösterdiğinde "Puan Harcama Tara" butonunu kullanın.
            </Text>
          </View>
        </ScrollView>

        {/* Custom Alert */}
        <CustomAlert {...alertProps} />
      </View>
    );
  }

  // Customer logged in - show customer QR tabs
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => handleTabChange('myqr')}
          style={[styles.tabButton, activeTab === 'myqr' && styles.tabButtonActive]}
        >
          <View style={[styles.tabIconWrapper, activeTab === 'myqr' && styles.tabIconWrapperActive]}>
            <Ionicons
              name="qr-code"
              size={20}
              color={activeTab === 'myqr' ? '#D4AF37' : '#6B7280'}
            />
          </View>
          <Text
            variant="labelSmall"
            weight={activeTab === 'myqr' ? 'semiBold' : 'medium'}
            color={activeTab === 'myqr' ? '#111827' : '#6B7280'}
          >
            QR Kodum
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('scan')}
          style={[styles.tabButton, activeTab === 'scan' && styles.tabButtonActive]}
        >
          <View style={[styles.tabIconWrapper, activeTab === 'scan' && styles.tabIconWrapperActive]}>
            <Ionicons
              name="scan"
              size={20}
              color={activeTab === 'scan' ? '#D4AF37' : '#6B7280'}
            />
          </View>
          <Text
            variant="labelSmall"
            weight={activeTab === 'scan' ? 'semiBold' : 'medium'}
            color={activeTab === 'scan' ? '#111827' : '#6B7280'}
          >
            Puan Kazan
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('spend')}
          style={[styles.tabButton, activeTab === 'spend' && styles.tabButtonActive]}
        >
          <View style={[styles.tabIconWrapper, activeTab === 'spend' && styles.tabIconWrapperActive]}>
            <Ionicons
              name="gift"
              size={20}
              color={activeTab === 'spend' ? '#D4AF37' : '#6B7280'}
            />
          </View>
          <Text
            variant="labelSmall"
            weight={activeTab === 'spend' ? 'semiBold' : 'medium'}
            color={activeTab === 'spend' ? '#111827' : '#6B7280'}
          >
            Puan Harca
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'myqr' && (
          // My QR Code Tab
          <View style={styles.qrSection}>
            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeAvatar}>
                <Ionicons name="person" size={24} color="#D4AF37" />
              </View>
              <View style={styles.welcomeInfo}>
                <Text variant="bodySmall" color="#6B7280">Hoş geldiniz</Text>
                <Text variant="titleMedium" weight="bold" color="#111827">
                  {customer?.name}
                </Text>
              </View>
              <View style={styles.welcomePoints}>
                <Text variant="bodySmall" color="#6B7280">Puanınız</Text>
                <Text variant="titleLarge" weight="bold" color="#D4AF37">
                  {availablePoints.toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>

            {/* Points Stats */}
            <View style={styles.pointsStatsRow}>
              <View style={styles.pointsStatCard}>
                <View style={[styles.pointsStatIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="trending-up" size={20} color="#16A34A" />
                </View>
                <Text variant="titleMedium" weight="bold">{customer?.totalPoints.toLocaleString('tr-TR')}</Text>
                <Text variant="labelSmall" color="#6B7280">Toplam Kazanılan</Text>
              </View>
              <View style={styles.pointsStatCard}>
                <View style={[styles.pointsStatIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="gift" size={20} color="#DC2626" />
                </View>
                <Text variant="titleMedium" weight="bold">{customer?.usedPoints.toLocaleString('tr-TR')}</Text>
                <Text variant="labelSmall" color="#6B7280">Harcanan</Text>
              </View>
            </View>

            {/* QR Code Display */}
            <View style={styles.qrCardNew}>
              <View style={styles.qrBadge}>
                <Ionicons name="qr-code" size={14} color="#D4AF37" />
                <Text variant="labelSmall" weight="semiBold" color="#D4AF37">
                  Kişisel QR Kodunuz
                </Text>
              </View>

              <View style={styles.qrCodeContainerNew}>
                {customer?.personalQRCode ? (
                  <QRCode
                    value={`AKA-CUSTOMER:${customer.personalQRCode}`}
                    size={200}
                    color="#111827"
                    backgroundColor="#FFFFFF"
                  />
                ) : (
                  <ActivityIndicator size="large" color="#D4AF37" />
                )}
              </View>

              <Text variant="bodySmall" color="#6B7280" align="center" style={{ marginTop: 16 }}>
                {customer?.phone}
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Ionicons name="information-circle" size={20} color="#D4AF37" />
              <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
                Bu sizin kişisel QR kodunuz. Puan kazanmak için "Puan Kazan" sekmesinden kasiyerin QR kodunu tarayın.
              </Text>
            </View>

            {/* Transaction History */}
            <View style={styles.transactionSection}>
              <View style={styles.transactionHeader}>
                <Text variant="labelMedium" weight="semiBold" color="#374151">
                  Son İşlemler
                </Text>
                {transactions.length > 0 && (
                  <Text variant="labelSmall" color="#6B7280">
                    Son {transactions.length} işlem
                  </Text>
                )}
              </View>

              {loadingTransactions ? (
                <View style={styles.transactionLoading}>
                  <ActivityIndicator size="small" color="#D4AF37" />
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.transactionEmpty}>
                  <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
                  <Text variant="bodySmall" color="#6B7280" style={{ marginTop: 8 }}>
                    Henüz işlem bulunmuyor
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionList}>
                  {transactions.map((tx, index) => (
                    <View key={tx.id} style={[
                      styles.transactionItem,
                      index === transactions.length - 1 && { borderBottomWidth: 0 }
                    ]}>
                      <View style={[
                        styles.transactionIcon,
                        tx.type === 'points_earned' || tx.type === 'bonus'
                          ? { backgroundColor: '#ECFDF5' }
                          : { backgroundColor: '#FEF2F2' }
                      ]}>
                        <Ionicons
                          name={tx.type === 'points_earned' || tx.type === 'bonus' ? 'trending-up' : 'gift'}
                          size={18}
                          color={tx.type === 'points_earned' || tx.type === 'bonus' ? '#16A34A' : '#DC2626'}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text variant="bodyMedium" weight="medium" color="#111827">
                          {tx.type === 'points_earned' ? 'Puan Kazanıldı' :
                           tx.type === 'points_used' ? 'Puan Harcandı' :
                           tx.type === 'bonus' ? 'Bonus Puan' : 'İşlem'}
                        </Text>
                        <Text variant="labelSmall" color="#6B7280">
                          {new Date(tx.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={styles.transactionPoints}>
                        <Text
                          variant="labelLarge"
                          weight="bold"
                          color={tx.points > 0 ? '#16A34A' : '#DC2626'}
                        >
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </Text>
                        <Text variant="labelSmall" color="#6B7280">puan</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'scan' && (
          // Scan Tab - Earn points
          <View style={styles.scanSection}>
            {/* Scan Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('QRScanner');
              }}
              style={styles.scanButtonNew}
            >
              <View style={styles.scanButtonIcon}>
                <Ionicons name="camera" size={28} color="#422D00" />
              </View>
              <View style={styles.scanButtonText}>
                <Text variant="titleMedium" weight="semiBold" color="#422D00">
                  QR Kod Tara
                </Text>
                <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                  Kamerayı açmak için dokunun
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
            </Pressable>

            {/* Steps */}
            <View style={styles.stepsCard}>
              <Text variant="labelMedium" weight="semiBold" color="#374151" style={{ marginBottom: 16 }}>
                Nasıl Çalışır?
              </Text>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">
                    Alışverişinizi tamamlayın
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    Kasada ödemenizi yapın
                  </Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">
                    QR kodu tarayın
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    Kasiyerin gösterdiği kodu okutun
                  </Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text variant="labelSmall" weight="bold" color="#422D00">3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">
                    Puanlarınız yüklensin
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    Anında hesabınıza eklenir
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'spend' && (
          // Spend Tab - Create spending QR
          <View style={styles.spendSection}>
            {!spendQRCode ? (
              <>
                {/* Available Points Card */}
                <View style={styles.availablePointsCard}>
                  <View style={styles.availablePointsIcon}>
                    <Ionicons name="wallet" size={24} color="#D4AF37" />
                  </View>
                  <View style={styles.availablePointsInfo}>
                    <Text variant="bodySmall" color="#6B7280">Kullanılabilir Puan</Text>
                    <Text variant="headlineSmall" weight="bold" color="#D4AF37">
                      {availablePoints.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                </View>

                {/* Input Card */}
                <View style={styles.spendInputCard}>
                  <Text variant="labelMedium" weight="semiBold" color="#374151" style={{ marginBottom: 12 }}>
                    Harcamak İstediğiniz Puan
                  </Text>
                  <View style={styles.inputContainerNew}>
                    <Ionicons name="star" size={22} color="#D4AF37" />
                    <TextInput
                      style={styles.inputNew}
                      placeholder="Örnek: 500"
                      placeholderTextColor="#6B7280"
                      value={spendPoints}
                      onChangeText={setSpendPoints}
                      keyboardType="number-pad"
                    />
                    <Text variant="labelMedium" color="#6B7280">puan</Text>
                  </View>

                  <Pressable
                    onPress={handleCreateSpendQR}
                    style={[styles.spendButtonNew, isCreatingSpendQR && styles.buttonDisabled]}
                    disabled={isCreatingSpendQR || !spendPoints}
                  >
                    {isCreatingSpendQR ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="qr-code" size={22} color="#FFFFFF" />
                        <Text variant="labelLarge" weight="semiBold" color="#FFFFFF">
                          QR Kod Oluştur
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>

                <View style={styles.tipCard}>
                  <Ionicons name="information-circle" size={20} color="#D4AF37" />
                  <Text variant="bodySmall" color="#6B7280" style={{ flex: 1 }}>
                    QR kod oluşturduktan sonra kasiyere gösterin. QR kodun süresi 1 dakikadır.
                  </Text>
                </View>
              </>
            ) : (
              // Show generated spend QR
              <View style={styles.spendQRSection}>
                {/* Timer Badge */}
                {spendQRUsed ? (
                  <View style={[styles.timerBadgeNew, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text variant="labelLarge" weight="bold" color="#16A34A">
                      İşlem Tamamlandı
                    </Text>
                  </View>
                ) : (
                  <View style={styles.timerBadgeNew}>
                    <Ionicons name="time" size={18} color="#DC2626" />
                    <Text variant="labelLarge" weight="bold" color="#DC2626">
                      {getRemainingTime()}
                    </Text>
                    <Text variant="bodySmall" color="#DC2626">kaldı</Text>
                  </View>
                )}

                {/* QR Card */}
                <View style={[styles.spendQRCardNew, spendQRUsed && { borderColor: '#16A34A' }]}>
                  {/* Used Badge */}
                  {spendQRUsed && (
                    <View style={styles.spendUsedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                      <Text variant="labelSmall" weight="semiBold" color="#16A34A">
                        Kullanıldı
                      </Text>
                    </View>
                  )}

                  <View style={[styles.spendQRBadge, spendQRUsed && { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="gift" size={16} color={spendQRUsed ? '#6B7280' : '#16A34A'} />
                    <Text variant="labelSmall" weight="semiBold" color={spendQRUsed ? '#6B7280' : '#16A34A'}>
                      {spendPoints} Puan Harcama Kodu
                    </Text>
                  </View>

                  <View style={styles.qrCodeContainerNew}>
                    <QRCode
                      value={spendQRCode || ''}
                      size={220}
                      color="#111827"
                      backgroundColor="#FFFFFF"
                    />
                  </View>

                  <Text variant="bodyMedium" color="#6B7280" align="center" style={{ marginTop: 20 }}>
                    {spendQRUsed ? 'Puanlarınız başarıyla kullanıldı' : 'Bu QR kodu kasiyere gösterin'}
                  </Text>

                  <Text variant="labelSmall" color="#6B7280" align="center" style={{ marginTop: 8 }}>
                    {spendQRCode}
                  </Text>
                </View>

                {spendQRUsed ? (
                  <Pressable
                    onPress={() => {
                      setSpendQRCode(null);
                      setSpendExpiresAt(null);
                      setSpendPoints('');
                      setSpendQRUsed(false);
                      setActiveTab('myqr');
                    }}
                    style={[styles.newQRButtonNew, { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#16A34A' }]}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    <Text variant="labelLarge" weight="semiBold" color="#16A34A">
                      Tamam
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      setSpendQRCode(null);
                      setSpendExpiresAt(null);
                      setSpendPoints('');
                    }}
                    style={styles.newQRButtonNew}
                  >
                    <Ionicons name="close-circle" size={20} color="#6B7280" />
                    <Text variant="labelLarge" weight="semiBold" color="#6B7280">
                      İptal Et
                    </Text>
                  </Pressable>
                )}

                {!spendQRUsed && (
                  <View style={[styles.tipCard, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text variant="bodySmall" color="#DC2626" style={{ flex: 1 }}>
                      QR kod 1 dakika içinde geçerlidir. Süre dolduğunda yeni QR kod oluşturmanız gerekir.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FEF9E7',
  },
  tabIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  // QR Section
  qrSection: {
    flex: 1,
  },
  pointsCard: {
    marginBottom: 20,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  pointsStats: {
    flexDirection: 'row',
    gap: 20,
  },
  pointsStat: {
    alignItems: 'center',
  },
  qrCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 232,
    minHeight: 232,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {
    marginTop: 20,
    gap: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF9E7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },

  // Scan Section
  scanSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scanIllustration: {
    marginBottom: 24,
  },
  scanIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  scanInfo: {
    marginTop: 32,
    gap: 16,
    width: '100%',
  },
  scanInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scanInfoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Spend Section
  spendSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  spendHeader: {
    marginBottom: 24,
  },
  spendCard: {
    width: '100%',
    marginTop: 24,
    padding: 20,
  },
  availablePointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  spendInputContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#111827',
  },
  spendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  spendQRSection: {
    width: '100%',
  },
  spendQRCard: {
    padding: 24,
    alignItems: 'center',
  },
  spendQRHeader: {
    marginBottom: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  newQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },

  // New QR Section Styles
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  welcomeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  welcomePoints: {
    alignItems: 'flex-end',
  },
  pointsStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pointsStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointsStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qrCardNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  qrCodeContainerNew: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  // New Scan Section Styles
  scanHeaderCard: {
    backgroundColor: '#FEF9E7',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  scanIconCircleNew: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
    gap: 16,
  },
  scanButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    flex: 1,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepDivider: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: 8,
  },

  // New Spend Section Styles
  spendHeaderCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  spendIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  availablePointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    gap: 16,
  },
  availablePointsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availablePointsInfo: {
    flex: 1,
  },
  spendInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    marginBottom: 16,
  },
  inputNew: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  spendButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },

  // Spend QR Display Styles
  timerBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    marginBottom: 20,
  },
  spendQRCardNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ECFDF5',
    marginBottom: 16,
  },
  spendQRBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  spendUsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 12,
  },
  newQRButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },

  // Admin Section - New Design
  adminWelcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  adminWelcomeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminWelcomeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  adminActionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  adminActionButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
  },
  adminActionButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminActionButtonText: {
    flex: 1,
  },
  adminScanButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
  },
  adminScanButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adminInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminInfoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminInfoContent: {
    flex: 1,
  },
  adminInfoDivider: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: 8,
  },

  // Transaction History Styles
  transactionSection: {
    marginTop: 24,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLoading: {
    padding: 32,
    alignItems: 'center',
  },
  transactionEmpty: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  transactionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionPoints: {
    alignItems: 'flex-end',
  },
});
