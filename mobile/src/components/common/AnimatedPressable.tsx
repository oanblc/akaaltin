import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TouchFeedback } from '../../constants/theme';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleOnPress?: boolean;
  pressScale?: number;
  opacityOnPress?: boolean;
  pressOpacity?: number;
  hapticType?: 'light' | 'medium' | 'heavy' | 'none';
  disabled?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  scaleOnPress = true,
  pressScale = TouchFeedback.scale.pressed,
  opacityOnPress = true,
  pressOpacity = TouchFeedback.opacity.pressed,
  hapticType = 'light',
  disabled = false,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const triggerHaptic = useCallback(() => {
    if (hapticType === 'none') return;
    switch (hapticType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }, [hapticType]);

  const handlePressIn = useCallback(
    (event: any) => {
      if (disabled) return;

      if (scaleOnPress) {
        Animated.spring(scaleAnim, {
          toValue: pressScale,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }

      if (opacityOnPress) {
        Animated.spring(opacityAnim, {
          toValue: pressOpacity,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }

      triggerHaptic();
      onPressIn?.(event);
    },
    [disabled, scaleOnPress, pressScale, opacityOnPress, pressOpacity, onPressIn, triggerHaptic, scaleAnim, opacityAnim]
  );

  const handlePressOut = useCallback(
    (event: any) => {
      if (disabled) return;

      if (scaleOnPress) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }

      if (opacityOnPress) {
        Animated.spring(opacityAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }

      onPressOut?.(event);
    },
    [disabled, scaleOnPress, opacityOnPress, onPressOut, scaleAnim, opacityAnim]
  );

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? TouchFeedback.opacity.disabled : opacityAnim,
        },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function PressableScale({
  children,
  style,
  ...props
}: Omit<AnimatedPressableProps, 'scaleOnPress' | 'opacityOnPress'>) {
  return (
    <AnimatedPressable
      scaleOnPress={true}
      opacityOnPress={false}
      style={style}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export function PressableOpacity({
  children,
  style,
  ...props
}: Omit<AnimatedPressableProps, 'scaleOnPress' | 'opacityOnPress'>) {
  return (
    <AnimatedPressable
      scaleOnPress={false}
      opacityOnPress={true}
      style={style}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
