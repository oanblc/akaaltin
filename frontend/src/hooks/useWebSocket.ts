"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

export interface Price {
  code: string;
  name: string;
  alis: number;
  satis: number;
  fark: number;
  farkOran: number;
  direction: 'up' | 'down' | 'same';
  category?: string;
}

interface UseWebSocketReturn {
  prices: Price[];
  connected: boolean;
  lastUpdate: Date | null;
  error: string | null;
  reconnect: () => void;
}

const CACHE_KEY = 'cachedPrices';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedPrices(): Price[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { prices, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return prices;
  } catch {
    return null;
  }
}

function setCachedPrices(prices: Price[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      prices,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
}

export function useWebSocket(): UseWebSocketReturn {
  const [prices, setPrices] = useState<Price[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5001';

    if (socketRef.current?.connected) {
      return;
    }

    socketRef.current = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('prices', (newPrices: Price[]) => {
      setPrices(newPrices);
      setLastUpdate(new Date());
      setCachedPrices(newPrices);
    });

    socketRef.current.on('connect_error', (err) => {
      setError(`Bağlantı hatası: ${err.message}`);
      setConnected(false);
    });
  }, []);

  const fetchCachedPrices = useCallback(async () => {
    // First try localStorage
    const cached = getCachedPrices();
    if (cached && cached.length > 0) {
      setPrices(cached);
    }

    // Then fetch from API
    try {
      const response = await api.get('/api/prices/cached');
      if (response.data.prices && response.data.prices.length > 0) {
        setPrices(response.data.prices);
        setCachedPrices(response.data.prices);
        setLastUpdate(new Date(response.data.timestamp));
      }
    } catch (err) {
      console.error('Error fetching cached prices:', err);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 1000);
  }, [connect]);

  useEffect(() => {
    fetchCachedPrices();
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, fetchCachedPrices]);

  return {
    prices,
    connected,
    lastUpdate,
    error,
    reconnect,
  };
}
