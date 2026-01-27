const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş işlemi başarısız' });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut ve yeni şifre gerekli' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Mevcut şifre yanlış' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Şifre değiştirme başarısız' });
  }
});

// Create initial admin (run once)
router.post('/setup', async (req, res) => {
  try {
    const existingUser = await prisma.user.findFirst();

    if (existingUser) {
      return res.status(400).json({ error: 'Admin kullanıcısı zaten mevcut' });
    }

    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    });

    res.json({
      message: 'Admin kullanıcısı oluşturuldu',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Kurulum başarısız' });
  }
});

module.exports = router;
