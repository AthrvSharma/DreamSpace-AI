import { Notification } from '../models/index.js';

/**
 * Create an in-app notification for a user.
 * Fire-and-forget — never awaits.
 */
export const notify = async (userId, { title, message, type = 'info', link = null }) => {
    try {
        await Notification.create({ userId, title, message, type, link });
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
};

// Pre-built notification templates
export const notifyPaymentSuccess = (userId, credits, amount) =>
    notify(userId, {
        title: 'Credits Added! 💎',
        message: `₹${amount} payment successful. ${credits} credits added to your account.`,
        type: 'payment',
        link: '/pricing',
    });

export const notifyCreditLow = (userId, creditsLeft) =>
    notify(userId, {
        title: 'Running Low on Credits',
        message: `You have ${creditsLeft} credits remaining. Buy more to keep designing!`,
        type: 'warning',
        link: '/pricing',
    });

export const notifyWelcome = (userId, userName) =>
    notify(userId, {
        title: 'Welcome to DreamSpace AI! 🎉',
        message: `Hi ${userName}! You have 5 free AI redesigns per day. Upload your first room to get started.`,
        type: 'success',
        link: '/upload',
    });

export const notifyRedesignComplete = (userId, style, roomId) =>
    notify(userId, {
        title: 'Redesign Ready! ✨',
        message: `Your ${style.replace(/_/g, ' ')} redesign has been generated. Check it out!`,
        type: 'success',
        link: `/room/${roomId}`,
    });

export const notifyPlanUpgraded = (userId, plan) =>
    notify(userId, {
        title: `Plan Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        message: plan === 'pro' 
            ? 'You now have 50 daily credits and priority AI processing. Enjoy!' 
            : 'Your plan has been updated.',
        type: 'info',
        link: '/settings',
    });

export const notifyAdminAction = (userId, description) =>
    notify(userId, {
        title: 'Account Updated',
        message: description,
        type: 'system',
        link: '/settings',
    });
