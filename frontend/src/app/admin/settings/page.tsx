"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';
import api from '@/lib/api';

interface Settings {
  logoBase64: string;
  logoHeight: string;
  logoWidth: string;
  faviconBase64: string;
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

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    logoBase64: '',
    logoHeight: '50',
    logoWidth: '150',
    faviconBase64: '',
    siteName: 'Aka Kuyumculuk',
    contactPhone: '',
    contactPhone2: '',
    contactEmail: '',
    contactAddress: '',
    workingHours: '',
    workingHoursNote: '',
    socialFacebook: '',
    socialTwitter: '',
    socialInstagram: '',
    socialYoutube: '',
    socialTiktok: '',
    socialWhatsapp: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/settings');
        setSettings({ ...settings, ...response.data });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({ ...settings, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({ ...settings, faviconBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post('/api/settings', settings);
      toast({ title: 'Ayarlar kaydedildi' });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Kaydetme başarısız',
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
        <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
        <p className="text-gray-500">Logo, iletişim bilgileri ve sosyal medya</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Logo & Marka</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Adı</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {settings.logoBase64 && (
                    <img
                      src={settings.logoBase64}
                      alt="Logo"
                      className="h-12 object-contain"
                    />
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      <span>Yükle</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  {settings.faviconBase64 && (
                    <img
                      src={settings.faviconBase64}
                      alt="Favicon"
                      className="h-8 w-8 object-contain"
                    />
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      <span>Yükle</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo Yüksekliği (px)</Label>
                <Input
                  type="number"
                  value={settings.logoHeight}
                  onChange={(e) => setSettings({ ...settings, logoHeight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo Genişliği (px)</Label>
                <Input
                  type="number"
                  value={settings.logoWidth}
                  onChange={(e) => setSettings({ ...settings, logoWidth: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon 1</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="0322 233 55 55"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon 2</Label>
                <Input
                  value={settings.contactPhone2}
                  onChange={(e) => setSettings({ ...settings, contactPhone2: e.target.value })}
                  placeholder="(Opsiyonel)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="info@akakuyumculuk.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Adres</Label>
              <textarea
                value={settings.contactAddress}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                className="w-full p-3 border rounded-md min-h-[80px]"
                placeholder="Adres"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Çalışma Saatleri</Label>
                <Input
                  value={settings.workingHours}
                  onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                  placeholder="Pazartesi - Cumartesi: 09:00 - 19:00"
                />
              </div>
              <div className="space-y-2">
                <Label>Not</Label>
                <Input
                  value={settings.workingHoursNote}
                  onChange={(e) => setSettings({ ...settings, workingHoursNote: e.target.value })}
                  placeholder="Pazar günleri kapalıyız"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Sosyal Medya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={settings.socialWhatsapp}
                  onChange={(e) => setSettings({ ...settings, socialWhatsapp: e.target.value })}
                  placeholder="+90 532 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={settings.socialInstagram}
                  onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={settings.socialFacebook}
                  onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X</Label>
                <Input
                  value={settings.socialTwitter}
                  onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube</Label>
                <Input
                  value={settings.socialYoutube}
                  onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>TikTok</Label>
                <Input
                  value={settings.socialTiktok}
                  onChange={(e) => setSettings({ ...settings, socialTiktok: e.target.value })}
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </form>
    </div>
  );
}
