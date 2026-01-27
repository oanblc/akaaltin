const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const priceManager = require('../services/priceManager');

const router = express.Router();

// Get all custom prices (public)
router.get('/', async (req, res) => {
  try {
    const { priceTable } = req.query;
    const where = priceTable ? { priceTable } : {};

    const prices = await prisma.customPrice.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    res.json(prices);
  } catch (error) {
    console.error('Get custom prices error:', error);
    res.status(500).json({ error: 'Custom fiyatlar alınamadı' });
  }
});

// Get visible custom prices only (public)
router.get('/visible', async (req, res) => {
  try {
    const { priceTable } = req.query;
    const where = { isVisible: true };
    if (priceTable) where.priceTable = priceTable;

    const prices = await prisma.customPrice.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    res.json(prices);
  } catch (error) {
    console.error('Get visible custom prices error:', error);
    res.status(500).json({ error: 'Custom fiyatlar alınamadı' });
  }
});

// Get grouped custom prices (primary and fallback pairs)
router.get('/grouped', async (req, res) => {
  try {
    const prices = await prisma.customPrice.findMany({
      orderBy: [{ code: 'asc' }, { priceTable: 'asc' }]
    });

    // Group by code
    const grouped = {};
    prices.forEach(price => {
      if (!grouped[price.code]) {
        grouped[price.code] = {
          code: price.code,
          name: price.name,
          category: price.category,
          order: price.order,
          decimals: price.decimals,
          isVisible: price.isVisible,
          primary: null,
          fallback: null
        };
      }
      grouped[price.code][price.priceTable] = price;
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Get grouped custom prices error:', error);
    res.status(500).json({ error: 'Custom fiyatlar alınamadı' });
  }
});

// Create custom price pair (admin) - creates both primary and fallback entries
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, code, category, order, decimals, isVisible,
      // Primary table config
      primaryAlisSourceCode, primaryAlisSourceField, primaryAlisMultiplier, primaryAlisAddition,
      primarySatisSourceCode, primarySatisSourceField, primarySatisMultiplier, primarySatisAddition,
      // Fallback table config
      fallbackAlisSourceCode, fallbackAlisSourceField, fallbackAlisMultiplier, fallbackAlisAddition,
      fallbackSatisSourceCode, fallbackSatisSourceField, fallbackSatisMultiplier, fallbackSatisAddition
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'İsim ve kod gerekli' });
    }

    // Check if code already exists
    const existingPrice = await prisma.customPrice.findFirst({
      where: { code }
    });

    if (existingPrice) {
      return res.status(400).json({ error: 'Bu kod zaten kullanılıyor' });
    }

    // Create primary table entry
    const primaryPrice = await prisma.customPrice.create({
      data: {
        name,
        code,
        category: category || 'altin',
        priceTable: 'primary',
        alisSourceCode: primaryAlisSourceCode || code,
        alisSourceField: primaryAlisSourceField || 'alis',
        alisMultiplier: primaryAlisMultiplier || 1.0,
        alisAddition: primaryAlisAddition || 0,
        satisSourceCode: primarySatisSourceCode || code,
        satisSourceField: primarySatisSourceField || 'satis',
        satisMultiplier: primarySatisMultiplier || 1.0,
        satisAddition: primarySatisAddition || 0,
        order: order || 0,
        decimals: decimals || 2,
        isVisible: isVisible !== false
      }
    });

    // Create fallback table entry
    const fallbackPrice = await prisma.customPrice.create({
      data: {
        name,
        code,
        category: category || 'altin',
        priceTable: 'fallback',
        alisSourceCode: fallbackAlisSourceCode || code,
        alisSourceField: fallbackAlisSourceField || 'alis',
        alisMultiplier: fallbackAlisMultiplier || 1.0,
        alisAddition: fallbackAlisAddition || 0,
        satisSourceCode: fallbackSatisSourceCode || code,
        satisSourceField: fallbackSatisSourceField || 'satis',
        satisMultiplier: fallbackSatisMultiplier || 1.0,
        satisAddition: fallbackSatisAddition || 0,
        order: order || 0,
        decimals: decimals || 2,
        isVisible: isVisible !== false
      }
    });

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.status(201).json({ primary: primaryPrice, fallback: fallbackPrice });
  } catch (error) {
    console.error('Create custom price error:', error);
    res.status(500).json({ error: 'Custom fiyat oluşturulamadı' });
  }
});

// Update single custom price entry (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.code; // code cannot be changed
    delete updateData.priceTable; // priceTable cannot be changed

    const price = await prisma.customPrice.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.json(price);
  } catch (error) {
    console.error('Update custom price error:', error);
    res.status(500).json({ error: 'Custom fiyat güncellenemedi' });
  }
});

// Update both primary and fallback entries for a code (admin)
router.put('/code/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const {
      name, category, order, decimals, isVisible,
      // Primary table config
      primaryAlisSourceCode, primaryAlisSourceField, primaryAlisMultiplier, primaryAlisAddition,
      primarySatisSourceCode, primarySatisSourceField, primarySatisMultiplier, primarySatisAddition,
      // Fallback table config
      fallbackAlisSourceCode, fallbackAlisSourceField, fallbackAlisMultiplier, fallbackAlisAddition,
      fallbackSatisSourceCode, fallbackSatisSourceField, fallbackSatisMultiplier, fallbackSatisAddition
    } = req.body;

    // Update primary entry
    const primaryPrice = await prisma.customPrice.update({
      where: { code_priceTable: { code, priceTable: 'primary' } },
      data: {
        name,
        category,
        order,
        decimals,
        isVisible,
        alisSourceCode: primaryAlisSourceCode,
        alisSourceField: primaryAlisSourceField,
        alisMultiplier: primaryAlisMultiplier,
        alisAddition: primaryAlisAddition,
        satisSourceCode: primarySatisSourceCode,
        satisSourceField: primarySatisSourceField,
        satisMultiplier: primarySatisMultiplier,
        satisAddition: primarySatisAddition
      }
    });

    // Update fallback entry
    const fallbackPrice = await prisma.customPrice.update({
      where: { code_priceTable: { code, priceTable: 'fallback' } },
      data: {
        name,
        category,
        order,
        decimals,
        isVisible,
        alisSourceCode: fallbackAlisSourceCode,
        alisSourceField: fallbackAlisSourceField,
        alisMultiplier: fallbackAlisMultiplier,
        alisAddition: fallbackAlisAddition,
        satisSourceCode: fallbackSatisSourceCode,
        satisSourceField: fallbackSatisSourceField,
        satisMultiplier: fallbackSatisMultiplier,
        satisAddition: fallbackSatisAddition
      }
    });

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.json({ primary: primaryPrice, fallback: fallbackPrice });
  } catch (error) {
    console.error('Update custom price by code error:', error);
    res.status(500).json({ error: 'Custom fiyat güncellenemedi' });
  }
});

// Update order (admin)
router.put('/order/bulk', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    for (const item of items) {
      // Update order for both tables
      await prisma.customPrice.updateMany({
        where: { code: item.code },
        data: { order: item.order }
      });
    }

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Sıralama güncellenemedi' });
  }
});

// Delete custom price pair by code (admin)
router.delete('/code/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;

    await prisma.customPrice.deleteMany({
      where: { code }
    });

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.json({ message: 'Custom fiyat silindi' });
  } catch (error) {
    console.error('Delete custom price error:', error);
    res.status(500).json({ error: 'Custom fiyat silinemedi' });
  }
});

// Delete single custom price entry by id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customPrice.delete({
      where: { id: parseInt(id) }
    });

    // Fiyatlari yeniden hesapla ve yayinla
    await priceManager.refreshPrices();

    res.json({ message: 'Custom fiyat silindi' });
  } catch (error) {
    console.error('Delete custom price error:', error);
    res.status(500).json({ error: 'Custom fiyat silinemedi' });
  }
});

module.exports = router;
