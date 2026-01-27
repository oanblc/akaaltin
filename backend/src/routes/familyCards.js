const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all family cards (public)
router.get('/', async (req, res) => {
  try {
    const cards = await prisma.familyCard.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(cards);
  } catch (error) {
    console.error('Get family cards error:', error);
    res.status(500).json({ error: 'Aile kartları alınamadı' });
  }
});

// Get all family cards (admin)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const cards = await prisma.familyCard.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(cards);
  } catch (error) {
    console.error('Get admin family cards error:', error);
    res.status(500).json({ error: 'Aile kartları alınamadı' });
  }
});

// Create family card (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image, link, order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Başlık gerekli' });
    }

    const card = await prisma.familyCard.create({
      data: {
        title,
        subtitle,
        image,
        link,
        order: order || 0
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create family card error:', error);
    res.status(500).json({ error: 'Aile kartı oluşturulamadı' });
  }
});

// Update family card (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;

    const card = await prisma.familyCard.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(card);
  } catch (error) {
    console.error('Update family card error:', error);
    res.status(500).json({ error: 'Aile kartı güncellenemedi' });
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
      await prisma.familyCard.update({
        where: { id: item.id },
        data: { order: item.order }
      });
    }

    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Sıralama güncellenemedi' });
  }
});

// Delete family card (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.familyCard.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Aile kartı silindi' });
  } catch (error) {
    console.error('Delete family card error:', error);
    res.status(500).json({ error: 'Aile kartı silinemedi' });
  }
});

module.exports = router;
