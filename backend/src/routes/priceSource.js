const express = require('express');
const prisma = require('../lib/prisma');
const priceManager = require('../services/priceManager');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get price source status (public)
router.get('/status', async (req, res) => {
  try {
    const status = priceManager.getStatus();

    const config = await prisma.priceSourceConfig.findFirst();

    res.json({
      ...status,
      config: config || {
        activeSource: 'primary',
        autoFallback: true,
        fallbackTimeout: 60
      }
    });
  } catch (error) {
    console.error('Get price source status error:', error);
    res.status(500).json({ error: 'Durum alınamadı' });
  }
});

// Get config (admin)
router.get('/config', authMiddleware, async (req, res) => {
  try {
    let config = await prisma.priceSourceConfig.findFirst();

    if (!config) {
      config = await prisma.priceSourceConfig.create({
        data: {
          activeSource: 'primary',
          autoFallback: true,
          fallbackTimeout: 60
        }
      });
    }

    // PriceManager'dan manualOverride durumunu al
    const status = priceManager.getStatus();

    res.json({
      ...config,
      manualOverride: status.manualOverride
    });
  } catch (error) {
    console.error('Get price source config error:', error);
    res.status(500).json({ error: 'Konfigürasyon alınamadı' });
  }
});

// Update config (admin)
router.post('/config', authMiddleware, async (req, res) => {
  try {
    const { activeSource, autoFallback, fallbackTimeout } = req.body;

    // Update price manager
    if (activeSource) {
      await priceManager.setActiveSource(activeSource);
    }

    if (autoFallback !== undefined) {
      await priceManager.setAutoFallback(autoFallback);
    }

    if (fallbackTimeout !== undefined) {
      await priceManager.setFallbackTimeout(fallbackTimeout);
    }

    const config = await prisma.priceSourceConfig.findFirst();

    res.json({
      message: 'Konfigürasyon güncellendi',
      config
    });
  } catch (error) {
    console.error('Update price source config error:', error);
    res.status(500).json({ error: 'Konfigürasyon güncellenemedi' });
  }
});

// Switch source manually (admin)
router.post('/switch/:source', authMiddleware, async (req, res) => {
  try {
    const { source } = req.params;

    if (!['primary', 'fallback'].includes(source)) {
      return res.status(400).json({ error: 'Geçersiz kaynak' });
    }

    await priceManager.setActiveSource(source);

    res.json({
      message: `Kaynak ${source} olarak değiştirildi`,
      activeSource: source
    });
  } catch (error) {
    console.error('Switch source error:', error);
    res.status(500).json({ error: 'Kaynak değiştirilemedi' });
  }
});

// Toggle auto fallback (admin)
router.post('/auto-fallback/:enabled', authMiddleware, async (req, res) => {
  try {
    const enabled = req.params.enabled === 'true';

    await priceManager.setAutoFallback(enabled);

    res.json({
      message: `Otomatik fallback ${enabled ? 'aktif' : 'pasif'}`,
      autoFallback: enabled
    });
  } catch (error) {
    console.error('Toggle auto fallback error:', error);
    res.status(500).json({ error: 'Ayar değiştirilemedi' });
  }
});

// Reset manual override (admin) - Otomatik geçişi yeniden aktif et
router.post('/reset-override', authMiddleware, async (req, res) => {
  try {
    priceManager.resetManualOverride();

    res.json({
      message: 'Otomatik geçiş yeniden aktif edildi',
      manualOverride: false
    });
  } catch (error) {
    console.error('Reset override error:', error);
    res.status(500).json({ error: 'İşlem başarısız' });
  }
});

module.exports = router;
