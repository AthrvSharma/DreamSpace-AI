import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload/generated directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const generatedDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Static files
app.use('/uploads', express.static(uploadsDir));
app.use('/generated', express.static(generatedDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', redesignRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/poly', polyRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
});

// Start server
async function start() {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');
        await seedAssets();
        app.listen(PORT, () => {
            console.log(`🚀 RoomForge AI server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

start();
