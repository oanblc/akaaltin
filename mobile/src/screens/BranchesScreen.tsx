import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { Card } from '../components/common/Card';
import { Header } from '../components/common/Header';
import { Colors, Spacing, BorderRadius, IconSize, Shadows } from '../constants/theme';
import { Branch } from '../types';

// Mock data - API'den gelecek
const MOCK_BRANCHES: Branch[] = [
  {
    id: 1,
    name: 'Aka Kuyumculuk Merkez',
    address: 'Kapalicarsı No:123, Fatih/Istanbul',
    phone: '0212 123 45 67',
    workingHours: '09:00 - 19:00',
    latitude: 41.0082,
    longitude: 28.9784,
    isActive: true,
  },
  {
    id: 2,
    name: 'Aka Kuyumculuk Bakirkoy',
    address: 'Bakirkoy Carsi No:45, Bakirkoy/Istanbul',
    phone: '0212 234 56 78',
    workingHours: '09:00 - 20:00',
    latitude: 40.9808,
    longitude: 28.8772,
    isActive: true,
  },
  {
    id: 3,
    name: 'Aka Kuyumculuk Kadikoy',
    address: 'Kadikoy Carsi No:78, Kadikoy/Istanbul',
    phone: '0216 345 67 89',
    workingHours: '10:00 - 21:00',
    latitude: 40.9927,
    longitude: 29.0277,
    isActive: true,
  },
];

export function BranchesScreen() {
  const insets = useSafeAreaInsets();
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);

  // Tab bar yüksekliği (Samsung/iPhone navigasyon çakışması önlemi)
  const TAB_BAR_HEIGHT = 56 + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  const handleCall = async (phone: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phoneNumber = phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDirections = async (branch: Branch) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios'
      ? `maps:?daddr=${branch.latitude},${branch.longitude}`
      : `geo:${branch.latitude},${branch.longitude}?q=${branch.latitude},${branch.longitude}(${branch.name})`;
    Linking.openURL(url);
  };

  const renderBranch = ({ item }: { item: Branch }) => (
    <Card variant="elevated" style={styles.branchCard}>
      {/* Header */}
      <View style={styles.branchHeader}>
        <View style={styles.branchIconContainer}>
          <Ionicons
            name="storefront"
            size={IconSize.lg}
            color={Colors.primary[500]}
          />
        </View>
        <View style={styles.branchInfo}>
          <Text variant="titleMedium" weight="semiBold">
            {item.name}
          </Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text variant="labelSmall" color={Colors.semantic.success}>
              Acik
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.branchDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={IconSize.sm}
            color={Colors.neutral[500]}
          />
          <Text variant="bodyMedium" color={Colors.neutral[700]} style={styles.detailText}>
            {item.address}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={IconSize.sm}
            color={Colors.neutral[500]}
          />
          <Text variant="bodyMedium" color={Colors.neutral[700]}>
            {item.workingHours}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="call-outline"
            size={IconSize.sm}
            color={Colors.neutral[500]}
          />
          <Text variant="bodyMedium" color={Colors.neutral[700]}>
            {item.phone}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.branchActions}>
        <Pressable
          onPress={() => handleCall(item.phone)}
          style={[styles.actionButton, styles.callButton]}
        >
          <Ionicons
            name="call"
            size={IconSize.sm}
            color={Colors.semantic.success}
          />
          <Text variant="labelLarge" weight="semiBold" color={Colors.semantic.success}>
            Ara
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleDirections(item)}
          style={[styles.actionButton, styles.directionsButton]}
        >
          <Ionicons
            name="navigate"
            size={IconSize.sm}
            color={Colors.neutral[0]}
          />
          <Text variant="labelLarge" weight="semiBold" color={Colors.neutral[0]}>
            Yol Tarifi
          </Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      {/* Branch List */}
      <FlatList
        data={branches}
        renderItem={renderBranch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ ...styles.listContent, paddingBottom: TAB_BAR_HEIGHT + Spacing.lg }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="storefront-outline"
              size={48}
              color={Colors.neutral[300]}
            />
            <Text variant="bodyLarge" color={Colors.neutral[500]}>
              Şube bulunamadı
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  branchCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  branchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.semantic.success,
  },
  branchDetails: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  detailText: {
    flex: 1,
  },
  branchActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  callButton: {
    backgroundColor: Colors.semantic.successLight,
  },
  directionsButton: {
    backgroundColor: Colors.primary[500],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: Spacing.md,
  },
});
