const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Default legal pages
const defaultPages = {
  'gizlilik-politikasi': {
    title: 'Gizlilik Politikası',
    content: '# Gizlilik Politikası\n\nBu sayfa henüz düzenlenmedi.'
  },
  'kullanim-kosullari': {
    title: 'Kullanım Koşulları',
    content: '# Kullanım Koşulları\n\nBu sayfa henüz düzenlenmedi.'
  },
  'cerez-politikasi': {
    title: 'Çerez Politikası',
    content: '# Çerez Politikası\n\nBu sayfa henüz düzenlenmedi.'
  },
  'kvkk': {
    title: 'KVKK Aydınlatma Metni',
    content: '# KVKK Aydınlatma Metni\n\nBu sayfa henüz düzenlenmedi.'
  }
};

// Get legal page by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let page = await prisma.legalPage.findUnique({
      where: { slug }
    });

    if (!page && defaultPages[slug]) {
      // Create default page
      page = await prisma.legalPage.create({
        data: {
          slug,
          title: defaultPages[slug].title,
          content: defaultPages[slug].content
        }
      });
    }

    if (!page) {
      return res.status(404).json({ error: 'Sayfa bulunamadı' });
    }

    res.json(page);
  } catch (error) {
    console.error('Get legal page error:', error);
    res.status(500).json({ error: 'Sayfa alınamadı' });
  }
});

// Get all legal pages (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pages = await prisma.legalPage.findMany({
      orderBy: { slug: 'asc' }
    });
    res.json(pages);
  } catch (error) {
    console.error('Get legal pages error:', error);
    res.status(500).json({ error: 'Sayfalar alınamadı' });
  }
});

// Update legal page (admin)
router.post('/:slug', authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Başlık ve içerik gerekli' });
    }

    const page = await prisma.legalPage.upsert({
      where: { slug },
      create: { slug, title, content },
      update: { title, content }
    });

    res.json(page);
  } catch (error) {
    console.error('Update legal page error:', error);
    res.status(500).json({ error: 'Sayfa güncellenemedi' });
  }
});

module.exports = router;
