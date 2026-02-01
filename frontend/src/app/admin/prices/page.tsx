"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Server, Database, ChevronDown, ChevronUp, TrendingUp, TrendingDown, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CustomPrice {
  id: number;
  name: string;
  code: string;
  category: string;
  priceTable: string;
  alisSourceCode: string;
  alisSourceField: string;
  alisMultiplier: number;
  alisAddition: number;
  satisSourceCode: string;
  satisSourceField: string;
  satisMultiplier: number;
  satisAddition: number;
  order: number;
  decimals: number;
  isVisible: boolean;
}

interface GroupedPrice {
  code: string;
  name: string;
  category: string;
  order: number;
  decimals: number;
  isVisible: boolean;
  primary: CustomPrice | null;
  fallback: CustomPrice | null;
}

interface SourcePrice {
  code: string;
  name: string;
  alis: number;
  satis: number;
}

interface CachedPrice {
  code: string;
  name: string;
  alis: number;
  satis: number;
  fark: number;
  farkOran: number;
  direction: string;
}

function SortablePriceRow({
  gp,
  cached,
  expandedItems,
  toggleExpanded,
  toggleVisibility,
  handleEdit,
  handleDelete,
}: {
  gp: GroupedPrice;
  cached: CachedPrice | undefined;
  expandedItems: Set<string>;
  toggleExpanded: (code: string) => void;
  toggleVisibility: (gp: GroupedPrice) => void;
  handleEdit: (gp: GroupedPrice) => void;
  handleDelete: (code: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: gp.code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
        onClick={() => toggleExpanded(gp.code)}
      >
        <div className="flex items-center gap-4">
          <button
            className="cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          {expandedItems.has(gp.code) ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium">{gp.name}</p>
            <p className="text-sm text-gray-500">{gp.code} • {gp.category}</p>
          </div>
          {cached && (
            <div className="flex items-center gap-4 ml-4">
              <div className="text-sm">
                <span className="text-gray-500">Alış:</span>
                <span className="ml-1 font-semibold text-green-600">{cached.alis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Satış:</span>
                <span className="ml-1 font-semibold text-red-600">{cached.satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {cached.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : cached.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={cached.direction === 'up' ? 'text-green-500' : cached.direction === 'down' ? 'text-red-500' : 'text-gray-400'}>
                  {cached.farkOran > 0 ? '+' : ''}{cached.farkOran.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); toggleVisibility(gp); }}
          >
            {gp.isVisible ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleEdit(gp); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleDelete(gp.code); }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {expandedItems.has(gp.code) && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-white border-t">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">VPS Yapılandırması</span>
            </div>
            {gp.primary ? (
              <div className="space-y-1 text-gray-600">
                <p>Alış: {gp.primary.alisSourceCode}[{gp.primary.alisSourceField}] × {gp.primary.alisMultiplier} + {gp.primary.alisAddition}</p>
                <p>Satış: {gp.primary.satisSourceCode}[{gp.primary.satisSourceField}] × {gp.primary.satisMultiplier} + {gp.primary.satisAddition}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Yapılandırılmamış</p>
            )}
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Yedek Yapılandırması</span>
            </div>
            {gp.fallback ? (
              <div className="space-y-1 text-gray-600">
                <p>Alış: {gp.fallback.alisSourceCode}[{gp.fallback.alisSourceField}] × {gp.fallback.alisMultiplier} + {gp.fallback.alisAddition}</p>
                <p>Satış: {gp.fallback.satisSourceCode}[{gp.fallback.satisSourceField}] × {gp.fallback.satisMultiplier} + {gp.fallback.satisAddition}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Yapılandırılmamış</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPricesPage() {
  const { toast } = useToast();
  const [groupedPrices, setGroupedPrices] = useState<GroupedPrice[]>([]);
  const [primarySourcePrices, setPrimarySourcePrices] = useState<SourcePrice[]>([]);
  const [fallbackSourcePrices, setFallbackSourcePrices] = useState<SourcePrice[]>([]);
  const [cachedPrices, setCachedPrices] = useState<CachedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showSourcePrices, setShowSourcePrices] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groupedPrices.findIndex((gp) => gp.code === active.id);
    const newIndex = groupedPrices.findIndex((gp) => gp.code === over.id);
    const reordered = arrayMove(groupedPrices, oldIndex, newIndex);
    setGroupedPrices(reordered);

    try {
      await api.put('/api/custom-prices/order/bulk', {
        items: reordered.map((gp, i) => ({ code: gp.code, order: i })),
      });
      toast({ title: 'Sıralama güncellendi' });
    } catch (error) {
      toast({ title: 'Hata', description: 'Sıralama güncellenemedi', variant: 'destructive' });
      fetchPrices();
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'altin',
    decimals: 2,
    isVisible: true,
    // Primary table config
    primaryAlisSourceCode: '',
    primaryAlisSourceField: 'alis',
    primaryAlisMultiplier: 1,
    primaryAlisAddition: 0,
    primarySatisSourceCode: '',
    primarySatisSourceField: 'satis',
    primarySatisMultiplier: 1,
    primarySatisAddition: 0,
    // Fallback table config
    fallbackAlisSourceCode: '',
    fallbackAlisSourceField: 'alis',
    fallbackAlisMultiplier: 1,
    fallbackAlisAddition: 0,
    fallbackSatisSourceCode: '',
    fallbackSatisSourceField: 'satis',
    fallbackSatisMultiplier: 1,
    fallbackSatisAddition: 0,
  });

  const fetchPrices = async () => {
    try {
      const [groupedRes, primaryRes, fallbackRes, cachedRes] = await Promise.all([
        api.get('/api/custom-prices/grouped'),
        api.get('/api/prices/sources?source=primary'),
        api.get('/api/prices/sources?source=fallback'),
        api.get('/api/prices/cached')
      ]);
      setGroupedPrices(groupedRes.data);
      setPrimarySourcePrices(primaryRes.data.prices || []);
      setFallbackSourcePrices(fallbackRes.data.prices || []);
      setCachedPrices(cachedRes.data.prices || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'altin',
      decimals: 2,
      isVisible: true,
      primaryAlisSourceCode: '',
      primaryAlisSourceField: 'alis',
      primaryAlisMultiplier: 1,
      primaryAlisAddition: 0,
      primarySatisSourceCode: '',
      primarySatisSourceField: 'satis',
      primarySatisMultiplier: 1,
      primarySatisAddition: 0,
      fallbackAlisSourceCode: '',
      fallbackAlisSourceField: 'alis',
      fallbackAlisMultiplier: 1,
      fallbackAlisAddition: 0,
      fallbackSatisSourceCode: '',
      fallbackSatisSourceField: 'satis',
      fallbackSatisMultiplier: 1,
      fallbackSatisAddition: 0,
    });
    setEditingCode(null);
    setShowForm(false);
  };

  const handleEdit = (gp: GroupedPrice) => {
    setFormData({
      name: gp.name,
      code: gp.code,
      category: gp.category,
      decimals: gp.decimals,
      isVisible: gp.isVisible,
      primaryAlisSourceCode: gp.primary?.alisSourceCode || '',
      primaryAlisSourceField: gp.primary?.alisSourceField || 'alis',
      primaryAlisMultiplier: gp.primary?.alisMultiplier || 1,
      primaryAlisAddition: gp.primary?.alisAddition || 0,
      primarySatisSourceCode: gp.primary?.satisSourceCode || '',
      primarySatisSourceField: gp.primary?.satisSourceField || 'satis',
      primarySatisMultiplier: gp.primary?.satisMultiplier || 1,
      primarySatisAddition: gp.primary?.satisAddition || 0,
      fallbackAlisSourceCode: gp.fallback?.alisSourceCode || '',
      fallbackAlisSourceField: gp.fallback?.alisSourceField || 'alis',
      fallbackAlisMultiplier: gp.fallback?.alisMultiplier || 1,
      fallbackAlisAddition: gp.fallback?.alisAddition || 0,
      fallbackSatisSourceCode: gp.fallback?.satisSourceCode || '',
      fallbackSatisSourceField: gp.fallback?.satisSourceField || 'satis',
      fallbackSatisMultiplier: gp.fallback?.satisMultiplier || 1,
      fallbackSatisAddition: gp.fallback?.satisAddition || 0,
    });
    setEditingCode(gp.code);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await api.put(`/api/custom-prices/code/${editingCode}`, formData);
        toast({ title: 'Fiyat güncellendi' });
      } else {
        await api.post('/api/custom-prices', formData);
        toast({ title: 'Fiyat eklendi' });
      }
      fetchPrices();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'İşlem başarısız',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Bu fiyatı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/custom-prices/code/${code}`);
      toast({ title: 'Fiyat silindi' });
      fetchPrices();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Silme başarısız',
        variant: 'destructive',
      });
    }
  };

  const toggleVisibility = async (gp: GroupedPrice) => {
    try {
      // Update both entries
      if (gp.primary) {
        await api.put(`/api/custom-prices/${gp.primary.id}`, {
          isVisible: !gp.isVisible
        });
      }
      if (gp.fallback) {
        await api.put(`/api/custom-prices/${gp.fallback.id}`, {
          isVisible: !gp.isVisible
        });
      }
      fetchPrices();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleExpanded = (code: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedItems(newExpanded);
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
          <h1 className="text-2xl font-bold text-gray-900">Fiyat Yönetimi</h1>
          <p className="text-gray-500">Her fiyat hem VPS hem de yedek kaynak için ayrı ayrı yapılandırılır</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Fiyat
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCode ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Ürün Adı</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Çeyrek Altın"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kod</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CEYREK"
                    required
                    disabled={!!editingCode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="altin">Altın</option>
                    <option value="gumus">Gümüş</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ondalık Basamak</Label>
                  <Input
                    type="number"
                    value={formData.decimals}
                    onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
                    min="0"
                    max="6"
                  />
                </div>
              </div>

              {/* Dual Table Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Table */}
                <div className="border rounded-lg p-4 bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">VPS (Ana Kaynak)</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Alış Kaynak Kodu</Label>
                        <select
                          value={formData.primaryAlisSourceCode}
                          onChange={(e) => setFormData({ ...formData, primaryAlisSourceCode: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="">Seçin...</option>
                          {primarySourcePrices.map((sp) => (
                            <option key={sp.code} value={sp.code}>{sp.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Fiyat Alanı</Label>
                        <select
                          value={formData.primaryAlisSourceField}
                          onChange={(e) => setFormData({ ...formData, primaryAlisSourceField: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="alis">Alış</option>
                          <option value="satis">Satış</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Çarpan</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          className="h-9 text-sm"
                          value={formData.primaryAlisMultiplier}
                          onChange={(e) => setFormData({ ...formData, primaryAlisMultiplier: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Ekleme</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-sm"
                          value={formData.primaryAlisAddition}
                          onChange={(e) => setFormData({ ...formData, primaryAlisAddition: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Satış Kaynak Kodu</Label>
                        <select
                          value={formData.primarySatisSourceCode}
                          onChange={(e) => setFormData({ ...formData, primarySatisSourceCode: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="">Seçin...</option>
                          {primarySourcePrices.map((sp) => (
                            <option key={sp.code} value={sp.code}>{sp.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Fiyat Alanı</Label>
                        <select
                          value={formData.primarySatisSourceField}
                          onChange={(e) => setFormData({ ...formData, primarySatisSourceField: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="alis">Alış</option>
                          <option value="satis">Satış</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Çarpan</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          className="h-9 text-sm"
                          value={formData.primarySatisMultiplier}
                          onChange={(e) => setFormData({ ...formData, primarySatisMultiplier: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Ekleme</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-sm"
                          value={formData.primarySatisAddition}
                          onChange={(e) => setFormData({ ...formData, primarySatisAddition: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fallback Table */}
                <div className="border rounded-lg p-4 bg-orange-50/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">Yedek Kaynak</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Alış Kaynak Kodu</Label>
                        <select
                          value={formData.fallbackAlisSourceCode}
                          onChange={(e) => setFormData({ ...formData, fallbackAlisSourceCode: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="">Seçin...</option>
                          {fallbackSourcePrices.map((sp) => (
                            <option key={sp.code} value={sp.code}>{sp.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Fiyat Alanı</Label>
                        <select
                          value={formData.fallbackAlisSourceField}
                          onChange={(e) => setFormData({ ...formData, fallbackAlisSourceField: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="alis">Alış</option>
                          <option value="satis">Satış</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Çarpan</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          className="h-9 text-sm"
                          value={formData.fallbackAlisMultiplier}
                          onChange={(e) => setFormData({ ...formData, fallbackAlisMultiplier: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Ekleme</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-sm"
                          value={formData.fallbackAlisAddition}
                          onChange={(e) => setFormData({ ...formData, fallbackAlisAddition: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Satış Kaynak Kodu</Label>
                        <select
                          value={formData.fallbackSatisSourceCode}
                          onChange={(e) => setFormData({ ...formData, fallbackSatisSourceCode: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="">Seçin...</option>
                          {fallbackSourcePrices.map((sp) => (
                            <option key={sp.code} value={sp.code}>{sp.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Fiyat Alanı</Label>
                        <select
                          value={formData.fallbackSatisSourceField}
                          onChange={(e) => setFormData({ ...formData, fallbackSatisSourceField: e.target.value })}
                          className="w-full h-9 px-2 text-sm border rounded-md"
                        >
                          <option value="alis">Alış</option>
                          <option value="satis">Satış</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Çarpan</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          className="h-9 text-sm"
                          value={formData.fallbackSatisMultiplier}
                          onChange={(e) => setFormData({ ...formData, fallbackSatisMultiplier: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Ekleme</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-sm"
                          value={formData.fallbackSatisAddition}
                          onChange={(e) => setFormData({ ...formData, fallbackSatisAddition: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCode ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Price List */}
      <Card>
        <CardHeader>
          <CardTitle>Fiyat Listesi ({groupedPrices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {groupedPrices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz fiyat eklenmemiş</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groupedPrices.map((gp) => gp.code)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {groupedPrices.map((gp) => {
                    const cached = cachedPrices.find(cp => cp.code === gp.code);
                    return (
                      <SortablePriceRow
                        key={gp.code}
                        gp={gp}
                        cached={cached}
                        expandedItems={expandedItems}
                        toggleExpanded={toggleExpanded}
                        toggleVisibility={toggleVisibility}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Source Prices - Collapsible */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowSourcePrices(!showSourcePrices)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Kaynak Fiyatları</CardTitle>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">VPS: {primarySourcePrices.length} • Yedek: {fallbackSourcePrices.length}</span>
              {showSourcePrices ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </CardHeader>
        {showSourcePrices && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VPS Source Prices */}
              <div className="border rounded-lg p-4 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">VPS Kaynak Fiyatları ({primarySourcePrices.length})</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm max-h-64 overflow-y-auto">
                  {primarySourcePrices.map((sp) => (
                    <div key={sp.code} className="p-2 bg-white rounded border">
                      <p className="font-medium truncate text-blue-900">{sp.code}</p>
                      <p className="text-blue-600 text-xs truncate">{sp.name}</p>
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="text-green-600">A: {sp.alis.toLocaleString('tr-TR')}</span>
                        <span className="mx-1">|</span>
                        <span className="text-red-600">S: {sp.satis.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fallback Source Prices */}
              <div className="border rounded-lg p-4 bg-orange-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Yedek Kaynak Fiyatları ({fallbackSourcePrices.length})</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm max-h-64 overflow-y-auto">
                  {fallbackSourcePrices.map((sp) => (
                    <div key={sp.code} className="p-2 bg-white rounded border">
                      <p className="font-medium truncate text-orange-900">{sp.code}</p>
                      <p className="text-orange-600 text-xs truncate">{sp.name}</p>
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="text-green-600">A: {sp.alis.toLocaleString('tr-TR')}</span>
                        <span className="mx-1">|</span>
                        <span className="text-red-600">S: {sp.satis.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
