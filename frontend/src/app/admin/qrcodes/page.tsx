"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  QrCode, Search, Plus, Trash2, Check, X, Copy,
  ChevronLeft, ChevronRight, Calendar, Award, User
} from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  tlPerPoint: number;
  isActive: boolean;
}

interface CategoryAmount {
  categoryId: number;
  amount: string;
}

interface CategoryBreakdownItem {
  categoryId: number;
  categoryName: string;
  amount: number;
  points: number;
}

interface QRCode {
  id: number;
  code: string;
  customerId: number | null;
  categoryId: number | null;
  categoryBreakdown: string | null;
  points: number;
  amount: number | null;
  description: string | null;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
  } | null;
  category: {
    id: number;
    name: string;
    tlPerPoint: number;
  } | null;
}

interface Stats {
  totalQRCodes: number;
  usedQRCodes: number;
  unusedQRCodes: number;
  totalPoints: number;
  usedPoints: number;
}

export default function AdminQRCodesPage() {
  const { toast } = useToast();
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    createdBy: ''
  });

  // Category amounts state
  const [categoryAmounts, setCategoryAmounts] = useState<CategoryAmount[]>([]);

  // Calculate points for all categories
  const calculateBreakdown = React.useMemo(() => {
    let totalPoints = 0;
    let totalAmount = 0;
    const breakdown: CategoryBreakdownItem[] = [];

    for (const ca of categoryAmounts) {
      const rawAmount = parseFloat(ca.amount) || 0;
      if (rawAmount <= 0) continue;

      const category = categories.find(c => c.id === ca.categoryId);
      if (!category) continue;

      const points = Math.floor(rawAmount / category.tlPerPoint);
      breakdown.push({
        categoryId: category.id,
        categoryName: category.name,
        amount: rawAmount,
        points
      });

      totalPoints += points;
      totalAmount += rawAmount;
    }

    return { totalPoints, totalAmount, breakdown };
  }, [categoryAmounts, categories]);

  const calculatedPoints = calculateBreakdown.totalPoints;

  const [bulkFormData, setBulkFormData] = useState({
    count: '10',
    points: '',
    description: '',
    expiresAt: '',
    createdBy: ''
  });

  const fetchQRCodes = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(filter !== 'all' && { isUsed: filter === 'used' ? 'true' : 'false' })
      });

      const response = await api.get(`/api/qrcodes?${params}`);
      setQRCodes(response.data.qrCodes);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/qrcodes/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories?activeOnly=true');
      setCategories(response.data);
      // Initialize categoryAmounts with all categories
      setCategoryAmounts(response.data.map((c: Category) => ({
        categoryId: c.id,
        amount: ''
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchQRCodes();
    fetchStats();
    fetchCategories();
  }, [page, search, filter]);

  const resetForm = () => {
    setFormData({
      description: '',
      createdBy: ''
    });
    // Reset all category amounts
    setCategoryAmounts(categories.map(c => ({
      categoryId: c.id,
      amount: ''
    })));
    setShowForm(false);
  };

  const handleCategoryAmountChange = (categoryId: number, value: string) => {
    setCategoryAmounts(prev => prev.map(ca =>
      ca.categoryId === categoryId ? { ...ca, amount: value } : ca
    ));
  };

  const resetBulkForm = () => {
    setBulkFormData({
      count: '10',
      points: '',
      description: '',
      expiresAt: '',
      createdBy: ''
    });
    setShowBulkForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (calculateBreakdown.breakdown.length === 0) {
      toast({
        title: 'Hata',
        description: 'En az bir kategoride tutar girmelisiniz',
        variant: 'destructive'
      });
      return;
    }

    if (calculatedPoints <= 0) {
      toast({
        title: 'Hata',
        description: 'Girilen tutarlar için puan kazanılamaz.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Send categories array to API
      const categoriesPayload = calculateBreakdown.breakdown.map(item => ({
        categoryId: item.categoryId,
        amount: item.amount
      }));

      await api.post('/api/qrcodes/earn', {
        categories: categoriesPayload,
        description: formData.description || null,
        createdBy: formData.createdBy || null
      });
      toast({ title: `${calculatedPoints} puan değerinde QR kod oluşturuldu` });
      fetchQRCodes();
      fetchStats();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive'
      });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/qrcodes/bulk', {
        count: parseInt(bulkFormData.count),
        points: parseInt(bulkFormData.points),
        description: bulkFormData.description || null,
        expiresAt: bulkFormData.expiresAt || null,
        createdBy: bulkFormData.createdBy || null
      });
      toast({ title: response.data.message });
      fetchQRCodes();
      fetchStats();
      resetBulkForm();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu QR kodu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/qrcodes/${id}`);
      toast({ title: 'QR kod silindi' });
      fetchQRCodes();
      fetchStats();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme başarısız', variant: 'destructive' });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Kod kopyalandı' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">QR Kod Yönetimi</h1>
          <p className="text-gray-500">Puan kazandıran QR kodları yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Toplu Oluştur
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni QR Kod
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalQRCodes}</p>
                  <p className="text-sm text-gray-500">Toplam QR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.usedQRCodes}</p>
                  <p className="text-sm text-gray-500">Kullanılan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <X className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unusedQRCodes}</p>
                  <p className="text-sm text-gray-500">Kullanılmamış</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-500">Toplam Puan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.usedPoints.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-500">Kullanılan Puan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Single QR Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni QR Kod Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Amount Inputs */}
              <div className="space-y-2">
                <Label>Kategori Tutarları</Label>
                <p className="text-sm text-gray-500">Her kategoriden alışveriş tutarını girin (boş bırakılanlar dahil edilmez)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {categories.map((cat) => {
                    const catAmount = categoryAmounts.find(ca => ca.categoryId === cat.id);
                    const rawAmount = parseFloat(catAmount?.amount || '0') || 0;
                    const catPoints = rawAmount > 0 ? Math.floor(rawAmount / cat.tlPerPoint) : 0;

                    return (
                      <div key={cat.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-700">{cat.name}</span>
                            <p className="text-xs text-gray-500">{cat.tlPerPoint.toLocaleString('tr-TR')} TL = 1 Puan</p>
                          </div>
                          {catPoints > 0 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                              +{catPoints} puan
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={catAmount?.amount || ''}
                            onChange={(e) => handleCategoryAmountChange(cat.id, e.target.value)}
                            placeholder="0"
                            min="0"
                            className="text-right"
                          />
                          <span className="text-gray-500 text-sm font-medium">TL</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              {calculateBreakdown.breakdown.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Toplam Tutar:</span>
                    <span className="font-bold text-gray-900">{calculateBreakdown.totalAmount.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">Toplam Puan:</span>
                    <span className="font-bold text-amber-600 text-lg">{calculateBreakdown.totalPoints} puan</span>
                  </div>
                  {calculateBreakdown.breakdown.length > 1 && (
                    <div className="pt-2 border-t border-amber-200 space-y-1">
                      {calculateBreakdown.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                          <span>{item.categoryName}:</span>
                          <span>{item.amount.toLocaleString('tr-TR')} TL → {item.points} puan</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Oluşturan</Label>
                  <Input
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    placeholder="Personel adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="22 Ayar Bilezik Alımı"
                  />
                </div>
              </div>

              {categories.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                  Henüz kategori eklenmemiş. Lütfen önce "Puan Kategorileri" sayfasından kategori ekleyin.
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={categories.length === 0 || calculatedPoints <= 0}>
                  Oluştur
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk QR Form */}
      {showBulkForm && (
        <Card>
          <CardHeader>
            <CardTitle>Toplu QR Kod Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Adet *</Label>
                  <Input
                    type="number"
                    value={bulkFormData.count}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, count: e.target.value })}
                    placeholder="10"
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puan Değeri *</Label>
                  <Input
                    type="number"
                    value={bulkFormData.points}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, points: e.target.value })}
                    placeholder="100"
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Son Kullanma</Label>
                  <Input
                    type="datetime-local"
                    value={bulkFormData.expiresAt}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, expiresAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Oluşturan</Label>
                  <Input
                    value={bulkFormData.createdBy}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, createdBy: e.target.value })}
                    placeholder="Personel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Input
                    value={bulkFormData.description}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, description: e.target.value })}
                    placeholder="Kampanya"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">Oluştur</Button>
                <Button type="button" variant="outline" onClick={resetBulkForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>QR Kodlar</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFilter('all'); setPage(1); }}
                >
                  Tümü
                </Button>
                <Button
                  variant={filter === 'unused' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFilter('unused'); setPage(1); }}
                >
                  Kullanılmamış
                </Button>
                <Button
                  variant={filter === 'used' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFilter('used'); setPage(1); }}
                >
                  Kullanılmış
                </Button>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kod veya müşteri ara..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {qrCodes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">QR kod bulunamadı</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Kod</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Puan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tutar</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Kullanan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Oluşturma</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {qr.code}
                            </code>
                            <button
                              onClick={() => copyCode(qr.code)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {qr.categoryBreakdown ? (
                            <div className="space-y-1">
                              {(() => {
                                try {
                                  const breakdown = JSON.parse(qr.categoryBreakdown);
                                  return breakdown.map((item: any, idx: number) => (
                                    <span key={idx} className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium mr-1">
                                      {item.categoryName}
                                    </span>
                                  ));
                                } catch {
                                  return qr.category ? (
                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                                      {qr.category.name}
                                    </span>
                                  ) : '-';
                                }
                              })()}
                            </div>
                          ) : qr.category ? (
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                              {qr.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-amber-600">{qr.points} puan</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            {qr.amount ? `${qr.amount.toLocaleString('tr-TR')} TL` : '-'}
                            {qr.description && (
                              <p className="text-xs text-gray-400 line-clamp-1">{qr.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {qr.customer ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">{qr.customer.name}</p>
                                <p className="text-xs text-gray-400">{qr.customer.phone}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            qr.isUsed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {qr.isUsed ? 'Kullanıldı' : 'Bekliyor'}
                          </span>
                          {qr.usedAt && (
                            <p className="text-xs text-gray-400 mt-1">{formatDate(qr.usedAt)}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-500">{formatDate(qr.createdAt)}</p>
                          {qr.createdBy && (
                            <p className="text-xs text-gray-400">{qr.createdBy}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(qr.id)}
                              disabled={qr.isUsed}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Sayfa {page} / {totalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
