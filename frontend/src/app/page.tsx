"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceTable from '@/components/PriceTable';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Shield, Clock, Users, TrendingUp, ChevronRight,
  MapPin, Phone, Award, Zap, Lock, ArrowRight,
  CheckCircle2, Building2, Banknote
} from 'lucide-react';

export default function Home() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Clean & Professional */}
        <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left - Content */}
              <div className={`space-y-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-8 h-[2px] bg-amber-500" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Güvenilir Kuyumculuk
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Anlık Altın ve Döviz
                  <span className="block text-amber-600">Fiyatları</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  25 yıllık tecrübemizle Adana'nın güvenilir kuyumcusu.
                  Güncel piyasa fiyatları ve şeffaf işlemlerle hizmetinizdeyiz.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium h-12 px-6"
                    asChild
                  >
                    <Link href="/piyasalar">
                      Tüm Fiyatları Gör
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-6"
                    asChild
                  >
                    <Link href="/iletisim">
                      İletişime Geç
                    </Link>
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-8 pt-6 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">25+</div>
                    <div className="text-sm text-gray-500">Yıllık Tecrübe</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">10.000+</div>
                    <div className="text-sm text-gray-500">Müşteri</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">7/24</div>
                    <div className="text-sm text-gray-500">Fiyat Takibi</div>
                  </div>
                </div>
              </div>

              {/* Right - Price Table */}
              <div className={`${isVisible ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                      <h2 className="font-semibold text-gray-900">Canlı Piyasa Verileri</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Canlı
                    </div>
                  </div>
                  <div className="p-4">
                    <PriceTable />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Minimal */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                Neden Aka Kuyumculuk?
              </h2>
              <p className="text-gray-600">
                Güvenilir hizmet anlayışımızla fark yaratıyoruz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: 'Anlık Fiyat Takibi',
                  description: 'Piyasadaki tüm değişiklikleri saniye saniye takip edin'
                },
                {
                  icon: Shield,
                  title: 'Güvenli İşlem',
                  description: '25 yıllık tecrübe ve binlerce mutlu müşteri'
                },
                {
                  icon: Award,
                  title: 'Ayar Garantisi',
                  description: 'Tüm ürünlerde ayar garantisi ve sertifika'
                },
                {
                  icon: Lock,
                  title: 'Şeffaf Fiyat',
                  description: 'Gizli masraf yok, net ve açık fiyatlandırma'
                },
                {
                  icon: Zap,
                  title: 'Hızlı İşlem',
                  description: 'Alım satım işlemleriniz dakikalar içinde'
                },
                {
                  icon: Users,
                  title: 'Uzman Destek',
                  description: 'Profesyonel ekibimiz her zaman yanınızda'
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-12 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Award, value: '25+', label: 'Yıllık Deneyim' },
                { icon: Users, value: '10K+', label: 'Mutlu Müşteri' },
                { icon: Clock, value: '7/24', label: 'Fiyat Güncelleme' },
                { icon: Shield, value: '%100', label: 'Güvenilirlik' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Hizmetlerimiz
                </h2>
                <p className="text-gray-600">
                  Profesyonel kuyumculuk hizmetleri
                </p>
              </div>
              <Link
                href="/iletisim"
                className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                Tüm Hizmetler
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Banknote,
                  title: 'Altın Alım Satım',
                  description: 'Gram altın, çeyrek, yarım ve tam altın alım satım işlemleri',
                  features: ['Anlık piyasa fiyatı', 'Komisyonsuz işlem', 'Anında ödeme']
                },
                {
                  icon: TrendingUp,
                  title: 'Döviz İşlemleri',
                  description: 'USD, EUR ve diğer döviz alım satım hizmetleri',
                  features: ['Güncel kurlar', 'Rekabetçi fiyat', 'Hızlı işlem']
                },
                {
                  icon: Building2,
                  title: 'Değerleme Hizmeti',
                  description: 'Altın ve mücevher değerleme, ekspertiz hizmeti',
                  features: ['Ücretsiz değerleme', 'Uzman kadro', 'Sertifikalı rapor']
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App CTA - Simple */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                Mobil Uygulamamızı İndirin
              </h2>
              <p className="text-gray-600 mb-6">
                Fiyatları takip edin, puan kazanın ve özel kampanyalardan haberdar olun
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-70">İndir</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-70">İndir</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Clean */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left - Info */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Bize Ulaşın
                </h2>
                <p className="text-gray-600 mb-8">
                  Sorularınız için bizimle iletişime geçebilir veya mağazamızı ziyaret edebilirsiniz.
                </p>

                <div className="space-y-4">
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Telefon</div>
                      <div className="font-medium text-gray-900">{settings.contactPhone}</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Adres</div>
                      <div className="font-medium text-gray-900">{settings.contactAddress}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Çalışma Saatleri</div>
                      <div className="font-medium text-gray-900">{settings.workingHours}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    asChild
                  >
                    <Link href="/iletisim">
                      <MapPin className="mr-2 h-4 w-4" />
                      Yol Tarifi
                    </Link>
                  </Button>
                  {settings.socialWhatsapp && (
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right - Map */}
              <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3185.8661891805547!2d35.3195!3d36.9863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDU5JzEwLjciTiAzNcKwMTknMTAuMiJF!5e0!3m2!1str!2str!4v1600000000000!5m2!1str!2str"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
