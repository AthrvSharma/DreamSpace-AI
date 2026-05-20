import { Router } from 'express';
import { Op } from 'sequelize';
import { User, Room, Redesign, Layout, Order, CreditHistory } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ── List all users with stats ──
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'plan', 'credits', 'isEmailVerified', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Platform stats ──
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const verifiedUsers = await User.count({ where: { isEmailVerified: true } });
        const totalRooms = await Room.count();
        const totalRedesigns = await Redesign.count();
        const totalLayouts = await Layout.count();
        const proUsers = await User.count({ where: { plan: 'pro' } });
        const totalRevenue = await Order.sum('amount', { where: { status: 'paid' } }) || 0;
        const totalOrders = await Order.count({ where: { status: 'paid' } });
        const totalCreditsUsed = await CreditHistory.sum('amount', { where: { type: 'usage' } }) || 0;

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } });
        const recentRedesigns = await Redesign.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } });

        res.json({
            stats: {
                totalUsers, verifiedUsers, totalRooms, totalRedesigns, totalLayouts,
                proUsers, totalRevenue, totalOrders, totalCreditsUsed: Math.abs(totalCreditsUsed),
                recentUsers, recentRedesigns,
                avgRevenuePerUser: totalUsers > 0 ? Math.round(totalRevenue / totalUsers / 100) : 0,
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Admin: Adjust user credits ──
router.post('/users/:id/credits', authenticate, requireAdmin, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        if (!amount || amount === 0) return res.status(400).json({ error: 'Amount must be non-zero.' });
        if (Math.abs(amount) > 1000) return res.status(400).json({ error: 'Max 1000 credits per adjustment.' });

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const previousCredits = user.credits;
        user.credits += amount;
        if (user.credits < 0) user.credits = 0;
        await user.save();

        await CreditHistory.create({
            userId: user.id,
            type: 'admin_adjustment',
            amount,
            balance: user.credits,
            description: reason || `Admin adjustment by ${req.user.id}`,
            referenceId: req.user.id,
        });

        res.json({
            message: `Credits adjusted. ${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} credits.`,
            previousCredits,
            newCredits: user.credits,
        });
    } catch (err) {
        console.error('Credit adjustment error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Admin: Get user detail ──
router.get('/users/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'role', 'plan', 'credits', 'isEmailVerified', 'createdAt'],
            include: [
                { model: Room, attributes: ['id', 'title', 'roomType', 'createdAt'] },
                { model: Order, attributes: ['id', 'packageId', 'amount', 'credits', 'status', 'createdAt'], order: [['createdAt', 'DESC']] },
                { model: CreditHistory, attributes: ['id', 'type', 'amount', 'balance', 'description', 'createdAt'], order: [['createdAt', 'DESC']], limit: 20 },
            ],
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Admin: Set user plan ──
router.post('/users/:id/plan', authenticate, requireAdmin, async (req, res) => {
    try {
        const { plan } = req.body;
        if (!['free', 'pro'].includes(plan)) return res.status(400).json({ error: 'Plan must be free or pro.' });

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        user.plan = plan;
        if (plan === 'pro') user.credits = Math.max(user.credits, 50);
        await user.save();

        res.json({ message: `User plan updated to ${plan}.`, credits: user.credits });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Admin: Orders list ──
router.get('/orders', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        const where = {};
        if (status && ['created', 'paid', 'failed', 'refunded'].includes(status)) where.status = status;

        const orders = await Order.findAll({
            where,
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
        });
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
