import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, chatSchema, generateImageSchema } from '../middleware/validate.js';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Redesign, Room, ChatMessage, CreditHistory } from '../models/index.js';
import { generateRedesign } from '../services/aiService.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.join(__dirname, '..', '..', 'generated');

if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
}

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set.");
    return new Groq({ apiKey });
};

// ── 1. Chat Endpoint (persisted & credits) ──
router.post('/chat', authenticate, validate(chatSchema), async (req, res) => {
    try {
        const { message, history, context } = req.body;
        
        // Check & deduct credits
        const { User } = await import('../models/index.js');
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.credits <= 0) {
            return res.status(429).json({ error: 'No credits remaining. Purchase more to continue.' });
        }

        const groq = getGroqClient();
        const systemInstruction = `You are a professional, helpful, and creative interior design assistant named DreamSpace AI. You are chatting with a user who is looking to redesign their room. Their current room context: ${context || 'Unknown room type'}. Provide very practical, stylish, and specific interior design advice. Keep responses concise and engaging.`;

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text || msg.content || ''
        }));

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction },
                ...formattedHistory,
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
        });

        const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // Deduct 1 credit for chatting
        user.credits -= 1;
        await user.save();

        await CreditHistory.create({
            userId: user.id,
            type: 'usage',
            amount: -1,
            balance: user.credits,
            description: `AI Chat Consultation`,
        });

        // Persist both messages to DB
        await ChatMessage.create({
            userId: req.user.id,
            role: 'user',
            content: message,
        });

        await ChatMessage.create({
            userId: req.user.id,
            role: 'assistant',
            content: reply,
        });

        res.json({ reply, creditsRemaining: user.credits });
    } catch (err) {
        console.error('Groq Chat Error:', err);
        res.status(500).json({ error: err.message || 'Failed to communicate with AI chat.' });
    }
});

// ── 2. Image Generation (with credit tracking) ──
router.post('/generate-image', authenticate, validate(generateImageSchema), async (req, res) => {
    try {
        const { prompt, roomId, style } = req.body;
        
        const room = await Room.findOne({ where: { id: roomId, userId: req.user.id } });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        // Check & deduct credits
        const { User } = await import('../models/index.js');
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (user.credits <= 0) {
            return res.status(429).json({ error: 'No credits remaining. Purchase more to continue.' });
        }

        console.log(`🎨 Redesign Request: style=${style}, prompt=${prompt}`);

        const result = await generateRedesign(room.originalImageUrl, style, prompt, room.roomType);

        const redesign = await Redesign.create({
            roomId: room.id,
            style: style || 'modern',
            prompt: result.prompt,
            imageUrl: result.imageUrl,
        });

        // Deduct credit + record history
        user.credits -= 1;
        await user.save();

        await CreditHistory.create({
            userId: user.id,
            type: 'usage',
            amount: -1,
            balance: user.credits,
            description: `AI redesign: ${style} style`,
            referenceId: redesign.id,
        });

        res.status(200).json({ 
            imageUrl: result.imageUrl,
            prompt: result.prompt,
            method: result.method,
            redesign,
            creditsRemaining: user.credits,
        });
    } catch (err) {
        console.error('Image Generation Error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate image.' });
    }
});

// ── 3. Get Chat History ──
router.get('/chat/history', authenticate, async (req, res) => {
    try {
        const { roomId, limit = 50 } = req.query;
        const where = { userId: req.user.id };
        if (roomId) where.roomId = roomId;

        const messages = await ChatMessage.findAll({
            where,
            order: [['createdAt', 'ASC']],
            limit: parseInt(limit),
            attributes: ['id', 'role', 'content', 'createdAt'],
        });

        res.json({ messages });
    } catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

// ── 4. Delete Chat History ──
router.delete('/chat/history', authenticate, async (req, res) => {
    try {
        await ChatMessage.destroy({ where: { userId: req.user.id } });
        res.json({ message: 'Chat history cleared.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear chat history.' });
    }
});

export default router;
