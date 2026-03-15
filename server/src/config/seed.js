import { Asset } from '../models/index.js';

const defaultAssets = [
    { type: 'sofa', name: 'Modern Sofa', description: 'A sleek modern 3-seater sofa', defaultScale: '{"x":2.2,"y":0.8,"z":0.9}', tags: '["modern","minimal","luxury"]', materialOptions: '["fabric","velvet","leather"]' },
    { type: 'sofa', name: 'L-Shape Sofa', description: 'Spacious L-shaped sectional sofa', defaultScale: '{"x":2.5,"y":0.8,"z":2}', tags: '["modern","luxury"]', materialOptions: '["fabric","velvet","leather"]' },
    { type: 'bed', name: 'Platform Bed', description: 'Low-profile platform bed with headboard', defaultScale: '{"x":1.8,"y":0.8,"z":2.2}', tags: '["modern","minimal"]', materialOptions: '["fabric","wood","velvet"]' },
    { type: 'bed', name: 'King Poster Bed', description: 'Grand king-size poster bed', defaultScale: '{"x":2,"y":1.5,"z":2.4}', tags: '["luxury","indian_contemporary"]', materialOptions: '["wood","velvet","fabric"]' },
    { type: 'table', name: 'Coffee Table', description: 'Rectangular coffee table', defaultScale: '{"x":1.2,"y":0.5,"z":0.6}', tags: '["modern","minimal","boho"]', materialOptions: '["wood","marble","glass","metal"]' },
    { type: 'table', name: 'Dining Table', description: '6-seater dining table', defaultScale: '{"x":1.8,"y":0.8,"z":1}', tags: '["modern","scandinavian"]', materialOptions: '["wood","marble","glass"]' },
    { type: 'table', name: 'Nightstand', description: 'Compact bedside nightstand', defaultScale: '{"x":0.5,"y":0.6,"z":0.4}', tags: '["modern","minimal"]', materialOptions: '["wood","metal"]' },
    { type: 'side_table', name: 'Round Side Table', description: 'Small round accent table', defaultScale: '{"x":0.5,"y":0.5,"z":0.5}', tags: '["modern","boho","scandinavian"]', materialOptions: '["wood","metal","marble"]' },
    { type: 'side_table', name: 'Nesting Tables', description: 'Set of nesting side tables', defaultScale: '{"x":0.6,"y":0.45,"z":0.6}', tags: '["modern","minimal","scandinavian"]', materialOptions: '["wood","metal","glass"]' },
    { type: 'chair', name: 'Dining Chair', description: 'Upholstered dining chair', defaultScale: '{"x":0.6,"y":0.85,"z":0.6}', tags: '["modern","scandinavian","luxury"]', materialOptions: '["fabric","velvet","leather","wood"]' },
    { type: 'chair', name: 'Accent Chair', description: 'Cozy armchair', defaultScale: '{"x":0.8,"y":0.9,"z":0.8}', tags: '["modern","boho","luxury"]', materialOptions: '["fabric","velvet","leather"]' },
    { type: 'almirah', name: 'Wardrobe', description: 'Full-height double-door wardrobe', defaultScale: '{"x":1.2,"y":2.2,"z":0.6}', tags: '["modern","indian_contemporary"]', materialOptions: '["wood","matte_white","matte_black"]' },
    { type: 'bookshelf', name: 'Bookshelf', description: 'Open bookshelf with 5 tiers', defaultScale: '{"x":1,"y":2,"z":0.35}', tags: '["modern","scandinavian","boho"]', materialOptions: '["wood","metal"]' },
    { type: 'lamp', name: 'Floor Lamp', description: 'Tall standing floor lamp', defaultScale: '{"x":0.3,"y":1.6,"z":0.3}', tags: '["modern","minimal","scandinavian"]', materialOptions: '["metal","fabric","wood"]' },
    { type: 'lamp', name: 'Table Lamp', description: 'Compact table lamp with shade', defaultScale: '{"x":0.25,"y":0.5,"z":0.25}', tags: '["modern","luxury","boho"]', materialOptions: '["metal","ceramic","fabric"]' },
    { type: 'pendant_light', name: 'Pendant Light', description: 'Hanging pendant light fixture', defaultScale: '{"x":0.5,"y":0.4,"z":0.5}', tags: '["modern","luxury","scandinavian"]', materialOptions: '["metal","glass","rattan"]' },
    { type: 'pendant_light', name: 'Crystal Chandelier', description: 'Crystal pendant chandelier', defaultScale: '{"x":0.6,"y":0.6,"z":0.6}', tags: '["luxury","indian_contemporary"]', materialOptions: '["gold","metal","glass"]' },
    { type: 'curtain', name: 'Sheer Curtain', description: 'Light sheer window curtain', defaultScale: '{"x":0.05,"y":2.4,"z":1.5}', tags: '["modern","minimal","scandinavian"]', materialOptions: '["linen","fabric"]' },
    { type: 'curtain', name: 'Heavy Drape', description: 'Thick heavy window drape', defaultScale: '{"x":0.1,"y":2.6,"z":1.8}', tags: '["luxury","indian_contemporary"]', materialOptions: '["velvet","silk"]' },
    { type: 'rug', name: 'Area Rug', description: 'Large rectangular area rug', defaultScale: '{"x":2.5,"y":0.05,"z":2}', tags: '["modern","boho","scandinavian"]', materialOptions: '["fabric","jute"]' },
    { type: 'rug', name: 'Round Rug', description: 'Circular accent rug', defaultScale: '{"x":1.5,"y":0.05,"z":1.5}', tags: '["modern","boho"]', materialOptions: '["fabric","jute"]' },
    { type: 'wall_art', name: 'Canvas Print', description: 'Framed canvas wall art', defaultScale: '{"x":1,"y":0.7,"z":0.05}', tags: '["modern","minimal","luxury"]', materialOptions: '["canvas","wood","metal"]' },
    { type: 'wall_art', name: 'Gallery Set', description: 'Set of 3 small art prints', defaultScale: '{"x":1.5,"y":0.6,"z":0.05}', tags: '["modern","scandinavian","boho"]', materialOptions: '["canvas","wood"]' },
    { type: 'plant', name: 'Potted Plant', description: 'Medium potted indoor plant', defaultScale: '{"x":0.5,"y":0.7,"z":0.5}', tags: '["modern","boho","scandinavian","minimal"]', materialOptions: '["ceramic","wood"]' },
    { type: 'plant', name: 'Tall Plant', description: 'Tall floor plant', defaultScale: '{"x":0.6,"y":1,"z":0.6}', tags: '["modern","boho","scandinavian"]', materialOptions: '["ceramic","rattan"]' },
    { type: 'tv', name: 'Flat Screen TV', description: 'Wall-mounted flat screen TV', defaultScale: '{"x":1.2,"y":0.7,"z":0.12}', tags: '["modern","minimal","luxury"]', materialOptions: '["matte_black"]' },
    { type: 'mirror', name: 'Full Mirror', description: 'Full-length standing mirror', defaultScale: '{"x":0.7,"y":1.5,"z":0.05}', tags: '["modern","luxury","scandinavian"]', materialOptions: '["metal","gold","wood"]' },
    { type: 'mirror', name: 'Round Mirror', description: 'Decorative round wall mirror', defaultScale: '{"x":0.8,"y":0.8,"z":0.05}', tags: '["modern","boho","minimal"]', materialOptions: '["metal","gold","wood"]' },
    { type: 'clock', name: 'Wall Clock', description: 'Minimalist wall clock', defaultScale: '{"x":0.6,"y":0.6,"z":0.08}', tags: '["modern","minimal","scandinavian"]', materialOptions: '["wood","metal","matte_black"]' },
];

export async function seedAssets() {
    const count = await Asset.count();
    if (count === 0) {
        await Asset.bulkCreate(defaultAssets);
        console.log(`✅ Seeded ${defaultAssets.length} default assets`);
    }
}
