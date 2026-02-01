import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const alertConfig = {
  success: {
    icon: 'checkmark-circle' as const,
    color: '#16A34A',
    bgColor: '#ECFDF5',
  },
  error: {
    icon: 'close-circle' as const,
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
  warning: {
    icon: 'warning' as const,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  info: {
    icon: 'information-circle' as const,
    color: '#D4AF37',
    bgColor: '#FEF9E7',
  },
};

export function CustomAlert({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'Tamam', style: 'default' }],
  onClose,
}: CustomAlertProps) {
  const config = alertConfig[type];

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: '#DC2626' };
      case 'cancel':
        return { backgroundColor: '#F3F4F6' };
      default:
        return { backgroundColor: '#D4AF37' };
    }
  };

  const getButtonTextColor = (style?: 'default' | 'cancel' | 'destructive') => {
    return style === 'cancel' ? '#374151' : style === 'destructive' ? '#FFFFFF' : '#422D00';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={48} color={config.color} />
          </View>

          {/* Content */}
          <Text variant="titleLarge" weight="bold" align="center" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" color="#6B7280" align="center" style={styles.message}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            buttons.length === 1 && styles.buttonContainerSingle
          ]}>
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                onPress={() => handleButtonPress(button)}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length > 1 && { flex: 1 },
                ]}
              >
                <Text
                  variant="labelLarge"
                  weight="semiBold"
                  color={getButtonTextColor(button.style)}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Hook for easier usage
import { useState, useCallback } from 'react';

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export function useCustomAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    buttons?: AlertButton[],
    type?: AlertType
  ) => {
    setAlertState({
      visible: true,
      type: type || 'info',
      title,
      message,
      buttons: buttons || [{ text: 'Tamam', style: 'default' }],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const alertProps = {
    ...alertState,
    onClose: hideAlert,
  };

  return { showAlert, hideAlert, alertProps, CustomAlert };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonContainerSingle: {
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
});
