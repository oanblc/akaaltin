"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Wifi, WifiOff, X, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { useWebSocket, Price } from '@/hooks/useWebSocket';
import { formatPrice, formatPercent, cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface PriceDetail {
  code: string;
  name: string;
  alis: number;
  satis: number;
  fark: number;
  farkOran: number;
  direction: 'up' | 'down' | 'same';
  // Alış high/low
  dailyHighAlis: number | null;
  dailyLowAlis: number | null;
  dailyHighAlisTime: string | null;
  dailyLowAlisTime: string | null;
  // Satış high/low
  dailyHighSatis: number | null;
  dailyLowSatis: number | null;
  dailyHighSatisTime: string | null;
  dailyLowSatisTime: string | null;
  timestamp: string;
}

interface PriceRowProps {
  price: Price;
  prevPrice?: Price;
  onClick?: () => void;
}

function PriceRow({ price, prevPrice, onClick }: PriceRowProps) {
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPrice && (prevPrice.satis !== price.satis || prevPrice.alis !== price.alis)) {
      // Fiyat değişim yönünü belirle
      const priceChange = price.satis - prevPrice.satis;
      if (priceChange > 0) {
        setFlashType('up');
      } else if (priceChange < 0) {
        setFlashType('down');
      } else {
        setFlashType('up'); // Alış değişti ama satış aynı
      }
      const timer = setTimeout(() => setFlashType(null), 800);
      return () => clearTimeout(timer);
    }
  }, [price.alis, price.satis, prevPrice]);

  const DirectionIcon = price.direction === 'up'
    ? TrendingUp
    : price.direction === 'down'
      ? TrendingDown
      : Minus;

  const directionColor = price.direction === 'up'
    ? 'text-green-600'
    : price.direction === 'down'
      ? 'text-red-600'
      : 'text-gray-500';

  const directionBg = price.direction === 'up'
    ? 'bg-green-50'
    : price.direction === 'down'
      ? 'bg-red-50'
      : 'bg-gray-50';

  return (
    <tr
      className={cn(
        "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
        flashType === 'up' && "animate-price-flash-up",
        flashType === 'down' && "animate-price-flash-down"
      )}
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <DirectionIcon className={cn("h-4 w-4", directionColor)} />
          <span className="font-medium text-gray-900">{price.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right font-semibold text-lg text-gray-900">
        {formatPrice(price.alis)}
      </td>
      <td className="py-3 px-4 text-right font-semibold text-lg text-gray-900">
        {formatPrice(price.satis)}
      </td>
      <td className="py-3 px-4 text-right">
        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
          directionColor,
          directionBg
        )}>
          {price.direction === 'up' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : price.direction === 'down' ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
          {formatPercent(price.farkOran)}
        </div>
      </td>
    </tr>
  );
}

// Mobile card view
function PriceCard({ price, prevPrice, onClick }: PriceRowProps) {
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPrice && (prevPrice.satis !== price.satis || prevPrice.alis !== price.alis)) {
      const priceChange = price.satis - prevPrice.satis;
      if (priceChange > 0) {
        setFlashType('up');
      } else if (priceChange < 0) {
        setFlashType('down');
      } else {
        setFlashType('up');
      }
      const timer = setTimeout(() => setFlashType(null), 800);
      return () => clearTimeout(timer);
    }
  }, [price.alis, price.satis, prevPrice]);

  const directionColor = price.direction === 'up'
    ? 'text-green-600 bg-green-50'
    : price.direction === 'down'
      ? 'text-red-600 bg-red-50'
      : 'text-gray-500 bg-gray-50';

  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-4 shadow-sm cursor-pointer hover:border-amber-300 transition-all",
        flashType === 'up' && "animate-price-flash-up border-green-300",
        flashType === 'down' && "animate-price-flash-down border-red-300"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-semibold text-gray-900">{price.name}</span>
        <span className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          directionColor
        )}>
          {price.direction === 'up' ? (
            <ArrowUp className="h-3 w-3" />
          ) : price.direction === 'down' ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {formatPercent(price.farkOran)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-gray-500">Alış</span>
          <p className="font-bold text-lg text-gray-900">{formatPrice(price.alis)}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Satış</span>
          <p className="font-bold text-lg text-gray-900">{formatPrice(price.satis)}</p>
        </div>
      </div>
    </div>
  );
}

// Price Detail Modal
function PriceDetailModal({
  code,
  prices,
  onClose
}: {
  code: string;
  prices: Price[];
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<PriceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get live price from prices array
  const livePrice = prices.find(p => p.code === code);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/prices/detail/${code}`);
        if (!response.ok) throw new Error('Fiyat detayı alınamadı');
        const data = await response.json();
        setDetail(data);
      } catch (err) {
        console.error('Error fetching price detail:', err);
        setError('Fiyat detayı alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [code]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Use live price for current values
  const displayPrice = livePrice || detail;
  const direction = displayPrice?.direction || 'same';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with prominent close button */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-200 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Fiyat Detayı</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
              >
                Kapat
              </button>
            </div>
          ) : displayPrice ? (
            <div className="space-y-6">
              {/* Price Name */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{displayPrice.name}</h3>
                <p className="text-sm text-gray-500">{code}</p>
              </div>

              {/* Current Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Alış</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice.alis)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Satış</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice.satis)}</p>
                </div>
              </div>

              {/* Change Badge */}
              <div className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                direction === 'up' && "bg-green-50",
                direction === 'down' && "bg-red-50",
                direction === 'same' && "bg-gray-50"
              )}>
                {direction === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : direction === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-500" />
                )}
                <span className={cn(
                  "font-semibold",
                  direction === 'up' && "text-green-600",
                  direction === 'down' && "text-red-600",
                  direction === 'same' && "text-gray-500"
                )}>
                  {direction === 'up' ? '+' : ''}{displayPrice.farkOran.toFixed(2)}%
                </span>
                <span className="text-gray-500 text-sm">
                  ({direction === 'up' ? '+' : ''}{formatPrice(displayPrice.fark)})
                </span>
              </div>

              {/* Daily High/Low - Alış */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-center font-semibold text-blue-900 mb-4">
                  Alış - Günün En Yüksek / En Düşük
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Daily High Alis */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">En Yüksek</p>
                    <p className="text-lg font-bold text-green-600">
                      {detail?.dailyHighAlis ? formatPrice(detail.dailyHighAlis) : '-'}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(detail?.dailyHighAlisTime || null)}
                    </p>
                  </div>

                  {/* Daily Low Alis */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">En Düşük</p>
                    <p className="text-lg font-bold text-red-600">
                      {detail?.dailyLowAlis ? formatPrice(detail.dailyLowAlis) : '-'}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(detail?.dailyLowAlisTime || null)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily High/Low - Satış */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="text-center font-semibold text-amber-900 mb-4">
                  Satış - Günün En Yüksek / En Düşük
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Daily High Satis */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">En Yüksek</p>
                    <p className="text-lg font-bold text-green-600">
                      {detail?.dailyHighSatis ? formatPrice(detail.dailyHighSatis) : '-'}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(detail?.dailyHighSatisTime || null)}
                    </p>
                  </div>

                  {/* Daily Low Satis */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">En Düşük</p>
                    <p className="text-lg font-bold text-red-600">
                      {detail?.dailyLowSatis ? formatPrice(detail.dailyLowSatis) : '-'}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(detail?.dailyLowSatisTime || null)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <p className="text-xs text-gray-400 text-center">
                Günlük en yüksek ve en düşük değerler gece 00:00'da sıfırlanır.
              </p>

              {/* Close Button at Bottom */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
              >
                Kapat
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PriceTable() {
  const { prices, connected, lastUpdate, error, reconnect } = useWebSocket();
  const prevPricesRef = useRef<Map<string, Price>>(new Map());
  const [selectedPriceCode, setSelectedPriceCode] = useState<string | null>(null);

  useEffect(() => {
    if (prices.length > 0) {
      const newMap = new Map<string, Price>();
      prices.forEach(p => newMap.set(p.code, p));
      prevPricesRef.current = newMap;
    }
  }, [prices]);

  const handlePriceClick = useCallback((code: string) => {
    setSelectedPriceCode(code);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPriceCode(null);
  }, []);

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gold px-4 py-3 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">Güncel Fiyatlar</h2>
          {!connected && (
            <button
              onClick={reconnect}
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
            >
              <WifiOff className="h-4 w-4 text-danger" />
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky-header">
              <tr className="text-left text-sm text-gray-600">
                <th className="py-3 px-4 font-semibold">Ürün</th>
                <th className="py-3 px-4 text-right font-semibold">Alış</th>
                <th className="py-3 px-4 text-right font-semibold">Satış</th>
                <th className="py-3 px-4 text-right font-semibold">Değişim</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <PriceRow
                  key={price.code}
                  price={price}
                  prevPrice={prevPricesRef.current.get(price.code)}
                  onClick={() => handlePriceClick(price.code)}
                />
              ))}
              {prices.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Fiyatlar yükleniyor...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {prices.map((price) => (
            <PriceCard
              key={price.code}
              price={price}
              prevPrice={prevPricesRef.current.get(price.code)}
              onClick={() => handlePriceClick(price.code)}
            />
          ))}
          {prices.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Fiyatlar yükleniyor...
            </div>
          )}
        </div>
      </Card>

      {/* Price Detail Modal */}
      {selectedPriceCode && (
        <PriceDetailModal
          code={selectedPriceCode}
          prices={prices}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
