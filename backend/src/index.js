require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const prisma = require('./lib/prisma');
const priceManager = require('./services/priceManager');

// Routes
const authRoutes = require('./routes/auth');
const priceRoutes = require('./routes/prices');
const customPriceRoutes = require('./routes/customPrices');
const settingsRoutes = require('./routes/settings');
const seoRoutes = require('./routes/seo');
const articleRoutes = require('./routes/articles');
const branchRoutes = require('./routes/branches');
const familyCardRoutes = require('./routes/familyCards');
const legalRoutes = require('./routes/legal');
const priceSourceRoutes = require('./routes/priceSource');
const campaignRoutes = require('./routes/campaigns');
const customerRoutes = require('./routes/customers');
const qrcodeRoutes = require('./routes/qrcodes');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const alertRoutes = require('./routes/alerts');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 1000,
  message: { error: 'Çok fazla istek gönderdiniz, lütfen bekleyin.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Çok fazla giriş denemesi, lütfen bekleyin.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/custom-prices', customPriceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/family-cards', familyCardRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/price-source', priceSourceRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/qrcodes', qrcodeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // İlk bağlantıda mevcut fiyatları gönder
  const currentPrices = priceManager.getCurrentPrices();
  if (currentPrices && currentPrices.length > 0) {
    socket.emit('prices', currentPrices);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Price Manager'a io instance'ını ver
priceManager.setSocketIO(io);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası'
  });
});

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Database bağlantısını kontrol et
    await prisma.$connect();
    console.log('Database connected');

    // Price Manager'ı başlat
    await priceManager.initialize();
    console.log('Price Manager initialized');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  priceManager.stop();
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});
