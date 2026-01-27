"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function IletisimPage() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">İletişim</h1>
            <p className="text-gray-600">Bizimle iletişime geçin</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gold/20 rounded-full">
                      <Phone className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
                      <a
                        href={`tel:${settings.contactPhone}`}
                        className="text-lg text-gold-dark hover:underline block"
                      >
                        {settings.contactPhone}
                      </a>
                      {settings.contactPhone2 && (
                        <a
                          href={`tel:${settings.contactPhone2}`}
                          className="text-lg text-gold-dark hover:underline block mt-1"
                        >
                          {settings.contactPhone2}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {settings.contactEmail && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gold/20 rounded-full">
                        <Mail className="h-6 w-6 text-gold-dark" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="text-lg text-gold-dark hover:underline"
                        >
                          {settings.contactEmail}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gold/20 rounded-full">
                      <MapPin className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
                      <p className="text-gray-600">{settings.contactAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gold/20 rounded-full">
                      <Clock className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Çalışma Saatleri</h3>
                      <p className="text-gray-600">{settings.workingHours}</p>
                      {settings.workingHoursNote && (
                        <p className="text-sm text-gray-500 mt-1">{settings.workingHoursNote}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {settings.socialWhatsapp && (
                <Button variant="whatsapp" className="w-full h-14 text-lg gap-3" asChild>
                  <a
                    href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-6 w-6" />
                    WhatsApp ile İletişim
                  </a>
                </Button>
              )}
            </div>

            {/* Map */}
            <Card className="overflow-hidden h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3185.8661891805547!2d35.3195!3d36.9863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDU5JzEwLjciTiAzNcKwMTknMTAuMiJF!5e0!3m2!1str!2str!4v1600000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
