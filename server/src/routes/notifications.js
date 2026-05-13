import { Router } from 'express';
import { Notification } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Get user notifications ──
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50,
            attributes: ['id', 'title', 'message', 'type', 'read', 'link', 'createdAt'],
        });
        const unreadCount = await Notification.count({ where: { userId: req.user.id, read: false } });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Mark as read ──
router.post('/:id/read', authenticate, async (req, res) => {
    try {
        const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!notif) return res.status(404).json({ error: 'Notification not found.' });
        notif.read = true;
        await notif.save();
        res.json({ message: 'Marked as read.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Mark all as read ──
router.post('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
        res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Delete notification ──
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!notif) return res.status(404).json({ error: 'Notification not found.' });
        await notif.destroy();
        res.json({ message: 'Notification deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
