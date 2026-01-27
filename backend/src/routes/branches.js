const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all branches (public)
router.get('/', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: [
        { isMain: 'desc' },
        { order: 'asc' }
      ]
    });
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Şubeler alınamadı' });
  }
});

// Get all branches (admin)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: [
        { isMain: 'desc' },
        { order: 'asc' }
      ]
    });
    res.json(branches);
  } catch (error) {
    console.error('Get admin branches error:', error);
    res.status(500).json({ error: 'Şubeler alınamadı' });
  }
});

// Create branch (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address, phone, phone2, email, mapUrl, mapEmbed, workingHours, isMain, order } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Şube adı ve adres gerekli' });
    }

    // If this is main branch, remove main from others
    if (isMain) {
      await prisma.branch.updateMany({
        data: { isMain: false }
      });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        phone,
        phone2,
        email,
        mapUrl,
        mapEmbed,
        workingHours,
        isMain: isMain || false,
        order: order || 0
      }
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Şube oluşturulamadı' });
  }
});

// Update branch (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;

    // If setting as main, remove main from others
    if (updateData.isMain) {
      await prisma.branch.updateMany({
        where: { id: { not: parseInt(id) } },
        data: { isMain: false }
      });
    }

    const branch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(branch);
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ error: 'Şube güncellenemedi' });
  }
});

// Delete branch (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.branch.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Şube silindi' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Şube silinemedi' });
  }
});

module.exports = router;
