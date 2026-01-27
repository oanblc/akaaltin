"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface Settings {
  logoBase64: string;
  logoHeight: number;
  logoWidth: number;
  faviconBase64: string;
  priceTableImage: string;
  siteName: string;
  contactPhone: string;
  contactPhone2: string;
  contactEmail: string;
  contactAddress: string;
  workingHours: string;
  workingHoursNote: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
  socialWhatsapp: string;
}

const defaultSettings: Settings = {
  logoBase64: '',
  logoHeight: 50,
  logoWidth: 150,
  faviconBase64: '',
  priceTableImage: '',
  siteName: 'Aka Kuyumculuk',
  contactPhone: '0322 233 55 55',
  contactPhone2: '',
  contactEmail: '',
  contactAddress: 'Turgut Özal Bulvarı Güzelyalı Mahallesi QNB Finansbank Yanı Recep Gergin Apt. Zemin Kat No:124/A Çukurova / ADANA',
  workingHours: 'Pazartesi - Cumartesi: 09:00 - 19:00',
  workingHoursNote: 'Pazar günleri kapalıyız',
  socialFacebook: '',
  socialTwitter: '',
  socialInstagram: '',
  socialYoutube: '',
  socialTiktok: '',
  socialWhatsapp: '',
};

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings({ ...defaultSettings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
