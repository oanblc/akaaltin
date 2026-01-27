const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all alerts for authenticated customer
router.get('/', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;

    const alerts = await prisma.priceAlert.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Alarmlar alinamadi' });
  }
});

// Create new alert
router.post('/', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { priceCode, priceName, alertType, targetPrice, priceField = 'satis' } = req.body;

    // Validation
    if (!priceCode || !priceName || !alertType || !targetPrice) {
      return res.status(400).json({ error: 'Tum alanlar gerekli' });
    }

    if (!['above', 'below'].includes(alertType)) {
      return res.status(400).json({ error: 'Gecersiz alarm tipi' });
    }

    if (!['alis', 'satis'].includes(priceField)) {
      return res.status(400).json({ error: 'Gecersiz fiyat alani' });
    }

    // Check if similar alert exists
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        customerId,
        priceCode,
        alertType,
        priceField,
        isActive: true
      }
    });

    if (existingAlert) {
      return res.status(400).json({ error: 'Bu fiyat icin benzer bir alarm zaten mevcut' });
    }

    const alert = await prisma.priceAlert.create({
      data: {
        customerId,
        priceCode,
        priceName,
        alertType,
        targetPrice: parseFloat(targetPrice),
        priceField
      }
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Alarm olusturulamadi' });
  }
});

// Toggle alert active status
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: parseInt(id),
        customerId
      }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alarm bulunamadi' });
    }

    const updated = await prisma.priceAlert.update({
      where: { id: parseInt(id) },
      data: {
        isActive: !alert.isActive,
        triggeredAt: null // Reset triggered state when reactivating
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle alert error:', error);
    res.status(500).json({ error: 'Alarm durumu degistirilemedi' });
  }
});

// Delete alert
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: parseInt(id),
        customerId
      }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alarm bulunamadi' });
    }

    await prisma.priceAlert.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Alarm silindi' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Alarm silinemedi' });
  }
});

// Update push token for customer
router.post('/push-token', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ error: 'Push token gerekli' });
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { pushToken }
    });

    res.json({ message: 'Push token kaydedildi' });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({ error: 'Push token kaydedilemedi' });
  }
});

// Remove push token (on logout)
router.delete('/push-token', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;

    await prisma.customer.update({
      where: { id: customerId },
      data: { pushToken: null }
    });

    res.json({ message: 'Push token silindi' });
  } catch (error) {
    console.error('Remove push token error:', error);
    res.status(500).json({ error: 'Push token silinemedi' });
  }
});

module.exports = router;
