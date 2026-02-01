import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { CustomAlert, useCustomAlert } from '../components/common/CustomAlert';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export function QRScannerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { customer, refreshProfile } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showAlert, alertProps } = useCustomAlert();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing || !customer) return;

    // Check if it's a valid AKA QR code
    if (!data.startsWith('AKA-')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('Geçersiz QR Kod', 'Bu QR kod geçerli bir Aka Kuyumculuk QR kodu değil', undefined, 'error');
      return;
    }

    setScanned(true);
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Use the earn QR code (customer scans admin's QR)
      const response = await api.post('/api/qrcodes/use-earn', {
        code: data,
        customerId: customer.id,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh user profile to get updated points
      await refreshProfile();

      const { points, newTotalPoints, availablePoints } = response.data;

      showAlert(
        'Tebrikler! 🎉',
        `${points} puan kazandınız!\n\nKullanılabilir Puanınız: ${availablePoints}`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Main', { screen: 'QR' } as never),
          },
        ],
        'success'
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error.response?.data?.error ||
        'QR kod kullanılırken bir hata oluştu';

      showAlert('Hata', errorMessage, [
        {
          text: 'Tekrar Dene',
          onPress: () => {
            setScanned(false);
            setIsProcessing(false);
          },
        },
        {
          text: 'Geri Dön',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ], 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Permission not determined yet
  if (permission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text variant="titleMedium" weight="semiBold">QR Tarayici</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={64} color="#6B7280" />
          </View>
          <Text variant="titleMedium" weight="semiBold" align="center">
            Kamera Izni Gerekli
          </Text>
          <Text
            variant="bodyMedium"
            color="#6B7280"
            align="center"
            style={{ marginTop: 8, paddingHorizontal: 40 }}
          >
            QR kod taramak icin kamera erisime izin vermeniz gerekmektedir.
          </Text>
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Text variant="labelLarge" weight="semiBold" color="#422D00">
              Izin Ver
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Section */}
        <View style={[styles.overlaySection, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButtonLight}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text variant="titleMedium" weight="semiBold" color="#FFFFFF">
              QR Tarayici
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.instructionBadge}>
            <Ionicons name="gift" size={18} color="#D4AF37" />
            <Text variant="labelMedium" weight="semiBold" color="#D4AF37">
              Kasiyerin gosterdigi QR kodu tarayin
            </Text>
          </View>
        </View>

        {/* Middle Section with scan area */}
        <View style={styles.middleSection}>
          <View style={styles.overlayFill} />
          <View style={styles.scanAreaContainer}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Processing indicator */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text variant="bodyMedium" color="#FFFFFF" style={{ marginTop: 12 }}>
                  Isleniyor...
                </Text>
              </View>
            )}
          </View>
          <View style={styles.overlayFill} />
        </View>

        {/* Bottom Section */}
        <View style={[styles.overlaySection, styles.bottomSection]}>
          <Text variant="bodyMedium" color="#FFFFFF" align="center">
            QR kodu cerceve icine hizalayin
          </Text>

          {scanned && !isProcessing && (
            <Pressable
              onPress={() => setScanned(false)}
              style={styles.rescanButton}
            >
              <Ionicons name="refresh" size={20} color="#111827" />
              <Text variant="labelLarge" weight="semiBold" color="#111827">
                Tekrar Tara
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert {...alertProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Permission Screen
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlayFill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanAreaContainer: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  bottomSection: {
    paddingBottom: 60,
    gap: 20,
  },

  // Instruction Badge
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 249, 231, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginTop: 12,
  },

  // Corners - Gold for earn
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#D4AF37',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },

  // Processing
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  // Rescan
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
});
