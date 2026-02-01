import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../components/common/Text';
import { Header } from '../components/common/Header';
import { AnimatedPriceRow } from '../components/prices/AnimatedPriceRow';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { usePriceStore } from '../stores/priceStore';
import { useSettingsStore } from '../stores/settingsStore';
import { socketService } from '../services/socket';
import { pricesAPI } from '../services/api';
import { Price, RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 40; // 20px padding each side

const SLIDES = [
  {
    id: 'qr',
    tag: 'YENİ KAMPANYA',
    title: 'QR Kod ile Puan Kazan!',
    description: 'Alışverişlerinizde QR kod okutun, puan biriktirin, indirim kazanın.',
    icon: 'qr-code' as const,
    screen: 'QR',
  },
  {
    id: 'savings',
    tag: 'ÜYE AVANTAJI',
    title: 'Birikimlerinizi Takip Edin',
    description: 'Altın birikimlerinizi anlık fiyatlarla takip edin.',
    icon: 'wallet' as const,
    screen: 'Branches',
  },
  {
    id: 'alerts',
    tag: 'FİYAT ALARMI',
    title: 'Fiyat Değişikliklerinden Haberdar Olun',
    description: 'İstediğiniz fiyata ulaşınca anında bildirim alın.',
    icon: 'notifications' as const,
    screen: 'Alerts',
  },
];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { prices, setPrices, setConnected, setLastUpdate, lastUpdate } = usePriceStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<ScrollView>(null);

  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  // Uygulama acildiginda API'den fiyatlari cek
  const fetchPrices = useCallback(async () => {
    try {
      const response = await pricesAPI.getAll();
      if (response.data?.prices) {
        setPrices(response.data.prices);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }, [setPrices, setLastUpdate]);

  useEffect(() => {
    // Ilk acilista API'den fiyatlari ve ayarlari cek
    fetchPrices();
    fetchSettings();

    // Socket baglantisi kur
    socketService.connect();

    const unsubPrices = socketService.on('prices', (data) => {
      setPrices(data as Price[]);
      setLastUpdate(new Date());
    });

    const unsubConnection = socketService.on('connectionChange', (isConnected) => {
      setConnected(isConnected as boolean);
    });

    return () => {
      unsubPrices();
      unsubConnection();
    };
  }, [setPrices, setConnected, setLastUpdate, fetchPrices]);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        sliderRef.current?.scrollTo({ x: next * SLIDER_WIDTH, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
    if (slideIndex !== activeSlide && slideIndex >= 0 && slideIndex < SLIDES.length) {
      setActiveSlide(slideIndex);
    }
  };

  const handleSlidePress = (screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (screen === 'QR' || screen === 'Branches') {
      navigation.navigate('Main', { screen } as any);
    } else if (screen === 'Alerts') {
      navigation.navigate('Alerts');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // API'den guncel fiyatlari cek
    await fetchPrices();

    // Socket'i yeniden bagla
    socketService.disconnect();
    await socketService.connect();
    setRefreshing(false);
  }, [fetchPrices]);

  const handlePricePress = useCallback(
    (price: Price) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('PriceDetail', { code: price.code });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
          />
        }
      >
        {/* Slider Banner */}
        <LinearGradient
          colors={['#1F2937', '#111827', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sliderContainer}
        >
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide) => (
              <Pressable
                key={slide.id}
                style={styles.slide}
                onPress={() => handleSlidePress(slide.screen)}
              >
                <View style={styles.promoContent}>
                  <View style={styles.promoTextContainer}>
                    <Text variant="labelSmall" color="#D4AF37" weight="semiBold">
                      {slide.tag}
                    </Text>
                    <Text variant="titleMedium" weight="bold" color="#FFFFFF">
                      {slide.title}
                    </Text>
                    <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                      {slide.description}
                    </Text>
                  </View>
                  <View style={styles.promoIcon}>
                    <Ionicons name={slide.icon} size={48} color="#FFFFFF" />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.promoIndicators}>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.indicator,
                  activeSlide === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Tablo */}
        <View style={styles.tableContainer}>
          {/* Tablo Başlığı */}
          <View style={styles.tableHeader}>
            <View style={styles.headerNameCol}>
              <Text variant="labelMedium" weight="bold" color={Colors.neutral[500]}>
                {lastUpdate
                  ? lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : 'VARLIK'}
              </Text>
            </View>
            <View style={styles.headerChangeCol} />
            <View style={styles.headerPriceCol}>
              <Text variant="labelMedium" weight="bold" color={Colors.neutral[500]}>SATIŞ / ALIŞ</Text>
            </View>
          </View>

          {/* Satırlar */}
          {prices.length > 0 ? (
            prices.map((price, index) => (
              <AnimatedPriceRow
                key={price.code}
                price={price}
                index={index}
                onPress={handlePricePress}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color="#D1D5DB" />
              <Text variant="bodyMedium" color="#6B7280">Sonuç bulunamadı</Text>
            </View>
          )}
        </View>

        <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Slider Banner
  sliderContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  slide: {
    width: SLIDER_WIDTH,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promoTextContainer: {
    flex: 1,
    gap: 4,
  },
  promoIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212,175,55,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  promoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 12,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: '#D4AF37',
  },

  // Tablo
  tableContainer: {
    marginHorizontal: Spacing[4],
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2] + 2,
    paddingHorizontal: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerNameCol: {
    width: '50%',
  },
  headerChangeCol: {
    width: 44,
  },
  headerPriceCol: {
    flex: 1,
    alignItems: 'flex-end',
  },

  // Boş
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
});
