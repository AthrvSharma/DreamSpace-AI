import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.join(__dirname, '..', '..', 'generated');

// Ensure generated directory exists
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_MODEL = process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_IMG2IMG_MODEL = process.env.HF_IMG2IMG_MODEL || 'stabilityai/stable-diffusion-xl-refiner-1.0';
const USE_AI = !!HF_API_KEY;

/* ─────────────────────────────────────────────
   Style configurations with prompts + transforms
   ───────────────────────────────────────────── */
const styleConfigs = {
    modern: {
        prompt: 'Interior design photo, modern minimalist room redesign, clean lines, neutral color palette, contemporary furniture, large windows with natural light, sleek finishes, premium textures, architectural digest quality, 8k, photorealistic, ultra detailed',
        negative: 'cartoon, drawing, sketch, low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 1.12, saturation: 0.82, hue: 5 })
            .sharpen({ sigma: 2.5, m1: 1.5, m2: 0.5 })
            .gamma(1.1)
            .linear(1.05, -8)
            .tint({ r: 195, g: 210, b: 230 }),
    },
    minimal: {
        prompt: 'Interior design photo, minimal Scandinavian room, white walls, light wood floors, sparse elegant furniture, airy open space, abundant natural light, clean aesthetic, soft shadows, 8k, photorealistic, ultra detailed',
        negative: 'cluttered, dark, busy, colorful, cartoon, drawing, low quality, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 1.3, saturation: 0.55, hue: -5 })
            .sharpen({ sigma: 1.8, m1: 1, m2: 0.3 })
            .gamma(0.9)
            .linear(1.08, 10)
            .tint({ r: 245, g: 242, b: 238 }),
    },
    luxury: {
        prompt: 'Interior design photo, luxury opulent room, rich velvet textures, gold accents, marble surfaces, crystal chandelier, warm ambient lighting, deep jewel tones, premium materials, vogue living quality, 8k, photorealistic, ultra detailed',
        negative: 'cheap, plastic, cartoon, drawing, sketch, low quality, blurry, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 0.92, saturation: 1.35, hue: 15 })
            .sharpen({ sigma: 1.5, m1: 1.2, m2: 0.8 })
            .gamma(1.2)
            .linear(1.1, -15)
            .tint({ r: 235, g: 195, b: 150 }),
    },
    boho: {
        prompt: 'Interior design photo, bohemian eclectic room, warm earth tones, woven rattan textures, lush indoor plants, vintage rugs, macrame wall hangings, cozy layered textiles, golden hour lighting, 8k, photorealistic, ultra detailed',
        negative: 'cold, sterile, modern, minimalist, cartoon, drawing, low quality, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 1.08, saturation: 1.2, hue: 25 })
            .sharpen({ sigma: 1.2, m1: 0.8, m2: 0.4 })
            .gamma(1.15)
            .linear(1.02, -5)
            .tint({ r: 225, g: 190, b: 155 }),
    },
    scandinavian: {
        prompt: 'Interior design photo, Scandinavian hygge room, light birch wood, white painted walls, cozy wool textiles, soft muted colors, candles, natural materials, warm inviting atmosphere, 8k, photorealistic, ultra detailed',
        negative: 'dark, heavy, ornate, cluttered, cartoon, drawing, low quality, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 1.28, saturation: 0.52, hue: -8 })
            .sharpen({ sigma: 1.6, m1: 0.9, m2: 0.3 })
            .gamma(0.92)
            .linear(1.06, 8)
            .tint({ r: 238, g: 235, b: 228 }),
    },
    indian_contemporary: {
        prompt: 'Interior design photo, Indian contemporary room, vibrant jewel colors, traditional carved wood furniture, block print textiles, brass accents, modern layout, warm ambient lighting, cultural elegance, 8k, photorealistic, ultra detailed',
        negative: 'western, cold, sterile, cartoon, drawing, sketch, low quality, watermark, text',
        transform: (pipeline) => pipeline
            .modulate({ brightness: 1.02, saturation: 1.45, hue: 20 })
            .sharpen({ sigma: 1.8, m1: 1.3, m2: 0.6 })
            .gamma(1.18)
            .linear(1.08, -12)
            .tint({ r: 230, g: 180, b: 140 }),
    },
};

/* ─────────────────────────────────────────────
   Room type context for better prompts
   ───────────────────────────────────────────── */
const roomTypeContext = {
    living_room: 'spacious living room with seating area',
    bedroom: 'cozy bedroom with bed and nightstands',
    dining_room: 'elegant dining room with dining table',
    kitchen: 'modern kitchen with counters and cabinets',
    bathroom: 'clean bathroom with fixtures and tiles',
    office: 'productive home office with desk setup',
};

/* ─────────────────────────────────────────────
   Build the final prompt from style + custom input
   ───────────────────────────────────────────── */
function buildPrompt(style, customPrompt, roomType) {
    const config = styleConfigs[style] || styleConfigs.modern;
    const roomCtx = roomTypeContext[roomType] || 'interior room';

    // If user provides a custom prompt, merge it with the style's base prompt
    if (customPrompt && customPrompt.trim()) {
        return {
            prompt: `Interior design photo of a ${roomCtx}, ${customPrompt.trim()}, ${config.prompt}, masterpiece, best quality`,
            negative: config.negative,
        };
    }

    // Style-only prompt with room context
    return {
        prompt: `Redesign this ${roomCtx}, ${config.prompt}, masterpiece, best quality`,
        negative: config.negative,
    };
}

/* ─────────────────────────────────────────────
   Hugging Face AI — True Image-to-Image
   Sends the actual room image + prompt so the AI
   transforms the room while preserving its structure
   ───────────────────────────────────────────── */
async function generateImg2Img(sourceImageBuffer, prompt, negativePrompt) {
    console.log(`🖼️  Attempting img2img with model: ${HF_IMG2IMG_MODEL}`);

    // The HF Inference API img2img expects the image as raw bytes
    // with prompt and parameters in query or as multipart
    // For the inference API, we send base64 in the inputs field
    const base64Image = sourceImageBuffer.toString('base64');

    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_IMG2IMG_MODEL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: base64Image,
            parameters: {
                prompt: prompt,
                negative_prompt: negativePrompt,
                num_inference_steps: 40,
                guidance_scale: 8.5,
                strength: 0.65, // 0.65 = transform significantly but keep room structure
            },
        }),
    });

    if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('image') || contentType.includes('octet-stream')) {
            console.log('✅ img2img generation successful');
            return { buffer: Buffer.from(await response.arrayBuffer()), method: 'huggingface_img2img' };
        }
    }

    // If img2img fails (model not available), fall through
    const errorText = await response.text();
    console.warn(`⚠️ img2img failed (${response.status}), trying text-to-image fallback...`, errorText.substring(0, 200));

    // If 503 (model loading), wait and retry once
    if (response.status === 503) {
        try {
            const errorJson = JSON.parse(errorText);
            const waitTime = Math.min(errorJson.estimated_time || 20, 60);
            console.log(`⏳ Model loading, waiting ${waitTime}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

            const retryResponse = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_IMG2IMG_MODEL}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: base64Image,
                    parameters: {
                        prompt: prompt,
                        negative_prompt: negativePrompt,
                        num_inference_steps: 35,
                        guidance_scale: 8.5,
                        strength: 0.65,
                    },
                }),
            });

            if (retryResponse.ok) {
                const ct = retryResponse.headers.get('content-type') || '';
                if (ct.includes('image') || ct.includes('octet-stream')) {
                    console.log('✅ img2img retry successful');
                    return { buffer: Buffer.from(await retryResponse.arrayBuffer()), method: 'huggingface_img2img' };
                }
            }
        } catch (e) {
            console.warn('⚠️ img2img retry failed:', e.message);
        }
    }

    return null; // Signal to try text-to-image fallback
}

/* ─────────────────────────────────────────────
   Hugging Face AI — Text-to-Image Fallback
   Used when img2img model is unavailable
   ───────────────────────────────────────────── */
async function generateTextToImage(prompt, negativePrompt) {
    console.log(`📝 Using text-to-image with model: ${HF_MODEL}`);

    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                negative_prompt: negativePrompt,
                num_inference_steps: 35,
                guidance_scale: 8.5,
                width: 1024,
                height: 768,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('HF text-to-image error:', response.status, errorText.substring(0, 200));

        // If model is loading, wait and retry once
        if (response.status === 503) {
            try {
                const errorJson = JSON.parse(errorText);
                const waitTime = Math.min(errorJson.estimated_time || 20, 60);
                console.log(`⏳ Model loading, waiting ${waitTime}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

                const retryResponse = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
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
                            guidance_scale: 8.5,
                            width: 1024,
                            height: 768,
                        },
                    }),
                });

                if (retryResponse.ok) {
                    return { buffer: Buffer.from(await retryResponse.arrayBuffer()), method: 'huggingface_text2img' };
                }
            } catch (e) {
                console.warn('⚠️ text-to-image retry failed:', e.message);
            }
        }

        throw new Error(`HF API error: ${response.status}`);
    }

    return { buffer: Buffer.from(await response.arrayBuffer()), method: 'huggingface_text2img' };
}

/* ─────────────────────────────────────────────
   Enhanced Sharp-based Fallback Processing
   Creates a dramatically different-looking result
   ───────────────────────────────────────────── */
async function generateWithSharp(sourcePath, config) {
    const metadata = await sharp(sourcePath).metadata();
    const width = Math.min(metadata.width || 1024, 1024);
    const height = Math.min(metadata.height || 768, 768);

    // Base pipeline with resize
    let pipeline = sharp(sourcePath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true });

    // Apply the style-specific multi-stage transform
    pipeline = config.transform(pipeline);

    // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for local contrast
    pipeline = pipeline.clahe({ width: 4, height: 4 });

    return pipeline.jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toBuffer();
}

/* ─────────────────────────────────────────────
   Main redesign function — supports custom prompts
   ───────────────────────────────────────────── */
export async function generateRedesign(originalImagePath, style, customPrompt = '', roomType = 'living_room') {
    const config = styleConfigs[style] || styleConfigs.modern;
    const filename = `${uuidv4()}.jpg`;
    const outputPath = path.join(generatedDir, filename);

    // Resolve the source path
    const sourcePath = path.join(__dirname, '..', '..', originalImagePath.replace(/^\//, ''));

    // Build the prompt (merges style + custom prompt + room context)
    const { prompt, negative } = buildPrompt(style, customPrompt, roomType);

    let outputBuffer;
    let method = 'enhanced_processing';
    let usedPrompt = prompt;

    if (USE_AI) {
        try {
            console.log(`\n🤖 AI Redesign Request:`);
            console.log(`   Style: ${style}`);
            console.log(`   Custom prompt: ${customPrompt || '(none)'}`);
            console.log(`   Room type: ${roomType}`);
            console.log(`   Final prompt: ${prompt.substring(0, 120)}...`);

            // Step 1: Prepare the source image
            const sourceBuffer = await sharp(sourcePath)
                .resize(1024, 768, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();

            // Step 2: Try img2img first (preserves room structure)
            const img2imgResult = await generateImg2Img(sourceBuffer, prompt, negative);

            if (img2imgResult) {
                outputBuffer = img2imgResult.buffer;
                method = img2imgResult.method;
            } else {
                // Step 3: Fall back to text-to-image
                const t2iResult = await generateTextToImage(prompt, negative);
                outputBuffer = t2iResult.buffer;
                method = t2iResult.method;
            }

            console.log(`✅ AI generation successful (method: ${method})`);
        } catch (err) {
            console.warn('⚠️ All AI methods failed, falling back to enhanced processing:', err.message);
            outputBuffer = await generateWithSharp(sourcePath, config);
            method = 'enhanced_processing_fallback';
        }
    } else {
        console.log(`🎨 Using enhanced image processing for "${style}" redesign (set HUGGINGFACE_API_KEY for AI)`);
        outputBuffer = await generateWithSharp(sourcePath, config);
    }

    // Write output
    await fs.promises.writeFile(outputPath, outputBuffer);

    return {
        imageUrl: `/generated/${filename}`,
        prompt: usedPrompt,
        method,
    };
}
