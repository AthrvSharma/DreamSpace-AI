import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './models/index.js';
import { ensureDatabase } from './config/database.js';
import { ensureStorageDirs, uploadDir, generatedDir, exportDir } from './config/storage.js';
import { isProduction, serverConfig, validateRuntimeEnv } from './config/env.js';
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
const PORT = serverConfig.port;

if (serverConfig.trustProxy) {
    app.set('trust proxy', 1);
}

const allowedOrigins = serverConfig.corsOrigins.length > 0
    ? serverConfig.corsOrigins
    : (serverConfig.frontendUrl ? [serverConfig.frontendUrl] : []);

const corsOrigin = (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
};

const socketCorsOrigin = allowedOrigins.length === 0
    ? true
    : (allowedOrigins.includes('*') ? '*' : allowedOrigins);

// ── Socket.io Setup ──
const io = new Server(server, {
    cors: {
        origin: socketCorsOrigin,
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

ensureStorageDirs();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,   // Required for Razorpay popup payment flow
    crossOriginEmbedderPolicy: false,  // Required for Razorpay popup payment flow
}));
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));
app.use(express.json({
    limit: serverConfig.jsonBodyLimit,
    verify: (req, res, buf) => {
        if (req.originalUrl === '/api/payment/webhook') {
            req.rawBody = buf.toString('utf8');
        }
    },
}));

// Per-route rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', generalLimiter);

// Static files
const staticOptions = {
    maxAge: isProduction ? '7d' : 0,
    immutable: isProduction,
};
app.use('/uploads', express.static(uploadDir, staticOptions));
app.use('/generated', express.static(generatedDir, staticOptions));
app.use('/exports', express.static(exportDir, staticOptions));

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
        environment: serverConfig.nodeEnv,
        database: 'configured',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
    });
});

// Serve static client files in production
if (isProduction) {
    const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res, next) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/generated') && !req.path.startsWith('/exports')) {
            return res.sendFile(path.join(clientBuildPath, 'index.html'));
        }
        next();
    });
}

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const status = err.statusCode || err.status || 500;
    const message = isProduction && status >= 500
        ? 'Internal server error.'
        : (err.message || 'Internal server error.');
    res.status(status).json({ error: message });
});

// Start
async function start() {
    try {
        validateRuntimeEnv();
        await ensureDatabase();
        await sequelize.authenticate();
        const syncOptions = process.env.DB_SYNC_ALTER === 'true' ? { alter: true } : {};
        if (process.env.DB_SYNC_ON_START !== 'false') {
            await sequelize.sync(syncOptions);
        }
        console.log('✅ Database synced');
        if (process.env.DB_SEED_ON_START !== 'false') {
            await seedAssets();
        }
        server.listen(PORT, serverConfig.host, () => {
            console.log(`🚀 DreamSpace AI v2.0 listening on port ${PORT}`);
            console.log(`📡 Socket.io enabled · static storage root: ${path.dirname(uploadDir)}`);
        });
    } catch (err) {
        console.error('❌ Failed to start:', err);
        process.exit(1);
    }
}

start();
