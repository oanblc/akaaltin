const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Generate unique QR code
function generateQRCode() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `AKA-${timestamp}-${random}`.toUpperCase();
}

// Get point rate from settings
async function getPointRate() {
  const setting = await prisma.settings.findUnique({
    where: { key: 'pointRate' }
  });
  return setting ? parseFloat(setting.value) : 100; // Default: 100 TL = 1 puan
}

// Get all QR codes (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, isUsed, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } }
      ];
    }

    if (isUsed !== undefined) {
      where.isUsed = isUsed === 'true';
    }

    if (type) {
      where.type = type;
    }

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              tlPerPoint: true
            }
          }
        }
      }),
      prisma.qRCode.count({ where })
    ]);

    res.json({
      qrCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ error: 'QR kodlar alınamadı' });
  }
});

// Get QR code stats (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalQRCodes,
      usedQRCodes,
      unusedQRCodes,
      totalPoints,
      usedPoints
    ] = await Promise.all([
      prisma.qRCode.count(),
      prisma.qRCode.count({ where: { isUsed: true } }),
      prisma.qRCode.count({ where: { isUsed: false } }),
      prisma.qRCode.aggregate({ _sum: { points: true } }),
      prisma.qRCode.aggregate({
        where: { isUsed: true },
        _sum: { points: true }
      })
    ]);

    res.json({
      totalQRCodes,
      usedQRCodes,
      unusedQRCodes,
      totalPoints: totalPoints._sum.points || 0,
      usedPoints: usedPoints._sum.points || 0
    });
  } catch (error) {
    console.error('Get QR code stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// Get single QR code by code (public for scanning)
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            tlPerPoint: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı' });
    }

    // Check expiration
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: 'Bu QR kodun süresi dolmuş' });
    }

    if (qrCode.isUsed) {
      return res.status(400).json({ error: 'Bu QR kod zaten kullanılmış' });
    }

    res.json(qrCode);
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'QR kod alınamadı' });
  }
});

// Create EARN QR code (admin/cashier - customer scans to earn points)
// Supports both single category and multiple categories
router.post('/earn', authMiddleware, async (req, res) => {
  try {
    const { amount, description, createdBy, categoryId, categories } = req.body;

    let totalPoints = 0;
    let totalAmount = 0;
    let categoryBreakdown = [];
    let primaryCategoryId = null;

    // Multiple categories mode
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Get all category IDs
      const categoryIds = categories.map(c => parseInt(c.categoryId));

      // Fetch all categories at once
      const dbCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } }
      });

      const categoryMap = {};
      dbCategories.forEach(c => { categoryMap[c.id] = c; });

      // Validate and calculate points for each category
      for (const item of categories) {
        const catId = parseInt(item.categoryId);
        const catAmount = parseFloat(item.amount);

        if (!catAmount || catAmount <= 0) {
          continue; // Skip categories with 0 or invalid amount
        }

        const category = categoryMap[catId];
        if (!category) {
          return res.status(404).json({ error: `Kategori bulunamadı: ID ${catId}` });
        }

        if (!category.isActive) {
          return res.status(400).json({ error: `Bu kategori aktif değil: ${category.name}` });
        }

        const catPoints = Math.floor(catAmount / category.tlPerPoint);

        categoryBreakdown.push({
          categoryId: category.id,
          categoryName: category.name,
          tlPerPoint: category.tlPerPoint,
          amount: catAmount,
          points: catPoints
        });

        totalPoints += catPoints;
        totalAmount += catAmount;

        // Use first category as primary
        if (!primaryCategoryId) {
          primaryCategoryId = category.id;
        }
      }

      if (categoryBreakdown.length === 0) {
        return res.status(400).json({ error: 'En az bir kategoride tutar girmelisiniz' });
      }

      if (totalPoints <= 0) {
        return res.status(400).json({ error: 'Girilen tutarlar için puan kazanılamaz' });
      }

    } else {
      // Single category mode (backwards compatible)
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Geçerli bir tutar gerekli' });
      }

      if (!categoryId) {
        return res.status(400).json({ error: 'Kategori seçimi gerekli' });
      }

      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return res.status(404).json({ error: 'Kategori bulunamadı' });
      }

      if (!category.isActive) {
        return res.status(400).json({ error: 'Bu kategori aktif değil' });
      }

      totalPoints = Math.floor(amount / category.tlPerPoint);
      totalAmount = parseFloat(amount);
      primaryCategoryId = parseInt(categoryId);

      if (totalPoints <= 0) {
        return res.status(400).json({
          error: `Bu tutar için puan kazanılamaz. Minimum tutar: ${category.tlPerPoint} TL`
        });
      }

      categoryBreakdown.push({
        categoryId: category.id,
        categoryName: category.name,
        tlPerPoint: category.tlPerPoint,
        amount: totalAmount,
        points: totalPoints
      });
    }

    const code = generateQRCode();
    const expiresAt = new Date(Date.now() + 60000); // 1 dakika

    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        type: 'earn',
        points: totalPoints,
        amount: totalAmount,
        description,
        expiresAt,
        createdBy,
        categoryId: primaryCategoryId,
        categoryBreakdown: JSON.stringify(categoryBreakdown)
      },
      include: {
        category: true
      }
    });

    // Parse categoryBreakdown for response
    const response = {
      ...qrCode,
      categoryBreakdown: categoryBreakdown,
      message: categoryBreakdown.length > 1
        ? `${totalPoints} puan değerinde QR kod oluşturuldu (${categoryBreakdown.length} kategori)`
        : `${totalPoints} puan değerinde QR kod oluşturuldu (${categoryBreakdown[0].categoryName})`
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create earn QR code error:', error);
    res.status(500).json({ error: 'QR kod oluşturulamadı' });
  }
});

// Create SPEND QR code (customer - admin scans to deduct points)
router.post('/spend', async (req, res) => {
  try {
    const { customerId, points } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Müşteri bilgisi gerekli' });
    }

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Geçerli bir puan değeri gerekli' });
    }

    // Check customer and available points
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    const availablePoints = customer.totalPoints - customer.usedPoints;
    if (points > availablePoints) {
      return res.status(400).json({
        error: `Yetersiz puan. Kullanılabilir: ${availablePoints}`
      });
    }

    const code = generateQRCode();
    const expiresAt = new Date(Date.now() + 60000); // 1 dakika

    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        type: 'spend',
        points: parseInt(points),
        creatorId: parseInt(customerId),
        expiresAt
      }
    });

    res.status(201).json({
      ...qrCode,
      message: `${points} puan harcama QR kodu oluşturuldu`
    });
  } catch (error) {
    console.error('Create spend QR code error:', error);
    res.status(500).json({ error: 'QR kod oluşturulamadı' });
  }
});

// Use EARN QR code (customer scans admin's QR to earn points)
router.post('/use-earn', async (req, res) => {
  try {
    const { code, customerId } = req.body;

    if (!code || !customerId) {
      return res.status(400).json({ error: 'QR kod ve müşteri bilgisi gerekli' });
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { code }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı' });
    }

    if (qrCode.type !== 'earn') {
      return res.status(400).json({ error: 'Bu QR kod puan kazanmak için kullanılamaz' });
    }

    if (qrCode.isUsed) {
      return res.status(400).json({ error: 'Bu QR kod zaten kullanılmış' });
    }

    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: 'Bu QR kodun süresi dolmuş' });
    }

    // Transaction: Update QR code and customer points
    const [updatedQRCode, updatedCustomer] = await prisma.$transaction([
      prisma.qRCode.update({
        where: { code },
        data: {
          isUsed: true,
          usedAt: new Date(),
          customerId: parseInt(customerId)
        }
      }),
      prisma.customer.update({
        where: { id: parseInt(customerId) },
        data: {
          totalPoints: { increment: qrCode.points }
        }
      }),
      prisma.transaction.create({
        data: {
          customerId: parseInt(customerId),
          type: 'points_earned',
          amount: qrCode.amount,
          points: qrCode.points,
          description: qrCode.description || 'QR kod ile puan kazanıldı',
          qrCodeId: qrCode.id
        }
      })
    ]);

    res.json({
      success: true,
      message: `${qrCode.points} puan kazandınız!`,
      points: qrCode.points,
      newTotalPoints: updatedCustomer.totalPoints,
      availablePoints: updatedCustomer.totalPoints - updatedCustomer.usedPoints
    });
  } catch (error) {
    console.error('Use earn QR code error:', error);
    res.status(500).json({ error: 'QR kod kullanılamadı' });
  }
});

// Use SPEND QR code (admin scans customer's QR to deduct points)
router.post('/use-spend', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'QR kod gerekli' });
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        creator: true
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı' });
    }

    if (qrCode.type !== 'spend') {
      return res.status(400).json({ error: 'Bu QR kod puan harcamak için kullanılamaz' });
    }

    if (qrCode.isUsed) {
      return res.status(400).json({ error: 'Bu QR kod zaten kullanılmış' });
    }

    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: 'Bu QR kodun süresi dolmuş' });
    }

    if (!qrCode.creator) {
      return res.status(400).json({ error: 'QR kod sahibi bulunamadı' });
    }

    // Check if customer still has enough points
    const availablePoints = qrCode.creator.totalPoints - qrCode.creator.usedPoints;
    if (qrCode.points > availablePoints) {
      return res.status(400).json({
        error: `Müşterinin yeterli puanı yok. Kullanılabilir: ${availablePoints}`
      });
    }

    // Transaction: Update QR code and customer points
    const [updatedQRCode, updatedCustomer] = await prisma.$transaction([
      prisma.qRCode.update({
        where: { code },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      }),
      prisma.customer.update({
        where: { id: qrCode.creatorId },
        data: {
          usedPoints: { increment: qrCode.points }
        }
      }),
      prisma.transaction.create({
        data: {
          customerId: qrCode.creatorId,
          type: 'points_used',
          points: -qrCode.points,
          description: 'Puan harcandı',
          qrCodeId: qrCode.id
        }
      })
    ]);

    res.json({
      success: true,
      message: `${qrCode.points} puan başarıyla kullanıldı`,
      points: qrCode.points,
      customer: {
        id: qrCode.creator.id,
        name: qrCode.creator.name,
        phone: qrCode.creator.phone
      }
    });
  } catch (error) {
    console.error('Use spend QR code error:', error);
    res.status(500).json({ error: 'QR kod kullanılamadı' });
  }
});

// Legacy: Create QR code (admin) - kept for backwards compatibility
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { points, amount, description, expiresAt, createdBy } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Geçerli bir puan değeri gerekli' });
    }

    const code = generateQRCode();

    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        type: 'earn',
        points: parseInt(points),
        amount: amount ? parseFloat(amount) : null,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 60000),
        createdBy
      }
    });

    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Create QR code error:', error);
    res.status(500).json({ error: 'QR kod oluşturulamadı' });
  }
});

// Check QR code status (for polling - both admin and customer can use this)
router.get('/status/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR kod bulunamadı' });
    }

    res.json({
      code: qrCode.code,
      type: qrCode.type,
      isUsed: qrCode.isUsed,
      usedAt: qrCode.usedAt,
      points: qrCode.points,
      customer: qrCode.customer,
      expiresAt: qrCode.expiresAt,
      isExpired: qrCode.expiresAt && new Date() > qrCode.expiresAt
    });
  } catch (error) {
    console.error('Check QR status error:', error);
    res.status(500).json({ error: 'QR kod durumu alınamadı' });
  }
});

// Delete QR code (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.qRCode.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'QR kod silindi' });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({ error: 'QR kod silinemedi' });
  }
});

module.exports = router;
