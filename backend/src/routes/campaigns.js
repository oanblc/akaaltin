const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all active campaigns (public)
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        icon: true,
        badgeText: true,
        badgeColor: true,
        buttonText: true,
        buttonLink: true,
        order: true
      }
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Kampanyalar alınamadı' });
  }
});

// Get all campaigns including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({ error: 'Kampanyalar alınamadı' });
  }
});

// Get single campaign by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { slug }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Kampanya bulunamadı' });
    }

    if (!campaign.isActive) {
      return res.status(404).json({ error: 'Bu kampanya şu anda aktif değil' });
    }

    // Parse JSON fields
    const result = {
      ...campaign,
      features: campaign.features ? JSON.parse(campaign.features) : [],
      steps: campaign.steps ? JSON.parse(campaign.steps) : []
    };

    res.json(result);
  } catch (error) {
    console.error('Get campaign by slug error:', error);
    res.status(500).json({ error: 'Kampanya alınamadı' });
  }
});

// Get single campaign by id (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Kampanya bulunamadı' });
    }

    // Parse JSON fields
    const result = {
      ...campaign,
      features: campaign.features ? JSON.parse(campaign.features) : [],
      steps: campaign.steps ? JSON.parse(campaign.steps) : []
    };

    res.json(result);
  } catch (error) {
    console.error('Get campaign by id error:', error);
    res.status(500).json({ error: 'Kampanya alınamadı' });
  }
});

// Create campaign (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title, slug, description, content, coverImage, icon,
      badgeText, badgeColor, features, steps, buttonText, buttonLink,
      order, isActive
    } = req.body;

    if (!title || !slug || !description) {
      return res.status(400).json({ error: 'Başlık, slug ve açıklama gerekli' });
    }

    // Check if slug exists
    const existing = await prisma.campaign.findUnique({
      where: { slug }
    });

    if (existing) {
      return res.status(400).json({ error: 'Bu slug zaten kullanılıyor' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug,
        description,
        content: content || '',
        coverImage,
        icon,
        badgeText,
        badgeColor,
        features: features ? JSON.stringify(features) : null,
        steps: steps ? JSON.stringify(steps) : null,
        buttonText,
        buttonLink,
        order: order || 0,
        isActive: isActive !== false
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Kampanya oluşturulamadı' });
  }
});

// Update campaign (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, slug, description, content, coverImage, icon,
      badgeText, badgeColor, features, steps, buttonText, buttonLink,
      order, isActive
    } = req.body;

    // Check if new slug conflicts with another campaign
    if (slug) {
      const existing = await prisma.campaign.findFirst({
        where: {
          slug,
          id: { not: parseInt(id) }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Bu slug başka bir kampanya tarafından kullanılıyor' });
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        description,
        content,
        coverImage,
        icon,
        badgeText,
        badgeColor,
        features: features !== undefined ? JSON.stringify(features) : undefined,
        steps: steps !== undefined ? JSON.stringify(steps) : undefined,
        buttonText,
        buttonLink,
        order,
        isActive
      }
    });

    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Kampanya güncellenemedi' });
  }
});

// Update campaign order (admin)
router.put('/order/bulk', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    for (const item of items) {
      await prisma.campaign.update({
        where: { id: item.id },
        data: { order: item.order }
      });
    }

    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Update campaign order error:', error);
    res.status(500).json({ error: 'Sıralama güncellenemedi' });
  }
});

// Toggle campaign active status (admin)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Kampanya bulunamadı' });
    }

    const updated = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: { isActive: !campaign.isActive }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle campaign error:', error);
    res.status(500).json({ error: 'Kampanya durumu değiştirilemedi' });
  }
});

// Delete campaign (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Kampanya silindi' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Kampanya silinemedi' });
  }
});

module.exports = router;
