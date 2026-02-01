// =============================================================================
// AKA KUYUMCULUK - DESIGN SYSTEM
// Midas kalitesinde finansal uygulama tasarim sistemi
// =============================================================================

import { Platform } from 'react-native';

// =============================================================================
// COLORS
// =============================================================================
export const Colors = {
  // Marka Renkleri (Gold)
  primary: {
    50: '#FDF8E7',
    100: '#FAF0C3',
    200: '#F5E08A',
    300: '#EFCE4F',
    400: '#E5BC23',
    500: '#D4AF37', // Ana altin rengi
    600: '#B8941D',
    700: '#8C6F14',
    800: '#5F4B0D',
    900: '#332706',
  },

  // Notr Renkler
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantik Renkler
  semantic: {
    success: '#16A34A',
    successLight: '#DCFCE7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Fiyat Degisim Renkleri
  price: {
    up: '#16A34A',
    upBg: '#DCFCE7',
    down: '#DC2626',
    downBg: '#FEE2E2',
    neutral: '#6B7280',
    neutralBg: '#F3F4F6',
  },

  // Arka Plan Renkleri
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },

  // Yuzey Renkleri (Elevation)
  surface: {
    0: '#FFFFFF',
    1: '#FAFAFA',
    2: '#F5F5F5',
    3: '#EEEEEE',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

// =============================================================================
// SPACING - 8px Grid System
// =============================================================================
export const Spacing = {
  0: 0,
  1: 4,    // 0.5x
  2: 8,    // 1x   - Base
  3: 12,   // 1.5x
  4: 16,   // 2x
  5: 20,   // 2.5x
  6: 24,   // 3x
  7: 28,   // 3.5x
  8: 32,   // 4x
  10: 40,  // 5x
  12: 48,  // 6x
  16: 64,  // 8x
  20: 80,  // 10x
  24: 96,  // 12x
  // Semantic aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,    // Default for cards & buttons
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// =============================================================================
// SHADOWS - Platform Specific
// =============================================================================
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================
export const Typography = {
  // Font Family - System font kullan (daha hizli, daha guvenilir)
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto',
    semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Font Sizes
  fontSize: {
    displayLarge: 57,
    displayMedium: 45,
    displaySmall: 36,
    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,
    titleLarge: 22,
    titleMedium: 16,
    titleSmall: 14,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
    // Finansal veriler icin
    priceDisplay: 28,
    priceLarge: 20,
    priceMedium: 16,
    priceSmall: 14,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Letter Spacing - Finansal veriler icin optimize
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    // Fiyatlar icin - daha okunabilir
    price: 0.5,
    priceDisplay: -0.5,
  },
} as const;

// =============================================================================
// ANIMATION - Timing & Springs
// =============================================================================
export const Animation = {
  // Duration (ms)
  duration: {
    instant: 100,
    fast: 150,      // Micro interactions (button press)
    normal: 250,    // Standard transitions
    slow: 350,      // Complex animations (modal open)
    slower: 500,    // Page transitions
  },

  // Spring Configs (for Reanimated)
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 150,
      mass: 0.8,
    },
    stiff: {
      damping: 25,
      stiffness: 200,
      mass: 0.5,
    },
    // Button press spring
    press: {
      damping: 15,
      stiffness: 150,
      mass: 0.5,
    },
  },

  // Easing curves
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
  },
} as const;

// =============================================================================
// HAPTIC FEEDBACK
// =============================================================================
export const Haptic = {
  light: 'light' as const,      // Button tap
  medium: 'medium' as const,    // Important action
  heavy: 'heavy' as const,      // Error/Warning
  success: 'success' as const,  // Success feedback
  warning: 'warning' as const,  // Warning feedback
  error: 'error' as const,      // Error feedback
} as const;

// =============================================================================
// TOUCH FEEDBACK - Press States
// =============================================================================
export const TouchFeedback = {
  // Scale values
  scale: {
    pressed: 0.97,    // When pressed
    normal: 1,        // Default
  },
  // Opacity values
  opacity: {
    pressed: 0.9,     // When pressed
    disabled: 0.5,    // When disabled
    normal: 1,        // Default
  },
  // Minimum touch target (accessibility)
  minSize: 44,        // iOS HIG & Android minimum
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// =============================================================================
// LAYOUT
// =============================================================================
export const Layout = {
  screenPadding: 16,
  cardPadding: 16,
  listItemHeight: 56,       // 8px grid (7x)
  listItemHeightLarge: 72,  // 8px grid (9x)
  headerHeight: 56,
  tabBarHeight: 56,
  inputHeight: 48,          // 8px grid (6x)
  buttonHeight: 48,         // 8px grid (6x)
  buttonHeightSmall: 40,    // 8px grid (5x)
} as const;

// =============================================================================
// CARD VARIANTS
// =============================================================================
export const CardStyle = {
  elevated: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  flat: {
    backgroundColor: Colors.surface[1],
    borderRadius: BorderRadius.lg,
  },
} as const;

// =============================================================================
// PRICE FORMATTING HELPERS
// =============================================================================
export const PriceFormat = {
  // Format: 4.250,00
  format: (value: number, decimals: number = 2): string => {
    if (!value && value !== 0) return '-';
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  // Format with currency: 4.250,00 TL
  formatWithCurrency: (value: number, currency: string = 'TL'): string => {
    return `${PriceFormat.format(value)} ${currency}`;
  },

  // Get price color based on direction
  getColor: (direction: 'up' | 'down' | 'stable'): string => {
    switch (direction) {
      case 'up':
        return Colors.price.up;
      case 'down':
        return Colors.price.down;
      default:
        return Colors.price.neutral;
    }
  },

  // Get background color based on direction
  getBgColor: (direction: 'up' | 'down' | 'stable'): string => {
    switch (direction) {
      case 'up':
        return Colors.price.upBg;
      case 'down':
        return Colors.price.downBg;
      default:
        return Colors.price.neutralBg;
    }
  },
} as const;

// =============================================================================
// EXPORT THEME OBJECT
// =============================================================================
export const theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  typography: Typography,
  animation: Animation,
  haptic: Haptic,
  touchFeedback: TouchFeedback,
  iconSize: IconSize,
  layout: Layout,
  cardStyle: CardStyle,
  priceFormat: PriceFormat,
} as const;

export type Theme = typeof theme;
