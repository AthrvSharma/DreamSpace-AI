import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Replicate from 'replicate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.join(__dirname, '..', '..', 'generated');

if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

// Updated models (2026 — working on their respective APIs)
const HF_TEXT2IMG_MODEL = process.env.HF_MODEL || 'stabilityai/stable-diffusion-3.5-large-turbo';
const REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

const USE_REPLICATE = !!REPLICATE_API_TOKEN;
const USE_HF = !!HF_API_KEY;

let replicate = null;
if (USE_REPLICATE) {
    replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
}

/* ── Style configs ── */
const styleConfigs = {
    modern: {
        prompt: 'Interior design photo, modern minimalist room redesign, clean lines, neutral color palette, contemporary furniture, large windows with natural light, sleek finishes, premium textures, architectural digest quality, 8k, photorealistic, ultra detailed',
        negative: 'cartoon, drawing, sketch, low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, text',
        transform: (p) => p.modulate({ brightness: 1.12, saturation: 0.82, hue: 5 }).sharpen({ sigma: 2.5, m1: 1.5, m2: 0.5 }).gamma(1.1).linear(1.05, -8).tint({ r: 195, g: 210, b: 230 }),
    },
    minimal: {
        prompt: 'Interior design photo, minimal Scandinavian room, white walls, light wood floors, sparse elegant furniture, airy open space, abundant natural light, clean aesthetic, soft shadows, 8k, photorealistic, ultra detailed',
        negative: 'cluttered, dark, busy, colorful, cartoon, drawing, low quality, watermark, text',
        transform: (p) => p.modulate({ brightness: 1.3, saturation: 0.55, hue: -5 }).sharpen({ sigma: 1.8, m1: 1, m2: 0.3 }).gamma(0.9).linear(1.08, 10).tint({ r: 245, g: 242, b: 238 }),
    },
    luxury: {
        prompt: 'Interior design photo, luxury opulent room, rich velvet textures, gold accents, marble surfaces, crystal chandelier, warm ambient lighting, deep jewel tones, premium materials, vogue living quality, 8k, photorealistic, ultra detailed',
        negative: 'cheap, plastic, cartoon, drawing, sketch, low quality, blurry, watermark, text',
        transform: (p) => p.modulate({ brightness: 0.92, saturation: 1.35, hue: 15 }).sharpen({ sigma: 1.5, m1: 1.2, m2: 0.8 }).gamma(1.2).linear(1.1, -15).tint({ r: 235, g: 195, b: 150 }),
    },
    boho: {
        prompt: 'Interior design photo, bohemian eclectic room, warm earth tones, woven rattan textures, lush indoor plants, vintage rugs, macrame wall hangings, cozy layered textiles, golden hour lighting, 8k, photorealistic, ultra detailed',
        negative: 'cold, sterile, modern, minimalist, cartoon, drawing, low quality, watermark, text',
        transform: (p) => p.modulate({ brightness: 1.08, saturation: 1.2, hue: 25 }).sharpen({ sigma: 1.2, m1: 0.8, m2: 0.4 }).gamma(1.15).linear(1.02, -5).tint({ r: 225, g: 190, b: 155 }),
    },
    scandinavian: {
        prompt: 'Interior design photo, Scandinavian hygge room, light birch wood, white painted walls, cozy wool textiles, soft muted colors, candles, natural materials, warm inviting atmosphere, 8k, photorealistic, ultra detailed',
        negative: 'dark, heavy, ornate, cluttered, cartoon, drawing, low quality, watermark, text',
        transform: (p) => p.modulate({ brightness: 1.28, saturation: 0.52, hue: -8 }).sharpen({ sigma: 1.6, m1: 0.9, m2: 0.3 }).gamma(0.92).linear(1.06, 8).tint({ r: 238, g: 235, b: 228 }),
    },
    indian_contemporary: {
        prompt: 'Interior design photo, Indian contemporary room, vibrant jewel colors, traditional carved wood furniture, block print textiles, brass accents, modern layout, warm ambient lighting, cultural elegance, 8k, photorealistic, ultra detailed',
        negative: 'western, cold, sterile, cartoon, drawing, sketch, low quality, watermark, text',
        transform: (p) => p.modulate({ brightness: 1.02, saturation: 1.45, hue: 20 }).sharpen({ sigma: 1.8, m1: 1.3, m2: 0.6 }).gamma(1.18).linear(1.08, -12).tint({ r: 230, g: 180, b: 140 }),
    },
};

const roomTypeContext = {
    living_room: 'spacious living room with seating area',
    bedroom: 'cozy bedroom with bed and nightstands',
    dining_room: 'elegant dining room with dining table',
    kitchen: 'modern kitchen with counters and cabinets',
    bathroom: 'clean bathroom with fixtures and tiles',
    office: 'productive home office with desk setup',
};

function buildPrompt(style, customPrompt, roomType) {
    const config = styleConfigs[style] || styleConfigs.modern;
    const roomCtx = roomTypeContext[roomType] || 'interior room';

    if (customPrompt && customPrompt.trim()) {
        return {
            prompt: `Interior design photo of a ${roomCtx}, ${customPrompt.trim()}, ${config.prompt}, masterpiece, best quality`,
            negative: config.negative,
        };
    }
    return {
        prompt: `Redesign this ${roomCtx}, ${config.prompt}, masterpiece, best quality`,
        negative: config.negative,
    };
}

/* ─────────────────────────────────────────────
   Replicate AI — SDXL img2img (best quality)
   ───────────────────────────────────────────── */
async function generateWithReplicate(sourcePath, prompt, negativePrompt) {
    console.log(`🖼️  Calling Replicate SDXL img2img...`);

    const imageBuffer = await fs.promises.readFile(sourcePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const outputUrl = await replicate.run(REPLICATE_MODEL, {
        input: {
            image: base64Image,
            prompt: prompt,
            negative_prompt: negativePrompt,
            prompt_strength: 0.70,
            num_inference_steps: 40,
            guidance_scale: 8.5,
        },
    });

    if (outputUrl && outputUrl.length > 0) {
        const response = await fetch(outputUrl[0]);
        return { buffer: Buffer.from(await response.arrayBuffer()), method: 'replicate_sdxl_img2img' };
    }
    throw new Error('No URL returned from Replicate');
}

/* ─────────────────────────────────────────────
   Hugging Face — Text-to-Image (SD 3.5 Turbo)
   ───────────────────────────────────────────── */
async function generateWithHF(prompt, negativePrompt) {
    console.log(`📝 Using HF text-to-image with model: ${HF_TEXT2IMG_MODEL}`);

    // Try multiple models in order of preference
    const models = [
        HF_TEXT2IMG_MODEL,
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-xl-base-1.0',
    ];

    for (const model of models) {
        try {
            console.log(`   Trying model: ${model}`);
            const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        negative_prompt: negativePrompt,
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                        width: 1024,
                        height: 768,
                    },
                }),
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('image') || contentType.includes('octet-stream')) {
                    console.log(`   ✅ Model ${model} successful`);
                    return { buffer: Buffer.from(await response.arrayBuffer()), method: `hf_${model.split('/').pop()}` };
                }
            }

            const errorText = await response.text();
            console.warn(`   ⚠️ Model ${model} failed (${response.status}): ${errorText.substring(0, 120)}`);

            // If model loading, wait and retry once
            if (response.status === 503) {
                try {
                    const errJson = JSON.parse(errorText);
                    const wait = Math.min(errJson.estimated_time || 20, 60);
                    console.log(`   ⏳ Model loading, waiting ${wait}s...`);
                    await new Promise(r => setTimeout(r, wait * 1000));

                    const retry = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inputs: prompt, parameters: { negative_prompt: negativePrompt, num_inference_steps: 28, guidance_scale: 7.5, width: 1024, height: 768 } }),
                    });

                    if (retry.ok) {
                        const ct = retry.headers.get('content-type') || '';
                        if (ct.includes('image') || ct.includes('octet-stream')) {
                            console.log(`   ✅ Model ${model} retry successful`);
                            return { buffer: Buffer.from(await retry.arrayBuffer()), method: `hf_${model.split('/').pop()}` };
                        }
                    }
                } catch (e) {
                    console.warn(`   ⚠️ Retry failed:`, e.message);
                }
            }
        } catch (err) {
            console.warn(`   ❌ Model ${model} error:`, err.message);
        }
    }

    throw new Error('All HF models failed');
}

/* ─────────────────────────────────────────────
   Sharp Fallback — Enhanced Image Processing
   ───────────────────────────────────────────── */
async function generateWithSharp(sourcePath, config) {
    const metadata = await sharp(sourcePath).metadata();
    const width = Math.min(metadata.width || 1024, 1024);
    const height = Math.min(metadata.height || 768, 768);

    let pipeline = sharp(sourcePath).resize(width, height, { fit: 'inside', withoutEnlargement: true });
    pipeline = config.transform(pipeline);
    pipeline = pipeline.clahe({ width: 4, height: 4 });

    return pipeline.jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toBuffer();
}

/* ─────────────────────────────────────────────
   Main Redesign Function
   Priority: Replicate → HF → Sharp fallback
   ───────────────────────────────────────────── */
export async function generateRedesign(originalImagePath, style, customPrompt = '', roomType = 'living_room') {
    const config = styleConfigs[style] || styleConfigs.modern;
    const filename = `${uuidv4()}.jpg`;
    const outputPath = path.join(generatedDir, filename);
    const sourcePath = path.join(__dirname, '..', '..', originalImagePath.replace(/^\//, ''));
    const { prompt, negative } = buildPrompt(style, customPrompt, roomType);

    let outputBuffer;
    let method = 'enhanced_processing';

    console.log(`\n🤖 AI Redesign Request:`);
    console.log(`   Style: ${style}`);
    console.log(`   Custom prompt: ${customPrompt || '(none)'}`);
    console.log(`   Room type: ${roomType}`);
    console.log(`   Final prompt: ${prompt.substring(0, 120)}...`);

    // Priority 1: Replicate (best quality, img2img preserves room structure)
    if (USE_REPLICATE) {
        try {
            const result = await generateWithReplicate(sourcePath, prompt, negative);
            outputBuffer = result.buffer;
            method = result.method;
            console.log(`✅ Replicate generation successful`);
        } catch (err) {
            console.warn(`⚠️ Replicate failed: ${err.message}`);
        }
    }

    // Priority 2: Hugging Face (text-to-image, tries multiple models)
    if (!outputBuffer && USE_HF) {
        try {
            const result = await generateWithHF(prompt, negative);
            outputBuffer = result.buffer;
            method = result.method;
            console.log(`✅ HF generation successful`);
        } catch (err) {
            console.warn(`⚠️ All HF models failed: ${err.message}`);
        }
    }

    // Priority 3: Sharp fallback (always works, style-based image processing)
    if (!outputBuffer) {
        console.log(`🎨 Falling back to enhanced image processing for "${style}"`);
        outputBuffer = await generateWithSharp(sourcePath, config);
        method = 'enhanced_processing';
    }

    await fs.promises.writeFile(outputPath, outputBuffer);

    return { imageUrl: `/generated/${filename}`, prompt, method };
}
