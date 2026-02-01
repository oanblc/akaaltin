import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { Text } from '../common/Text';
import { Price } from '../../types';
import { Colors, PriceFormat, Spacing, Typography } from '../../constants/theme';

interface AnimatedPriceRowProps {
  price: Price;
  index?: number;
  onPress?: (price: Price) => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (code: string) => void;
}

export const AnimatedPriceRow = memo(function AnimatedPriceRow({
  price,
  index = 0,
  onPress,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite,
}: AnimatedPriceRowProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevPriceRef = useRef<{ alis: number; satis: number } | null>(null);
  const flashColorRef = useRef<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPriceRef.current) {
      const prevAlis = prevPriceRef.current.alis;
      const prevSatis = prevPriceRef.current.satis;

      if (prevAlis !== price.alis || prevSatis !== price.satis) {
        const priceChange = price.satis - prevSatis;
        flashColorRef.current = priceChange >= 0 ? 'up' : 'down';

        flashAnim.setValue(1);
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }).start();
      }
    }

    prevPriceRef.current = { alis: price.alis, satis: price.satis };
  }, [price.alis, price.satis, flashAnim]);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'rgba(255, 255, 255, 0)',
      flashColorRef.current === 'up'
        ? 'rgba(22, 163, 74, 0.12)'
        : 'rgba(220, 38, 38, 0.12)',
    ],
  });

  const directionColor =
    price.direction === 'up' ? Colors.price.up :
    price.direction === 'down' ? Colors.price.down : Colors.price.neutral;

  return (
    <View style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      <Pressable
        onPress={() => onPress?.(price)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Left: Fav + Name + Code */}
        <View style={styles.nameCol}>
          {showFavorite && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(price.code);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.favBtn}
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={14}
                color={isFavorite ? Colors.primary[500] : Colors.neutral[300]}
              />
            </Pressable>
          )}
          <Text weight="bold" numberOfLines={2} color={Colors.neutral[900]} style={styles.nameText}>
            {price.name}
          </Text>
        </View>

        {/* Center: Sparkline */}
        <View style={styles.changeCol}>
          <Svg width={36} height={18} viewBox="0 0 36 18">
            <Polyline
              points={
                price.direction === 'up'
                  ? '0,14 6,12 12,10 18,11 24,7 30,8 36,3'
                  : price.direction === 'down'
                  ? '0,3 6,5 12,7 18,6 24,10 30,9 36,14'
                  : '0,9 6,8 12,10 18,9 24,8 30,10 36,9'
              }
              fill="none"
              stroke={directionColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Right: Sell price + Buy price */}
        <View style={styles.priceCol}>
          <Text style={styles.priceMain} weight="bold" color={directionColor}>
            {PriceFormat.format(price.satis)}
          </Text>
          <Text style={styles.priceSub} variant="labelSmall" weight="bold" color={Colors.neutral[500]}>
            {PriceFormat.format(price.alis)}
          </Text>
        </View>
      </Pressable>

      <View style={styles.separator} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.background.primary,
  },
  rowAlt: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  cardPressed: {
    backgroundColor: Colors.primary[50] + '30',
  },

  // Left: Name
  nameCol: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing[3],
  },
  nameText: {
    flex: 1,
    fontSize: 14,
    minHeight: 40,
    lineHeight: 20,
  },
  favBtn: {
    marginRight: Spacing[2],
  },
  // Center: Prices
  priceCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceMain: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    letterSpacing: Typography.letterSpacing.price,
    lineHeight: 22,
  },
  priceSub: {
    fontVariant: ['tabular-nums'],
    letterSpacing: Typography.letterSpacing.price,
    marginTop: 2,
  },

  // Center: Change
  changeCol: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral[100],
    marginHorizontal: Spacing[4],
  },
});
