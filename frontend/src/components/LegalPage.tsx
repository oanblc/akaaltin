"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, FileText } from 'lucide-react';
import api from '@/lib/api';

interface LegalPageProps {
  slug: string;
  fallbackTitle: string;
}

interface LegalContent {
  title: string;
  content: string;
  updatedAt: string;
}

export default function LegalPage({ slug, fallbackTitle }: LegalPageProps) {
  const [content, setContent] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get(`/api/legal/${slug}`);
        setContent(response.data);
      } catch (err: any) {
        setError('Sayfa içeriği yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {content?.title || fallbackTitle}
              </h1>
              {content?.updatedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Son güncelleme: {new Date(content.updatedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
              {error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : content ? (
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-h1:text-2xl prose-h1:mb-6
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-a:text-amber-600 prose-a:no-underline prose-a:hover:underline
                    prose-strong:text-gray-900
                    prose-ul:my-4
                    prose-li:text-gray-600
                    prose-li:marker:text-amber-500"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
