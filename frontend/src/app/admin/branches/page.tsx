"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Star, Building } from 'lucide-react';
import api from '@/lib/api';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  phone2: string;
  email: string;
  mapUrl: string;
  workingHours: string;
  isMain: boolean;
  isActive: boolean;
}

export default function AdminBranchesPage() {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    phone2: '',
    email: '',
    mapUrl: '',
    workingHours: '',
    isMain: false,
  });

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branches/admin');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      phone2: '',
      email: '',
      mapUrl: '',
      workingHours: '',
      isMain: false,
    });
    setEditingBranch(null);
    setShowForm(false);
  };

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      phone2: branch.phone2 || '',
      email: branch.email || '',
      mapUrl: branch.mapUrl || '',
      workingHours: branch.workingHours || '',
      isMain: branch.isMain,
    });
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/api/branches/${editingBranch.id}`, formData);
        toast({ title: 'Şube güncellendi' });
      } else {
        await api.post('/api/branches', formData);
        toast({ title: 'Şube eklendi' });
      }
      fetchBranches();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/branches/${id}`);
      toast({ title: 'Şube silindi' });
      fetchBranches();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Silme başarısız',
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
          <h1 className="text-2xl font-bold text-gray-900">Şubeler</h1>
          <p className="text-gray-500">Şube bilgilerini yönetin</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Şube
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBranch ? 'Şube Düzenle' : 'Yeni Şube'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Şube Adı</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Merkez Şube"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Adres</Label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border rounded-md min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon 2</Label>
                  <Input
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Çalışma Saatleri</Label>
                  <Input
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    placeholder="09:00 - 19:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Google Maps URL</Label>
                <Input
                  value={formData.mapUrl}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                />
                <Label htmlFor="isMain">Ana Şube</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingBranch ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Şube Listesi ({branches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz şube eklenmemiş</p>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{branch.name}</p>
                        {branch.isMain && (
                          <Star className="h-4 w-4 fill-gold text-gold" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-md">{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(branch)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(branch.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
