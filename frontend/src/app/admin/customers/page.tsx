"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Search, Phone, Mail, Award, Eye, EyeOff,
  ChevronLeft, ChevronRight, Trash2, Edit2, Plus, X
} from 'lucide-react';
import api from '@/lib/api';

interface Customer {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  totalPoints: number;
  usedPoints: number;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    qrCodes: number;
    transactions: number;
  };
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
}

// Telefon numarası maskeleme fonksiyonu
const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, '');

  // Maksimum 11 rakam (0XXX XXX XX XX)
  const limited = numbers.slice(0, 11);

  // Formatlama
  if (limited.length === 0) return '';
  if (limited.length <= 4) return limited;
  if (limited.length <= 7) return `${limited.slice(0, 4)} ${limited.slice(4)}`;
  if (limited.length <= 9) return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`;
};

// Telefon numarasından maskeyi kaldır
const unmaskPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [phoneDisplay, setPhoneDisplay] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    isActive: true
  });

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await api.get(`/api/customers?${params}`);
      setCustomers(response.data.customers);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/customers/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [page, search]);

  const resetForm = () => {
    setFormData({
      phone: '',
      name: '',
      email: '',
      isActive: true
    });
    setPhoneDisplay('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      phone: customer.phone,
      name: customer.name,
      email: customer.email || '',
      isActive: customer.isActive
    });
    setPhoneDisplay(formatPhoneNumber(customer.phone));
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneDisplay(formatted);
    setFormData({ ...formData, phone: unmaskPhone(formatted) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/customers/${editingId}`, {
          name: formData.name,
          email: formData.email || null,
          isActive: formData.isActive
        });
        toast({ title: 'Müşteri güncellendi' });
      } else {
        await api.post('/api/customers', formData);
        toast({ title: 'Müşteri eklendi' });
      }
      fetchCustomers();
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
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz? Tüm işlem geçmişi de silinecektir.')) return;
    try {
      await api.delete(`/api/customers/${id}`);
      toast({ title: 'Müşteri silindi' });
      fetchCustomers();
      fetchStats();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme başarısız', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await api.patch(`/api/customers/${id}/toggle`);
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling customer:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
          <p className="text-gray-500">Mobil uygulama müşterilerini yönetin</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-500">Toplam Müşteri</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeCustomers}</p>
                  <p className="text-sm text-gray-500">Aktif Müşteri</p>
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
                  <p className="text-2xl font-bold">{stats.availablePoints.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-500">Kullanılabilir Puan</p>
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
            <CardTitle>{editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Telefon *</Label>
                  <Input
                    value={phoneDisplay}
                    onChange={handlePhoneChange}
                    placeholder="0XXX XXX XX XX"
                    required
                    disabled={!!editingId}
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label>İsim *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ad Soyad"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Aktif</Label>
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

      {/* Search and List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Müşteriler</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="İsim, telefon veya e-posta ara..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Müşteri bulunamadı</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Müşteri</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Telefon</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Puan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">İşlem</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Kayıt</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            {customer.email && (
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {formatPhoneNumber(customer.phone)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-amber-600">
                              {(customer.totalPoints - customer.usedPoints).toLocaleString('tr-TR')} puan
                            </p>
                            <p className="text-xs text-gray-400">
                              {customer.totalPoints.toLocaleString('tr-TR')} kazanıldı
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {customer._count.qrCodes} QR, {customer._count.transactions} işlem
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-500">{formatDate(customer.createdAt)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {customer.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(customer.id)}
                            >
                              {customer.isActive ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(customer.id)}
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
