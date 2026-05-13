import rateLimit from 'express-rate-limit';

// General API: 100 req / 15 min
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Please try again later.' },
});

// Auth endpoints: 5 req / 15 min (prevent brute force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// AI generation: 10 req / 15 min
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'AI generation limit reached. Please wait or purchase more credits.' },
});

// Payment: 10 req / 15 min
export const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many payment requests.' },
});

export default generalLimiter;
