import * as THREE from 'three';
import { useState, useEffect } from 'react';

const MATERIAL_COLORS = {
    wood: '#A0784C', dark_wood: '#3C2415', light_wood: '#D4A574',
    fabric: '#7C8693', velvet: '#1E3A5F', leather: '#5C3317',
    marble: '#F0EDE8', metal: '#71717A', gold: '#D4AF37',
    glass: '#B0C4DE', rattan: '#A0784C', bamboo: '#DEB887',
    ceramic: '#E8D5B7', linen: '#C4A882', silk: '#C5B358',
    jute: '#B8860B', matte_black: '#1A1A1A', matte_white: '#ECECEC',
    default: '#8A8F97',
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

export { MATERIAL_COLORS, DEFAULT_SCALES, DEFAULT_Y };

export function getMaterialProps(item) {
    const color = item.color || MATERIAL_COLORS[item.material] || MATERIAL_COLORS.default;
    if (item.material === 'metal' || item.material === 'gold') return { color, metalness: 0.75, roughness: 0.28 };
    if (item.material === 'glass') return { color, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.7 };
    if (item.material === 'marble') return { color, metalness: 0.05, roughness: 0.35 };
    return { color, metalness: 0.08, roughness: 0.7 };
}

export function FurniturePrimitive({ item }) {
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
        case 'rug':
            return (<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.9, 1.35]} /><meshStandardMaterial {...mat} roughness={0.92} metalness={0.02} /></mesh>);
        case 'tv':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1.2, 0.72, 0.06]} /><meshStandardMaterial color="#121212" roughness={0.35} /></mesh>
                    <mesh position={[0, 0, 0.032]}><boxGeometry args={[1.12, 0.64, 0.01]} /><meshStandardMaterial color="#22293A" metalness={0.1} roughness={0.14} /></mesh>
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
        case 'almirah': case 'bookshelf':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.9, 1.5, 0.38]} /><meshStandardMaterial {...mat} /></mesh>
                    <mesh position={[0, 0.03, 0.2]}><boxGeometry args={[0.84, 1.35, 0.02]} /><meshStandardMaterial color={dark} roughness={0.66} metalness={0.08} /></mesh>
                </group>
            );
        case 'wall_art':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.92, 0.64, 0.05]} /><meshStandardMaterial color="#282828" roughness={0.58} /></mesh>
                    <mesh position={[0, 0, 0.026]}><boxGeometry args={[0.82, 0.54, 0.012]} /><meshStandardMaterial {...mat} /></mesh>
                </group>
            );
        case 'mirror':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.84, 1.25, 0.05]} /><meshStandardMaterial color="#C8A96E" metalness={0.75} roughness={0.3} /></mesh>
                    <mesh position={[0, 0, 0.028]}><boxGeometry args={[0.72, 1.13, 0.012]} /><meshStandardMaterial color="#D7E5F0" metalness={0.88} roughness={0.06} /></mesh>
                </group>
            );
        case 'curtain':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[1, 1.9, 0.03]} /><meshStandardMaterial {...mat} transparent opacity={0.88} side={THREE.DoubleSide} /></mesh>
                    <mesh position={[0, 0.98, 0]} castShadow><boxGeometry args={[1.1, 0.03, 0.05]} /><meshStandardMaterial color="#777" metalness={0.55} roughness={0.35} /></mesh>
                </group>
            );
        case 'side_table':
            return (
                <group>
                    <mesh castShadow><boxGeometry args={[0.5, 0.06, 0.5]} /><meshStandardMaterial {...mat} /></mesh>
                    {[[-0.2, -0.13, -0.2], [0.2, -0.13, -0.2], [-0.2, -0.13, 0.2], [0.2, -0.13, 0.2]].map((p, i) => (
                        <mesh key={i} position={p} castShadow><cylinderGeometry args={[0.015, 0.018, 0.32, 10]} /><meshStandardMaterial color={dark} roughness={0.55} metalness={0.1} /></mesh>
                    ))}
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

export function GLBModel({ url, item }) {
    const [loadedScene, setLoadedScene] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!url) { setStatus('error'); return; }
        setStatus('loading');
        setLoadedScene(null);

        import('three-stdlib').then(({ GLTFLoader, DRACOLoader }) => {
            const loader = new GLTFLoader();
            const draco = new DRACOLoader();
            draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            loader.setDRACOLoader(draco);
            loader.load(url, (gltf) => {
                const scene = gltf.scene;
                scene.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
                const box = new THREE.Box3().setFromObject(scene);
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) { scene.scale.setScalar(1.2 / maxDim); }
                const centeredBox = new THREE.Box3().setFromObject(scene);
                const center = new THREE.Vector3();
                centeredBox.getCenter(center);
                scene.position.sub(center);
                scene.position.y = -centeredBox.min.y;
                setLoadedScene(scene);
                setStatus('loaded');
            }, undefined, () => setStatus('error'));
        }).catch(() => setStatus('error'));
    }, [url]);

    if (status !== 'loaded' || !loadedScene) return <FurniturePrimitive item={item} />;
    return <primitive object={loadedScene} />;
}
