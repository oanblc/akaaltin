const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Default settings
const defaultSettings = {
  logoBase64: '',
  logoHeight: 50,
  logoWidth: 150,
  faviconBase64: '',
  priceTableImage: '',
  siteName: 'Aka Kuyumculuk',
  contactPhone: '0322 233 55 55',
  contactPhone2: '',
  contactEmail: '',
  contactAddress: 'Turgut Özal Bulvarı Güzelyalı Mahallesi QNB Finansbank Yanı Recep Gergin Apt. Zemin Kat No:124/A Çukurova / ADANA',
  workingHours: 'Pazartesi - Cumartesi: 09:00 - 19:00',
  workingHoursNote: 'Pazar günleri kapalıyız',
  socialFacebook: '',
  socialTwitter: '',
  socialInstagram: '',
  socialYoutube: '',
  socialTiktok: '',
  socialWhatsapp: '',
  // Puan sistemi ayarları
  pointRate: '100', // Her 100 TL = 1 puan
};

// Get all settings (public)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();

    // Convert array to object
    const settingsObj = { ...defaultSettings };
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Ayarlar alınamadı' });
  }
});

// Update settings (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await prisma.settings.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) }
      });
    }

    res.json({ message: 'Ayarlar güncellendi' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Ayarlar güncellenemedi' });
  }
});

// Get single setting
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await prisma.settings.findUnique({
      where: { key }
    });

    if (!setting) {
      return res.json({ key, value: defaultSettings[key] || '' });
    }

    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Ayar alınamadı' });
  }
});

module.exports = router;
