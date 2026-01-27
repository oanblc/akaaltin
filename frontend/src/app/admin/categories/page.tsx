"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Tag, Coins } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  tlPerPoint: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tlPerPoint: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Hata',
        description: 'Kategoriler yüklenemedi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        tlPerPoint: category.tlPerPoint.toString(),
        isActive: category.isActive
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        tlPerPoint: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', tlPerPoint: '', isActive: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.tlPerPoint) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, {
          name: formData.name,
          tlPerPoint: parseFloat(formData.tlPerPoint),
          isActive: formData.isActive
        });
        toast({ title: 'Kategori güncellendi' });
      } else {
        await api.post('/api/categories', {
          name: formData.name,
          tlPerPoint: parseFloat(formData.tlPerPoint),
          isActive: formData.isActive
        });
        toast({ title: 'Kategori oluşturuldu' });
      }

      handleCloseModal();
      fetchCategories();
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

  const handleToggleActive = async (category: Category) => {
    try {
      await api.put(`/api/categories/${category.id}`, {
        isActive: !category.isActive
      });
      toast({ title: category.isActive ? 'Kategori pasife alındı' : 'Kategori aktifleştirildi' });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/api/categories/${category.id}`);
      toast({ title: 'Kategori silindi' });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Silme başarısız',
        variant: 'destructive',
      });
    }
  };

  const seedDefaultCategory = async () => {
    try {
      await api.post('/api/categories/seed');
      toast({ title: 'Varsayılan kategori oluşturuldu' });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive',
      });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Puan Kategorileri</h1>
          <p className="text-gray-500">Ürün kategorileri ve puan oranları</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-gold hover:bg-gold/90">
          <Plus className="h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Coins className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Puan Hesaplama</p>
              <p className="text-sm text-amber-700">
                Her kategori için "TL/Puan" değeri belirlenir. Örneğin: 1000 TL/Puan = Her 1000 TL alışverişe 1 puan kazanılır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Kategoriler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz kategori eklenmemiş</p>
              <Button onClick={seedDefaultCategory} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Varsayılan Kategori Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Puan Oranı</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Örnek</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gold" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{category.tlPerPoint.toLocaleString('tr-TR')} TL = 1 Puan</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500 text-sm">
                          {(5000 / category.tlPerPoint).toFixed(0)} puan (5.000 TL alışverişte)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {category.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori Adı</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: 22 Ayar Bilezik"
                />
              </div>

              <div className="space-y-2">
                <Label>Puan Oranı (TL / 1 Puan)</Label>
                <Input
                  type="number"
                  value={formData.tlPerPoint}
                  onChange={(e) => setFormData({ ...formData, tlPerPoint: e.target.value })}
                  placeholder="Örn: 1000"
                  min="1"
                />
                <p className="text-xs text-gray-500">
                  {formData.tlPerPoint && parseFloat(formData.tlPerPoint) > 0
                    ? `Her ${parseFloat(formData.tlPerPoint).toLocaleString('tr-TR')} TL alışverişe 1 puan kazanılır`
                    : 'Kaç TL\'ye 1 puan verileceğini girin'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold/90"
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : editingCategory ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
