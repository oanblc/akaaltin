const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all transactions (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, type, customerId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'İşlemler alınamadı' });
  }
});

// Get transaction stats (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalTransactions,
      pointsEarned,
      pointsUsed,
      totalAmount,
      recentTransactions
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { type: 'points_earned' },
        _sum: { points: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'points_used' },
        _sum: { points: true }
      }),
      prisma.transaction.aggregate({
        where: { amount: { not: null } },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      })
    ]);

    res.json({
      totalTransactions,
      pointsEarned: pointsEarned._sum.points || 0,
      pointsUsed: Math.abs(pointsUsed._sum.points || 0),
      totalAmount: totalAmount._sum.amount || 0,
      recentTransactions
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// Create transaction (admin) - For manual point adjustments
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerId, type, amount, points, description } = req.body;

    if (!customerId || !type) {
      return res.status(400).json({ error: 'Müşteri ve işlem tipi gerekli' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        customerId: parseInt(customerId),
        type,
        amount: amount ? parseFloat(amount) : null,
        points: parseInt(points) || 0,
        description
      },
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

    // Update customer points based on type
    if (type === 'points_earned' || type === 'bonus') {
      await prisma.customer.update({
        where: { id: parseInt(customerId) },
        data: {
          totalPoints: { increment: Math.abs(parseInt(points) || 0) }
        }
      });
    } else if (type === 'points_used') {
      const pointsToUse = Math.abs(parseInt(points) || 0);
      const availablePoints = customer.totalPoints - customer.usedPoints;

      if (pointsToUse > availablePoints) {
        return res.status(400).json({ error: 'Yetersiz puan' });
      }

      await prisma.customer.update({
        where: { id: parseInt(customerId) },
        data: {
          usedPoints: { increment: pointsToUse }
        }
      });
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'İşlem oluşturulamadı' });
  }
});

// Get customer transactions (mobile app or admin)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { customerId: parseInt(customerId) },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({
        where: { customerId: parseInt(customerId) }
      })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get customer transactions error:', error);
    res.status(500).json({ error: 'İşlemler alınamadı' });
  }
});

// Delete transaction (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    // Reverse the points if needed
    if (transaction.type === 'points_earned' || transaction.type === 'bonus') {
      await prisma.customer.update({
        where: { id: transaction.customerId },
        data: {
          totalPoints: { decrement: Math.abs(transaction.points) }
        }
      });
    } else if (transaction.type === 'points_used') {
      await prisma.customer.update({
        where: { id: transaction.customerId },
        data: {
          usedPoints: { decrement: Math.abs(transaction.points) }
        }
      });
    }

    await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'İşlem silindi ve puanlar geri alındı' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'İşlem silinemedi' });
  }
});

module.exports = router;
