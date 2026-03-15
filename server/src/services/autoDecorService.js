// Auto-decorate layout generation service
// Generates sensible furniture placement JSON based on room type and style

const roomTemplates = {
    living_room: {
        modern: [
            { type: 'sofa', name: 'Sofa', position: { x: 0, y: 0.4, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2.2, y: 0.8, z: 0.9 }, material: 'fabric', color: '#6B7280' },
            { type: 'table', name: 'Coffee Table', position: { x: 0, y: 0.25, z: -0.3 }, rotation: { y: 0 }, scale: { x: 1.2, y: 0.5, z: 0.6 }, material: 'wood', color: '#D4A574' },
            { type: 'lamp', name: 'Floor Lamp', position: { x: -2, y: 0.8, z: -1.8 }, rotation: { y: 0 }, scale: { x: 0.3, y: 1.6, z: 0.3 }, material: 'metal', color: '#71717A' },
            { type: 'rug', name: 'Area Rug', position: { x: 0, y: 0.02, z: -0.8 }, rotation: { y: 0 }, scale: { x: 2.5, y: 0.05, z: 2 }, material: 'fabric', color: '#9CA3AF' },
            { type: 'wall_art', name: 'Wall Art', position: { x: 0, y: 1.8, z: -2.45 }, rotation: { y: 0 }, scale: { x: 1.2, y: 0.8, z: 0.05 }, material: 'canvas', color: '#4B5563' },
            { type: 'tv', name: 'TV', position: { x: 2.2, y: 1.2, z: -1 }, rotation: { y: -Math.PI / 4 }, scale: { x: 1.2, y: 0.7, z: 0.15 }, material: 'matte_black', color: '#1a1a1a' },
            { type: 'plant', name: 'Plant', position: { x: 2.2, y: 0.35, z: -2 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.7, z: 0.5 }, material: 'ceramic', color: '#E8D5B7' },
            { type: 'side_table', name: 'Side Table', position: { x: -2, y: 0.28, z: -1.2 }, rotation: { y: 0 }, scale: { x: 0.6, y: 0.55, z: 0.6 }, material: 'wood', color: '#A0784C' },
            { type: 'bookshelf', name: 'Bookshelf', position: { x: 2.4, y: 0.9, z: 0.5 }, rotation: { y: -Math.PI / 2 }, scale: { x: 1, y: 1.8, z: 0.4 }, material: 'wood', color: '#A0784C' },
        ],
        luxury: [
            { type: 'sofa', name: 'Velvet Sofa', position: { x: 0, y: 0.45, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2.5, y: 0.9, z: 1 }, material: 'velvet', color: '#1E3A5F' },
            { type: 'table', name: 'Marble Table', position: { x: 0, y: 0.3, z: -0.2 }, rotation: { y: 0 }, scale: { x: 1.4, y: 0.6, z: 0.7 }, material: 'marble', color: '#F0EDE8' },
            { type: 'lamp', name: 'Gold Lamp', position: { x: -2.2, y: 0.9, z: -1.8 }, rotation: { y: 0 }, scale: { x: 0.4, y: 1.8, z: 0.4 }, material: 'gold', color: '#D4AF37' },
            { type: 'rug', name: 'Silk Rug', position: { x: 0, y: 0.02, z: -0.8 }, rotation: { y: 0 }, scale: { x: 3, y: 0.05, z: 2.5 }, material: 'silk', color: '#C5B358' },
            { type: 'curtain', name: 'Velvet Drapes', position: { x: -2.8, y: 1.2, z: 0 }, rotation: { y: Math.PI / 2 }, scale: { x: 1.5, y: 2.4, z: 0.1 }, material: 'velvet', color: '#1E3A5F' },
            { type: 'wall_art', name: 'Gold Frame Art', position: { x: 0, y: 2, z: -2.45 }, rotation: { y: 0 }, scale: { x: 1.5, y: 1, z: 0.05 }, material: 'gold', color: '#2C1810' },
            { type: 'mirror', name: 'Gold Mirror', position: { x: 2.95, y: 1.5, z: -1 }, rotation: { y: -Math.PI / 2 }, scale: { x: 0.8, y: 1.2, z: 0.05 }, material: 'gold', color: '#D4AF37' },
            { type: 'plant', name: 'Plant', position: { x: -2.2, y: 0.35, z: 1.5 }, rotation: { y: 0 }, scale: { x: 0.6, y: 0.8, z: 0.6 }, material: 'ceramic', color: '#F0EDE8' },
            { type: 'pendant_light', name: 'Pendant', position: { x: 0, y: 2.5, z: -0.5 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.6, z: 0.5 }, material: 'gold', color: '#D4AF37' },
        ],
        boho: [
            { type: 'sofa', name: 'Linen Sofa', position: { x: 0, y: 0.35, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2, y: 0.7, z: 0.85 }, material: 'linen', color: '#C4A882' },
            { type: 'table', name: 'Rattan Table', position: { x: 0, y: 0.2, z: -0.4 }, rotation: { y: Math.PI / 6 }, scale: { x: 0.8, y: 0.4, z: 0.8 }, material: 'rattan', color: '#A0784C' },
            { type: 'rug', name: 'Jute Rug', position: { x: 0, y: 0.02, z: -0.8 }, rotation: { y: Math.PI / 12 }, scale: { x: 2.8, y: 0.05, z: 2 }, material: 'jute', color: '#B8860B' },
            { type: 'lamp', name: 'Bamboo Lamp', position: { x: -1.8, y: 0.7, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.35, y: 1.4, z: 0.35 }, material: 'bamboo', color: '#DEB887' },
            { type: 'plant', name: 'Tall Plant', position: { x: 2, y: 0.5, z: -2 }, rotation: { y: 0 }, scale: { x: 0.6, y: 1, z: 0.6 }, material: 'ceramic', color: '#DEB887' },
            { type: 'plant', name: 'Small Plant', position: { x: -1.8, y: 0.3, z: 1 }, rotation: { y: 0 }, scale: { x: 0.4, y: 0.5, z: 0.4 }, material: 'ceramic', color: '#A0784C' },
            { type: 'wall_art', name: 'Macrame', position: { x: -1, y: 1.6, z: -2.45 }, rotation: { y: 0 }, scale: { x: 0.8, y: 0.8, z: 0.05 }, material: 'fabric', color: '#F5DEB3' },
            { type: 'wall_art', name: 'Canvas Art', position: { x: 1, y: 1.8, z: -2.45 }, rotation: { y: 0 }, scale: { x: 0.6, y: 0.9, z: 0.05 }, material: 'canvas', color: '#DEB887' },
            { type: 'bookshelf', name: 'Bookshelf', position: { x: -2.5, y: 0.9, z: -1 }, rotation: { y: Math.PI / 2 }, scale: { x: 0.8, y: 1.8, z: 0.35 }, material: 'wood', color: '#A0784C' },
        ],
        minimal: [
            { type: 'sofa', name: 'Low Sofa', position: { x: 0, y: 0.32, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2, y: 0.65, z: 0.8 }, material: 'linen', color: '#E5E7EB' },
            { type: 'table', name: 'Coffee Table', position: { x: 0, y: 0.2, z: -0.3 }, rotation: { y: 0 }, scale: { x: 0.9, y: 0.4, z: 0.5 }, material: 'light_wood', color: '#D4A574' },
            { type: 'lamp', name: 'Slim Lamp', position: { x: -1.8, y: 0.75, z: -1.8 }, rotation: { y: 0 }, scale: { x: 0.2, y: 1.5, z: 0.2 }, material: 'matte_black', color: '#1A1A1A' },
            { type: 'rug', name: 'White Rug', position: { x: 0, y: 0.02, z: -0.8 }, rotation: { y: 0 }, scale: { x: 2.2, y: 0.05, z: 1.6 }, material: 'fabric', color: '#F3F4F6' },
            { type: 'plant', name: 'Mini Plant', position: { x: 1.8, y: 0.35, z: -2 }, rotation: { y: 0 }, scale: { x: 0.35, y: 0.5, z: 0.35 }, material: 'ceramic', color: '#ECECEC' },
        ],
        scandinavian: [
            { type: 'sofa', name: 'Scandi Sofa', position: { x: 0, y: 0.38, z: -1.4 }, rotation: { y: 0 }, scale: { x: 2, y: 0.75, z: 0.85 }, material: 'linen', color: '#D1D5DB' },
            { type: 'table', name: 'Oak Table', position: { x: 0, y: 0.22, z: -0.2 }, rotation: { y: 0 }, scale: { x: 1, y: 0.45, z: 0.55 }, material: 'light_wood', color: '#D4A574' },
            { type: 'lamp', name: 'Wood Lamp', position: { x: -1.8, y: 0.8, z: -1.6 }, rotation: { y: 0 }, scale: { x: 0.25, y: 1.4, z: 0.25 }, material: 'wood', color: '#D4A574' },
            { type: 'rug', name: 'Wool Rug', position: { x: 0, y: 0.02, z: -0.7 }, rotation: { y: 0 }, scale: { x: 2.4, y: 0.05, z: 1.8 }, material: 'fabric', color: '#E5E7EB' },
            { type: 'plant', name: 'Monstera', position: { x: 2, y: 0.45, z: -2.1 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.8, z: 0.5 }, material: 'ceramic', color: '#ECECEC' },
            { type: 'bookshelf', name: 'Open Shelf', position: { x: -2.4, y: 0.9, z: -0.5 }, rotation: { y: Math.PI / 2 }, scale: { x: 0.8, y: 1.6, z: 0.3 }, material: 'light_wood', color: '#D4A574' },
        ],
        indian_contemporary: [
            { type: 'sofa', name: 'Carved Sofa', position: { x: 0, y: 0.42, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2.2, y: 0.85, z: 0.95 }, material: 'velvet', color: '#8B0000' },
            { type: 'table', name: 'Jali Table', position: { x: 0, y: 0.28, z: -0.3 }, rotation: { y: 0 }, scale: { x: 1.1, y: 0.5, z: 0.6 }, material: 'dark_wood', color: '#3C2415' },
            { type: 'rug', name: 'Dhurrie Rug', position: { x: 0, y: 0.02, z: -0.8 }, rotation: { y: Math.PI / 8 }, scale: { x: 2.5, y: 0.05, z: 2 }, material: 'fabric', color: '#B8860B' },
            { type: 'lamp', name: 'Brass Lamp', position: { x: -2, y: 0.85, z: -1.8 }, rotation: { y: 0 }, scale: { x: 0.35, y: 1.5, z: 0.35 }, material: 'gold', color: '#D4AF37' },
            { type: 'wall_art', name: 'Block Print', position: { x: 0, y: 1.8, z: -2.45 }, rotation: { y: 0 }, scale: { x: 1, y: 0.8, z: 0.05 }, material: 'fabric', color: '#B8860B' },
            { type: 'curtain', name: 'Silk Curtain', position: { x: -2.8, y: 1.2, z: 0 }, rotation: { y: Math.PI / 2 }, scale: { x: 1.5, y: 2.4, z: 0.08 }, material: 'silk', color: '#8B0000' },
            { type: 'mirror', name: 'Ornate Mirror', position: { x: 2.95, y: 1.5, z: -1 }, rotation: { y: -Math.PI / 2 }, scale: { x: 0.7, y: 1.1, z: 0.05 }, material: 'gold', color: '#D4AF37' },
        ],
    },
    bedroom: {
        modern: [
            { type: 'bed', name: 'Platform Bed', position: { x: 0, y: 0.4, z: -1.5 }, rotation: { y: 0 }, scale: { x: 1.8, y: 0.8, z: 2.2 }, material: 'fabric', color: '#E5E7EB' },
            { type: 'side_table', name: 'Nightstand L', position: { x: -1.5, y: 0.28, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.55, y: 0.55, z: 0.55 }, material: 'wood', color: '#A0784C' },
            { type: 'side_table', name: 'Nightstand R', position: { x: 1.5, y: 0.28, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.55, y: 0.55, z: 0.55 }, material: 'wood', color: '#A0784C' },
            { type: 'lamp', name: 'Bedside Lamp', position: { x: -1.5, y: 0.9, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.2, y: 0.5, z: 0.2 }, material: 'metal', color: '#71717A' },
            { type: 'almirah', name: 'Wardrobe', position: { x: 2.3, y: 1, z: -1 }, rotation: { y: 0 }, scale: { x: 1, y: 2, z: 0.6 }, material: 'wood', color: '#78716C' },
            { type: 'rug', name: 'Bedroom Rug', position: { x: 0, y: 0.02, z: -0.3 }, rotation: { y: 0 }, scale: { x: 2, y: 0.05, z: 1.5 }, material: 'fabric', color: '#D1D5DB' },
            { type: 'mirror', name: 'Full Mirror', position: { x: -2.95, y: 1.3, z: -0.5 }, rotation: { y: Math.PI / 2 }, scale: { x: 0.7, y: 1.5, z: 0.05 }, material: 'metal', color: '#71717A' },
            { type: 'plant', name: 'Desk Plant', position: { x: 1.5, y: 0.55, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.3, y: 0.4, z: 0.3 }, material: 'ceramic', color: '#F0EDE8' },
        ],
        luxury: [
            { type: 'bed', name: 'King Bed', position: { x: 0, y: 0.5, z: -1.5 }, rotation: { y: 0 }, scale: { x: 2, y: 1, z: 2.4 }, material: 'velvet', color: '#1E1E2E' },
            { type: 'side_table', name: 'Marble Nightstand L', position: { x: -1.6, y: 0.28, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.6, y: 0.55, z: 0.6 }, material: 'marble', color: '#F0EDE8' },
            { type: 'side_table', name: 'Marble Nightstand R', position: { x: 1.6, y: 0.28, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.6, y: 0.55, z: 0.6 }, material: 'marble', color: '#F0EDE8' },
            { type: 'lamp', name: 'Gold Lamp', position: { x: -1.6, y: 1, z: -1.5 }, rotation: { y: 0 }, scale: { x: 0.25, y: 0.6, z: 0.25 }, material: 'gold', color: '#D4AF37' },
            { type: 'almirah', name: 'Dark Wardrobe', position: { x: 2.3, y: 1.1, z: -1 }, rotation: { y: 0 }, scale: { x: 1.2, y: 2.2, z: 0.65 }, material: 'dark_wood', color: '#3C2415' },
            { type: 'curtain', name: 'Silk Drapes', position: { x: -2.8, y: 1.3, z: 0 }, rotation: { y: Math.PI / 2 }, scale: { x: 1.5, y: 2.4, z: 0.1 }, material: 'silk', color: '#2C1810' },
            { type: 'rug', name: 'Persian Rug', position: { x: 0, y: 0.02, z: -0.3 }, rotation: { y: 0 }, scale: { x: 2.5, y: 0.05, z: 2 }, material: 'silk', color: '#8B0000' },
            { type: 'pendant_light', name: 'Crystal Pendant', position: { x: 0, y: 2.5, z: -1 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.6, z: 0.5 }, material: 'gold', color: '#D4AF37' },
            { type: 'mirror', name: 'Gold Mirror', position: { x: -2.95, y: 1.5, z: -0.5 }, rotation: { y: Math.PI / 2 }, scale: { x: 0.8, y: 1.3, z: 0.05 }, material: 'gold', color: '#D4AF37' },
        ],
    },
    dining_room: {
        modern: [
            { type: 'table', name: 'Dining Table', position: { x: 0, y: 0.4, z: -0.5 }, rotation: { y: 0 }, scale: { x: 1.8, y: 0.8, z: 1 }, material: 'wood', color: '#A0784C' },
            { type: 'chair', name: 'Chair 1', position: { x: -0.6, y: 0.4, z: 0.3 }, rotation: { y: Math.PI }, scale: { x: 0.8, y: 0.85, z: 0.8 }, material: 'fabric', color: '#6B7280' },
            { type: 'chair', name: 'Chair 2', position: { x: 0.6, y: 0.4, z: 0.3 }, rotation: { y: Math.PI }, scale: { x: 0.8, y: 0.85, z: 0.8 }, material: 'fabric', color: '#6B7280' },
            { type: 'chair', name: 'Chair 3', position: { x: -0.6, y: 0.4, z: -1.3 }, rotation: { y: 0 }, scale: { x: 0.8, y: 0.85, z: 0.8 }, material: 'fabric', color: '#6B7280' },
            { type: 'chair', name: 'Chair 4', position: { x: 0.6, y: 0.4, z: -1.3 }, rotation: { y: 0 }, scale: { x: 0.8, y: 0.85, z: 0.8 }, material: 'fabric', color: '#6B7280' },
            { type: 'pendant_light', name: 'Pendant', position: { x: 0, y: 2.5, z: -0.5 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 }, material: 'metal', color: '#1a1a1a' },
            { type: 'rug', name: 'Dining Rug', position: { x: 0, y: 0.02, z: -0.5 }, rotation: { y: 0 }, scale: { x: 2.5, y: 0.05, z: 2 }, material: 'fabric', color: '#D1D5DB' },
            { type: 'wall_art', name: 'Wall Art', position: { x: 0, y: 1.8, z: -2.45 }, rotation: { y: 0 }, scale: { x: 1, y: 0.7, z: 0.05 }, material: 'canvas', color: '#374151' },
            { type: 'plant', name: 'Corner Plant', position: { x: -2.3, y: 0.5, z: -2 }, rotation: { y: 0 }, scale: { x: 0.5, y: 0.8, z: 0.5 }, material: 'ceramic', color: '#E8D5B7' },
        ],
    },
};

export function generateAutoLayout(roomType = 'living_room', style = 'modern') {
    const typeTemplates = roomTemplates[roomType] || roomTemplates.living_room;
    const layout = typeTemplates[style] || typeTemplates.modern || typeTemplates[Object.keys(typeTemplates)[0]];

    return layout.map(item => ({
        ...item,
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        rotation: { x: 0, y: item.rotation?.y || 0, z: 0 },
        position: {
            x: item.position.x + (Math.random() - 0.5) * 0.05,
            y: item.position.y,
            z: item.position.z + (Math.random() - 0.5) * 0.05,
        },
    }));
}
