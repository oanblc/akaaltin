"use client";

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWebSocket, Price } from '@/hooks/useWebSocket';
import { formatPrice, formatPercent, cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

export default function TVPage() {
  const { prices, lastUpdate } = useWebSocket();
  const { settings } = useSettings();
  const [showControls, setShowControls] = useState(true);
  const prevPricesRef = useRef<Map<string, Price>>(new Map());
  const [flashingCodes, setFlashingCodes] = useState<Set<string>>(new Set());

  // Hide controls after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Track price changes for flash animation
  useEffect(() => {
    const newFlashing = new Set<string>();

    prices.forEach(price => {
      const prev = prevPricesRef.current.get(price.code);
      if (prev && (prev.alis !== price.alis || prev.satis !== price.satis)) {
        newFlashing.add(price.code);
      }
    });

    if (newFlashing.size > 0) {
      setFlashingCodes(newFlashing);
      setTimeout(() => setFlashingCodes(new Set()), 800);
    }

    const newMap = new Map<string, Price>();
    prices.forEach(p => newMap.set(p.code, p));
    prevPricesRef.current = newMap;
  }, [prices]);

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-4 md:p-8"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Header */}
      <div className="text-center mb-8">
        {settings.logoBase64 ? (
          <img
            src={settings.logoBase64}
            alt={settings.siteName}
            className="h-16 mx-auto mb-4"
          />
        ) : (
          <h1 className="text-3xl font-bold text-gold mb-2">{settings.siteName}</h1>
        )}
        {lastUpdate && (
          <p className="text-gray-400">
            Son Güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </p>
        )}
      </div>

      {/* Price Table */}
      <div className="max-w-5xl mx-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gold border-b-2 border-gold/30 text-lg">
              <th className="py-4 text-left">Ürün</th>
              <th className="py-4 text-right">Alış</th>
              <th className="py-4 text-right">Satış</th>
              <th className="py-4 text-right">Değişim</th>
            </tr>
          </thead>
          <tbody className="text-xl">
            {prices.map((price) => {
              const DirectionIcon = price.direction === 'up'
                ? TrendingUp
                : price.direction === 'down'
                  ? TrendingDown
                  : Minus;

              const directionColor = price.direction === 'up'
                ? 'text-green-400'
                : price.direction === 'down'
                  ? 'text-red-400'
                  : 'text-gray-400';

              return (
                <tr
                  key={price.code}
                  className={cn(
                    "border-b border-gray-800",
                    flashingCodes.has(price.code) && "animate-price-flash bg-gold/20"
                  )}
                >
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <DirectionIcon className={cn("h-6 w-6", directionColor)} />
                      <span className="font-semibold">{price.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-right font-bold text-2xl">
                    {formatPrice(price.alis)}
                  </td>
                  <td className="py-5 text-right font-bold text-2xl">
                    {formatPrice(price.satis)}
                  </td>
                  <td className={cn("py-5 text-right font-semibold", directionColor)}>
                    {formatPercent(price.farkOran)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controls (hidden after 5 seconds) */}
      {showControls && (
        <div className="fixed bottom-4 right-4 flex gap-2 animate-slide-up">
          <a
            href="/"
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Ana Sayfa
          </a>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-gold-dark transition-colors text-sm font-medium"
          >
            Tam Ekran
          </button>
        </div>
      )}
    </div>
  );
}
