import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User, Order, CreditHistory } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { sendPaymentConfirmation } from '../utils/mailer.js';
import { notifyPaymentSuccess, notifyCreditLow, notifyAdminAction } from '../utils/notifications.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

function getRazorpayClient() {
    if (!razorpay) {
        const error = new Error('Payment gateway is not configured.');
        error.statusCode = 503;
        throw error;
    }
    return razorpay;
}

const CREDIT_PACKAGES = {
    starter: { amount: 199, credits: 20, name: 'Starter Pack' },
    pro: { amount: 499, credits: 60, name: 'Pro Pack' },
    business: { amount: 999, credits: 150, name: 'Business Pack' },
};

// ── Create Order ──
router.post('/create-order', authenticate, async (req, res) => {
    try {
        const { packageId } = req.body;
        const pack = CREDIT_PACKAGES[packageId];
        if (!pack) return res.status(400).json({ error: 'Invalid credit package selected.' });

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const razorpayClient = getRazorpayClient();

        const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now()}`;
        const options = {
            amount: pack.amount * 100,
            currency: 'INR',
            receipt,
            notes: { packageId, userId: user.id, credits: pack.credits },
        };

        const order = await razorpayClient.orders.create(options);

        await Order.create({
            userId: user.id,
            razorpayOrderId: order.id,
            packageId,
            amount: pack.amount * 100,
            credits: pack.credits,
            status: 'created',
            receipt,
        });

        res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to create payment order.' });
    }
});

// ── Verify Payment (client-side) ──
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = req.body;
        getRazorpayClient();

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature.' });
        }

        const order = await Order.findOne({
            where: { razorpayOrderId: razorpay_order_id, userId: req.user.id },
        });

        if (!order) return res.status(404).json({ error: 'Order not found.' });
        if (order.status === 'paid') return res.status(400).json({ error: 'Payment already verified.' });

        const pack = CREDIT_PACKAGES[packageId] || CREDIT_PACKAGES[order.packageId];
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'paid';
        await order.save();

        user.credits += pack.credits;
        await user.save();

        await CreditHistory.create({
            userId: user.id,
            type: 'purchase',
            amount: pack.credits,
            balance: user.credits,
            description: `Purchased ${pack.name} (₹${pack.amount})`,
            referenceId: order.id,
        });

        // Send email + notification (fire-and-forget)
        sendPaymentConfirmation(user.email, user.name, pack.amount, pack.credits).catch(() => {});
        notifyPaymentSuccess(user.id, pack.credits, pack.amount);

        if (user.credits <= 5) {
            notifyCreditLow(user.id, user.credits);
        }

        res.json({
            success: true,
            message: 'Payment verified and credits added!',
            credits: user.credits,
            orderId: order.id,
        });
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Failed to verify payment.' });
    }
});

// ── Webhook (server-side confirmation) ──
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return res.status(503).json({ error: 'Webhook not configured.' });

        const body = req.rawBody || JSON.stringify(req.body);
        const signature = req.headers['x-razorpay-signature'];
        const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ error: 'Invalid webhook signature.' });
        }

        const event = req.body.event;
        const payment = req.body.payload?.payment?.entity;
        if (!payment) return res.json({ received: true });

        if (event === 'payment.captured') {
            const orderId = payment.order_id;
            const order = await Order.findOne({ where: { razorpayOrderId: orderId } });
            if (!order) return res.json({ received: true, status: 'order_not_found' });
            if (order.status === 'paid') return res.json({ received: true, status: 'already_processed' });

            order.razorpayPaymentId = payment.id;
            order.status = 'paid';
            await order.save();

            const user = await User.findByPk(order.userId);
            if (!user) return res.json({ received: true, status: 'user_not_found' });

            const pack = CREDIT_PACKAGES[order.packageId] || { credits: order.credits, name: 'Package', amount: order.amount / 100 };

            user.credits += order.credits;
            await user.save();

            await CreditHistory.create({
                userId: user.id, type: 'purchase', amount: order.credits,
                balance: user.credits, description: `Purchased ${pack.name} (₹${pack.amount})`,
                referenceId: order.id,
            });

            sendPaymentConfirmation(user.email, user.name, pack.amount, order.credits).catch(() => {});
            notifyPaymentSuccess(user.id, pack.credits, pack.amount);

            console.log(`✅ Webhook: Payment captured for order ${orderId}`);
        }

        if (event === 'payment.failed') {
            const orderId = payment.order_id;
            const order = await Order.findOne({ where: { razorpayOrderId: orderId } });
            if (order && order.status === 'created') {
                order.status = 'failed';
                await order.save();
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'Webhook processing failed.' });
    }
});

// ── Payment History ──
router.get('/history', authenticate, async (req, res) => {
    try {
        const [orders, creditHistory] = await Promise.all([
            Order.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'razorpayOrderId', 'packageId', 'amount', 'credits', 'status', 'currency', 'createdAt'],
            }),
            CreditHistory.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']],
                limit: 50,
                attributes: ['id', 'type', 'amount', 'balance', 'description', 'createdAt'],
            }),
        ]);
        res.json({ orders, creditHistory });
    } catch (err) {
        console.error('Payment history error:', err);
        res.status(500).json({ error: 'Failed to fetch payment history.' });
    }
});

// ── Available Packages ──
router.get('/packages', (req, res) => {
    res.json({ packages: CREDIT_PACKAGES });
});

export default router;
