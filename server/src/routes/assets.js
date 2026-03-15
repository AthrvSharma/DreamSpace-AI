import { Router } from 'express';
import { Asset } from '../models/index.js';

const router = Router();

// List assets with optional filters
router.get('/', async (req, res) => {
    try {
        const where = {};
        if (req.query.type) where.type = req.query.type;
        const assets = await Asset.findAll({ where, order: [['type', 'ASC'], ['name', 'ASC']] });

        // Parse JSON fields
        const parsed = assets.map(a => ({
            ...a.toJSON(),
            defaultScale: JSON.parse(a.defaultScale || '{"x":1,"y":1,"z":1}'),
            tags: JSON.parse(a.tags || '[]'),
            materialOptions: JSON.parse(a.materialOptions || '[]'),
        }));

        res.json({ assets: parsed });
    } catch (err) {
        console.error('List assets error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
