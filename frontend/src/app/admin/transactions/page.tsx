"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Receipt, Search, Plus, Trash2, ArrowUpCircle, ArrowDownCircle,
  ChevronLeft, ChevronRight, User, Gift, ShoppingBag, Sparkles
} from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
  id: number;
  customerId: number;
  type: string;
  amount: number | null;
  points: number;
  description: string | null;
  qrCodeId: number | null;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
  };
}

interface Stats {
  totalTransactions: number;
  pointsEarned: number;
  pointsUsed: number;
  totalAmount: number;
  recentTransactions: Transaction[];
}

const typeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  purchase: { label: 'Alışveriş', icon: ShoppingBag, color: 'blue' },
  points_earned: { label: 'Puan Kazandı', icon: ArrowUpCircle, color: 'green' },
  points_used: { label: 'Puan Kullandı', icon: ArrowDownCircle, color: 'red' },
  bonus: { label: 'Bonus', icon: Gift, color: 'purple' }
};

export default function AdminTransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<{ id: number; name: string; phone: string }[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    type: 'bonus',
    amount: '',
    points: '',
    description: ''
  });

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter })
      });

      const response = await api.get(`/api/transactions?${params}`);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/transactions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers?limit=100');
      setCustomers(response.data.customers.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone
      })));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchCustomers();
  }, [page, search, typeFilter]);

  const resetForm = () => {
    setFormData({
      customerId: '',
      type: 'bonus',
      amount: '',
      points: '',
      description: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/transactions', {
        customerId: parseInt(formData.customerId),
        type: formData.type,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        points: parseInt(formData.points),
        description: formData.description || null
      });
      toast({ title: 'İşlem eklendi' });
      fetchTransactions();
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

  const handleDelete = async (id: number) => {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz? Puanlar geri alınacaktır.')) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      toast({ title: 'İşlem silindi' });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme başarısız', variant: 'destructive' });
    }
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
          <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
          <p className="text-gray-500">Müşteri işlemlerini ve puan hareketlerini görüntüleyin</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Manuel İşlem
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  <p className="text-sm text-gray-500">Toplam İşlem</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <ArrowUpCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pointsEarned.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-500">Kazanılan Puan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <ArrowDownCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pointsUsed.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-500">Kullanılan Puan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString('tr-TR')} TL</p>
                  <p className="text-sm text-gray-500">Toplam Tutar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Manuel İşlem Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Müşteri *</Label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                    required
                  >
                    <option value="">Müşteri seçin...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>İşlem Tipi *</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                    required
                  >
                    <option value="bonus">Bonus Puan</option>
                    <option value="points_earned">Puan Kazandı</option>
                    <option value="points_used">Puan Kullandı</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Puan *</Label>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tutar (TL)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1000.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="İşlem açıklaması"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">Ekle</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
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
            <CardTitle>İşlemler</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTypeFilter(''); setPage(1); }}
                >
                  Tümü
                </Button>
                <Button
                  variant={typeFilter === 'points_earned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTypeFilter('points_earned'); setPage(1); }}
                >
                  Kazanılan
                </Button>
                <Button
                  variant={typeFilter === 'points_used' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTypeFilter('points_used'); setPage(1); }}
                >
                  Kullanılan
                </Button>
                <Button
                  variant={typeFilter === 'bonus' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTypeFilter('bonus'); setPage(1); }}
                >
                  Bonus
                </Button>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri veya açıklama ara..."
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
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">İşlem bulunamadı</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Müşteri</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tip</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Puan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tutar</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Açıklama</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tarih</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const typeInfo = typeLabels[tx.type] || { label: tx.type, icon: Receipt, color: 'gray' };
                      const TypeIcon = typeInfo.icon;
                      return (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{tx.customer.name}</p>
                                <p className="text-xs text-gray-400">{tx.customer.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`h-4 w-4 text-${typeInfo.color}-600`} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                                {typeInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              tx.type === 'points_used' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {tx.type === 'points_used' ? '-' : '+'}{Math.abs(tx.points)} puan
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {tx.amount ? `${tx.amount.toLocaleString('tr-TR')} TL` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {tx.description || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(tx.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
