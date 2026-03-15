import { Router } from 'express';
import { Room, Layout } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { generateAutoLayout } from '../services/autoDecorService.js';

const router = Router();

// Save layout
router.post('/:roomId/layouts', authenticate, async (req, res) => {
    try {
        const { name, style, layoutJson } = req.body;
        if (!layoutJson) return res.status(400).json({ error: 'layoutJson is required.' });

        const room = await Room.findOne({ where: { id: req.params.roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const layout = await Layout.create({
            roomId: room.id,
            name: name || 'Untitled Layout',
            style: style || 'modern',
            layoutJson: typeof layoutJson === 'string' ? layoutJson : JSON.stringify(layoutJson),
        });
        res.status(201).json({ layout });
    } catch (err) {
        console.error('Save layout error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// List layouts for a room
router.get('/:roomId/layouts', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ where: { id: req.params.roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const layouts = await Layout.findAll({
            where: { roomId: room.id },
            order: [['createdAt', 'DESC']],
        });
        res.json({ layouts });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get specific layout
router.get('/detail/:id', authenticate, async (req, res) => {
    try {
        const layout = await Layout.findByPk(req.params.id, { include: [Room] });
        if (!layout || layout.Room.userId !== req.user.id) {
            return res.status(404).json({ error: 'Layout not found.' });
        }
        res.json({ layout });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Auto-decorate
router.post('/:roomId/auto-decorate', authenticate, async (req, res) => {
    try {
        const { style } = req.body;
        const room = await Room.findOne({ where: { id: req.params.roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const layoutJson = generateAutoLayout(room.roomType, style || 'modern');
        const layout = await Layout.create({
            roomId: room.id,
            name: `Auto ${style || 'modern'} Layout`,
            style: style || 'modern',
            layoutJson: JSON.stringify(layoutJson),
        });
        res.status(201).json({ layout: { ...layout.toJSON(), layoutJson } });
    } catch (err) {
        console.error('Auto-decorate error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
