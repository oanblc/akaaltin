"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Monitor,
  Users,
  QrCode,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import api from '@/lib/api';

interface PriceSourceStatus {
  activeSource: string;
  autoFallback: boolean;
  fallbackTimeout: number;
  lastPrimaryUpdate: string | null;
  lastFallbackUpdate: string | null;
  primaryConnected: boolean;
  priceCount: number;
}

interface CustomerStats {
  total: number;
  active: number;
  totalPoints: number;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<PriceSourceStatus | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statusRes, customersRes] = await Promise.all([
        api.get('/api/price-source/status'),
        api.get('/api/customers/stats').catch(() => ({ data: null }))
      ]);
      setStatus(statusRes.data);
      if (customersRes.data) setCustomerStats(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Henüz güncelleme yok';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Sistem durumunu ve istatistikleri görüntüleyin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Price Count */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Toplam Fiyat</p>
              <p className="text-3xl font-bold text-gray-900">{status?.priceCount || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Active Source */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Aktif Kaynak</p>
              <p className="text-xl font-bold text-gray-900">
                {status?.activeSource === 'primary' ? 'Ana Kaynak' : 'Yedek Kaynak'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status?.activeSource === 'primary'
                ? 'bg-gradient-to-br from-green-100 to-green-200'
                : 'bg-gradient-to-br from-yellow-100 to-yellow-200'
            }`}>
              <RefreshCw className={`h-6 w-6 ${
                status?.activeSource === 'primary' ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Primary Connection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ana Kaynak</p>
              <p className="text-xl font-bold text-gray-900">
                {status?.primaryConnected ? 'Bağlı' : 'Bağlı Değil'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status?.primaryConnected
                ? 'bg-gradient-to-br from-green-100 to-green-200'
                : 'bg-gradient-to-br from-red-100 to-red-200'
            }`}>
              {status?.primaryConnected ? (
                <Wifi className="h-6 w-6 text-green-600" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Müşteriler</p>
              <p className="text-3xl font-bold text-gray-900">{customerStats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Source Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              status?.primaryConnected ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {status?.primaryConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ana Kaynak (VPS)</h3>
              <p className={`text-sm ${status?.primaryConnected ? 'text-green-600' : 'text-red-600'}`}>
                {status?.primaryConnected ? 'Aktif' : 'Bağlantı yok'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Son güncelleme: {formatTime(status?.lastPrimaryUpdate || null)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Yedek Kaynak (API)</h3>
              <p className="text-sm text-blue-600">Her zaman aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Son güncelleme: {formatTime(status?.lastFallbackUpdate || null)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/prices"
            className="group p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <p className="font-medium text-gray-900">Fiyatları Yönet</p>
            <p className="text-sm text-gray-500 mt-1">Fiyat ekle, düzenle</p>
          </Link>

          <Link
            href="/admin/price-source"
            className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900">Kaynak Ayarları</p>
            <p className="text-sm text-gray-500 mt-1">Fiyat kaynakları</p>
          </Link>

          <Link
            href="/admin/customers"
            className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-medium text-gray-900">Müşteriler</p>
            <p className="text-sm text-gray-500 mt-1">Müşteri yönetimi</p>
          </Link>

          <Link
            href="/admin/qrcodes"
            className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <QrCode className="h-6 w-6 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">QR Kodlar</p>
            <p className="text-sm text-gray-500 mt-1">Puan işlemleri</p>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Site Ayarları</span>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            href="/tv"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Monitor className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">TV Görünümü</span>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Siteyi Gör</span>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            href="/piyasalar"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Piyasalar</span>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>
        </div>
      </div>

      {/* Auto Fallback Status */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status?.autoFallback ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Otomatik Kaynak Geçişi</h3>
              <p className="text-sm text-gray-600">
                {status?.autoFallback
                  ? `Aktif - ${status.fallbackTimeout} saniye sonra geçiş yapar`
                  : 'Pasif - Manuel kontrol gerekli'
                }
              </p>
            </div>
          </div>
          <Link
            href="/admin/price-source"
            className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
          >
            Ayarla
          </Link>
        </div>
      </div>
    </div>
  );
}
