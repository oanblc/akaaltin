const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all articles (public - only published)
router.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true
      }
    });
    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Makaleler alınamadı' });
  }
});

// Get all articles (admin - including unpublished)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    console.error('Get admin articles error:', error);
    res.status(500).json({ error: 'Makaleler alınamadı' });
  }
});

// Get single article by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug }
    });

    if (!article || !article.isPublished) {
      return res.status(404).json({ error: 'Makale bulunamadı' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Makale alınamadı' });
  }
});

// Get single article by id (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return res.status(404).json({ error: 'Makale bulunamadı' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Makale alınamadı' });
  }
});

// Create article (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, slug, content, excerpt, coverImage, isPublished } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Başlık, slug ve içerik gerekli' });
    }

    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({ error: 'Bu slug zaten kullanılıyor' });
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null
      }
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Makale oluşturulamadı' });
  }
});

// Update article (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;

    // Handle publish state change
    if (updateData.isPublished && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Makale güncellenemedi' });
  }
});

// Delete article (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Makale silindi' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Makale silinemedi' });
  }
});

module.exports = router;
