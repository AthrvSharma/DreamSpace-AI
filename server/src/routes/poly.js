import { Router } from 'express';

const router = Router();

const POLY_API_KEY = process.env.POLY_PIZZA_API_KEY || '';
const POLY_BASE_URL = 'https://api.poly.pizza/v1.1';

// Proxy GLB model downloads (to bypass CORS)
router.get('/model', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || !url.includes('poly.pizza')) {
            return res.status(400).json({ error: 'Invalid model URL.' });
        }

        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch model.' });
        }

        res.set('Content-Type', 'model/gltf-binary');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24h

        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
    } catch (err) {
        console.error('GLB proxy error:', err);
        res.status(500).json({ error: 'Failed to proxy model.' });
    }
});

// Search 3D models from Poly.pizza
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query (q) is required.' });

        if (!POLY_API_KEY) {
            return res.status(503).json({
                error: 'Poly.pizza API key not configured.',
                hint: 'Add POLY_PIZZA_API_KEY to your .env file. Get a free key at https://poly.pizza',
            });
        }

        const url = `${POLY_BASE_URL}/search/${encodeURIComponent(q)}?Limit=${Math.min(Number(limit), 40)}`;

        const response = await fetch(url, {
            headers: { 'x-auth-token': POLY_API_KEY },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Poly.pizza API error:', response.status, errorText.substring(0, 200));
            return res.status(response.status).json({ error: 'Poly.pizza API error', details: errorText.substring(0, 200) });
        }

        const data = await response.json();

        // Get server base URL for proxy
        const serverBase = `${req.protocol}://${req.get('host')}`;

        // Transform results — rewrite download URLs to go through our proxy
        const models = (data.results || []).map((m) => {
            const originalUrl = m.Download || '';
            return {
                id: m.ID || m.Slug || String(Math.random()),
                title: m.Title || 'Untitled',
                author: m.Creator?.Username || m.Author || 'Unknown',
                thumbnail: m.Thumbnail || '',
                downloadUrl: originalUrl ? `${serverBase}/api/poly/model?url=${encodeURIComponent(originalUrl)}` : '',
                originalUrl,
                triCount: m.TriCount || 0,
                license: m.License || 'CC0',
                category: q,
            };
        });

        res.json({ models, total: models.length, query: q });
    } catch (err) {
        console.error('Poly proxy error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
