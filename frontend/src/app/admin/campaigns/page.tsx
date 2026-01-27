"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Gift, Sparkles, Star, Crown, Percent, Award,
  ChevronDown, ChevronUp, ExternalLink, GripVertical, X
} from 'lucide-react';
import api from '@/lib/api';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface Step {
  title: string;
  description: string;
  icon?: string;
}

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  icon: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  features: Feature[];
  steps: Step[];
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  isActive: boolean;
}

const iconOptions = [
  { value: 'Gift', label: 'Hediye' },
  { value: 'Sparkles', label: 'Parlak' },
  { value: 'Star', label: 'Yıldız' },
  { value: 'Crown', label: 'Taç' },
  { value: 'Percent', label: 'Yüzde' },
  { value: 'Award', label: 'Ödül' },
  { value: 'Smartphone', label: 'Telefon' },
  { value: 'QrCode', label: 'QR Kod' },
  { value: 'ShoppingBag', label: 'Alışveriş' },
  { value: 'Users', label: 'Kullanıcılar' },
  { value: 'Wallet', label: 'Cüzdan' }
];

const badgeColorOptions = [
  { value: 'gold', label: 'Altın' },
  { value: 'green', label: 'Yeşil' },
  { value: 'blue', label: 'Mavi' },
  { value: 'purple', label: 'Mor' },
  { value: 'red', label: 'Kırmızı' }
];

const iconMap: Record<string, React.ElementType> = {
  Gift, Sparkles, Star, Crown, Percent, Award
};

export default function AdminCampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    coverImage: '',
    icon: 'Gift',
    badgeText: '',
    badgeColor: 'gold',
    buttonText: 'Detaylı Bilgi',
    buttonLink: '',
    features: [] as Feature[],
    steps: [] as Step[],
    isActive: true
  });

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/api/campaigns/all');
      // Parse JSON fields
      const parsed = response.data.map((c: any) => ({
        ...c,
        features: c.features ? JSON.parse(c.features) : [],
        steps: c.steps ? JSON.parse(c.steps) : []
      }));
      setCampaigns(parsed);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      coverImage: '',
      icon: 'Gift',
      badgeText: '',
      badgeColor: 'gold',
      buttonText: 'Detaylı Bilgi',
      buttonLink: '',
      features: [],
      steps: [],
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (campaign: Campaign) => {
    setFormData({
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description,
      content: campaign.content || '',
      coverImage: campaign.coverImage || '',
      icon: campaign.icon || 'Gift',
      badgeText: campaign.badgeText || '',
      badgeColor: campaign.badgeColor || 'gold',
      buttonText: campaign.buttonText || 'Detaylı Bilgi',
      buttonLink: campaign.buttonLink || '',
      features: campaign.features || [],
      steps: campaign.steps || [],
      isActive: campaign.isActive
    });
    setEditingId(campaign.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/campaigns/${editingId}`, formData);
        toast({ title: 'Kampanya güncellendi' });
      } else {
        await api.post('/api/campaigns', formData);
        toast({ title: 'Kampanya eklendi' });
      }
      fetchCampaigns();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/campaigns/${id}`);
      toast({ title: 'Kampanya silindi' });
      fetchCampaigns();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme başarısız', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await api.patch(`/api/campaigns/${id}/toggle`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { title: '', description: '', icon: 'Check' }]
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { title: '', description: '', icon: 'Smartphone' }]
    });
  };

  const removeStep = (index: number) => {
    const newSteps = [...formData.steps];
    newSteps.splice(index, 1);
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanya Yönetimi</h1>
          <p className="text-gray-500">Kampanyaları ekleyin, düzenleyin ve yönetin</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlık *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: editingId ? formData.slug : generateSlug(title)
                      });
                    }}
                    placeholder="Puan Kazan Kampanyası"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="puan-kazan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kısa Açıklama *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kampanya hakkında kısa bir açıklama..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Detaylı İçerik (HTML)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<p>Detaylı kampanya içeriği...</p>"
                  rows={6}
                />
              </div>

              {/* Visual Options */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Kapak Görseli URL</Label>
                  <Input
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>İkon</Label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Rozet Metni</Label>
                  <Input
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="Yeni"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rozet Rengi</Label>
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    {badgeColorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Button Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buton Metni</Label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Detaylı Bilgi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harici Link (opsiyonel)</Label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500">Boş bırakılırsa detay sayfasına yönlendirir</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Nasıl Çalışır Adımları</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-1" /> Adım Ekle
                  </Button>
                </div>
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                    <span className="flex items-center justify-center w-8 h-8 bg-gold text-white rounded-full text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="Adım başlığı"
                      />
                      <Input
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="Adım açıklaması"
                        className="md:col-span-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Avantajlar</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-1" /> Avantaj Ekle
                  </Button>
                </div>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-green-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        placeholder="Avantaj başlığı"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="Avantaj açıklaması"
                        className="md:col-span-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Aktif (Sitede görünsün)</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingId ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Kampanyalar ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz kampanya eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const IconComponent = iconMap[campaign.icon || 'Gift'] || Gift;
                return (
                  <div
                    key={campaign.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      campaign.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gold/10 rounded-xl">
                        <IconComponent className="h-6 w-6 text-gold-dark" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{campaign.title}</p>
                          {campaign.badgeText && (
                            <span className="px-2 py-0.5 bg-gold/20 text-gold-dark text-xs font-medium rounded-full">
                              {campaign.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{campaign.description}</p>
                        <p className="text-xs text-gray-400 mt-1">/{campaign.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/kampanyalar/${campaign.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(campaign.id)}
                      >
                        {campaign.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(campaign)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
