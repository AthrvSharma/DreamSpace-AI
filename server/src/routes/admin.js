import { Router } from 'express';
import { User, Room, Redesign, Layout } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'plan', 'credits', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalRooms = await Room.count();
        const totalRedesigns = await Redesign.count();
        const totalLayouts = await Layout.count();
        const proUsers = await User.count({ where: { plan: 'pro' } });
        res.json({ stats: { totalUsers, totalRooms, totalRedesigns, totalLayouts, proUsers } });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
