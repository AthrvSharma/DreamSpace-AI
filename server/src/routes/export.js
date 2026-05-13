import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Room, Redesign, Layout } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { generateDesignProposalPDF } from '../services/exportService.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportDir = path.join(__dirname, '..', '..', 'exports');

if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

// ── Generate PDF Design Proposal ──
router.get('/proposal/:roomId', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({
            where: { id: req.params.roomId, userId: req.user.id },
            include: [
                { model: Redesign, order: [['createdAt', 'DESC']] },
                { model: Layout, order: [['createdAt', 'DESC']], limit: 1 },
            ],
        });

        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const latestLayout = room.Layouts?.[0]?.layoutJson || null;
        const result = await generateDesignProposalPDF(room, room.Redesigns, latestLayout);

        res.json({ url: result.url, filename: result.filename });
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Failed to generate export.' });
    }
});

// ── Download PDF ──
router.get('/download/:filename', authenticate, async (req, res) => {
    try {
        const filePath = path.join(exportDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });

        // Verify user owns this export (check filename contains a room they own)
        const roomId = req.params.filename.split('_')[1];
        if (roomId) {
            const room = await Room.findOne({ where: { id: { [require('sequelize').Op.startsWith]: roomId }, userId: req.user.id } });
            if (!room) return res.status(403).json({ error: 'Access denied.' });
        }

        res.download(filePath, req.params.filename);
    } catch (err) {
        res.status(500).json({ error: 'Download failed.' });
    }
});

export default router;
