import { create } from 'zustand';
import { settingsAPI } from '../services/api';

interface Settings {
  logoBase64: string;
  logoHeight: string;
  siteName: string;
  contactPhone: string;
  contactPhone2: string;
  contactEmail: string;
  contactAddress: string;
  workingHours: string;
  socialWhatsapp: string;
  socialInstagram: string;
  socialFacebook: string;
}

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    logoBase64: '',
    logoHeight: '40',
    siteName: 'AKA Kuyumculuk',
    contactPhone: '',
    contactPhone2: '',
    contactEmail: '',
    contactAddress: '',
    workingHours: '',
    socialWhatsapp: '',
    socialInstagram: '',
    socialFacebook: '',
  },
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await settingsAPI.get();
      set({ settings: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error: 'Ayarlar yüklenemedi', loading: false });
    }
  },
}));
