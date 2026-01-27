"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import api from '@/lib/api';

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  headScripts: string;
  bodyStartScripts: string;
  bodyEndScripts: string;
}

export default function AdminSeoPage() {
  const { toast } = useToast();
  const [seo, setSeo] = useState<SeoSettings>({
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    ogImage: '',
    canonicalUrl: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    googleSiteVerification: '',
    bingSiteVerification: '',
    headScripts: '',
    bodyStartScripts: '',
    bodyEndScripts: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const response = await api.get('/api/seo');
        setSeo({ ...seo, ...response.data });
      } catch (error) {
        console.error('Error fetching SEO:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post('/api/seo', seo);
      toast({ title: 'SEO ayarları kaydedildi' });
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
        <h1 className="text-2xl font-bold text-gray-900">SEO Ayarları</h1>
        <p className="text-gray-500">Arama motoru optimizasyonu ve analytics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Etiketleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Başlığı</Label>
              <Input
                value={seo.siteTitle}
                onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                placeholder="Aka Kuyumculuk - Güncel Altın Fiyatları"
              />
            </div>

            <div className="space-y-2">
              <Label>Site Açıklaması</Label>
              <textarea
                value={seo.siteDescription}
                onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
                className="w-full p-3 border rounded-md min-h-[80px]"
                placeholder="Site açıklaması (160 karakter önerilir)"
              />
            </div>

            <div className="space-y-2">
              <Label>Anahtar Kelimeler</Label>
              <Input
                value={seo.siteKeywords}
                onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value })}
                placeholder="altın fiyatları, kuyumcu, adana"
              />
            </div>

            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                placeholder="https://akakuyumculuk.com"
              />
            </div>

            <div className="space-y-2">
              <Label>OG Image URL</Label>
              <Input
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                placeholder="https://akakuyumculuk.com/og-image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={seo.googleAnalyticsId}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Tag Manager ID</Label>
                <Input
                  value={seo.googleTagManagerId}
                  onChange={(e) => setSeo({ ...seo, googleTagManagerId: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Pixel ID</Label>
                <Input
                  value={seo.metaPixelId}
                  onChange={(e) => setSeo({ ...seo, metaPixelId: e.target.value })}
                  placeholder="123456789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Site Doğrulama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Google Site Verification</Label>
                <Input
                  value={seo.googleSiteVerification}
                  onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value })}
                  placeholder="verification-code"
                />
              </div>
              <div className="space-y-2">
                <Label>Bing Site Verification</Label>
                <Input
                  value={seo.bingSiteVerification}
                  onChange={(e) => setSeo({ ...seo, bingSiteVerification: e.target.value })}
                  placeholder="verification-code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>Özel Scriptler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Head İçi Scriptler</Label>
              <textarea
                value={seo.headScripts}
                onChange={(e) => setSeo({ ...seo, headScripts: e.target.value })}
                className="w-full p-3 border rounded-md min-h-[100px] font-mono text-sm"
                placeholder="<script>...</script>"
              />
            </div>

            <div className="space-y-2">
              <Label>Body Başı Scriptler</Label>
              <textarea
                value={seo.bodyStartScripts}
                onChange={(e) => setSeo({ ...seo, bodyStartScripts: e.target.value })}
                className="w-full p-3 border rounded-md min-h-[100px] font-mono text-sm"
                placeholder="<noscript>...</noscript>"
              />
            </div>

            <div className="space-y-2">
              <Label>Body Sonu Scriptler</Label>
              <textarea
                value={seo.bodyEndScripts}
                onChange={(e) => setSeo({ ...seo, bodyEndScripts: e.target.value })}
                className="w-full p-3 border rounded-md min-h-[100px] font-mono text-sm"
                placeholder="<script>...</script>"
              />
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
