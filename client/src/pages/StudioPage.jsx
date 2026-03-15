import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Grid, Html, OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import {
    ArrowLeft, Box, ChevronRight, Copy, Download, Eye, Grid3X3, Lamp, Maximize,
    Monitor, Move, Palette, RotateCcw, Save, Search, Sofa, Sparkles, Trash2,
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import useToastStore from '../store/toastStore';
import { assetsAPI, layoutsAPI, roomsAPI, polyAPI } from '../api/client';

/* ══════════════════════════════════════════════════════
   CONSTANTS & CONFIGS
   ══════════════════════════════════════════════════════ */
const DEFAULT_ROOM = { width: 8, height: 3.2, depth: 6 };
const DEFAULT_STYLE = 'modern';

const STYLE_OPTIONS = [
    { id: 'modern', label: 'Modern' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'boho', label: 'Boho' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'scandinavian', label: 'Scandinavian' },
    { id: 'indian_contemporary', label: 'Indian Contemporary' },
];

const MATERIAL_COLORS = {
    wood: '#A0784C', dark_wood: '#3C2415', light_wood: '#D4A574',
    fabric: '#7C8693', velvet: '#1E3A5F', leather: '#5C3317',
    marble: '#F0EDE8', metal: '#71717A', gold: '#D4AF37',
    glass: '#B0C4DE', rattan: '#A0784C', bamboo: '#DEB887',
    ceramic: '#E8D5B7', linen: '#C4A882', silk: '#C5B358',
    jute: '#B8860B', matte_black: '#1A1A1A', matte_white: '#ECECEC',
    default: '#8A8F97',
};

const COLOR_CHOICES = [
    '#6B7280', '#A0784C', '#3C2415', '#1E3A5F', '#D4AF37',
    '#B8860B', '#E8D5B7', '#ECECEC', '#1A1A1A', '#4B5563',
];

/* ── Categorized Product Catalog ───────────────── */
const CATALOG_CATEGORIES = [
    {
        id: 'furniture',
        name: 'Furniture',
        icon: '🛋️',
        description: 'Sofas, chairs, tables & more',
        subcategories: [
            { id: 'upholstered', name: 'Upholstered Furniture', icon: '🛋️', types: ['sofa'] },
            { id: 'chairs', name: 'Chairs & Benches', icon: '🪑', types: ['chair'] },
            { id: 'tables', name: 'Tables', icon: '🪵', types: ['table', 'side_table'] },
            { id: 'beds', name: 'Beds', icon: '🛏️', types: ['bed'] },
            { id: 'cabinets', name: 'Cabinets & Shelves', icon: '📚', types: ['almirah', 'bookshelf'] },
        ],
    },
    {
        id: 'lighting',
        name: 'Lighting',
        icon: '💡',
        description: 'Lamps & light fixtures',
        subcategories: [
            { id: 'floor_lamps', name: 'Floor Lamps', icon: '🪔', types: ['lamp', 'floor_lamp'] },
            { id: 'pendant_lights', name: 'Pendant Lights', icon: '💡', types: ['pendant_light'] },
        ],
    },
    {
        id: 'decor',
        name: 'Decor',
        icon: '🎨',
        description: 'Art, plants & accessories',
        subcategories: [
            { id: 'wall_decor', name: 'Wall Art & Mirrors', icon: '🖼️', types: ['wall_art', 'mirror', 'clock'] },
            { id: 'plants', name: 'Plants', icon: '🪴', types: ['plant'] },
            { id: 'rugs', name: 'Rugs & Carpets', icon: '🧶', types: ['rug'] },
        ],
    },
    {
        id: 'textiles',
        name: 'Textiles',
        icon: '🪟',
        description: 'Curtains & fabrics',
        subcategories: [
            { id: 'curtains', name: 'Curtains', icon: '🪟', types: ['curtain'] },
        ],
    },
    {
        id: 'electronics',
        name: 'Electronics',
        icon: '📺',
        description: 'TV, audio & gadgets',
        subcategories: [
            { id: 'tv_audio', name: 'TV & Audio', icon: '📺', types: ['tv'] },
        ],
    },
];

const SUBCATEGORY_SEARCH_TERMS = {
    upholstered: 'sofa couch',
    chairs: 'chair armchair',
    tables: 'table dining table',
    beds: 'bed bedroom',
    cabinets: 'cabinet shelf bookshelf',
    floor_lamps: 'floor lamp',
    pendant_lights: 'pendant light chandelier',
    wall_decor: 'painting frame wall art',
    plants: 'plant pot indoor plant',
    rugs: 'rug carpet',
    curtains: 'curtain drape',
    tv_audio: 'television TV monitor',
};

const DEFAULT_SCALES = {
    sofa: { x: 1.5, y: 0.8, z: 0.9 }, bed: { x: 1.6, y: 0.8, z: 1.8 },
    table: { x: 1.1, y: 0.5, z: 0.7 }, side_table: { x: 0.6, y: 0.5, z: 0.6 },
    chair: { x: 0.7, y: 0.8, z: 0.7 }, almirah: { x: 1.1, y: 2, z: 0.6 },
    bookshelf: { x: 0.9, y: 1.8, z: 0.4 }, lamp: { x: 0.4, y: 1.5, z: 0.4 },
    floor_lamp: { x: 0.4, y: 1.5, z: 0.4 }, pendant_light: { x: 0.5, y: 0.6, z: 0.5 },
    curtain: { x: 1.4, y: 2.2, z: 0.08 }, rug: { x: 2.2, y: 0.05, z: 1.7 },
    wall_art: { x: 1, y: 0.8, z: 0.06 }, plant: { x: 0.6, y: 0.8, z: 0.6 },
    tv: { x: 1.2, y: 0.8, z: 0.12 }, mirror: { x: 0.9, y: 1.4, z: 0.06 },
    clock: { x: 0.6, y: 0.6, z: 0.1 },
};

const DEFAULT_Y = {
    sofa: 0.4, bed: 0.45, table: 0.28, side_table: 0.28, chair: 0.35,
    almirah: 1, bookshelf: 0.95, lamp: 0.75, floor_lamp: 0.75, pendant_light: 2.5,
    curtain: 1.2, rug: 0.02, wall_art: 1.8, plant: 0.35, tv: 1.2, mirror: 1.5, clock: 2,
};

const ASSET_ICONS = {
    sofa: '🛋️', bed: '🛏️', table: '🪵', side_table: '🪑', chair: '🪑',
    almirah: '🚪', bookshelf: '📚', lamp: '💡', floor_lamp: '💡', pendant_light: '💡',
    curtain: '🪟', rug: '🧶', wall_art: '🖼️', plant: '🪴', tv: '📺', mirror: '🪞', clock: '🕒',
};

/* ══════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════ */
function uid(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function safeParseLayout(layoutJson) {
    if (Array.isArray(layoutJson)) return layoutJson;
    if (typeof layoutJson === 'string') {
        try { const parsed = JSON.parse(layoutJson); return Array.isArray(parsed) ? parsed : []; }
        catch { return []; }
    }
    return [];
}

function normalizeRotation(r) {
    return { x: Number(r?.x) || 0, y: Number(r?.y) || 0, z: Number(r?.z) || 0 };
}

function normalizeVector3(v, fallback) {
    return { x: Number(v?.x) || fallback.x, y: Number(v?.y) || fallback.y, z: Number(v?.z) || fallback.z };
}

function normalizeItem(raw, idx = 0) {
    const type = raw?.type || 'table';
    const fallbackScale = DEFAULT_SCALES[type] || { x: 1, y: 1, z: 1 };
    const fallbackPos = { x: -1 + (idx % 4) * 0.7, y: DEFAULT_Y[type] || 0.3, z: -0.8 + Math.floor(idx / 4) * 0.6 };

    return {
        id: raw?.id || uid(type), type,
        name: raw?.name || type.replace(/_/g, ' '),
        material: raw?.material || 'wood',
        color: raw?.color || MATERIAL_COLORS[raw?.material] || MATERIAL_COLORS.default,
        position: normalizeVector3(raw?.position, fallbackPos),
        rotation: normalizeRotation(raw?.rotation),
        scale: normalizeVector3(raw?.scale, fallbackScale),
        modelUrl: raw?.modelUrl || '',
        thumbnailUrl: raw?.thumbnailUrl || '',
    };
}

function makeItemFromAsset(asset, index = 0) {
    const type = asset?.type || 'table';
    const scale = normalizeVector3(asset?.defaultScale, DEFAULT_SCALES[type] || { x: 1, y: 1, z: 1 });
    const material = Array.isArray(asset?.materialOptions) && asset.materialOptions[0] ? asset.materialOptions[0] : 'wood';

    return normalizeItem({
        id: uid(type), type, name: asset?.name || type, material,
        color: MATERIAL_COLORS[material] || MATERIAL_COLORS.default, scale,
        position: { x: -1.2 + (index % 4) * 0.8, y: DEFAULT_Y[type] || 0.3, z: -0.7 + Math.floor(index / 4) * 0.7 },
        rotation: { x: 0, y: 0, z: 0 },
    }, index);
}

function exportLayout(items) {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `roomforge-layout-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    a.click(); URL.revokeObjectURL(url);
}

function getMaterialProps(item) {
    const color = item.color || MATERIAL_COLORS[item.material] || MATERIAL_COLORS.default;
    if (item.material === 'metal' || item.material === 'gold') return { color, metalness: 0.75, roughness: 0.28 };
    if (item.material === 'glass') return { color, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.7 };
    if (item.material === 'marble') return { color, metalness: 0.05, roughness: 0.35 };
    return { color, metalness: 0.08, roughness: 0.7 };
}

/* ══════════════════════════════════════════════════════
   3D FURNITURE PRIMITIVES
   ══════════════════════════════════════════════════════ */
function FurniturePrimitive({ item }) {
    const mat = getMaterialProps(item);
    const dark = new THREE.Color(mat.color).offsetHSL(0, 0, -0.12).getStyle();

    switch (item.type) {
        case 'sofa':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1, 0.35, 0.55]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0.25, -0.22]} castShadow><boxGeometry args={[1, 0.35, 0.08]} /><meshStandardMaterial color={dark} roughness={0.82} metalness={0.03} /></mesh>
                    <mesh position={[-0.47, 0.1, 0]} castShadow><boxGeometry args={[0.06, 0.35, 0.55]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0.47, 0.1, 0]} castShadow><boxGeometry args={[0.06, 0.35, 0.55]} /><meshStandardMaterial {...mat} /></mesh>
                </group>
            );
        case 'bed':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1.1, 0.22, 1.4]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0.18, 0]} castShadow><boxGeometry args={[1.04, 0.12, 1.34]} /><meshStandardMaterial color="#ECE8E1" roughness={0.9} metalness={0.02} /></mesh>
                    <mesh position={[0, 0.35, -0.66]} castShadow><boxGeometry args={[1.14, 0.42, 0.08]} /><meshStandardMaterial color={dark} roughness={0.6} metalness={0.12} /></mesh>
                </group>
            );
        case 'table':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1, 0.07, 0.62]} /><meshStandardMaterial {...mat} /></mesh>
                    {[[-0.44, -0.24, -0.25], [0.44, -0.24, -0.25], [-0.44, -0.24, 0.25], [0.44, -0.24, 0.25]].map((p, i) => (
                        <mesh key={i} position={p} castShadow><boxGeometry args={[0.05, 0.45, 0.05]} /><meshStandardMaterial color={dark} roughness={0.62} metalness={0.08} /></mesh>
                    ))}
                </group>
            );
        case 'side_table':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.5, 0.06, 0.5]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, -0.17, 0]} castShadow><boxGeometry args={[0.42, 0.03, 0.42]} /><meshStandardMaterial color={dark} roughness={0.65} metalness={0.08} /></mesh>
                    {[[-0.2, -0.13, -0.2], [0.2, -0.13, -0.2], [-0.2, -0.13, 0.2], [0.2, -0.13, 0.2]].map((p, i) => (
                        <mesh key={i} position={p} castShadow><cylinderGeometry args={[0.015, 0.018, 0.32, 10]} /><meshStandardMaterial color={dark} roughness={0.55} metalness={0.1} /></mesh>
                    ))}
                </group>
            );
        case 'chair':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.48, 0.06, 0.48]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0.26, -0.2]} castShadow><boxGeometry args={[0.48, 0.48, 0.05]} /><meshStandardMaterial color={dark} roughness={0.72} metalness={0.06} /></mesh>
                    {[[-0.2, -0.2, -0.2], [0.2, -0.2, -0.2], [-0.2, -0.2, 0.2], [0.2, -0.2, 0.2]].map((p, i) => (
                        <mesh key={i} position={p} castShadow><cylinderGeometry args={[0.015, 0.018, 0.4, 10]} /><meshStandardMaterial color={dark} roughness={0.56} metalness={0.08} /></mesh>
                    ))}
                </group>
            );
        case 'almirah': case 'bookshelf':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.9, 1.5, 0.38]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0.03, 0.2]}><boxGeometry args={[0.84, 1.35, 0.02]} /><meshStandardMaterial color={dark} roughness={0.66} metalness={0.08} /></mesh>
                </group>
            );
        case 'rug':
            return (<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.9, 1.35]} /><meshStandardMaterial {...mat} roughness={0.92} metalness={0.02} /></mesh>);
        case 'wall_art':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.92, 0.64, 0.05]} /><meshStandardMaterial color="#282828" roughness={0.58} /></mesh>
                    <mesh position={[0, 0, 0.026]}><boxGeometry args={[0.82, 0.54, 0.012]} /><meshStandardMaterial {...mat} /></mesh>
                </group>
            );
        case 'curtain':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1, 1.9, 0.03]} /><meshStandardMaterial {...mat} transparent opacity={0.88} side={THREE.DoubleSide} /></mesh>
                    <mesh position={[0, 0.98, 0]} castShadow><boxGeometry args={[1.1, 0.03, 0.05]} /><meshStandardMaterial color="#777" metalness={0.55} roughness={0.35} /></mesh>
                </group>
            );
        case 'pendant_light':
            return (
                <group>
                    <mesh><cylinderGeometry args={[0.005, 0.005, 0.28, 8]} /><meshStandardMaterial color="#757575" metalness={0.8} roughness={0.25} /></mesh>
                    <mesh position={[0, -0.18, 0]} castShadow><cylinderGeometry args={[0.18, 0.08, 0.24, 22]} /><meshStandardMaterial {...mat} /></mesh>
                    <pointLight position={[0, -0.26, 0]} intensity={0.25} distance={3} color="#FFE9B6" />
                </group>
            );
        case 'lamp': case 'floor_lamp':
            return (
                <group>
                    <mesh position={[0, -0.5, 0]} castShadow><cylinderGeometry args={[0.16, 0.13, 0.05, 20]} /><meshStandardMaterial color="#656565" metalness={0.65} roughness={0.34} /></mesh>
                    <mesh castShadow><cylinderGeometry args={[0.015, 0.015, 1, 12]} /><meshStandardMaterial color="#7A7A7A" metalness={0.6} roughness={0.32} /></mesh>
                    <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.22, 0.12, 0.32, 22]} /><meshStandardMaterial {...mat} /></mesh>
                </group>
            );
        case 'plant':
            return (
                <group>
                    <mesh position={[0, -0.2, 0]} castShadow><cylinderGeometry args={[0.12, 0.09, 0.18, 14]} /><meshStandardMaterial color="#D2B48C" roughness={0.7} /></mesh>
                    <mesh position={[0, 0.04, 0]} castShadow><sphereGeometry args={[0.22, 14, 14]} /><meshStandardMaterial color="#3F8A42" roughness={0.86} /></mesh>
                </group>
            );
        case 'tv':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1.2, 0.72, 0.06]} /><meshStandardMaterial color="#121212" roughness={0.35} /></mesh>
                    <mesh position={[0, 0, 0.032]}><boxGeometry args={[1.12, 0.64, 0.01]} /><meshStandardMaterial color="#22293A" metalness={0.1} roughness={0.14} /></mesh>
                </group>
            );
        case 'mirror':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.84, 1.25, 0.05]} /><meshStandardMaterial color="#C8A96E" metalness={0.75} roughness={0.3} /></mesh>
                    <mesh position={[0, 0, 0.028]}><boxGeometry args={[0.72, 1.13, 0.012]} /><meshStandardMaterial color="#D7E5F0" metalness={0.88} roughness={0.06} /></mesh>
                </group>
            );
        case 'clock':
            return (
                <group>
                    <mesh castShadow><cylinderGeometry args={[0.3, 0.3, 0.06, 28]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0, 0.033]}><cylinderGeometry args={[0.25, 0.25, 0.012, 24]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#F4EFE5" roughness={0.82} /></mesh>
                </group>
            );
        default:
            return (<mesh castShadow><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial {...mat} /></mesh>);
    }
}

/* ══════════════════════════════════════════════════════
   3D SCENE COMPONENTS
   ══════════════════════════════════════════════════════ */
function RoomShell({ onBackgroundClick, showGrid, roomDims }) {
    return (
        <group onClick={onBackgroundClick}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[roomDims.width, roomDims.depth]} />
                <meshStandardMaterial color="#F5F1EA" roughness={0.95} />
            </mesh>
            <mesh position={[0, roomDims.height / 2, -roomDims.depth / 2]} receiveShadow>
                <planeGeometry args={[roomDims.width, roomDims.height]} />
                <meshStandardMaterial color="#EEE7DC" side={THREE.DoubleSide} roughness={0.9} />
            </mesh>
            <mesh position={[-roomDims.width / 2, roomDims.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[roomDims.depth, roomDims.height]} />
                <meshStandardMaterial color="#F0E9DF" side={THREE.DoubleSide} roughness={0.92} />
            </mesh>
            <mesh position={[roomDims.width / 2, roomDims.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[roomDims.depth, roomDims.height]} />
                <meshStandardMaterial color="#F0E9DF" side={THREE.DoubleSide} roughness={0.92} />
            </mesh>
            {showGrid && (
                <Grid position={[0, 0.01, 0]} args={[roomDims.width, roomDims.depth]}
                    cellColor="#B9B3A8" sectionColor="#9D9588" cellSize={0.5}
                    cellThickness={0.6} sectionSize={2} sectionThickness={1}
                    fadeDistance={20} infiniteGrid={false} />
            )}
            <ContactShadows position={[0, 0.01, 0]} opacity={0.32} scale={12} blur={1.8} far={3.2} />
        </group>
    );
}

function clampToRoom(pos, roomDims) {
    const halfW = roomDims.width / 2 - 0.1;
    const halfD = roomDims.depth / 2 - 0.1;
    return {
        x: Math.max(-halfW, Math.min(halfW, pos.x)),
        y: Math.max(0, Math.min(roomDims.height, pos.y)),
        z: Math.max(-halfD, Math.min(halfD, pos.z)),
    };
}

/* ── GLB Model Loader (imperative for reliable error handling) ──────── */
function GLBModel({ url, item }) {
    const [loadedScene, setLoadedScene] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

    useEffect(() => {
        if (!url) { setStatus('error'); return; }

        setStatus('loading');
        setLoadedScene(null);

        // Use imperative loading via Three.js GLTFLoader for proper error callbacks
        import('three-stdlib').then(({ GLTFLoader, DRACOLoader }) => {
            const loader = new GLTFLoader();
            const draco = new DRACOLoader();
            draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            loader.setDRACOLoader(draco);

            loader.load(
                url,
                (gltf) => {
                    const scene = gltf.scene;
                    // Enable shadows
                    scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Auto-scale to reasonable size based on bounding box
                    const box = new THREE.Box3().setFromObject(scene);
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                        const targetSize = 1.2; // normalize to ~1.2 units
                        const scaleFactor = targetSize / maxDim;
                        scene.scale.setScalar(scaleFactor);
                    }

                    // Center the model
                    const centeredBox = new THREE.Box3().setFromObject(scene);
                    const center = new THREE.Vector3();
                    centeredBox.getCenter(center);
                    scene.position.sub(center);
                    scene.position.y = -centeredBox.min.y; // sit on ground

                    setLoadedScene(scene);
                    setStatus('loaded');
                },
                undefined, // progress
                (err) => {
                    console.warn('GLB load failed:', url, err?.message || err);
                    setStatus('error');
                }
            );
        }).catch(() => {
            setStatus('error');
        });
    }, [url]);

    if (status === 'error') return <FurniturePrimitive item={item} />;
    if (status === 'loading' || !loadedScene) return <FurniturePrimitive item={item} />;

    return <primitive object={loadedScene} />;
}

function SceneItem({ item, selected, onSelect, onSetRef }) {
    const groupRef = useRef();
    useEffect(() => { if (selected && groupRef.current) onSetRef(groupRef.current); }, [selected, onSetRef]);

    return (
        <group ref={groupRef}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
            onPointerDown={(e) => e.stopPropagation()}>
            {item.modelUrl ? (
                <GLBModel url={item.modelUrl} item={item} />
            ) : (
                <FurniturePrimitive item={item} />
            )}
            {selected && (
                <Html position={[0, 0.8, 0]} center distanceFactor={8}>
                    <div style={{ fontSize: 11, background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                        {item.name}
                    </div>
                </Html>
            )}
        </group>
    );
}

function SceneTransformControls({ selectedObj, transformMode, onChange, selectedItemId, orbitRef, roomDims }) {
    const controlRef = useRef();

    useEffect(() => {
        if (!controlRef.current || !selectedObj) return undefined;
        const controls = controlRef.current;

        const onDragging = (event) => { if (orbitRef.current) orbitRef.current.enabled = !event.value; };
        const onObjectChange = () => {
            const obj = selectedObj;
            const clampedPos = clampToRoom(obj.position, roomDims);
            obj.position.set(clampedPos.x, clampedPos.y, clampedPos.z);
            onChange(selectedItemId, {
                position: { x: clampedPos.x, y: clampedPos.y, z: clampedPos.z },
                rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                scale: { x: Math.abs(obj.scale.x), y: Math.abs(obj.scale.y), z: Math.abs(obj.scale.z) },
            });
        };

        controls.addEventListener('dragging-changed', onDragging);
        controls.addEventListener('objectChange', onObjectChange);
        return () => {
            controls.removeEventListener('dragging-changed', onDragging);
            controls.removeEventListener('objectChange', onObjectChange);
            if (orbitRef.current) orbitRef.current.enabled = true;
        };
    }, [selectedObj, selectedItemId, onChange, orbitRef, roomDims]);

    if (!selectedObj) return null;
    return <TransformControls ref={controlRef} object={selectedObj} mode={transformMode} size={0.75} />;
}

/* ── Camera Controller for 2D/3D Toggle ──────── */
function CameraController({ is2D, roomDims }) {
    const { camera } = useThree();

    useEffect(() => {
        if (is2D) {
            const maxDim = Math.max(roomDims.width, roomDims.depth);
            camera.position.set(0, maxDim * 1.2, 0.01);
            camera.lookAt(0, 0, 0);
        } else {
            camera.position.set(5.5, 4.4, 6.5);
            camera.lookAt(0, 0.7, 0);
        }
        camera.updateProjectionMatrix();
    }, [is2D, camera, roomDims]);

    return null;
}

function StudioScene({ items, selectedItemId, transformMode, onSelect, onChange, onClearSelection, showGrid, is2D, roomDims }) {
    const orbitRef = useRef();
    const [selectedObj, setSelectedObj] = useState(null);

    useEffect(() => { if (!selectedItemId) setSelectedObj(null); }, [selectedItemId]);
    const handleSetRef = useMemo(() => (obj) => setSelectedObj(obj), []);

    return (
        <Canvas camera={{ position: [5.5, 4.4, 6.5], fov: 42 }} shadows gl={{ antialias: true }} onPointerMissed={onClearSelection}>
            <color attach="background" args={["#F5F1EA"]} />
            <ambientLight intensity={0.65} />
            <directionalLight position={[4, 7, 4]} intensity={0.95} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-5, 4, -2]} intensity={0.3} />

            <Suspense fallback={null}><Environment preset="apartment" /></Suspense>

            <CameraController is2D={is2D} roomDims={roomDims} />
            <RoomShell onBackgroundClick={onClearSelection} showGrid={showGrid} roomDims={roomDims} />

            {items.map((item) => (
                <SceneItem key={item.id} item={item} selected={selectedItemId === item.id} onSelect={onSelect} onSetRef={handleSetRef} />
            ))}

            <SceneTransformControls selectedObj={selectedObj} transformMode={transformMode} onChange={onChange} selectedItemId={selectedItemId} orbitRef={orbitRef} roomDims={roomDims} />
            <OrbitControls ref={orbitRef} enableDamping dampingFactor={0.08} minDistance={2.5} maxDistance={15}
                minPolarAngle={is2D ? Math.PI / 2 - 0.01 : 0.25} maxPolarAngle={Math.PI / 2.05} target={[0, 0.7, 0]} />
        </Canvas>
    );
}

/* ══════════════════════════════════════════════════════
   CATEGORY BROWSER COMPONENT
   ══════════════════════════════════════════════════════ */
function CategoryBrowser({ assets, onAddAsset, onAddPolyModel, searchQuery, onSearchChange }) {
    const [navPath, setNavPath] = useState([]);
    const [polyModels, setPolyModels] = useState([]);
    const [polyLoading, setPolyLoading] = useState(false);
    const [polyError, setPolyError] = useState('');
    const [polySearchResults, setPolySearchResults] = useState([]);
    const [polySearchLoading, setPolySearchLoading] = useState(false);

    const currentCategory = navPath.length >= 1 ? CATALOG_CATEGORIES.find(c => c.id === navPath[0]) : null;
    const currentSubcategory = navPath.length >= 2 && currentCategory
        ? currentCategory.subcategories.find(s => s.id === navPath[1]) : null;

    // Count assets per type
    const assetCountByType = useMemo(() => {
        const counts = {};
        assets.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1; });
        return counts;
    }, [assets]);

    const getCategoryCount = (cat) => cat.subcategories.reduce((total, sub) => total + sub.types.reduce((t, type) => t + (assetCountByType[type] || 0), 0), 0);
    const getSubcategoryCount = (sub) => sub.types.reduce((t, type) => t + (assetCountByType[type] || 0), 0);

    // Fetch Poly.pizza models when entering a subcategory
    useEffect(() => {
        if (!currentSubcategory) { setPolyModels([]); return; }
        const query = SUBCATEGORY_SEARCH_TERMS[currentSubcategory.id] || currentSubcategory.name;
        setPolyLoading(true);
        setPolyError('');
        polyAPI.search(query, 20)
            .then(data => { setPolyModels(data.models || []); })
            .catch(err => {
                console.warn('Poly.pizza fetch failed:', err.message);
                setPolyError(err.message);
                setPolyModels([]);
            })
            .finally(() => setPolyLoading(false));
    }, [currentSubcategory]);

    // Search with Poly.pizza API
    useEffect(() => {
        if (!searchQuery.trim()) { setPolySearchResults([]); return; }
        const timeout = setTimeout(() => {
            setPolySearchLoading(true);
            polyAPI.search(searchQuery, 20)
                .then(data => setPolySearchResults(data.models || []))
                .catch(() => setPolySearchResults([]))
                .finally(() => setPolySearchLoading(false));
        }, 500); // debounce
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Local search results (from seeded assets)
    const localSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const q = searchQuery.toLowerCase();
        return assets.filter(a => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    }, [searchQuery, assets]);

    // Build breadcrumb
    const breadcrumb = useMemo(() => {
        const parts = [{ label: 'Products', onClick: () => setNavPath([]) }];
        if (currentCategory) parts.push({ label: currentCategory.name, onClick: () => setNavPath([currentCategory.id]) });
        if (currentSubcategory) parts.push({ label: currentSubcategory.name, onClick: () => { } });
        return parts;
    }, [currentCategory, currentSubcategory]);

    // Local items at leaf level
    const leafAssets = useMemo(() => {
        if (!currentSubcategory) return [];
        return assets.filter(a => currentSubcategory.types.includes(a.type));
    }, [currentSubcategory, assets]);

    return (
        <div className="catalog-browser">
            {/* Search Bar */}
            <div className="catalog-search">
                <Search size={14} />
                <input type="text" placeholder="Search 3D models..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="catalog-search-input" />
            </div>

            {/* Search Results */}
            {searchQuery.trim() ? (
                <div className="catalog-section">
                    <div className="catalog-breadcrumb">
                        <span className="crumb-link" onClick={() => onSearchChange('')}>Products</span>
                        <ChevronRight size={12} />
                        <span className="crumb-current">Search: "{searchQuery}"</span>
                    </div>

                    {/* Poly.pizza results */}
                    {polySearchLoading ? (
                        <div className="catalog-loading"><div className="spinner" style={{ width: 20, height: 20 }} /> Searching 3D models...</div>
                    ) : polySearchResults.length > 0 ? (
                        <div className="poly-models-grid">
                            {polySearchResults.map(model => (
                                <button key={model.id} className="poly-model-card" onClick={() => onAddPolyModel(model, currentSubcategory?.types?.[0] || 'table')}>
                                    {model.thumbnail ? (
                                        <img src={model.thumbnail} alt={model.title} className="poly-model-thumb" loading="lazy" />
                                    ) : (
                                        <div className="poly-model-thumb-placeholder">📦</div>
                                    )}
                                    <div className="poly-model-info">
                                        <span className="poly-model-name">{model.title}</span>
                                        <span className="poly-model-author">by {model.author}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="catalog-empty">No 3D models found for "{searchQuery}"</div>
                    )}
                </div>
            ) : (
                <div className="catalog-section">
                    {/* Breadcrumb */}
                    <div className="catalog-breadcrumb">
                        {breadcrumb.map((b, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {i > 0 && <ChevronRight size={12} />}
                                {i === breadcrumb.length - 1
                                    ? <span className="crumb-current">{b.label}</span>
                                    : <span className="crumb-link" onClick={b.onClick}>{b.label}</span>
                                }
                            </span>
                        ))}
                    </div>

                    {/* Back button */}
                    {navPath.length > 0 && (
                        <button className="catalog-back-btn" onClick={() => setNavPath(navPath.slice(0, -1))}>
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>
                    )}

                    {/* Top-level categories */}
                    {navPath.length === 0 && (
                        <div className="catalog-grid">
                            {CATALOG_CATEGORIES.map(cat => (
                                <button key={cat.id} className="catalog-category-card" onClick={() => setNavPath([cat.id])}>
                                    <span className="catalog-card-icon">{cat.icon}</span>
                                    <div className="catalog-card-info">
                                        <span className="catalog-card-name">{cat.name}</span>
                                        <span className="catalog-card-count">{getCategoryCount(cat)} items</span>
                                    </div>
                                    <ChevronRight size={14} className="catalog-card-arrow" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Subcategories */}
                    {navPath.length === 1 && currentCategory && (
                        <div className="catalog-grid">
                            {currentCategory.subcategories.map(sub => (
                                <button key={sub.id} className="catalog-category-card" onClick={() => setNavPath([currentCategory.id, sub.id])}>
                                    <span className="catalog-card-icon">{sub.icon}</span>
                                    <div className="catalog-card-info">
                                        <span className="catalog-card-name">{sub.name}</span>
                                        <span className="catalog-card-count">{getSubcategoryCount(sub)} items</span>
                                    </div>
                                    <ChevronRight size={14} className="catalog-card-arrow" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Leaf-level: Poly.pizza models only */}
                    {navPath.length === 2 && (
                        <>
                            {polyLoading ? (
                                <div className="catalog-loading"><div className="spinner" style={{ width: 20, height: 20 }} /> Loading 3D models...</div>
                            ) : polyError ? (
                                <div className="catalog-empty">{polyError.includes('API key') ? 'Add POLY_PIZZA_API_KEY to .env for 3D models' : 'Could not load models'}</div>
                            ) : polyModels.length > 0 ? (
                                <div className="poly-models-grid">
                                    {polyModels.map(model => (
                                        <button key={model.id} className="poly-model-card" onClick={() => onAddPolyModel(model, currentSubcategory?.types?.[0] || 'table')}>
                                            {model.thumbnail ? (
                                                <img src={model.thumbnail} alt={model.title} className="poly-model-thumb" loading="lazy" />
                                            ) : (
                                                <div className="poly-model-thumb-placeholder">📦</div>
                                            )}
                                            <div className="poly-model-info">
                                                <span className="poly-model-name">{model.title}</span>
                                                <span className="poly-model-author">by {model.author}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="catalog-empty">No 3D models found</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN STUDIO PAGE
   ══════════════════════════════════════════════════════ */
export default function StudioPage() {
    const { roomId } = useParams();
    const addToast = useToastStore((s) => s.addToast);

    const {
        items, selectedItemId, transformMode,
        addItem, removeItem, updateItem, selectItem,
        clearSelection, setTransformMode, loadLayout, clearScene, getLayoutJson,
    } = useStudioStore();

    const [assets, setAssets] = useState([]);
    const [layouts, setLayouts] = useState([]);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingLayouts, setLoadingLayouts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [autoDecorating, setAutoDecorating] = useState(false);
    const [style, setStyle] = useState(DEFAULT_STYLE);
    const [showGrid, setShowGrid] = useState(true);
    const [is2D, setIs2D] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarTab, setSidebarTab] = useState('catalog'); // 'catalog' | 'properties' | 'layouts'
    const [roomDims, setRoomDims] = useState(DEFAULT_ROOM);

    const selectedItem = useMemo(() => items.find((item) => item.id === selectedItemId) || null, [items, selectedItemId]);

    // Auto-switch to properties tab when item selected
    useEffect(() => {
        if (selectedItem) setSidebarTab('properties');
    }, [selectedItem]);

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            switch (e.key.toLowerCase()) {
                case 'g': setTransformMode('translate'); break;
                case 'r': setTransformMode('rotate'); break;
                case 's':
                    if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); setTransformMode('scale'); }
                    break;
                case 'delete': case 'backspace':
                    if (selectedItemId) { removeItem(selectedItemId); addToast('Item removed'); }
                    break;
                case 'escape': clearSelection(); break;
                case 'd':
                    if ((e.metaKey || e.ctrlKey) && selectedItem) {
                        e.preventDefault();
                        const clone = normalizeItem({ ...selectedItem, id: uid(selectedItem.type), position: { x: selectedItem.position.x + 0.35, y: selectedItem.position.y, z: selectedItem.position.z + 0.35 } }, items.length);
                        addItem(clone); selectItem(clone.id);
                    }
                    break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, selectedItem, items.length, setTransformMode, removeItem, clearSelection, addItem, selectItem, addToast]);

    /* ── Load assets ── */
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const assetData = await assetsAPI.list();
                if (active) setAssets(assetData.assets || []);
            } catch (err) { addToast(err.message || 'Failed to load assets', 'error'); }
            finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [addToast]);

    /* ── Load room data ── */
    useEffect(() => {
        let active = true;
        (async () => {
            if (!roomId) { setLayouts([]); return; }
            setLoadingLayouts(true);
            try {
                const [roomRes, layoutsRes] = await Promise.all([
                    roomsAPI.get(roomId).catch(() => null), layoutsAPI.list(roomId),
                ]);
                if (!active) return;
                setRoom(roomRes?.room || null);
                const fetchedLayouts = layoutsRes?.layouts || [];
                setLayouts(fetchedLayouts);
                if (fetchedLayouts.length > 0) {
                    const latest = fetchedLayouts[0];
                    const parsed = safeParseLayout(latest.layoutJson).map((item, idx) => normalizeItem(item, idx));
                    if (parsed.length > 0) loadLayout(parsed);
                }
            } catch (err) { if (active) addToast(err.message || 'Failed to load room layouts', 'error'); }
            finally { if (active) setLoadingLayouts(false); }
        })();
        return () => { active = false; };
    }, [roomId, loadLayout, addToast]);

    const addAssetToScene = useCallback((asset) => {
        const newItem = makeItemFromAsset(asset, items.length);
        addItem(newItem); selectItem(newItem.id);
    }, [items.length, addItem, selectItem]);

    const addPolyModelToScene = useCallback((model, fallbackType = 'table') => {
        const type = fallbackType;
        const scale = DEFAULT_SCALES[type] || { x: 1, y: 1, z: 1 };
        const newItem = normalizeItem({
            id: uid(type), type, name: model.title || 'Poly Model',
            material: 'default',
            color: MATERIAL_COLORS.default,
            scale,
            position: { x: -1.2 + (items.length % 4) * 0.8, y: DEFAULT_Y[type] || 0.3, z: -0.7 + Math.floor(items.length / 4) * 0.7 },
            rotation: { x: 0, y: 0, z: 0 },
            modelUrl: model.downloadUrl || '',
            thumbnailUrl: model.thumbnail || '',
        }, items.length);
        addItem(newItem); selectItem(newItem.id);
    }, [items.length, addItem, selectItem]);

    const duplicateSelected = () => {
        if (!selectedItem) return;
        const clone = normalizeItem({ ...selectedItem, id: uid(selectedItem.type), position: { x: selectedItem.position.x + 0.35, y: selectedItem.position.y, z: selectedItem.position.z + 0.35 } }, items.length);
        addItem(clone); selectItem(clone.id);
    };

    const deleteSelected = () => { if (!selectedItemId) return; removeItem(selectedItemId); addToast('Item removed'); };

    const saveCurrentLayout = async () => {
        if (!roomId) { addToast('Open studio from a room to save layouts', 'error'); return; }
        if (items.length === 0) { addToast('Add at least one item before saving', 'error'); return; }
        setSaving(true);
        try {
            await layoutsAPI.save(roomId, { name: `Layout ${new Date().toLocaleString()}`, style, layoutJson: getLayoutJson() });
            const refreshed = await layoutsAPI.list(roomId);
            setLayouts(refreshed?.layouts || []);
            addToast('Layout saved');
        } catch (err) { addToast(err.message || 'Failed to save layout', 'error'); }
        finally { setSaving(false); }
    };

    const runAutoDecorate = async () => {
        if (!roomId) { addToast('Open studio from a room to auto-decorate', 'error'); return; }
        setAutoDecorating(true);
        try {
            const data = await layoutsAPI.autoDecorate(roomId, style);
            const parsed = safeParseLayout(data?.layout?.layoutJson).map((item, idx) => normalizeItem(item, idx));
            if (parsed.length === 0) { addToast('Auto-decorate returned empty layout', 'error'); return; }
            loadLayout(parsed); clearSelection();
            const refreshed = await layoutsAPI.list(roomId);
            setLayouts(refreshed?.layouts || []);
            addToast('Auto-decorate complete');
        } catch (err) { addToast(err.message || 'Auto-decorate failed', 'error'); }
        finally { setAutoDecorating(false); }
    };

    const loadSavedLayout = (layout) => {
        const parsed = safeParseLayout(layout.layoutJson).map((item, idx) => normalizeItem(item, idx));
        if (parsed.length === 0) { addToast('Selected layout has no usable items', 'error'); return; }
        loadLayout(parsed); clearSelection();
        addToast(`Loaded: ${layout.name || 'layout'}`);
    };

    return (
        <div className="studio-layout">
            {/* ═══ VIEWPORT ═══ */}
            <div className="studio-viewport">
                {/* Top toolbar */}
                <div className="studio-toolbar">
                    <div className="toolbar-group">
                        <span className="toolbar-label">Transform</span>
                        <button className={`toolbar-btn ${transformMode === 'translate' ? 'active' : ''}`} title="Move (G)" onClick={() => setTransformMode('translate')}><Move size={16} /></button>
                        <button className={`toolbar-btn ${transformMode === 'rotate' ? 'active' : ''}`} title="Rotate (R)" onClick={() => setTransformMode('rotate')}><RotateCcw size={16} /></button>
                        <button className={`toolbar-btn ${transformMode === 'scale' ? 'active' : ''}`} title="Scale (S)" onClick={() => setTransformMode('scale')}><Maximize size={16} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                        <span className="toolbar-label">Edit</span>
                        <button className="toolbar-btn" title="Duplicate (⌘D)" onClick={duplicateSelected} disabled={!selectedItem}><Copy size={16} /></button>
                        <button className="toolbar-btn danger" title="Delete (Del)" onClick={deleteSelected} disabled={!selectedItem}><Trash2 size={16} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                        <span className="toolbar-label">View</span>
                        <button className={`toolbar-btn ${showGrid ? 'active' : ''}`} title="Toggle Grid" onClick={() => setShowGrid(v => !v)}><Grid3X3 size={16} /></button>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                        <span className="toolbar-label">File</span>
                        <button className="toolbar-btn" title="Export JSON" onClick={() => exportLayout(getLayoutJson())}><Download size={16} /></button>
                        <button className="toolbar-btn save" title="Save Layout" onClick={saveCurrentLayout} disabled={saving || !roomId}><Save size={16} /></button>
                    </div>
                </div>

                {/* 2D/3D Toggle + Info Overlay */}
                <div className="studio-view-toggle">
                    <button className={`view-toggle-btn ${!is2D ? 'active' : ''}`} onClick={() => setIs2D(false)}>3D</button>
                    <button className={`view-toggle-btn ${is2D ? 'active' : ''}`} onClick={() => setIs2D(true)}>2D</button>
                </div>

                {/* Scene item count */}
                <div className="studio-info-bar">
                    <span className="info-badge"><Box size={12} /> {items.length} items</span>
                    <span className="info-badge">{roomDims.width}m × {roomDims.depth}m</span>
                </div>

                <StudioScene items={items} selectedItemId={selectedItemId} transformMode={transformMode}
                    onSelect={selectItem} onChange={updateItem} onClearSelection={clearSelection}
                    showGrid={showGrid} is2D={is2D} roomDims={roomDims} />
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <aside className="studio-sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    <h3>Studio</h3>
                    <p className="sidebar-room-name">{room ? room.title || room.name || 'Untitled Room' : 'No room linked'}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                        {roomId && <Link to={`/room/${roomId}`} className="btn btn-ghost btn-sm">Room</Link>}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="sidebar-tabs">
                    <button className={`sidebar-tab ${sidebarTab === 'catalog' ? 'active' : ''}`} onClick={() => setSidebarTab('catalog')}>
                        <Sofa size={14} /> Catalog
                    </button>
                    <button className={`sidebar-tab ${sidebarTab === 'properties' ? 'active' : ''}`} onClick={() => setSidebarTab('properties')}>
                        <Palette size={14} /> Properties
                    </button>
                    <button className={`sidebar-tab ${sidebarTab === 'layouts' ? 'active' : ''}`} onClick={() => setSidebarTab('layouts')}>
                        <Lamp size={14} /> Layouts
                    </button>
                </div>

                {/* Tab Content */}
                <div className="sidebar-tab-content">
                    {/* ── Catalog Tab ── */}
                    {sidebarTab === 'catalog' && (
                        <>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><div className="spinner" /></div>
                            ) : (
                                <CategoryBrowser assets={assets} onAddAsset={addAssetToScene} onAddPolyModel={addPolyModelToScene} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                            )}
                        </>
                    )}

                    {/* ── Properties Tab ── */}
                    {sidebarTab === 'properties' && (
                        <div className="properties-panel">
                            {/* Auto Decorate */}
                            <div className="sidebar-section">
                                <h4>Auto Decorate</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                                    <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
                                        {STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                    </select>
                                    <button className="btn btn-olive" onClick={runAutoDecorate} disabled={autoDecorating || !roomId}><Sparkles size={16} /></button>
                                </div>
                                <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={clearScene}>Clear Scene</button>
                            </div>

                            {/* Room Dimensions */}
                            <div className="sidebar-section">
                                <h4>Room Dimensions</h4>
                                <div className="dimension-control">
                                    <label>Width: <strong>{roomDims.width}m</strong></label>
                                    <input type="range" min="4" max="16" step="0.5" value={roomDims.width}
                                        onChange={(e) => setRoomDims(d => ({ ...d, width: parseFloat(e.target.value) }))} />
                                </div>
                                <div className="dimension-control">
                                    <label>Depth: <strong>{roomDims.depth}m</strong></label>
                                    <input type="range" min="4" max="16" step="0.5" value={roomDims.depth}
                                        onChange={(e) => setRoomDims(d => ({ ...d, depth: parseFloat(e.target.value) }))} />
                                </div>
                                <div className="dimension-control">
                                    <label>Height: <strong>{roomDims.height}m</strong></label>
                                    <input type="range" min="2.4" max="5" step="0.2" value={roomDims.height}
                                        onChange={(e) => setRoomDims(d => ({ ...d, height: parseFloat(e.target.value) }))} />
                                </div>
                            </div>

                            {/* Selected Item Properties */}
                            <div className="sidebar-section">
                                <h4>Selected Item</h4>
                                {!selectedItem ? (
                                    <p className="sidebar-muted">Click an item in the scene to select it.</p>
                                ) : (
                                    <>
                                        <p className="selected-item-name">
                                            {ASSET_ICONS[selectedItem.type] || '📦'} {selectedItem.name}
                                            <span className="selected-item-type">{selectedItem.type}</span>
                                        </p>

                                        <div className="property-field">
                                            <label>Material</label>
                                            <select className="input" value={selectedItem.material}
                                                onChange={(e) => {
                                                    const material = e.target.value;
                                                    updateItem(selectedItem.id, { material, color: MATERIAL_COLORS[material] || selectedItem.color });
                                                }}>
                                                {Object.keys(MATERIAL_COLORS).filter(k => k !== 'default').map(m => (
                                                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="property-field">
                                            <label>Color</label>
                                            <div className="color-picker-row">
                                                {COLOR_CHOICES.map(color => (
                                                    <button key={color} className={`color-dot ${selectedItem.color === color ? 'active' : ''}`}
                                                        style={{ background: color }} title={color}
                                                        onClick={() => updateItem(selectedItem.id, { color })} />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Layouts Tab ── */}
                    {sidebarTab === 'layouts' && (
                        <div className="layouts-panel">
                            <div className="sidebar-section">
                                <h4>Saved Layouts</h4>
                                {loadingLayouts ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}><div className="spinner" /></div>
                                ) : layouts.length === 0 ? (
                                    <p className="sidebar-muted">No saved layouts yet.</p>
                                ) : (
                                    <div className="layouts-list">
                                        {layouts.map(layout => (
                                            <button key={layout.id} className="layout-item" onClick={() => loadSavedLayout(layout)}>
                                                <span className="layout-icon">📐</span>
                                                <span className="layout-name">{layout.name || 'Untitled Layout'}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Scene Items List */}
                            <div className="sidebar-section">
                                <h4>Scene Items ({items.length})</h4>
                                {items.length === 0 ? (
                                    <p className="sidebar-muted">No items in scene. Add from Catalog.</p>
                                ) : (
                                    <div className="scene-items-list">
                                        {items.map(item => (
                                            <button key={item.id}
                                                className={`scene-item-row ${selectedItemId === item.id ? 'active' : ''}`}
                                                onClick={() => selectItem(item.id)}>
                                                <span>{ASSET_ICONS[item.type] || '📦'}</span>
                                                <span className="scene-item-name">{item.name}</span>
                                                <button className="scene-item-delete" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
