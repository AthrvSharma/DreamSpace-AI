import { Router } from 'express';

const router = Router();

const POLY_API_KEY = process.env.POLY_PIZZA_API_KEY || '';
const POLY_BASE_URL = 'https://api.poly.pizza/v1.1';

// Simple in-memory cache for GLB downloads (stores last 10 models)
const glbCache = new Map();
const MAX_CACHE_SIZE = 10;

// Proxy GLB model downloads (to bypass CORS) with retry and caching
router.get('/model', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || !url.includes('poly.pizza')) {
            return res.status(400).json({ error: 'Invalid model URL.' });
        }

        // Check cache first
        if (glbCache.has(url)) {
            console.log('📦 GLB from cache:', url.substring(0, 60) + '...');
            const { buffer, timestamp } = glbCache.get(url);
            res.set('Content-Type', 'model/gltf-binary');
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Cache-Control', 'public, max-age=86400');
            res.set('X-Cache', 'HIT');
            return res.send(buffer);
        }

        let lastError;
        const maxRetries = 2;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📦 Fetching GLB (attempt ${attempt}/${maxRetries}): ${url.substring(0, 70)}...`);
                
                // Use fetch with signal for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

                const response = await fetch(url, { 
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn(`⚠️ GLB fetch failed (${response.status})`);
                    if (attempt === maxRetries) {
                        return res.status(response.status).json({ error: 'Failed to fetch model from server.' });
                    }
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }

                console.log('✅ GLB fetched successfully');
                const buffer = Buffer.from(await response.arrayBuffer());
                
                // Cache the result
                glbCache.set(url, { buffer, timestamp: Date.now() });
                if (glbCache.size > MAX_CACHE_SIZE) {
                    const firstKey = glbCache.keys().next().value;
                    glbCache.delete(firstKey);
                }

                res.set('Content-Type', 'model/gltf-binary');
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Cache-Control', 'public, max-age=86400');
                res.set('X-Cache', 'MISS');
                return res.send(buffer);
            } catch (fetchErr) {
                lastError = fetchErr;
                const errorCode = fetchErr.code || fetchErr.name;
                console.error(`⚠️ GLB fetch error (attempt ${attempt}/${maxRetries}): ${errorCode}`);
                
                if (attempt < maxRetries) {
                    const waitTime = Math.min(1000 * attempt, 5000); // Exponential backoff
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
                break;
            }
        }

        // All retries exhausted, or server is blocked.
        console.error('❌ GLB proxy failed after retries. Redirecting client to original URL as fallback.');
        
        // Instead of returning a JSON error (which crashes the frontend GLTF loader expecting a binary file),
        // we redirect the browser to fetch the model directly. Poly Pizza often supports CORS.
        return res.redirect(302, url);
    } catch (err) {
        console.error('❌ GLB proxy error:', err.message);
        res.status(500).json({ error: 'Internal server error.', retry: false });
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
                downloadUrl: originalUrl ? `/api/poly/model?url=${encodeURIComponent(originalUrl)}` : '',
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
