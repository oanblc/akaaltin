// Fiyat Verileri
export interface Price {
  code: string;
  name: string;
  alis: number;
  satis: number;
  fark: number;
  farkOran: number;
  direction: 'up' | 'down' | 'stable';
  kaynakAlis?: number;
  kaynakSatis?: number;
  spreadAlis?: number;
  spreadSatis?: number;
  timestamp?: string;
}

// Favori
export interface Favorite {
  code: string;
  addedAt: string;
}

// Fiyat Alarmi
export interface PriceAlert {
  id: string;
  priceCode: string;
  priceName: string;
  type: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

// Kullanici
export interface User {
  id: number;
  phone: string;
  name: string;
  email?: string;
  personalQRCode: string;
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// QR Kod
export interface QRCode {
  id: number;
  code: string;
  points: number;
  amount?: number;
  description?: string;
  isUsed: boolean;
  usedAt?: string;
  expiresAt?: string;
}

// Islem
export interface Transaction {
  id: number;
  type: 'purchase' | 'points_earned' | 'points_used' | 'bonus';
  amount?: number;
  points: number;
  description?: string;
  createdAt: string;
}

// Sube
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

// Kampanya
export interface Campaign {
  id: number;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Navigation Tipleri
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  PriceDetail: { code: string };
  QRScanner: undefined;
  AdminQR: undefined;
  AdminScanner: undefined;
  Notifications: undefined;
  Settings: undefined;
  Profile: undefined;
  Alerts: undefined;
  AlertCreate: { priceCode?: string };
  SavingsAdd: undefined;
  BranchDetail: { id: number };
  CampaignDetail: { id: number };
  Help: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Prices: undefined;
  QR: undefined;
  Branches: undefined;
  Profile: undefined;
};

// API Response Tipleri
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
