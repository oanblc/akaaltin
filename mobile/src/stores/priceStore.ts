import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Price, Favorite, PriceAlert } from '../types';

interface PriceState {
  prices: Price[];
  favorites: Favorite[];
  alerts: PriceAlert[];
  connected: boolean;
  lastUpdate: Date | null;

  // Actions
  setPrices: (prices: Price[]) => void;
  updatePrice: (price: Price) => void;
  setConnected: (connected: boolean) => void;
  setLastUpdate: (date: Date) => void;

  // Favorites
  addFavorite: (code: string) => void;
  removeFavorite: (code: string) => void;
  isFavorite: (code: string) => boolean;
  getFavorites: () => Price[];

  // Alerts
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
}

export const usePriceStore = create<PriceState>()(
  persist(
    (set, get) => ({
      prices: [],
      favorites: [],
      alerts: [],
      connected: false,
      lastUpdate: null,

      setPrices: (prices) => set({ prices }),

      updatePrice: (updatedPrice) =>
        set((state) => ({
          prices: state.prices.map((p) =>
            p.code === updatedPrice.code ? updatedPrice : p
          ),
        })),

      setConnected: (connected) => set({ connected }),

      setLastUpdate: (date) => set({ lastUpdate: date }),

      addFavorite: (code) =>
        set((state) => ({
          favorites: [
            ...state.favorites,
            { code, addedAt: new Date().toISOString() },
          ],
        })),

      removeFavorite: (code) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.code !== code),
        })),

      isFavorite: (code) => get().favorites.some((f) => f.code === code),

      getFavorites: () => {
        const { prices, favorites } = get();
        return prices.filter((p) => favorites.some((f) => f.code === p.code));
      },

      addAlert: (alertData) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...alertData,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),

      triggerAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? { ...a, isActive: false, triggeredAt: new Date().toISOString() }
              : a
          ),
        })),
    }),
    {
      name: 'price-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        alerts: state.alerts,
      }),
    }
  )
);
