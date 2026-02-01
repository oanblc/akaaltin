import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '../common/Text';
import { Card } from '../common/Card';
import { Colors, Spacing, BorderRadius, IconSize } from '../../constants/theme';
import { Price } from '../../types';
import { usePriceStore } from '../../stores/priceStore';

interface PriceCardProps {
  price: Price;
  onPress?: (price: Price) => void;
  showFavoriteButton?: boolean;
  compact?: boolean;
}

// Fiyat formatlama fonksiyonu
const formatPrice = (value: number): string => {
  if (!value) return '-';
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const PriceCard = memo(function PriceCard({
  price,
  onPress,
  showFavoriteButton = true,
  compact = false,
}: PriceCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = usePriceStore();
  const favorite = isFavorite(price.code);

  const handleFavoritePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (favorite) {
      removeFavorite(price.code);
    } else {
      addFavorite(price.code);
    }
  }, [favorite, price.code, addFavorite, removeFavorite]);

  const handlePress = useCallback(() => {
    onPress?.(price);
  }, [onPress, price]);

  const directionIcon =
    price.direction === 'up'
      ? 'trending-up'
      : price.direction === 'down'
      ? 'trending-down'
      : 'remove';

  const directionColor =
    price.direction === 'up'
      ? Colors.price.up
      : price.direction === 'down'
      ? Colors.price.down
      : Colors.price.neutral;

  if (compact) {
    return (
      <Card
        variant="outlined"
        padding="md"
        onPress={onPress ? handlePress : undefined}
        style={styles.compactCard}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Text variant="titleSmall" weight="semiBold">
              {price.name}
            </Text>
            <View style={styles.directionBadge}>
              <Ionicons
                name={directionIcon}
                size={IconSize.xs}
                color={directionColor}
              />
              <Text
                variant="labelSmall"
                color={directionColor}
                weight="semiBold"
              >
                {price.farkOran > 0 ? '+' : ''}
                {price.farkOran.toFixed(2)}%
              </Text>
            </View>
          </View>
          <View style={styles.compactRight}>
            <Text variant="bodySmall" color={Colors.neutral[500]}>
              Alis
            </Text>
            <Text variant="titleSmall" weight="bold">
              {formatPrice(price.alis)}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      padding={0}
      onPress={onPress ? handlePress : undefined}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBg, { backgroundColor: Colors.primary[100] }]}>
            <Text variant="titleMedium" color={Colors.primary[700]}>
              {price.code.slice(0, 2)}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" weight="semiBold">
              {price.name}
            </Text>
            <Text variant="bodySmall" color={Colors.neutral[500]}>
              {price.code}
            </Text>
          </View>
        </View>

        {showFavoriteButton && (
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={8}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={IconSize.md}
              color={favorite ? Colors.semantic.error : Colors.neutral[400]}
            />
          </Pressable>
        )}
      </View>

      {/* Prices */}
      <View style={styles.priceContainer}>
        <View style={styles.priceColumn}>
          <Text variant="labelMedium" color={Colors.neutral[500]}>
            ALIS
          </Text>
          <Text variant="headlineSmall" weight="bold" color={Colors.price.up}>
            {formatPrice(price.alis)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceColumn}>
          <Text variant="labelMedium" color={Colors.neutral[500]}>
            SATIS
          </Text>
          <Text variant="headlineSmall" weight="bold" color={Colors.price.down}>
            {formatPrice(price.satis)}
          </Text>
        </View>
      </View>

      {/* Footer - Change */}
      <View style={[styles.footer, { backgroundColor: `${directionColor}10` }]}>
        <View style={styles.changeContainer}>
          <Ionicons
            name={directionIcon}
            size={IconSize.sm}
            color={directionColor}
          />
          <Text variant="labelLarge" color={directionColor} weight="semiBold">
            {price.fark > 0 ? '+' : ''}
            {formatPrice(price.fark)} TL
          </Text>
        </View>
        <Text variant="labelLarge" color={directionColor} weight="bold">
          {price.farkOran > 0 ? '+' : ''}
          {price.farkOran.toFixed(2)}%
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  compactCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    gap: Spacing.xs,
  },
  favoriteButton: {
    padding: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeft: {
    gap: Spacing.xs,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
