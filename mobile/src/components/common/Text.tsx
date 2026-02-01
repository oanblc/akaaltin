import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

type Variant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'bodyMedium',
  color = Colors.neutral[900],
  weight,
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const fontSize = Typography.fontSize[variant];

  // Varsayilan font weight'i variant'a gore belirle
  const defaultWeight = variant.startsWith('display') || variant.startsWith('headline')
    ? 'bold'
    : variant.startsWith('title')
    ? 'semiBold'
    : variant.startsWith('label')
    ? 'medium'
    : 'regular';

  const fontWeight = weight || defaultWeight;

  // Font weight mapping for system fonts
  const fontWeightMap: Record<string, '400' | '500' | '600' | '700'> = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  };

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize,
          color,
          textAlign: align,
          fontWeight: fontWeightMap[fontWeight],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
