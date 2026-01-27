const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Generate UUID for personal QR code
function generateUUID() {
  return crypto.randomUUID();
}

// Get all customers (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } }
          ]
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              qrCodes: true,
              transactions: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Müşteriler alınamadı' });
  }
});

// Get customer stats (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalPoints,
      usedPoints
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.customer.aggregate({ _sum: { totalPoints: true } }),
      prisma.customer.aggregate({ _sum: { usedPoints: true } })
    ]);

    res.json({
      totalCustomers,
      activeCustomers,
      totalPoints: totalPoints._sum.totalPoints || 0,
      usedPoints: usedPoints._sum.usedPoints || 0,
      availablePoints: (totalPoints._sum.totalPoints || 0) - (usedPoints._sum.usedPoints || 0)
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// Get single customer with details (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        qrCodes: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Müşteri alınamadı' });
  }
});

// Create customer (admin or from mobile app)
router.post('/', async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ error: 'Telefon ve isim gerekli' });
    }

    // Check if phone exists
    const existing = await prisma.customer.findUnique({
      where: { phone }
    });

    if (existing) {
      return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı' });
    }

    const customer = await prisma.customer.create({
      data: {
        phone,
        name,
        email,
        personalQRCode: generateUUID()
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Müşteri oluşturulamadı' });
  }
});

// Update customer (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isActive } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        isActive
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Müşteri güncellenemedi' });
  }
});

// Toggle customer status (admin)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    const updated = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { isActive: !customer.isActive }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle customer error:', error);
    res.status(500).json({ error: 'Müşteri durumu değiştirilemedi' });
  }
});

// Delete customer (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await prisma.transaction.deleteMany({
      where: { customerId: parseInt(id) }
    });

    await prisma.qRCode.updateMany({
      where: { customerId: parseInt(id) },
      data: { customerId: null }
    });

    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Müşteri silindi' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Müşteri silinemedi' });
  }
});

// Get customer by personal QR code (for admin scanning)
router.get('/qr/:qrCode', authMiddleware, async (req, res) => {
  try {
    const { qrCode } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { personalQRCode: qrCode },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    if (!customer.isActive) {
      return res.status(400).json({ error: 'Bu müşteri hesabı aktif değil' });
    }

    res.json({
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      totalPoints: customer.totalPoints,
      usedPoints: customer.usedPoints,
      availablePoints: customer.totalPoints - customer.usedPoints,
      recentTransactions: customer.transactions
    });
  } catch (error) {
    console.error('Get customer by QR error:', error);
    res.status(500).json({ error: 'Müşteri alınamadı' });
  }
});

// Login/Register for mobile app (by phone)
router.post('/auth', async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Telefon numarası gerekli' });
    }

    let customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      if (!name) {
        return res.status(400).json({ error: 'Yeni kayıt için isim gerekli', needsRegistration: true });
      }

      customer = await prisma.customer.create({
        data: {
          phone,
          name,
          personalQRCode: generateUUID(),
          lastLoginAt: new Date()
        }
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { lastLoginAt: new Date() }
      });
    }

    // Generate JWT token for authenticated requests
    const token = jwt.sign(
      {
        id: customer.id,
        phone: customer.phone,
        role: customer.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ ...customer, token });
  } catch (error) {
    console.error('Customer auth error:', error);
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
});

module.exports = router;
