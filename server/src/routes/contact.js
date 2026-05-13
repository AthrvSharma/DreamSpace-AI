import { Router } from 'express';
import { User } from '../models/index.js';
import { sendContactNotification } from '../utils/mailer.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';

const router = Router();

const contactSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().trim().max(200).optional().default(''),
    message: Joi.string().trim().min(10).max(5000).required(),
});

// Submit contact form
router.post('/', validate(contactSchema), async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // If user is logged in, verify email matches
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const jwt = (await import('jsonwebtoken')).default;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Don't require match, just log
            } catch {}
        }

        await sendContactNotification({ name, email, subject, message });

        res.json({ message: 'Message sent successfully! We\'ll get back to you soon.' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

export default router;
