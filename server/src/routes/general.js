import { Router } from 'express';
import transporter from '../utils/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        // Send email to admin
        const adminMailOptions = {
            from: `"DreamSpace Contact" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
            to: process.env.ADMIN_EMAIL || 'admin@dreamspaceai.com',
            subject: `Contact Form: ${subject || 'New Message'}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6B7F5E;">New Contact Form Message</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Message:</strong></p>
                        <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="font-size: 12px; color: #777;">Sent from DreamSpace AI Contact Page</p>
                </div>
            `,
        };

        // Send auto-reply to user
        const userMailOptions = {
            from: `"DreamSpace AI" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
            to: email,
            subject: 'We received your message!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6B7F5E;">Hi ${name},</h2>
                    <p>Thanks for reaching out to us. We've received your message and our team will get back to you within 24 hours.</p>
                    <p><strong>Your message summary:</strong></p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; font-style: italic; color: #555;">
                        "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"
                    </div>
                    <p>Best regards,<br>The DreamSpace AI Team</p>
                </div>
            `,
        };

        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

export default router;
