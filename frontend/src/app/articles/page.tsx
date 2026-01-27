"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/api/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Makaleler</h1>
            <p className="text-gray-600">Altın piyasası hakkında bilgiler</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Henüz makale yayınlanmamış.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {article.coverImage && (
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
