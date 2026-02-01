import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Header } from '../components/common/Header';
import { RootStackParamList } from '../types';
import { useAuthStore, useIsAdmin, useIsCustomer } from '../stores/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
  danger = false,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={[
        styles.menuIconContainer,
        { backgroundColor: danger ? '#FEE2E2' : '#F3F4F6' }
      ]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#DC2626' : '#6B7280'}
        />
      </View>
      <View style={styles.menuContent}>
        <Text
          variant="bodyMedium"
          weight="medium"
          color={danger ? '#DC2626' : '#111827'}
        >
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" color="#6B7280">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {showArrow && !rightElement && (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      )}
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { customer, isAuthenticated, login, logout, isLoading } = useAuthStore();
  const isAdmin = useIsAdmin();
  const isCustomer = useIsCustomer();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);

  // Login form state
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  // Phone number formatting (0XXX XXX XX XX)
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    let formatted = '';
    if (limited.length > 0) formatted = limited.slice(0, 4);
    if (limited.length > 4) formatted += ' ' + limited.slice(4, 7);
    if (limited.length > 7) formatted += ' ' + limited.slice(7, 9);
    if (limited.length > 9) formatted += ' ' + limited.slice(9, 11);
    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhoneNumber(text));
  };

  const getRawPhone = () => phone.replace(/\s/g, '');

  const handleLogin = async () => {
    const rawPhone = getRawPhone();
    if (!rawPhone || rawPhone.length < 10) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası girin');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await login(rawPhone, showNameInput ? name : undefined);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhone('');
      setName('');
      setShowNameInput(false);
    } else if (result.needsRegistration) {
      setShowNameInput(true);
    } else {
      Alert.alert('Hata', result.error || 'Giriş yapılamadı');
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
            setPhone('');
            setName('');
            setShowNameInput(false);
          },
        },
      ]
    );
  };

  const availablePoints = customer ? customer.totalPoints - customer.usedPoints : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Not Logged In - Show Login Form */}
        {!isAuthenticated && (
          <View style={styles.content}>
            {/* User Card - Guest */}
            <View style={[styles.userCard, { marginHorizontal: 0 }]}>
              <View style={styles.userAvatarContainer}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={32} color="#D4AF37" />
                </View>
                <View style={styles.userInfo}>
                  <Text variant="titleMedium" weight="bold" color="#111827">
                    Hesabım
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    Giriş yaparak puanlarınızı takip edin
                  </Text>
                </View>
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.loginSection}>
              <View style={styles.loginIconWrapper}>
                <Ionicons name="log-in-outline" size={48} color="#D4AF37" />
              </View>
              <Text variant="titleMedium" weight="bold" align="center" style={{ marginTop: 12 }}>
                Giriş Yapın
              </Text>
              <Text variant="bodyMedium" color="#6B7280" align="center" style={{ marginTop: 8, marginBottom: 20 }}>
                Puanlarınızı görüntülemek ve kullanmak için giriş yapın.
              </Text>

              <View style={styles.formFields}>
                <View style={styles.inputWrapper}>
                  <Text variant="labelMedium" weight="medium" color="#374151" style={styles.inputLabel}>
                    Telefon Numarası
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="0XXX XXX XX XX"
                      placeholderTextColor="#6B7280"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      maxLength={14}
                    />
                  </View>
                </View>

                {showNameInput && (
                  <View style={styles.inputWrapper}>
                    <Text variant="labelMedium" weight="medium" color="#374151" style={styles.inputLabel}>
                      Ad Soyad
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color="#6B7280" />
                      <TextInput
                        style={styles.input}
                        placeholder="Adınız Soyadınız"
                        placeholderTextColor="#6B7280"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                {/* Submit Button */}
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.submitButtonPressed,
                    isLoading && styles.submitButtonDisabled,
                  ]}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#422D00" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#422D00" />
                      <Text variant="labelLarge" weight="semiBold" color="#422D00">
                        {showNameInput ? 'Kayıt Ol' : 'Giriş Yap'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Features */}
            <Text variant="labelMedium" weight="semiBold" color="#6B7280" style={{ marginTop: 24, marginBottom: 12 }}>
              ÖZELLİKLER
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="diamond" size={20} color="#D4AF37" />
                </View>
                <View style={styles.featureText}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">Puan Takibi</Text>
                  <Text variant="bodySmall" color="#6B7280">Kazandığınız ve kullandığınız puanları görün</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="qr-code" size={20} color="#D4AF37" />
                </View>
                <View style={styles.featureText}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">QR Kod ile Puan Kazanın</Text>
                  <Text variant="bodySmall" color="#6B7280">Alışverişlerinizde kolayca puan kazanın</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="gift" size={20} color="#D4AF37" />
                </View>
                <View style={styles.featureText}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">Özel Kampanyalar</Text>
                  <Text variant="bodySmall" color="#6B7280">Üyelere özel indirim ve fırsatlar</Text>
                </View>
              </View>
              <View style={[styles.featureItem, { borderBottomWidth: 0 }]}>
                <View style={styles.featureIcon}>
                  <Ionicons name="notifications" size={20} color="#D4AF37" />
                </View>
                <View style={styles.featureText}>
                  <Text variant="bodyMedium" weight="medium" color="#111827">Fiyat Alarmları</Text>
                  <Text variant="bodySmall" color="#6B7280">Altın fiyatlarını takip edin ve alarm kurun</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Customer Logged In */}
        {isAuthenticated && isCustomer && customer && (
          <>
            {/* User Card */}
            <View style={styles.userCard}>
              <View style={styles.userAvatarContainer}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={32} color="#D4AF37" />
                </View>
                <View style={styles.userInfo}>
                  <Text variant="titleMedium" weight="bold" color="#111827">
                    {customer.name}
                  </Text>
                  <Text variant="bodySmall" color="#6B7280">
                    {customer.phone}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FDF8E7' }]}>
                  <Ionicons name="diamond" size={22} color="#D4AF37" />
                </View>
                <Text variant="titleLarge" weight="bold" color="#D4AF37">
                  {availablePoints.toLocaleString('tr-TR')}
                </Text>
                <Text variant="bodySmall" color="#6B7280">Kullanılabilir</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="trending-up" size={22} color="#3B82F6" />
                </View>
                <Text variant="titleLarge" weight="bold" color="#111827">
                  {customer.totalPoints.toLocaleString('tr-TR')}
                </Text>
                <Text variant="bodySmall" color="#6B7280">Toplam</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                </View>
                <Text variant="titleLarge" weight="bold" color="#111827">
                  {customer.usedPoints.toLocaleString('tr-TR')}
                </Text>
                <Text variant="bodySmall" color="#6B7280">Kullanılan</Text>
              </View>
            </View>
          </>
        )}

        {/* Admin Logged In */}
        {isAuthenticated && isAdmin && customer && (
          <View style={styles.userCard}>
            <View style={styles.userAvatarContainer}>
              <View style={[styles.userAvatar, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="shield-checkmark" size={32} color="#6366F1" />
              </View>
              <View style={styles.userInfo}>
                <Text variant="titleMedium" weight="bold" color="#111827">
                  {customer.name}
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  Personel Hesabı • {customer.phone}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Section - Only for authenticated users */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text variant="labelMedium" color="#6B7280" style={styles.sectionTitle}>
              AYARLAR
            </Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="notifications-outline"
                title="Bildirimler"
                subtitle="Push bildirimleri"
                showArrow={false}
                rightElement={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNotificationsEnabled(val);
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#D4AF37' }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="pulse-outline"
                title="Fiyat Alarmları"
                subtitle="Fiyat değişiklik bildirimleri"
                showArrow={false}
                rightElement={
                  <Switch
                    value={priceAlertsEnabled}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPriceAlertsEnabled(val);
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#D4AF37' }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="alarm-outline"
                title="Alarmlarım"
                subtitle="Fiyat alarmlarını yönet"
                onPress={() => navigation.navigate('Alerts')}
              />
            </View>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="#6B7280" style={styles.sectionTitle}>
            DESTEK
          </Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Yardım"
              onPress={() => navigation.navigate('Help')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="document-text-outline"
              title="Gizlilik Politikası"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Kullanım Koşulları"
              onPress={() => navigation.navigate('Terms')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="star-outline"
              title="Uygulamayı Değerlendir"
              onPress={() => {
                const storeUrl = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/app/idXXXXXXXXX'
                  : 'https://play.google.com/store/apps/details?id=com.akakuyumculuk';
                Linking.openURL(storeUrl);
              }}
            />
          </View>
        </View>

        {/* Logout - Only for authenticated users */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.menuCard}>
              <MenuItem
                icon="log-out-outline"
                title="Çıkış Yap"
                danger
                showArrow={false}
                onPress={handleLogout}
              />
            </View>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text variant="bodySmall" color="#D1D5DB">
            Aka Kuyumculuk v1.0.0
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
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

  // User Card
  userCard: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  userAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },

  // Content wrapper for not authenticated
  content: {
    paddingHorizontal: 20,
  },

  // Login Section
  loginSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
  },
  loginIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    gap: 16,
    width: '100%',
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 4,
  },

  // Menu Card
  menuCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemPressed: {
    backgroundColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 62,
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

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
