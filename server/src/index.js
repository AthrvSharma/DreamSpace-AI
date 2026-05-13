import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import sequelize from './models/index.js';
import { seedAssets } from './config/seed.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import redesignRoutes from './routes/redesigns.js';
import layoutRoutes from './routes/layouts.js';
import assetRoutes from './routes/assets.js';
import adminRoutes from './routes/admin.js';
import polyRoutes from './routes/poly.js';
import geminiRoutes from './routes/gemini.js';
import paymentRoutes from './routes/payment.js';
import exportRoutes from './routes/export.js';
import notificationRoutes from './routes/notifications.js';
import contactRoutes from './routes/contact.js';
import generalRoutes from './routes/general.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Socket.io Setup ──
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
});

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(`room:${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(`room:${roomId}`);
    });

    socket.on('redesign-started', ({ roomId }) => {
        socket.to(`room:${roomId}`).emit('redesign-progress', { status: 'processing' });
    });

    socket.on('redesign-complete', ({ roomId, data }) => {
        socket.to(`room:${roomId}`).emit('redesign-result', data);
    });

    socket.on('studio-update', ({ roomId, update }) => {
        socket.to(`room:${roomId}`).emit('studio-updated', update);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

app.set('io', io);

// Ensure directories exist
const dirs = ['uploads', 'generated', 'exports'].map(d => path.join(__dirname, '..', d));
dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Per-route rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/generated', express.static(path.join(__dirname, '..', 'generated')));
app.use('/exports', express.static(path.join(__dirname, '..', 'exports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', redesignRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/poly', polyRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', generalRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
});

// Start
async function start() {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');
        await seedAssets();
        server.listen(PORT, () => {
            console.log(`🚀 DreamSpace AI v2.0 running on http://localhost:${PORT}`);
            console.log(`📡 Socket.io enabled · ${dirs.length} static directories`);
        });
    } catch (err) {
        console.error('❌ Failed to start:', err);
        process.exit(1);
    }
}

start();
