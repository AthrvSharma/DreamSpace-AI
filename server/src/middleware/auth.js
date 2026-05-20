import { verifyAuthToken } from '../utils/tokens.js';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAuthToken(token);
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

    if (user.credits <= 0) {
        return res.status(429).json({ error: 'No credits remaining. Please purchase more credits.' });
    }
    req.userRecord = user;
    next();
};
