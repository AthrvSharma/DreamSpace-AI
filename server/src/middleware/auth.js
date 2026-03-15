import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
};

export const checkCredits = async (req, res, next) => {
    const { User } = await import('../models/index.js');
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Reset daily credits for free users
    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);
    if (now.toDateString() !== lastReset.toDateString()) {
        user.credits = user.plan === 'free' ? 5 : 50;
        user.lastCreditReset = now;
        await user.save();
    }

    if (user.credits <= 0) {
        return res.status(429).json({ error: 'No credits remaining. Upgrade to Pro or wait for daily reset.' });
    }
    req.userRecord = user;
    next();
};
