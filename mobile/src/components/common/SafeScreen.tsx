import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  // Hangi kenarlar için safe area uygulanacak
  edges?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
  // StatusBar stili
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  // StatusBar arka plan rengi (Android)
  statusBarColor?: string;
  // Arka plan rengi
  backgroundColor?: string;
  // Tab bar var mı (alt padding için)
  hasTabBar?: boolean;
  // Klavye ayarlama davranışı
  keyboardBehavior?: 'padding' | 'height' | 'position';
  // Ek stil
  style?: ViewStyle;
  // Klavye ayarlama için ek offset
  keyboardVerticalOffset?: number;
}

export function SafeScreen({
  children,
  edges = { top: true, bottom: true, left: true, right: true },
  statusBarStyle = 'dark-content',
  statusBarColor,
  backgroundColor = Colors.background.primary,
  hasTabBar = false,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
  style,
  keyboardVerticalOffset = 0,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  // Tab bar yüksekliği (Samsung/iPhone navigasyon çakışmasını önlemek için)
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 70;

  // Safe area padding hesaplama
  const paddingTop = edges.top ? insets.top : 0;
  const paddingBottom = edges.bottom
    ? hasTabBar
      ? TAB_BAR_HEIGHT // Tab bar varsa onun yüksekliği kadar
      : insets.bottom // Tab bar yoksa sadece safe area inset
    : 0;
  const paddingLeft = edges.left ? insets.left : 0;
  const paddingRight = edges.right ? insets.right : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* StatusBar - Çentik (Notch) için */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor || backgroundColor}
        translucent={Platform.OS === 'android'}
      />

      {/* KeyboardAvoidingView - Klavye Kapatma için */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={
          keyboardVerticalOffset + (Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0)
        }
      >
        {/* Safe Area Container */}
        <View
          style={[
            styles.safeContainer,
            {
              paddingTop,
              paddingBottom,
              paddingLeft,
              paddingRight,
            },
            style,
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Tab bar içeren ekranlar için özel wrapper
interface TabScreenProps {
  children: React.ReactNode;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  backgroundColor?: string;
  style?: ViewStyle;
}

export function TabScreen({
  children,
  statusBarStyle = 'dark-content',
  backgroundColor = Colors.background.secondary,
  style,
}: TabScreenProps) {
  return (
    <SafeScreen
      edges={{ top: true, bottom: false, left: true, right: true }}
      statusBarStyle={statusBarStyle}
      backgroundColor={backgroundColor}
      hasTabBar={true}
      style={style}
    >
      {children}
    </SafeScreen>
  );
}

// Modal/Stack ekranlar için wrapper (tab bar yok)
interface StackScreenProps {
  children: React.ReactNode;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  backgroundColor?: string;
  style?: ViewStyle;
  keyboardVerticalOffset?: number;
}

export function StackScreen({
  children,
  statusBarStyle = 'dark-content',
  backgroundColor = Colors.background.primary,
  style,
  keyboardVerticalOffset = 0,
}: StackScreenProps) {
  return (
    <SafeScreen
      edges={{ top: true, bottom: true, left: true, right: true }}
      statusBarStyle={statusBarStyle}
      backgroundColor={backgroundColor}
      hasTabBar={false}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={style}
    >
      {children}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
});
