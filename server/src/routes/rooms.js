import { Router } from 'express';
import { Room, Redesign, Layout } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Create room + upload image
router.post('/', authenticate, upload.single('image'), async (req, res) => {
    try {
        const { title, name, roomType } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Image is required.' });

        const room = await Room.create({
            title: title || name || 'Untitled Room',
            roomType: roomType || 'living_room',
            originalImageUrl: `/uploads/${req.file.filename}`,
            userId: req.user.id,
        });
        res.status(201).json({ room });
    } catch (err) {
        console.error('Create room error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// List user's rooms
router.get('/', authenticate, async (req, res) => {
    try {
        const rooms = await Room.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Redesign, attributes: ['id', 'style', 'imageUrl', 'createdAt'] },
                { model: Layout, attributes: ['id', 'name', 'style', 'createdAt'] },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json({ rooms });
    } catch (err) {
        console.error('List rooms error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get room by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                { model: Redesign, order: [['createdAt', 'DESC']] },
                { model: Layout, order: [['createdAt', 'DESC']] },
            ],
        });
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        res.json({ room });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Delete room
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        await room.destroy();
        res.json({ message: 'Room deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
