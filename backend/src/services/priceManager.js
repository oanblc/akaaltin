const prisma = require('../lib/prisma');
const primaryPriceService = require('./primaryPriceService');
const fallbackPriceService = require('./fallbackPriceService');
const alertService = require('./alertService');

class PriceManager {
  constructor() {
    this.io = null;
    this.currentPrices = [];
    this.sourcePrices = { primary: {}, fallback: {} };
    this.activeSource = 'primary';
    this.autoFallback = true;
    this.fallbackTimeout = 3600; // 1 saat (saniye)
    this.lastPrimaryUpdate = null;
    this.lastFallbackUpdate = null;
    this.checkInterval = null;
    this.fallbackFetchInterval = null;
    this.isInitialized = false;
    this.manualOverride = false; // Manuel kaynak değişikliği yapıldı mı?
  }

  setSocketIO(io) {
    this.io = io;
  }

  async initialize() {
    // Veritabanından konfigürasyonu yükle
    await this.loadConfig();

    // ÖNCELİKLE veritabanından cache'li fiyatları yükle (her zaman gösterilecek)
    await this.loadCachedPrices();

    // Veritabanından kaynak fiyatları da yükle
    await this.loadSourcePricesFromDB();

    this.isInitialized = true;

    // Ana kaynağı başlat (API polling)
    primaryPriceService.onPriceUpdate((prices) => {
      this.handlePrimaryPrices(prices);
    });

    primaryPriceService.onError((error) => {
      console.error('Primary source error:', error);
      this.updateSourceStatus('primary', 'error');
    });

    primaryPriceService.connect();

    // Yedek kaynağı da HER ZAMAN çek (her 30 saniye)
    this.startFallbackPolling();

    // Fallback kontrolü (her 10 saniye)
    this.startFallbackCheck();

    console.log('Price Manager initialized');
  }

  async loadConfig() {
    try {
      let config = await prisma.priceSourceConfig.findFirst();

      if (!config) {
        config = await prisma.priceSourceConfig.create({
          data: {
            activeSource: 'primary',
            autoFallback: true,
            fallbackTimeout: 3600 // 1 saat
          }
        });
      }

      this.activeSource = config.activeSource;
      this.autoFallback = config.autoFallback;
      this.fallbackTimeout = config.fallbackTimeout;
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async loadCachedPrices() {
    try {
      const cached = await prisma.cachedPrice.findMany({
        orderBy: { code: 'asc' }
      });

      if (cached.length > 0) {
        this.currentPrices = cached;
        console.log(`Loaded ${cached.length} cached prices from database`);
      }
    } catch (error) {
      console.error('Error loading cached prices:', error);
    }
  }

  async loadSourcePricesFromDB() {
    try {
      // Primary source fiyatlarını yükle
      const primaryPrices = await prisma.sourcePrice.findMany({
        where: { source: 'primary' }
      });

      primaryPrices.forEach(p => {
        this.sourcePrices.primary[p.code] = {
          name: p.name,
          alis: p.alis,
          satis: p.satis,
          high: p.high,
          low: p.low
        };
      });

      // Fallback source fiyatlarını yükle
      const fallbackPrices = await prisma.sourcePrice.findMany({
        where: { source: 'fallback' }
      });

      fallbackPrices.forEach(p => {
        this.sourcePrices.fallback[p.code] = {
          name: p.name,
          alis: p.alis,
          satis: p.satis,
          high: p.high,
          low: p.low
        };
      });

      console.log(`Loaded source prices from DB - Primary: ${primaryPrices.length}, Fallback: ${fallbackPrices.length}`);
    } catch (error) {
      console.error('Error loading source prices from DB:', error);
    }
  }

  async handlePrimaryPrices(prices) {
    this.lastPrimaryUpdate = new Date();
    this.sourcePrices.primary = { ...this.sourcePrices.primary, ...prices };
    this.updateSourceStatus('primary', 'active');

    // Primary fiyatları HER ZAMAN veritabanına kaydet
    await this.saveSourcePrices(prices, 'primary');

    // Eğer aktif kaynak primary ise fiyatları hesapla ve yayınla
    if (this.activeSource === 'primary') {
      await this.processAndBroadcastPrices('primary');
    }
  }

  async handleFallbackPrices(prices) {
    this.lastFallbackUpdate = new Date();
    this.sourcePrices.fallback = { ...this.sourcePrices.fallback, ...prices };
    this.updateSourceStatus('fallback', 'active');

    // Fallback fiyatları HER ZAMAN veritabanına kaydet
    await this.saveSourcePrices(prices, 'fallback');

    // Eğer aktif kaynak fallback ise fiyatları hesapla ve yayınla
    if (this.activeSource === 'fallback') {
      await this.processAndBroadcastPrices('fallback');
    }
  }

  startFallbackPolling() {
    const fetchFallback = async () => {
      try {
        const prices = await fallbackPriceService.fetchPrices();
        if (prices && Object.keys(prices).length > 0) {
          await this.handleFallbackPrices(prices);
        }
      } catch (error) {
        console.error('Fallback fetch error:', error);
        this.updateSourceStatus('fallback', 'error');
      }
    };

    // İlk çekimi yap
    fetchFallback();

    // Her 30 saniyede bir yedek kaynaktan çek
    this.fallbackFetchInterval = setInterval(fetchFallback, 30000);
  }

  startFallbackCheck() {
    this.checkInterval = setInterval(async () => {
      // autoFallback kapalı veya manuel override varsa otomatik geçiş yapma
      if (!this.autoFallback || this.manualOverride) return;

      const now = new Date();
      const timeoutMs = this.fallbackTimeout * 1000;

      // Primary kaynak timeout olduysa fallback'e geç
      if (this.activeSource === 'primary' && this.lastPrimaryUpdate) {
        const timeSinceUpdate = now - this.lastPrimaryUpdate;

        if (timeSinceUpdate > timeoutMs) {
          console.log('Primary source timeout, switching to fallback');
          this.manualOverride = false; // Otomatik geçiş, override'ı kaldır
          await this.switchSource('fallback');
        }
      }

      // Fallback'teyiz ama primary geri geldiyse primary'e dön
      if (this.activeSource === 'fallback' && this.lastPrimaryUpdate) {
        const timeSinceUpdate = now - this.lastPrimaryUpdate;

        if (timeSinceUpdate < timeoutMs) {
          console.log('Primary source recovered, switching back');
          this.manualOverride = false; // Otomatik geçiş, override'ı kaldır
          await this.switchSource('primary');
        }
      }
    }, 10000);
  }

  async switchSource(source) {
    this.activeSource = source;

    try {
      await prisma.priceSourceConfig.updateMany({
        data: { activeSource: source }
      });
    } catch (error) {
      console.error('Error updating source config:', error);
    }

    // Yeni kaynaktan fiyatları işle
    await this.processAndBroadcastPrices(source);
  }

  async updateSourceStatus(source, status) {
    try {
      const updateData = source === 'primary'
        ? { primaryStatus: status, lastPrimaryPing: new Date() }
        : { fallbackStatus: status, lastFallbackPing: new Date() };

      await prisma.priceSourceConfig.updateMany({ data: updateData });
    } catch (error) {
      console.error('Error updating source status:', error);
    }
  }

  async processAndBroadcastPrices(source) {
    try {
      const sourcePrices = this.sourcePrices[source];

      // Kaynak fiyat yoksa, mevcut fiyatları koru ve çık
      if (!sourcePrices || Object.keys(sourcePrices).length === 0) {
        console.log(`No ${source} prices available, keeping existing prices`);
        // Mevcut fiyatları yine de yayınla (varsa)
        if (this.io && this.currentPrices.length > 0) {
          this.io.emit('prices', this.currentPrices);
        }
        return;
      }

      // Aktif kaynağa göre priceTable'ı belirle
      const priceTable = source; // 'primary' veya 'fallback'

      // İlgili priceTable'dan custom fiyatları al
      const customPrices = await prisma.customPrice.findMany({
        where: {
          isVisible: true,
          priceTable: priceTable
        },
        orderBy: { order: 'asc' }
      });

      // Eğer custom price tanımlı değilse mevcut fiyatları koru
      if (customPrices.length === 0) {
        console.log(`No custom prices defined for ${source}, keeping existing prices`);
        if (this.io && this.currentPrices.length > 0) {
          this.io.emit('prices', this.currentPrices);
        }
        return;
      }

      const calculatedPrices = [];

      for (const cp of customPrices) {
        // Kaynak fiyatlardan alış ve satış için ilgili fiyatları bul
        const alisSource = sourcePrices[cp.alisSourceCode];
        const satisSource = sourcePrices[cp.satisSourceCode];

        // KAYNAK FİYAT YOKSA, MEVCUT DEĞERİ KORU
        if (!alisSource && !satisSource) {
          const existingPrice = this.currentPrices.find(p => p.code === cp.code);
          if (existingPrice) {
            calculatedPrices.push(existingPrice);
          }
          continue;
        }

        // Alış hesapla - sourceField'a göre kaynaktan doğru fiyatı al
        const alisSourceField = cp.alisSourceField || 'alis';
        const alisBase = alisSource
          ? (alisSourceField === 'satis'
              ? (alisSource.satis || alisSource.ask || 0)
              : (alisSource.alis || alisSource.bid || 0))
          : 0;

        // Satış hesapla - sourceField'a göre kaynaktan doğru fiyatı al
        const satisSourceField = cp.satisSourceField || 'satis';
        const satisBase = satisSource
          ? (satisSourceField === 'alis'
              ? (satisSource.alis || satisSource.bid || 0)
              : (satisSource.satis || satisSource.ask || 0))
          : 0;

        const alis = alisBase * cp.alisMultiplier + cp.alisAddition;
        const satis = satisBase * cp.satisMultiplier + cp.satisAddition;

        // Önceki fiyatı bul (direction için)
        const prevPrice = this.currentPrices.find(p => p.code === cp.code);
        const prevSatis = prevPrice?.satis || satis;

        // Fark: satis - alis (spread)
        const fark = satis - alis;
        // Yüzde: satış fiyatının alış fiyatına oranı ((satis - alis) / alis * 100)
        const farkOran = alis > 0 ? ((satis - alis) / alis) * 100 : 0;

        // Direction: önceki satış fiyatına göre
        let direction = 'same';
        const satisChange = satis - prevSatis;
        if (satisChange > 0.01) direction = 'up';
        else if (satisChange < -0.01) direction = 'down';

        calculatedPrices.push({
          code: cp.code,
          name: cp.name,
          alis: Number(alis.toFixed(cp.decimals)),
          satis: Number(satis.toFixed(cp.decimals)),
          fark: Number(fark.toFixed(cp.decimals)),
          farkOran: Number(farkOran.toFixed(2)),
          direction,
          category: cp.category
        });
      }

      // Sadece yeni hesaplanmış fiyatlar varsa güncelle
      if (calculatedPrices.length > 0) {
        this.currentPrices = calculatedPrices;

        // Veritabanına kaydet
        await this.saveCachedPrices(calculatedPrices);

        // Socket.io ile yayınla
        if (this.io) {
          this.io.emit('prices', calculatedPrices);
        }
      }
    } catch (error) {
      console.error('Error processing prices:', error);
      // Hata durumunda bile mevcut fiyatları yayınla
      if (this.io && this.currentPrices.length > 0) {
        this.io.emit('prices', this.currentPrices);
      }
    }
  }

  async saveSourcePrices(prices, source) {
    try {
      for (const [code, price] of Object.entries(prices)) {
        await prisma.sourcePrice.upsert({
          where: { code_source: { code, source } },
          create: {
            code,
            name: price.name || code,
            alis: price.alis || price.bid || 0,
            satis: price.satis || price.ask || 0,
            high: price.high,
            low: price.low,
            change: price.change,
            changeRate: price.changeRate,
            source,
            timestamp: new Date()
          },
          update: {
            name: price.name || code,
            alis: price.alis || price.bid || 0,
            satis: price.satis || price.ask || 0,
            high: price.high,
            low: price.low,
            change: price.change,
            changeRate: price.changeRate,
            timestamp: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error saving source prices:', error);
    }
  }

  async saveCachedPrices(prices) {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const price of prices) {
        // Önce mevcut kaydı kontrol et
        const existing = await prisma.cachedPrice.findUnique({
          where: { code: price.code }
        });

        // Alış için daily high/low
        let dailyHighAlis = price.alis;
        let dailyLowAlis = price.alis;
        let dailyHighAlisTime = now;
        let dailyLowAlisTime = now;

        // Satış için daily high/low
        let dailyHighSatis = price.satis;
        let dailyLowSatis = price.satis;
        let dailyHighSatisTime = now;
        let dailyLowSatisTime = now;

        let lastResetDate = todayStart;

        if (existing) {
          // Gece yarısı kontrolü - yeni gün mü?
          const existingResetDate = existing.lastResetDate ? new Date(existing.lastResetDate) : null;
          const isNewDay = !existingResetDate || existingResetDate < todayStart;

          if (!isNewDay) {
            // Aynı gün - karşılaştır ve güncelle

            // Alış için
            dailyHighAlis = existing.dailyHighAlis || price.alis;
            dailyLowAlis = existing.dailyLowAlis || price.alis;
            dailyHighAlisTime = existing.dailyHighAlisTime || now;
            dailyLowAlisTime = existing.dailyLowAlisTime || now;

            if (price.alis > dailyHighAlis) {
              dailyHighAlis = price.alis;
              dailyHighAlisTime = now;
            }
            if (price.alis < dailyLowAlis) {
              dailyLowAlis = price.alis;
              dailyLowAlisTime = now;
            }

            // Satış için
            dailyHighSatis = existing.dailyHighSatis || price.satis;
            dailyLowSatis = existing.dailyLowSatis || price.satis;
            dailyHighSatisTime = existing.dailyHighSatisTime || now;
            dailyLowSatisTime = existing.dailyLowSatisTime || now;

            if (price.satis > dailyHighSatis) {
              dailyHighSatis = price.satis;
              dailyHighSatisTime = now;
            }
            if (price.satis < dailyLowSatis) {
              dailyLowSatis = price.satis;
              dailyLowSatisTime = now;
            }
          }
        }

        await prisma.cachedPrice.upsert({
          where: { code: price.code },
          create: {
            code: price.code,
            name: price.name,
            alis: price.alis,
            satis: price.satis,
            fark: price.fark,
            farkOran: price.farkOran,
            direction: price.direction,
            timestamp: now,
            // Alış high/low
            dailyHighAlis,
            dailyLowAlis,
            dailyHighAlisTime,
            dailyLowAlisTime,
            // Satış high/low
            dailyHighSatis,
            dailyLowSatis,
            dailyHighSatisTime,
            dailyLowSatisTime,
            // Geriye uyumluluk için eski alanlar
            dailyHigh: dailyHighSatis,
            dailyLow: dailyLowSatis,
            dailyHighTime: dailyHighSatisTime,
            dailyLowTime: dailyLowSatisTime,
            lastResetDate
          },
          update: {
            name: price.name,
            alis: price.alis,
            satis: price.satis,
            fark: price.fark,
            farkOran: price.farkOran,
            direction: price.direction,
            timestamp: now,
            // Alış high/low
            dailyHighAlis,
            dailyLowAlis,
            dailyHighAlisTime,
            dailyLowAlisTime,
            // Satış high/low
            dailyHighSatis,
            dailyLowSatis,
            dailyHighSatisTime,
            dailyLowSatisTime,
            // Geriye uyumluluk için eski alanlar
            dailyHigh: dailyHighSatis,
            dailyLow: dailyLowSatis,
            dailyHighTime: dailyHighSatisTime,
            dailyLowTime: dailyLowSatisTime,
            lastResetDate
          }
        });
      }

      // Fiyat alarmlarini kontrol et
      await alertService.checkAlerts(prices, this.io);
    } catch (error) {
      console.error('Error saving cached prices:', error);
    }
  }

  getCurrentPrices() {
    return this.currentPrices;
  }

  getSourcePrices(source = 'primary') {
    return this.sourcePrices[source] || {};
  }

  getStatus() {
    return {
      activeSource: this.activeSource,
      autoFallback: this.autoFallback,
      fallbackTimeout: this.fallbackTimeout,
      lastPrimaryUpdate: this.lastPrimaryUpdate,
      lastFallbackUpdate: this.lastFallbackUpdate,
      primaryConnected: primaryPriceService.isConnected(),
      priceCount: this.currentPrices.length,
      manualOverride: this.manualOverride
    };
  }

  async setActiveSource(source) {
    this.manualOverride = true; // Manuel değişiklik yapıldı
    console.log(`Manual source change to ${source}, auto-switch disabled until timeout`);
    await this.switchSource(source);
  }

  async setAutoFallback(enabled) {
    this.autoFallback = enabled;
    // Auto fallback açıldığında manual override'ı sıfırla
    if (enabled) {
      this.manualOverride = false;
      console.log('Auto fallback enabled, manual override cleared');
    }
    try {
      await prisma.priceSourceConfig.updateMany({
        data: { autoFallback: enabled }
      });
    } catch (error) {
      console.error('Error updating auto fallback:', error);
    }
  }

  // Manuel override'ı sıfırla (otomatik geçişi tekrar aktif et)
  resetManualOverride() {
    this.manualOverride = false;
    console.log('Manual override reset, auto-switch re-enabled');
  }

  async setFallbackTimeout(seconds) {
    this.fallbackTimeout = seconds;
    try {
      await prisma.priceSourceConfig.updateMany({
        data: { fallbackTimeout: seconds }
      });
    } catch (error) {
      console.error('Error updating fallback timeout:', error);
    }
  }

  // Custom fiyat eklendiginde/guncellendiginde fiyatlari yeniden hesapla ve yayinla
  async refreshPrices() {
    console.log('Refreshing prices after custom price change...');
    await this.processAndBroadcastPrices(this.activeSource);
  }

  stop() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.fallbackFetchInterval) clearInterval(this.fallbackFetchInterval);
    primaryPriceService.disconnect();
  }
}

module.exports = new PriceManager();
