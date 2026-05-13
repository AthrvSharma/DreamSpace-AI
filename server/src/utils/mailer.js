import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: process.env.MAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER || 'mock_user@ethereal.email',
        pass: process.env.MAIL_PASS || 'mock_password',
    },
});

export const sendPaymentConfirmation = async (userEmail, userName, amount, credits) => {
    try {
        const mailOptions = {
            from: `"DreamSpace AI" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
            to: userEmail,
            subject: 'Payment Confirmation - DreamSpace AI',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6B7F5E;">Thank You for Your Purchase!</h2>
                    <p>Hi ${userName},</p>
                    <p>We've successfully received your payment of <strong>₹${amount}</strong>.</p>
                    <p>Your account has been credited with <strong>${credits} credits</strong>.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Order Details:</strong></p>
                        <p style="margin: 5px 0;">Transaction ID: DS-${Date.now()}</p>
                        <p style="margin: 5px 0;">Credits Added: ${credits}</p>
                    </div>
                    <p>Start designing now!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">If you have any questions, reply to this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Payment confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

export const sendVerificationEmail = async (userEmail, userName, token) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"DreamSpace AI" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
        to: userEmail,
        subject: 'Verify Your Email - DreamSpace AI',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6B7F5E;">Welcome to DreamSpace AI! 🎨</h2>
                <p>Hi ${userName},</p>
                <p>Please verify your email address to get started:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background: #6B7F5E; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #777; font-size: 13px;">This link expires in 24 hours.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777;">If you didn't create an account, you can ignore this email.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions).catch(err => console.error('❌ Verification email failed:', err));
};

export const sendPasswordResetEmail = async (userEmail, userName, token) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"DreamSpace AI" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
        to: userEmail,
        subject: 'Reset Your Password - DreamSpace AI',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6B7F5E;">Password Reset Request</h2>
                <p>Hi ${userName},</p>
                <p>We received a request to reset your password. Click the button below to set a new one:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #6B7F5E; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #777; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions).catch(err => console.error('❌ Password reset email failed:', err));
};


export const sendContactNotification = async ({ name, email, subject, message }) => {
    const mailOptions = {
        from: `"DreamSpace AI Contact" <${process.env.MAIL_FROM || 'no-reply@dreamspace.ai'}>`,
        to: process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'support@dreamspace.ai',
        replyTo: email,
        subject: subject ? `[Contact] ${subject}` : '[Contact] New message from website',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #6B7F5E;">New Contact Message</h2>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject || 'N/A'}</p>
                </div>
                <div style="padding: 16px; border: 1px solid #eee; border-radius: 8px;">
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777;">Reply directly to ${email} to respond.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions).catch(err => console.error('❌ Contact email failed:', err));
};

export default transporter;
