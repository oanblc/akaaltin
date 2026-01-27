"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, Star, Crown, Percent, Award, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  icon: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  Gift,
  Sparkles,
  Star,
  Crown,
  Percent,
  Award
};

const badgeColorMap: Record<string, string> = {
  gold: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  red: 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
};

export default function KampanyalarPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/api/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Gift;
    return iconMap[iconName] || Gift;
  };

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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Aka Kuyumculuk Avantajları
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Kampanyalar ve <span className="text-gold">Fırsatlar</span>
              </h1>
              <p className="text-lg text-gray-300">
                Size özel kampanyalarımızı keşfedin. Mobil uygulamamızla puan kazanın,
                avantajlı alışveriş yapın.
              </p>
            </div>
          </div>
        </section>

        {/* Campaigns Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-20">
                <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  Henüz aktif kampanya yok
                </h2>
                <p className="text-gray-500">
                  Yeni kampanyalarımız için takipte kalın!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((campaign) => {
                  const IconComponent = getIcon(campaign.icon);
                  const badgeClasses = badgeColorMap[campaign.badgeColor || 'gold'];

                  return (
                    <Card
                      key={campaign.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white"
                    >
                      {/* Image or Gradient Header */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        {campaign.coverImage ? (
                          <img
                            src={campaign.coverImage}
                            alt={campaign.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-6 bg-gold/20 rounded-full">
                              <IconComponent className="h-16 w-16 text-gold" />
                            </div>
                          </div>
                        )}

                        {/* Badge */}
                        {campaign.badgeText && (
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${badgeClasses}`}>
                            {campaign.badgeText}
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gold/10 rounded-xl shrink-0">
                            <IconComponent className="h-6 w-6 text-gold-dark" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gold-dark transition-colors">
                              {campaign.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {campaign.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          {campaign.buttonLink ? (
                            <a
                              href={campaign.buttonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full"
                            >
                              <Button variant="gold" className="w-full group/btn">
                                {campaign.buttonText || 'Detayli Bilgi'}
                                <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </a>
                          ) : (
                            <Link href={`/kampanyalar/${campaign.slug}`}>
                              <Button variant="gold" className="w-full group/btn">
                                {campaign.buttonText || 'Detayli Bilgi'}
                                <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-gold-dark via-gold to-gold-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Mobil Uygulamayı İndirin
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Aka Kuyumculuk mobil uygulaması ile alışverişlerinizden puan kazanın,
              özel kampanyalardan haberdar olun.
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
