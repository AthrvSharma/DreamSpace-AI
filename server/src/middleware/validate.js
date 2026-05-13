import Joi from 'joi';

/**
 * Express middleware factory — validates req.body against a Joi schema.
 * Returns 400 with detailed errors if validation fails.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), handler);
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message,
            }));
            return res.status(400).json({ error: 'Validation failed.', details: errors });
        }

        // Replace req.body with validated + stripped value
        req.body = value;
        next();
    };
};

// ── Pre-built Schemas ──

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const createRoomSchema = Joi.object({
    title: Joi.string().trim().max(200).optional(),
    name: Joi.string().trim().max(200).optional(),
    roomType: Joi.string().valid('living_room', 'bedroom', 'dining_room', 'kitchen', 'bathroom', 'office').default('living_room'),
});

export const redesignSchema = Joi.object({
    style: Joi.string().valid('modern', 'minimal', 'luxury', 'boho', 'scandinavian', 'indian_contemporary').required(),
    customPrompt: Joi.string().trim().max(2000).optional().default(''),
});

export const saveLayoutSchema = Joi.object({
    name: Joi.string().trim().max(200).optional(),
    style: Joi.string().trim().max(100).optional(),
    layoutJson: Joi.object().required(),
});

export const createOrderSchema = Joi.object({
    packageId: Joi.string().valid('starter', 'pro', 'business').required(),
});

export const verifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
    packageId: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
});

export const chatSchema = Joi.object({
    message: Joi.string().trim().max(2000).required(),
    history: Joi.array().items(Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        text: Joi.string().required(),
    })).optional().default([]),
    context: Joi.string().optional(),
});

export const generateImageSchema = Joi.object({
    prompt: Joi.string().trim().max(2000).optional(),
    roomId: Joi.string().uuid().required(),
    style: Joi.string().valid('modern', 'minimal', 'luxury', 'boho', 'scandinavian', 'indian_contemporary').default('modern'),
});

export default validate;
