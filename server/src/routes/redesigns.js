import { Router } from 'express';
import { Room, Redesign } from '../models/index.js';
import { authenticate, checkCredits } from '../middleware/auth.js';
import { generateRedesign } from '../services/aiService.js';

const router = Router();

// Generate redesign
router.post('/:roomId/redesign', authenticate, checkCredits, async (req, res) => {
    try {
        const { style, customPrompt } = req.body;
        if (!style) return res.status(400).json({ error: 'Style is required.' });

        const room = await Room.findOne({ where: { id: req.params.roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const result = await generateRedesign(room.originalImageUrl, style, customPrompt || '', room.roomType || 'living_room');

        const redesign = await Redesign.create({
            roomId: room.id,
            style,
            prompt: result.prompt,
            imageUrl: result.imageUrl,
        });

        // Deduct credit
        req.userRecord.credits -= 1;
        await req.userRecord.save();

        const { CreditHistory } = await import('../models/index.js');
        await CreditHistory.create({
            userId: req.userRecord.id,
            type: 'usage',
            amount: -1,
            balance: req.userRecord.credits,
            description: `AI redesign: ${style} style`,
            referenceId: redesign.id,
        });

        res.status(201).json({ redesign, creditsRemaining: req.userRecord.credits, method: result.method });
    } catch (err) {
        console.error('Redesign error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// List redesigns for a room
router.get('/:roomId/redesigns', authenticate, async (req, res) => {
    try {
        const room = await Room.findOne({ where: { id: req.params.roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const redesigns = await Redesign.findAll({
            where: { roomId: room.id },
            order: [['createdAt', 'DESC']],
        });
        res.json({ redesigns });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
