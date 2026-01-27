"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

interface PriceSourceConfig {
  activeSource: string;
  autoFallback: boolean;
  fallbackTimeout: number;
  primaryStatus: string;
  fallbackStatus: string;
  lastPrimaryPing: string | null;
  lastFallbackPing: string | null;
  manualOverride?: boolean;
}

export default function PriceSourcePage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<PriceSourceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fallbackTimeout, setFallbackTimeout] = useState('60');

  const fetchConfig = async () => {
    try {
      const response = await api.get('/api/price-source/config');
      setConfig(response.data);
      setFallbackTimeout(response.data.fallbackTimeout.toString());
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchSource = async (source: string) => {
    try {
      setSaving(true);
      await api.post(`/api/price-source/switch/${source}`);
      toast({
        title: 'Kaynak değiştirildi',
        description: `Aktif kaynak: ${source === 'primary' ? 'Ana Kaynak' : 'Yedek Kaynak'}`,
      });
      fetchConfig();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Kaynak değiştirilemedi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoFallback = async () => {
    try {
      setSaving(true);
      const newValue = !config?.autoFallback;
      await api.post(`/api/price-source/auto-fallback/${newValue}`);
      toast({
        title: 'Ayar güncellendi',
        description: `Otomatik geçiş: ${newValue ? 'Aktif' : 'Pasif'}`,
      });
      fetchConfig();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Ayar güncellenemedi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTimeout = async () => {
    try {
      setSaving(true);
      await api.post('/api/price-source/config', {
        fallbackTimeout: parseInt(fallbackTimeout)
      });
      toast({
        title: 'Ayar güncellendi',
        description: `Timeout: ${fallbackTimeout} saniye`,
      });
      fetchConfig();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Ayar güncellenemedi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetOverride = async () => {
    try {
      setSaving(true);
      await api.post('/api/price-source/reset-override');
      toast({
        title: 'Otomatik geçiş aktif edildi',
        description: 'Artık sistem otomatik olarak kaynaklar arası geçiş yapabilir',
      });
      fetchConfig();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fiyat Kaynağı Yönetimi</h1>
        <p className="text-gray-500">Ana ve yedek fiyat kaynaklarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Source */}
        <Card className={config?.activeSource === 'primary' ? 'ring-2 ring-gold' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Ana Kaynak (VPS)
                {config?.activeSource === 'primary' && (
                  <span className="text-xs bg-gold text-gray-900 px-2 py-1 rounded-full">Aktif</span>
                )}
              </CardTitle>
              {config?.primaryStatus === 'active' ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Durum</p>
              <p className={`font-medium ${config?.primaryStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {config?.primaryStatus === 'active' ? 'Bağlı' : 'Bağlantı Yok'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Güncelleme</p>
              <p className="font-medium">
                {config?.lastPrimaryPing
                  ? new Date(config.lastPrimaryPing).toLocaleString('tr-TR')
                  : 'Henüz yok'
                }
              </p>
            </div>
            <Button
              className="w-full"
              variant={config?.activeSource === 'primary' ? 'outline' : 'gold'}
              disabled={config?.activeSource === 'primary' || saving}
              onClick={() => handleSwitchSource('primary')}
            >
              {config?.activeSource === 'primary' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Seçili
                </>
              ) : (
                'Bu Kaynağı Kullan'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Fallback Source */}
        <Card className={config?.activeSource === 'fallback' ? 'ring-2 ring-gold' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Yedek Kaynak
                {config?.activeSource === 'fallback' && (
                  <span className="text-xs bg-gold text-gray-900 px-2 py-1 rounded-full">Aktif</span>
                )}
              </CardTitle>
              {config?.fallbackStatus === 'active' ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Durum</p>
              <p className={`font-medium ${config?.fallbackStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {config?.fallbackStatus === 'active' ? 'Çalışıyor' : 'Bağlantı Yok'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Güncelleme</p>
              <p className="font-medium">
                {config?.lastFallbackPing
                  ? new Date(config.lastFallbackPing).toLocaleString('tr-TR')
                  : 'Henüz yok'
                }
              </p>
            </div>
            <Button
              className="w-full"
              variant={config?.activeSource === 'fallback' ? 'outline' : 'gold'}
              disabled={config?.activeSource === 'fallback' || saving}
              onClick={() => handleSwitchSource('fallback')}
            >
              {config?.activeSource === 'fallback' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Seçili
                </>
              ) : (
                'Bu Kaynağı Kullan'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Auto Fallback Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Otomatik Geçiş Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Override Warning */}
          {config?.manualOverride && (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Manuel Kaynak Seçimi Aktif</p>
                  <p className="text-sm text-amber-600">
                    Manuel olarak kaynak değiştirdiğiniz için otomatik geçiş devre dışı bırakıldı
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleResetOverride}
                disabled={saving}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Otomatik Geçişi Aktif Et
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Otomatik Geçiş</p>
              <p className="text-sm text-gray-500">
                Ana kaynak belirli süre yanıt vermezse otomatik olarak yedek kaynağa geç
              </p>
            </div>
            <Button
              variant={config?.autoFallback ? 'gold' : 'outline'}
              onClick={handleToggleAutoFallback}
              disabled={saving}
            >
              {config?.autoFallback ? 'Aktif' : 'Pasif'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout Süresi (saniye)</Label>
            <div className="flex gap-2">
              <Input
                id="timeout"
                type="number"
                value={fallbackTimeout}
                onChange={(e) => setFallbackTimeout(e.target.value)}
                className="max-w-[150px]"
                min="10"
                max="3600"
              />
              <Button onClick={handleUpdateTimeout} disabled={saving}>
                Kaydet
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Ana kaynak bu süre boyunca yanıt vermezse yedek kaynağa geçilir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
