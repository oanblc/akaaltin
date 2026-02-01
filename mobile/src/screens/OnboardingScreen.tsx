import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if running in Expo Go
const isExpoGo = Constants.default.appOwnership === 'expo';

import { Text } from '../components/common/Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = '@aka_onboarding_completed';

interface SlideData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const SLIDES: SlideData[] = [
  {
    id: 'welcome',
    icon: 'diamond',
    iconBg: '#FEF9E7',
    iconColor: '#D4AF37',
    title: 'AKA Kuyumculuk\'a Hoş Geldiniz',
    description: 'Altın fiyatlarını anlık takip edin, alışverişlerinizden puan kazanın ve özel fırsatlardan yararlanın.',
  },
  {
    id: 'prices',
    icon: 'trending-up',
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
    title: 'Anlık Fiyat Takibi',
    description: 'Altın ve gümüş fiyatlarını canlı olarak izleyin. Fiyat alarmları kurarak hedef fiyatınıza ulaşınca bildirim alın.',
  },
  {
    id: 'points',
    icon: 'qr-code',
    iconBg: '#ECFDF5',
    iconColor: '#16A34A',
    title: 'QR ile Puan Kazanın',
    description: 'Mağazamızdan alışveriş yaptığınızda QR kodunuzu okutun, puan biriktirin ve sonraki alışverişlerinizde kullanın.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const isLastSlide = activeSlide === SLIDES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < SLIDES.length) {
      setActiveSlide(slideIndex);
    }
  };

  const goToNextSlide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeSlide < SLIDES.length - 1) {
      const nextSlide = activeSlide + 1;
      scrollRef.current?.scrollTo({ x: nextSlide * SCREEN_WIDTH, animated: true });
      setActiveSlide(nextSlide);
    }
  };

  const goToSlide = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveSlide(index);
  };

  const requestNotificationPermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Expo Go'da bildirimler desteklenmiyor - kullanıcıya bilgi ver ve devam et
    if (isExpoGo) {
      Alert.alert(
        'Bilgi',
        'Bildirim izinleri Expo Go\'da desteklenmiyor. Uygulama yayınlandığında bu özellik çalışacaktır.',
        [{ text: 'Tamam' }]
      );
      setNotificationGranted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setNotificationGranted(finalStatus === 'granted');

      if (finalStatus === 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Hata durumunda da devam et
      setNotificationGranted(true);
    }
  };

  const handleComplete = async () => {
    if (!policyAccepted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      onComplete();
    }
  };

  const openPrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to privacy policy - for now open in browser
    Linking.openURL('https://akakuyumculuk.com/gizlilik-politikasi');
  };

  const openTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://akakuyumculuk.com/kullanim-kosullari');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      {!isLastSlide && (
        <Pressable
          onPress={() => goToSlide(SLIDES.length - 1)}
          style={[styles.skipButton, { top: insets.top + 16 }]}
        >
          <Text variant="labelLarge" color="#6B7280">Atla</Text>
        </Pressable>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slideContainer}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { paddingTop: insets.top + 80 }]}>
            <View style={[styles.iconContainer, { backgroundColor: slide.iconBg }]}>
              <Ionicons name={slide.icon} size={64} color={slide.iconColor} />
            </View>
            <Text variant="headlineSmall" weight="bold" color="#111827" align="center" style={styles.slideTitle}>
              {slide.title}
            </Text>
            <Text variant="bodyMedium" color="#6B7280" align="center" style={styles.slideDescription}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        {/* Indicators */}
        <View style={styles.indicators}>
          {SLIDES.map((slide, index) => (
            <Pressable
              key={slide.id}
              onPress={() => goToSlide(index)}
              style={[
                styles.indicator,
                activeSlide === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* Permissions & Policy (only on last slide) */}
        {isLastSlide && (
          <View style={styles.permissionsSection}>
            {/* Notification Permission */}
            <Pressable
              onPress={requestNotificationPermission}
              style={[
                styles.permissionItem,
                notificationGranted && styles.permissionItemGranted,
              ]}
            >
              <View style={[
                styles.permissionIcon,
                notificationGranted && styles.permissionIconGranted,
              ]}>
                <Ionicons
                  name={notificationGranted ? 'checkmark' : 'notifications-outline'}
                  size={22}
                  color={notificationGranted ? '#FFFFFF' : '#D4AF37'}
                />
              </View>
              <View style={styles.permissionContent}>
                <Text variant="bodyMedium" weight="medium" color="#111827">
                  Bildirim İzni
                </Text>
                <Text variant="bodySmall" color="#6B7280">
                  {notificationGranted
                    ? (isExpoGo ? 'Yayın sürümünde aktif olacak' : 'İzin verildi')
                    : 'Fiyat alarmları ve kampanyalar için'}
                </Text>
              </View>
              {!notificationGranted && (
                <View style={styles.permissionBadge}>
                  <Text variant="labelSmall" weight="semiBold" color="#D4AF37">İzin Ver</Text>
                </View>
              )}
            </Pressable>

            {/* Policy Acceptance */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPolicyAccepted(!policyAccepted);
              }}
              style={styles.policyItem}
            >
              <View style={[
                styles.checkbox,
                policyAccepted && styles.checkboxChecked,
              ]}>
                {policyAccepted && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text variant="bodySmall" color="#374151" style={styles.policyText}>
                <Text
                  variant="bodySmall"
                  color="#D4AF37"
                  weight="medium"
                  onPress={openPrivacyPolicy}
                >
                  Gizlilik Politikası
                </Text>
                {' ve '}
                <Text
                  variant="bodySmall"
                  color="#D4AF37"
                  weight="medium"
                  onPress={openTerms}
                >
                  Kullanım Koşulları
                </Text>
                {'\'nı okudum ve kabul ediyorum.'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Action Button */}
        {isLastSlide ? (
          <Pressable
            onPress={handleComplete}
            style={[
              styles.completeButton,
              !policyAccepted && styles.completeButtonDisabled,
            ]}
          >
            <Text variant="labelLarge" weight="semiBold" color={policyAccepted ? '#422D00' : '#9CA3AF'}>
              Başla
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={goToNextSlide} style={styles.nextButton}>
            <Text variant="labelLarge" weight="semiBold" color="#FFFFFF">
              Devam
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// Helper function to check if onboarding is completed
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

// Helper function to reset onboarding (for testing)
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    marginBottom: 16,
  },
  slideDescription: {
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#D4AF37',
  },
  permissionsSection: {
    marginBottom: 20,
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  permissionItemGranted: {
    backgroundColor: '#ECFDF5',
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionIconGranted: {
    backgroundColor: '#16A34A',
  },
  permissionContent: {
    flex: 1,
    gap: 2,
  },
  permissionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF9E7',
    borderRadius: 8,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  policyText: {
    flex: 1,
    lineHeight: 22,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
