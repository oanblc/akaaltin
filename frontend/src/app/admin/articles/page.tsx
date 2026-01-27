"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    isPublished: false,
  });

  const fetchArticles = async () => {
    try {
      const response = await api.get('/api/articles/admin');
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      isPublished: false,
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      coverImage: article.coverImage || '',
      isPublished: article.isPublished,
    });
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await api.put(`/api/articles/${editingArticle.id}`, formData);
        toast({ title: 'Makale güncellendi' });
      } else {
        await api.post('/api/articles', formData);
        toast({ title: 'Makale eklendi' });
      }
      fetchArticles();
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
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/articles/${id}`);
      toast({ title: 'Makale silindi' });
      fetchArticles();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data?.error || 'Silme başarısız',
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      await api.put(`/api/articles/${article.id}`, {
        isPublished: !article.isPublished
      });
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Makaleler</h1>
          <p className="text-gray-500">Blog yazılarını yönetin</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Makale
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingArticle ? 'Makale Düzenle' : 'Yeni Makale'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingArticle ? formData.slug : generateSlug(e.target.value)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    disabled={!!editingArticle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Özet</Label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-3 border rounded-md min-h-[80px]"
                  placeholder="Kısa özet..."
                />
              </div>

              <div className="space-y-2">
                <Label>İçerik</Label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border rounded-md min-h-[200px]"
                  placeholder="Makale içeriği (Markdown desteklenir)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Kapak Görseli URL</Label>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <Label htmlFor="isPublished">Yayınla</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingArticle ? 'Güncelle' : 'Ekle'}
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
          <CardTitle>Makale Listesi ({articles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Henüz makale eklenmemiş</p>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-gray-500">/{article.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(article)}
                    >
                      {article.isPublished ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
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
