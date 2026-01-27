const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all categories (public - mobile app needs this)
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;

    const where = activeOnly === 'true' ? { isActive: true } : {};

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Kategoriler alınamadı' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Kategori alınamadı' });
  }
});

// Create category (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, tlPerPoint, isActive = true } = req.body;

    if (!name || !tlPerPoint) {
      return res.status(400).json({ error: 'Kategori adı ve puan oranı gerekli' });
    }

    if (tlPerPoint <= 0) {
      return res.status(400).json({ error: 'Puan oranı 0\'dan büyük olmalı' });
    }

    // Check if category name already exists
    const existing = await prisma.category.findUnique({
      where: { name }
    });

    if (existing) {
      return res.status(400).json({ error: 'Bu isimde bir kategori zaten var' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        tlPerPoint: parseFloat(tlPerPoint),
        isActive
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Kategori oluşturulamadı' });
  }
});

// Update category (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tlPerPoint, isActive } = req.body;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // If name is changing, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Bu isimde bir kategori zaten var' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (tlPerPoint !== undefined) updateData.tlPerPoint = parseFloat(tlPerPoint);
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Kategori güncellenemedi' });
  }
});

// Delete category (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { qrCodes: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // Check if category is used by any QR codes
    if (existing._count.qrCodes > 0) {
      return res.status(400).json({
        error: `Bu kategori ${existing._count.qrCodes} QR kodda kullanılıyor. Önce pasife alabilirsiniz.`
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Kategori silinemedi' });
  }
});

// Seed default category (can be called once on setup)
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.category.findFirst();

    if (existing) {
      return res.json({ message: 'Kategoriler zaten mevcut', categories: await prisma.category.findMany() });
    }

    const defaultCategory = await prisma.category.create({
      data: {
        name: 'Genel',
        tlPerPoint: 1000, // 1000 TL = 1 puan
        isActive: true
      }
    });

    res.status(201).json({ message: 'Varsayılan kategori oluşturuldu', category: defaultCategory });
  } catch (error) {
    console.error('Seed category error:', error);
    res.status(500).json({ error: 'Kategori oluşturulamadı' });
  }
});

module.exports = router;
