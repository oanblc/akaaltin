const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get SEO settings (public)
router.get('/', async (req, res) => {
  try {
    let seo = await prisma.seo.findFirst();

    if (!seo) {
      seo = await prisma.seo.create({
        data: {
          siteTitle: 'Aka Kuyumculuk - Güncel Altın Fiyatları',
          siteDescription: 'Adana\'da güvenilir kuyumcu. Güncel altın, gümüş ve döviz fiyatları. Altın alış satış işlemleri.',
          siteKeywords: 'altın fiyatları, kuyumcu, adana kuyumcu, altın alış, altın satış, gram altın, çeyrek altın'
        }
      });
    }

    res.json(seo);
  } catch (error) {
    console.error('Get SEO error:', error);
    res.status(500).json({ error: 'SEO ayarları alınamadı' });
  }
});

// Update SEO settings (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.id;

    let seo = await prisma.seo.findFirst();

    if (seo) {
      seo = await prisma.seo.update({
        where: { id: seo.id },
        data: updateData
      });
    } else {
      seo = await prisma.seo.create({
        data: updateData
      });
    }

    res.json(seo);
  } catch (error) {
    console.error('Update SEO error:', error);
    res.status(500).json({ error: 'SEO ayarları güncellenemedi' });
  }
});

module.exports = router;
