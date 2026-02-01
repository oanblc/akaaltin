import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface Customer {
  id: number;
  phone: string;
  name: string;
  email?: string;
  role: 'customer' | 'admin';
  personalQRCode: string;
  totalPoints: number;
  usedPoints: number;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

type UserType = 'customer' | 'admin' | null;

interface AuthState {
  customer: Customer | null;
  userType: UserType;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (phone: string, name?: string) => Promise<{ success: boolean; needsRegistration?: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setCustomer: (customer: Customer) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      userType: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, name?: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/customers/auth', { phone, name });
          const { token, ...customer } = response.data;

          // Store JWT token for authenticated API requests
          if (token) {
            await AsyncStorage.setItem('auth_token', token);
          }

          // Determine user type from role
          const userType: UserType = customer.role === 'admin' ? 'admin' : 'customer';

          set({
            customer,
            userType,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });

          if (error.response?.data?.needsRegistration) {
            return { success: false, needsRegistration: true };
          }

          return {
            success: false,
            error: error.response?.data?.error || 'Giriş yapılamadı'
          };
        }
      },

      logout: async () => {
        // Clear any potential stale auth token
        await AsyncStorage.removeItem('auth_token');
        set({
          customer: null,
          userType: null,
          isAuthenticated: false,
        });
      },

      refreshProfile: async () => {
        const { customer } = get();
        if (!customer) return;

        try {
          const response = await api.post('/api/customers/auth', {
            phone: customer.phone
          });
          const { token, ...updatedCustomer } = response.data;
          const userType: UserType = updatedCustomer.role === 'admin' ? 'admin' : 'customer';

          // Update token if provided
          if (token) {
            await AsyncStorage.setItem('auth_token', token);
          }

          set({ customer: updatedCustomer, userType });
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      },

      setCustomer: (customer: Customer) => {
        const userType: UserType = customer.role === 'admin' ? 'admin' : 'customer';
        set({ customer, userType, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        customer: state.customer,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useIsAdmin = () => useAuthStore((state) => state.userType === 'admin');
export const useIsCustomer = () => useAuthStore((state) => state.userType === 'customer');
