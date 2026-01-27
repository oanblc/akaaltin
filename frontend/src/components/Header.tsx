"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Clock, ChevronRight, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/piyasalar', label: 'Piyasalar' },
  { href: '/kampanyalar', label: 'Kampanyalar' },
  { href: '/articles', label: 'Makaleler' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white'
      }`}>
        {/* Top bar with contact info */}
        <div className="hidden lg:block border-b border-gray-100">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-6">
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{settings.contactPhone}</span>
                </a>
                {settings.contactPhone2 && (
                  <a
                    href={`tel:${settings.contactPhone2}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{settings.contactPhone2}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{settings.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-amber-50/70">
          <div className="container mx-auto px-4 flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center relative z-10">
              {settings.logoBase64 ? (
                <img
                  src={settings.logoBase64}
                  alt={settings.siteName}
                  style={{ height: settings.logoHeight || '48px', width: 'auto' }}
                  className="object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {settings.siteName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {settings.socialWhatsapp && (
                <a
                  href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden relative z-10 p-2 -mr-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-gray-900">Menü</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 text-base transition-colors ${
                    isActive
                      ? 'text-amber-600 bg-amber-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                  <ChevronRight className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu footer */}
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <a
                href={`tel:${settings.contactPhone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">{settings.contactPhone}</span>
              </a>
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-sm">{settings.workingHours}</span>
              </div>
            </div>

            {settings.socialWhatsapp && (
              <a
                href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp ile İletişim
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
