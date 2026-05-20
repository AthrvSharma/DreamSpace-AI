import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../middleware/validate.js';
import { verifyGoogleToken } from '../utils/firebase.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import { notifyWelcome } from '../utils/notifications.js';
import { signAuthToken } from '../utils/tokens.js';

const router = Router();

// ── Google OAuth Login ──
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Firebase token is required.' });

        const googleUser = await verifyGoogleToken(token);
        
        let user = await User.findOne({ where: { email: googleUser.email } });
        
        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, 12);
            user = await User.create({ 
                name: googleUser.name || 'User', 
                email: googleUser.email, 
                passwordHash,
                isEmailVerified: true,
            });
        }

        const jwtToken = signAuthToken(user);
        
        res.status(200).json({
            token: jwtToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, credits: user.credits, isEmailVerified: user.isEmailVerified },
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(401).json({ error: err.message || 'Google login failed.' });
    }
});

// ── Register ──
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already registered.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await User.create({ name, email, passwordHash, verifyToken, verifyTokenExpires });
        sendVerificationEmail(email, name, verifyToken);
        notifyWelcome(user.id, name);

        const token = signAuthToken(user);
        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, credits: user.credits, isEmailVerified: false },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Login ──
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = signAuthToken(user);
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, credits: user.credits, isEmailVerified: user.isEmailVerified },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Get Current User ──
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'plan', 'credits', 'isEmailVerified'],
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Verify Email ──
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Verification token is required.' });

        const { Op } = await import('sequelize');
        const user = await User.findOne({
            where: { verifyToken: token, verifyTokenExpires: { [Op.gt]: new Date() } },
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired verification token.' });

        user.isEmailVerified = true;
        user.verifyToken = null;
        user.verifyTokenExpires = null;
        await user.save();

        res.json({ message: 'Email verified successfully!' });
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Resend Verification ──
router.post('/resend-verify', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.isEmailVerified) return res.status(400).json({ error: 'Email is already verified.' });

        const verifyToken = crypto.randomBytes(32).toString('hex');
        user.verifyToken = verifyToken;
        user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        sendVerificationEmail(user.email, user.name, verifyToken);
        res.json({ message: 'Verification email sent.' });
    } catch (err) {
        console.error('Resend verify error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Forgot Password ──
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        sendPasswordResetEmail(user.email, user.name, resetToken);
        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Reset Password ──
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
    try {
        const { token, password } = req.body;

        const { Op } = await import('sequelize');
        const user = await User.findOne({
            where: { resetToken: token, resetTokenExpires: { [Op.gt]: new Date() } },
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token.' });

        user.passwordHash = await bcrypt.hash(password, 12);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── Change Password ──
router.post('/change-password', authenticate, validate(changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
