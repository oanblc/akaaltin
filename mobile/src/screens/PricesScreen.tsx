import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Header } from '../components/common/Header';
import { AnimatedPriceRow } from '../components/prices/AnimatedPriceRow';
import { Colors, Spacing } from '../constants/theme';
import { usePriceStore } from '../stores/priceStore';
import { pricesAPI } from '../services/api';
import { Price, RootStackParamList } from '../types';

export function PricesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { prices, setPrices, isFavorite, lastUpdate } = usePriceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  const filteredPrices = React.useMemo(() => {
    let result = prices;

    if (showFavoritesOnly) {
      result = result.filter((p) => isFavorite(p.code));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query)
      );
    }

    return result;
  }, [prices, searchQuery, showFavoritesOnly, isFavorite]);

  const handlePricePress = useCallback(
    (price: Price) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('PriceDetail', { code: price.code });
    },
    [navigation]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const response = await pricesAPI.getAll();
      if (response.data?.prices) {
        setPrices(response.data.prices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setRefreshing(false);
    }
  }, [setPrices]);


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
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
              colors={['#D4AF37']}
            />
          }
        >
          {/* Search */}
        <View style={styles.searchContainer}>
          <Pressable
            style={[styles.alertBtn, showFavoritesOnly && styles.activeFilterBtn]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFavoritesOnly(!showFavoritesOnly);
            }}
          >
            <Ionicons name={showFavoritesOnly ? 'star' : 'star-outline'} size={22} color={showFavoritesOnly ? '#FFFFFF' : '#D4AF37'} />
          </Pressable>
          <Pressable
            style={styles.alertBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Alerts');
            }}
          >
            <Ionicons name="alarm" size={22} color="#D4AF37" />
          </Pressable>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Altın ara..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
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

          {/* Rows */}
          {filteredPrices.length > 0 ? (
            filteredPrices.map((price, index) => (
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  alertBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterBtn: {
    backgroundColor: '#D4AF37',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },

  // Table
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

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
});
