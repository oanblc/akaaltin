"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Gift, Sparkles, Star, Crown, Percent, Award, ChevronRight, Loader2,
  ArrowLeft, Check, Smartphone, QrCode, ShoppingBag, Users, Wallet
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
}

const iconMap: Record<string, React.ElementType> = {
  Gift,
  Sparkles,
  Star,
  Crown,
  Percent,
  Award,
  Check,
  Smartphone,
  QrCode,
  ShoppingBag,
  Users,
  Wallet
};

const badgeColorMap: Record<string, string> = {
  gold: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  red: 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
};

export default function KampanyaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/api/campaigns/slug/${params.slug}`);
        setCampaign(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Kampanya bulunamadı');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCampaign();
    }
  }, [params.slug]);

  const getIcon = (iconName: string | null | undefined) => {
    if (!iconName) return Gift;
    return iconMap[iconName] || Gift;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Kampanya bulunamadı'}
            </h1>
            <p className="text-gray-500 mb-6">
              Aradığınız kampanya mevcut değil veya kaldırılmış olabilir.
            </p>
            <Link href="/kampanyalar">
              <Button variant="gold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kampanyalara Dön
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = getIcon(campaign.icon);
  const badgeClasses = badgeColorMap[campaign.badgeColor || 'gold'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
          </div>

          {/* Background Image */}
          {campaign.coverImage && (
            <div className="absolute inset-0">
              <img
                src={campaign.coverImage}
                alt={campaign.title}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-gray-900" />
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <Link
              href="/kampanyalar"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Kampanyalar
            </Link>

            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gold/20 rounded-2xl">
                  <IconComponent className="h-10 w-10 text-gold" />
                </div>
                {campaign.badgeText && (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${badgeClasses}`}>
                    {campaign.badgeText}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {campaign.title}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {campaign.description}
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        {campaign.steps && campaign.steps.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Nasıl Çalışır?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Sadece birkaç adımda avantajlardan yararlanmaya başlayın
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {campaign.steps.map((step, index) => {
                  const StepIcon = getIcon(step.icon);
                  return (
                    <div key={index} className="relative">
                      {/* Connection Line */}
                      {index < campaign.steps.length - 1 && (
                        <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gold/30" />
                      )}

                      <div className="relative bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="relative inline-flex">
                          <div className="p-4 bg-gold/10 rounded-xl mb-4">
                            <StepIcon className="h-8 w-8 text-gold-dark" />
                          </div>
                          <span className="absolute -top-2 -right-2 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {campaign.features && campaign.features.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Avantajlar
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Bu kampanya ile elde edeceğiniz tüm avantajlar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {campaign.features.map((feature, index) => {
                  const FeatureIcon = getIcon(feature.icon);
                  return (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 rounded-xl shrink-0">
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Content Section */}
        {campaign.content && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-gold-dark prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-gold-dark via-gold to-gold-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Hemen Başlayın!
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Aka Kuyumculuk mobil uygulamasını indirerek bu kampanyadan yararlanmaya başlayabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="gap-2 bg-white text-gray-900 hover:bg-gray-100">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button size="lg" variant="secondary" className="gap-2 bg-white text-gray-900 hover:bg-gray-100">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Google Play
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
