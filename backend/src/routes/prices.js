const express = require('express');
const prisma = require('../lib/prisma');
const priceManager = require('../services/priceManager');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get cached prices (public)
router.get('/cached', async (req, res) => {
  try {
    // Önce memory'den dene
    let prices = priceManager.getCurrentPrices();

    // Memory'de yoksa database'den al
    if (!prices || prices.length === 0) {
      prices = await prisma.cachedPrice.findMany({
        orderBy: { code: 'asc' }
      });
    }

    res.json({
      prices,
      timestamp: new Date().toISOString(),
      source: priceManager.getStatus().activeSource
    });
  } catch (error) {
    console.error('Get cached prices error:', error);
    res.status(500).json({ error: 'Fiyatlar alınamadı' });
  }
});

// Get source prices (public)
router.get('/sources', async (req, res) => {
  try {
    const source = req.query.source || 'primary';
    const prices = await prisma.sourcePrice.findMany({
      where: { source },
      orderBy: { code: 'asc' }
    });

    res.json({
      prices,
      source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get source prices error:', error);
    res.status(500).json({ error: 'Kaynak fiyatları alınamadı' });
  }
});

// Get all source prices grouped
router.get('/sources/all', async (req, res) => {
  try {
    const primaryPrices = await prisma.sourcePrice.findMany({
      where: { source: 'primary' },
      orderBy: { code: 'asc' }
    });

    const fallbackPrices = await prisma.sourcePrice.findMany({
      where: { source: 'fallback' },
      orderBy: { code: 'asc' }
    });

    res.json({
      primary: primaryPrices,
      fallback: fallbackPrices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get all source prices error:', error);
    res.status(500).json({ error: 'Kaynak fiyatları alınamadı' });
  }
});

// Get price manager status
router.get('/status', (req, res) => {
  const status = priceManager.getStatus();
  res.json(status);
});

// Get price detail with daily high/low (public)
router.get('/detail/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const price = await prisma.cachedPrice.findUnique({
      where: { code }
    });

    if (!price) {
      return res.status(404).json({ error: 'Fiyat bulunamadı' });
    }

    res.json({
      code: price.code,
      name: price.name,
      alis: price.alis,
      satis: price.satis,
      fark: price.fark,
      farkOran: price.farkOran,
      direction: price.direction,
      // Alış high/low
      dailyHighAlis: price.dailyHighAlis,
      dailyLowAlis: price.dailyLowAlis,
      dailyHighAlisTime: price.dailyHighAlisTime,
      dailyLowAlisTime: price.dailyLowAlisTime,
      // Satış high/low
      dailyHighSatis: price.dailyHighSatis,
      dailyLowSatis: price.dailyLowSatis,
      dailyHighSatisTime: price.dailyHighSatisTime,
      dailyLowSatisTime: price.dailyLowSatisTime,
      // Geriye uyumluluk için eski alanlar
      dailyHigh: price.dailyHigh,
      dailyLow: price.dailyLow,
      dailyHighTime: price.dailyHighTime,
      dailyLowTime: price.dailyLowTime,
      timestamp: price.timestamp
    });
  } catch (error) {
    console.error('Get price detail error:', error);
    res.status(500).json({ error: 'Fiyat detayı alınamadı' });
  }
});

// Switch active source (admin)
router.post('/switch-source', authMiddleware, async (req, res) => {
  try {
    const { source } = req.body;

    if (!['primary', 'fallback'].includes(source)) {
      return res.status(400).json({ error: 'Geçersiz kaynak. primary veya fallback olmalı' });
    }

    await priceManager.setActiveSource(source);

    res.json({
      message: `Aktif kaynak ${source === 'primary' ? 'VPS' : 'Yedek'} olarak değiştirildi`,
      activeSource: source
    });
  } catch (error) {
    console.error('Switch source error:', error);
    res.status(500).json({ error: 'Kaynak değiştirilemedi' });
  }
});

// Set auto fallback (admin)
router.post('/auto-fallback', authMiddleware, async (req, res) => {
  try {
    const { enabled } = req.body;
    await priceManager.setAutoFallback(enabled);
    res.json({ message: `Otomatik fallback ${enabled ? 'açıldı' : 'kapatıldı'}` });
  } catch (error) {
    console.error('Set auto fallback error:', error);
    res.status(500).json({ error: 'Ayar değiştirilemedi' });
  }
});

module.exports = router;
