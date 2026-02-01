import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabNavigator } from './TabNavigator';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../types';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { AdminQRScreen } from '../screens/AdminQRScreen';
import { AdminScannerScreen } from '../screens/AdminScannerScreen';
import { PriceDetailScreen } from '../screens/PriceDetailScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AlertCreateScreen } from '../screens/AlertCreateScreen';
import { SavingsAddScreen } from '../screens/SavingsAddScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { OnboardingScreen, isOnboardingCompleted } from '../screens/OnboardingScreen';

// Placeholder Screen Component
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={placeholderStyles.container}>
      <View style={placeholderStyles.content}>
        <Text style={placeholderStyles.text}>{title}</Text>
        <Text style={placeholderStyles.subtext}>Yakinda...</Text>
      </View>
    </SafeAreaView>
  );
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  subtext: {
    fontSize: 16,
    color: Colors.neutral[500],
    marginTop: 8,
  },
});

// Placeholder screens
const LoginScreen = () => <PlaceholderScreen title="Giriş" />;
const RegisterScreen = () => <PlaceholderScreen title="Kayıt" />;
const SettingsScreen = () => <PlaceholderScreen title="Ayarlar" />;
const BranchDetailScreen = () => <PlaceholderScreen title="Şube Detay" />;
const CampaignDetailScreen = () => <PlaceholderScreen title="Kampanya Detay" />;

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingCompleted();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: Colors.background.primary,
          },
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen name="Main" component={TabNavigator} />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />

        {/* Detail Screens */}
        <Stack.Screen name="PriceDetail" component={PriceDetailScreen} />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="AdminQR"
          component={AdminQRScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="AdminScanner"
          component={AdminScannerScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen
          name="AlertCreate"
          component={AlertCreateScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SavingsAdd"
          component={SavingsAddScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="BranchDetail" component={BranchDetailScreen} />
        <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />

        {/* Support Screens */}
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
