"use client";

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const quickLinks = [
  { href: '/piyasalar', label: 'Canlı Fiyatlar' },
  { href: '/kampanyalar', label: 'Kampanyalar' },
  { href: '/articles', label: 'Makaleler' },
  { href: '/iletisim', label: 'İletişim' },
];

const legalLinks = [
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { href: '/kullanim-kosullari', label: 'Kullanım Koşulları' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
];

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            {settings.logoBase64 ? (
              <img
                src={settings.logoBase64}
                alt={settings.siteName}
                style={{ height: settings.logoHeight || '40px', width: 'auto' }}
                className="object-contain mb-4"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900 mb-4">{settings.siteName}</h3>
            )}
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
              25 yılı aşkın tecrübemizle güvenilir altın alış satış hizmeti sunuyoruz.
              Güncel fiyatlar ve şeffaf işlemlerle yanınızdayız.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-600 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.socialWhatsapp && (
                <a
                  href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-600 hover:border-green-600 transition-all duration-200"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Sayfalar
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Yasal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                    <Phone className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">Telefon</span>
                    <span className="text-sm">{settings.contactPhone}</span>
                    {settings.contactPhone2 && (
                      <span className="text-sm block">{settings.contactPhone2}</span>
                    )}
                  </div>
                </a>
              </li>

              {settings.contactEmail && (
                <li>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                      <Mail className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">E-posta</span>
                      <span className="text-sm">{settings.contactEmail}</span>
                    </div>
                  </a>
                </li>
              )}

              <li className="flex items-start gap-3 text-gray-600">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 block">Adres</span>
                  <span className="text-sm">{settings.contactAddress}</span>
                </div>
              </li>

              <li className="flex items-start gap-3 text-gray-600">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 block">Çalışma Saatleri</span>
                  <span className="text-sm">{settings.workingHours}</span>
                  {settings.workingHoursNote && (
                    <span className="text-xs text-gray-500 block mt-1">{settings.workingHoursNote}</span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings.siteName}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Fiyatlar canlı güncelleniyor
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
