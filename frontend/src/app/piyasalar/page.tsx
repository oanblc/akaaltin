"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TrendingUp, TrendingDown, Minus, Star, Search, RefreshCw, Minimize, Monitor, X, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { useWebSocket, Price } from '@/hooks/useWebSocket';
import { formatPrice, formatPercent, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Flash animation row component (same as homepage PriceTable)
function PiyasalarPriceRow({
  price,
  prevPrice,
  index,
  isFavorite,
  onToggleFavorite,
  onClick
}: {
  price: Price;
  prevPrice?: Price;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (code: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPrice && (prevPrice.satis !== price.satis || prevPrice.alis !== price.alis)) {
      const priceChange = price.satis - prevPrice.satis;
      setFlashType(priceChange >= 0 ? 'up' : 'down');
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
      onClick={onClick}
      className={cn(
        "border-b border-gray-100 hover:bg-amber-50 transition-colors cursor-pointer",
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
        flashType === 'up' && "animate-price-flash-up",
        flashType === 'down' && "animate-price-flash-down"
      )}
    >
      <td className="py-4 px-4">
        <DirectionIcon className={cn("h-4 w-4", directionColor)} />
      </td>
      <td className="py-4 px-4">
        <span className="font-medium text-gray-900">{price.name}</span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-semibold text-lg text-gray-900 tabular-nums">
          {formatPrice(price.alis)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-semibold text-lg text-gray-900 tabular-nums">
          {formatPrice(price.satis)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium tabular-nums",
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
      <td className="py-4 px-4 text-center">
        <button
          onClick={(e) => onToggleFavorite(price.code, e)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Star className={cn(
            "h-4 w-4",
            isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-300"
          )} />
        </button>
      </td>
    </tr>
  );
}

// Flash animation mobile card component
function PiyasalarPriceCard({
  price,
  prevPrice,
  isFavorite,
  onToggleFavorite,
  onClick
}: {
  price: Price;
  prevPrice?: Price;
  isFavorite: boolean;
  onToggleFavorite: (code: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevPrice && (prevPrice.satis !== price.satis || prevPrice.alis !== price.alis)) {
      const priceChange = price.satis - prevPrice.satis;
      setFlashType(priceChange >= 0 ? 'up' : 'down');
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
    <div
      className={cn(
        "p-4 hover:bg-amber-50 cursor-pointer transition-colors",
        flashType === 'up' && "animate-price-flash-up",
        flashType === 'down' && "animate-price-flash-down"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DirectionIcon className={cn("h-4 w-4", directionColor)} />
          <span className="font-medium text-gray-900">{price.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            directionColor,
            directionBg
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
          <button
            onClick={(e) => onToggleFavorite(price.code, e)}
            className="p-1"
          >
            <Star className={cn(
              "h-4 w-4",
              isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-300"
            )} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-gray-500 block">Alış</span>
          <span className="font-semibold text-gray-900">{formatPrice(price.alis)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Satış</span>
          <span className="font-semibold text-gray-900">{formatPrice(price.satis)}</span>
        </div>
      </div>
    </div>
  );
}

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

// Price Detail Modal Component
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
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

export default function PiyasalarPage() {
  const { prices, connected, lastUpdate, reconnect } = useWebSocket();
  const prevPricesRef = useRef<Map<string, Price>>(new Map());
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTVMode, setIsTVMode] = useState(false);
  const [selectedPriceCode, setSelectedPriceCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(code)) {
      newFavorites.delete(code);
    } else {
      newFavorites.add(code);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const handlePriceClick = useCallback((code: string) => {
    setSelectedPriceCode(code);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPriceCode(null);
  }, []);

  // Track previous prices for flash animation
  useEffect(() => {
    if (prices.length > 0) {
      const timer = setTimeout(() => {
        const newMap = new Map<string, Price>();
        prices.forEach(p => newMap.set(p.code, p));
        prevPricesRef.current = newMap;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [prices]);

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.name.toLowerCase().includes(search.toLowerCase()) ||
                          price.code.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = filter === 'all' || favorites.has(price.code);
    return matchesSearch && matchesFavorite;
  });

  // Fullscreen API
  const enterFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setIsTVMode(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      // Fallback: just enable TV mode without fullscreen
      setIsTVMode(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      setIsTVMode(false);
    } catch (err) {
      console.error('Exit fullscreen error:', err);
      setIsTVMode(false);
    }
  };

  const toggleTVMode = () => {
    if (isTVMode) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setIsTVMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ESC key to exit TV mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTVMode && !document.fullscreenElement) {
        setIsTVMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTVMode]);

  // TV Mode Component
  if (isTVMode) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-white flex flex-col"
      >
        {/* TV Mode Header */}
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Canlı Piyasa</h1>
              <span className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
                {connected ? 'Canlı' : 'Bağlantı Kesildi'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <span className="text-gray-500 text-sm">
                  Son Güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                </span>
              )}
              <button
                onClick={toggleTVMode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Minimize className="h-5 w-5" />
                <span className="hidden sm:inline">Cik</span>
              </button>
            </div>
          </div>
        </div>

        {/* TV Mode Price Table */}
        <div className="flex-1 overflow-hidden p-4">
          <TVPriceTable prices={filteredPrices} />
        </div>

        {/* TV Mode Footer */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Fiyatlar bilgilendirme amaçlıdır</span>
            <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    );
  }

  // Normal Mode
  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Canlı Piyasa Verileri</h1>
              <p className="text-gray-500 text-sm mt-1">Altın fiyatları anlık güncelleniyor</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
                {connected ? 'Canlı' : 'Bağlantı kesildi'}
              </span>
              {lastUpdate && (
                <span className="text-sm text-gray-500">
                  {lastUpdate.toLocaleTimeString('tr-TR')}
                </span>
              )}
              {!connected && (
                <Button variant="outline" size="sm" onClick={reconnect}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Yeniden Bağlan
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Fiyat ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                >
                  Tümü ({prices.length})
                </Button>
                <Button
                  variant={filter === 'favorites' ? 'default' : 'outline'}
                  onClick={() => setFilter('favorites')}
                  className={filter === 'favorites' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Favoriler ({favorites.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleTVMode}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">TV Modu</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Price Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm w-10"></th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Ürün</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm">Alış</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm">Satış</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm">Değişim</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((price, index) => (
                    <PiyasalarPriceRow
                      key={price.code}
                      price={price}
                      prevPrice={prevPricesRef.current.get(price.code)}
                      index={index}
                      isFavorite={favorites.has(price.code)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handlePriceClick(price.code)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredPrices.map((price) => (
                <PiyasalarPriceCard
                  key={price.code}
                  price={price}
                  prevPrice={prevPricesRef.current.get(price.code)}
                  isFavorite={favorites.has(price.code)}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => handlePriceClick(price.code)}
                />
              ))}
            </div>

            {filteredPrices.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {search ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz fiyat verisi yok.'}
              </div>
            )}
          </div>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Fiyatlar bilgilendirme amaçlıdır. İşlem yapmadan önce mağazamızı arayınız.
          </p>
        </div>
      </main>

      <Footer />

      {/* Price Detail Modal */}
      {selectedPriceCode && (
        <PriceDetailModal
          code={selectedPriceCode}
          prices={prices}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// TV Mode Price Table Component - Auto-sizing
function TVPriceTable({ prices }: { prices: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const calculateFontSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const priceCount = prices.length;

      if (priceCount === 0) return;

      // Calculate row height based on available space
      // Header takes ~60px, each row needs padding
      const headerHeight = 60;
      const availableHeight = containerHeight - headerHeight;
      const rowHeight = Math.floor(availableHeight / priceCount);

      // Calculate font size based on row height (font should be ~40% of row height)
      const calculatedFontSize = Math.floor(rowHeight * 0.35);

      // Clamp between min and max sizes
      const minFontSize = 12;
      const maxFontSize = 48;
      const finalFontSize = Math.max(minFontSize, Math.min(maxFontSize, calculatedFontSize));

      setFontSize(finalFontSize);
    };

    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [prices.length]);

  const rowHeight = Math.max(40, fontSize * 2.5);

  return (
    <div ref={containerRef} className="h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div
        className="flex-shrink-0 grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200"
        style={{ fontSize: Math.max(12, fontSize * 0.7) }}
      >
        <div className="col-span-1 text-gray-500 font-semibold"></div>
        <div className="col-span-4 text-gray-500 font-semibold">ÜRÜN</div>
        <div className="col-span-3 text-right text-gray-500 font-semibold">ALIŞ</div>
        <div className="col-span-3 text-right text-gray-500 font-semibold">SATIŞ</div>
        <div className="col-span-1 text-right text-gray-500 font-semibold">%</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-hidden bg-white">
        {prices.map((price, index) => {
          const DirectionIcon = price.direction === 'up'
            ? TrendingUp
            : price.direction === 'down'
              ? TrendingDown
              : Minus;

          const directionColor = price.direction === 'up'
            ? 'text-green-600'
            : price.direction === 'down'
              ? 'text-red-600'
              : 'text-gray-400';

          const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

          return (
            <div
              key={price.code}
              className={cn(
                "grid grid-cols-12 gap-2 px-4 items-center border-b border-gray-100",
                rowBg
              )}
              style={{
                height: rowHeight,
                fontSize
              }}
            >
              <div className="col-span-1 flex items-center">
                <DirectionIcon
                  className={cn("flex-shrink-0", directionColor)}
                  style={{ width: fontSize * 1.2, height: fontSize * 1.2 }}
                />
              </div>
              <div className="col-span-4 font-semibold text-gray-900 truncate">
                {price.name}
              </div>
              <div className="col-span-3 text-right font-bold text-gray-900 tabular-nums">
                {formatPrice(price.alis)}
              </div>
              <div className="col-span-3 text-right font-bold text-gray-900 tabular-nums">
                {formatPrice(price.satis)}
              </div>
              <div className={cn("col-span-1 text-right font-semibold tabular-nums", directionColor)}>
                {price.farkOran > 0 ? '+' : ''}{price.farkOran.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {prices.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Fiyat verisi bekleniyor...
        </div>
      )}
    </div>
  );
}
