import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  Pressable,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof Spacing | number;
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 'lg',
  onPress,
  disabled = false,
  style,
  children,
  ...props
}: CardProps) {
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && styles.filled,
    { padding: paddingValue },
    disabled && styles.disabled,
    style,
  ];

  const handlePress = async () => {
    if (onPress && !disabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        {...(props as PressableProps)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: Colors.surface.elevated,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filled: {
    backgroundColor: Colors.neutral[100],
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
