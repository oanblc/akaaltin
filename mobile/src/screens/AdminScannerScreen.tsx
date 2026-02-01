import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';
import { CustomAlert, useCustomAlert } from '../components/common/CustomAlert';
import { api } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export function AdminScannerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    if (scanned || isProcessing) return;

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
      // Use the spend QR code (admin endpoint)
      const response = await api.post('/api/qrcodes/use-spend', {
        code: data,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const { points, customer } = response.data;

      showAlert(
        'Başarılı!',
        `${points} puan başarıyla kullanıldı.\n\nMüşteri: ${customer.name}\nTelefon: ${customer.phone}`,
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
        'QR kod kullanılamadı';

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
      <View style={[styles.container, styles.centered, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.permissionHeader}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text variant="titleMedium" weight="semiBold">Puan Harcama Tara</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.permissionContent}>
          <View style={styles.permissionIconWrapper}>
            <View style={styles.permissionIcon}>
              <Ionicons name="camera" size={48} color="#16A34A" />
            </View>
          </View>

          <Text variant="titleLarge" weight="bold" align="center" style={{ marginTop: 24 }}>
            Kamera İzni Gerekli
          </Text>

          <Text
            variant="bodyMedium"
            color="#6B7280"
            align="center"
            style={{ marginTop: 12, paddingHorizontal: 24 }}
          >
            Müşteri QR kodunu taramak için kamera erişimine izin vermeniz gerekmektedir.
          </Text>

          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text variant="labelLarge" weight="semiBold" color="#FFFFFF">
              Kamera İzni Ver
            </Text>
          </Pressable>

          <View style={styles.permissionInfo}>
            <Ionicons name="shield-checkmark" size={18} color="#6B7280" />
            <Text variant="bodySmall" color="#6B7280">
              Kamera sadece QR kod taramak için kullanılır
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

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
          <View style={styles.scannerHeader}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButtonLight}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Text variant="titleMedium" weight="semiBold" color="#FFFFFF">
                Puan Harcama Tara
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.instructionBadge}>
            <View style={styles.instructionBadgeIcon}>
              <Ionicons name="gift" size={16} color="#16A34A" />
            </View>
            <Text variant="labelMedium" weight="semiBold" color="#16A34A">
              Müşteri QR kodunu tarayın
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

            {/* Scan line animation could be added here */}

            {/* Processing indicator */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingCard}>
                  <ActivityIndicator size="large" color="#16A34A" />
                  <Text variant="labelMedium" weight="semiBold" color="#111827" style={{ marginTop: 12 }}>
                    İşleniyor...
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.overlayFill} />
        </View>

        {/* Bottom Section */}
        <View style={[styles.overlaySection, styles.bottomSection]}>
          <View style={styles.bottomContent}>
            <Text variant="bodyMedium" color="#FFFFFF" align="center">
              QR kodu çerçeve içine hizalayın
            </Text>
            <Text variant="bodySmall" color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: 4 }}>
              Otomatik olarak taranacaktır
            </Text>
          </View>

          {scanned && !isProcessing && (
            <Pressable
              onPress={() => setScanned(false)}
              style={styles.rescanButton}
            >
              <Ionicons name="refresh" size={20} color="#16A34A" />
              <Text variant="labelLarge" weight="semiBold" color="#16A34A">
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

  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  permissionIconWrapper: {
    alignItems: 'center',
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 32,
    gap: 10,
    width: '100%',
    maxWidth: 280,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },

  // Scanner Header
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlayFill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  scanAreaContainer: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  bottomSection: {
    paddingBottom: 60,
    gap: 24,
  },
  bottomContent: {
    alignItems: 'center',
  },

  // Instruction Badge
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 10,
    marginTop: 16,
  },
  instructionBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Corners - Green for spend
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#16A34A',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },

  // Processing
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },

  // Rescan
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 10,
  },
});
