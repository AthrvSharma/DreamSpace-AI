import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
    ArrowLeft, Camera, CameraOff, FlipHorizontal, Trash2, RotateCcw,
    Download, Smartphone, Move, ZoomIn, ChevronDown, X,
    Plus, Minus, Video, Search, Copy, Palette, Eye, Sparkles,
    RotateCw, Maximize2, Grid3X3, SunMedium
} from 'lucide-react';
import { FurniturePrimitive, GLBModel, MATERIAL_COLORS, DEFAULT_SCALES, DEFAULT_Y } from '../components/FurniturePrimitives';
import { polyAPI } from '../api/client';
import '../ar-styles.css';

/* ═══════════════════ CONSTANTS ═══════════════════ */
const SUBCATEGORY_SEARCH = {
    seating: 'sofa couch', tables: 'table dining', bedroom: 'bed bedroom',
    lighting: 'floor lamp chandelier', decor: 'plant vase indoor', electronics: 'television monitor',
};

const AR_CATALOG = [
    { id: 'seating', name: 'Seating', icon: '🛋️', defaultType: 'sofa', items: [
        { type: 'sofa', name: 'Sofa', icon: '🛋️' }, { type: 'chair', name: 'Chair', icon: '🪑' },
    ]},
    { id: 'tables', name: 'Tables', icon: '🪵', defaultType: 'table', items: [
        { type: 'table', name: 'Table', icon: '🪵' }, { type: 'side_table', name: 'Side Table', icon: '🪑' },
    ]},
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️', defaultType: 'bed', items: [
        { type: 'bed', name: 'Bed', icon: '🛏️' }, { type: 'almirah', name: 'Wardrobe', icon: '🚪' },
    ]},
    { id: 'lighting', name: 'Lighting', icon: '💡', defaultType: 'lamp', items: [
        { type: 'lamp', name: 'Floor Lamp', icon: '💡' }, { type: 'pendant_light', name: 'Pendant', icon: '💡' },
    ]},
    { id: 'decor', name: 'Decor', icon: '🎨', defaultType: 'plant', items: [
        { type: 'plant', name: 'Plant', icon: '🪴' }, { type: 'rug', name: 'Rug', icon: '🧶' },
        { type: 'wall_art', name: 'Wall Art', icon: '🖼️' }, { type: 'mirror', name: 'Mirror', icon: '🪞' },
    ]},
    { id: 'electronics', name: 'Electronics', icon: '📺', defaultType: 'tv', items: [
        { type: 'tv', name: 'TV', icon: '📺' }, { type: 'bookshelf', name: 'Bookshelf', icon: '📚' },
    ]},
];

const COLOR_CHOICES = ['#6B7280','#A0784C','#3C2415','#1E3A5F','#D4AF37','#B8860B','#E8D5B7','#ECECEC','#1A1A1A','#4B5563','#3F8A42','#C45B4A'];

function uid() { return `ar_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

function createItem(type, pos = { x: 0, z: 0 }) {
    const scale = DEFAULT_SCALES[type] || { x: 1, y: 1, z: 1 };
    return {
        id: uid(), type, name: type.replace(/_/g, ' '), material: 'wood',
        color: MATERIAL_COLORS.wood, position: { x: pos.x, y: DEFAULT_Y[type] || 0.3, z: pos.z },
        rotation: { x: 0, y: 0, z: 0 }, scale, modelUrl: '', thumbnailUrl: '',
    };
}

/* ═══════════════════ 3D COMPONENTS ═══════════════════ */
function ARItem({ item, selected, onSelect, onDragStart }) {
    const ref = useRef();

    useFrame(() => {
        if (!ref.current || !selected) return;
        ref.current.position.y = item.position.y + Math.sin(Date.now() * 0.003) * 0.015;
    });

    return (
        <group ref={ref}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
            onPointerDown={(e) => {
                if (selected) {
                    e.stopPropagation();
                    e.target.setPointerCapture(e.pointerId);
                    onDragStart(item.id);
                }
            }}
        >
            {item.modelUrl ? <GLBModel url={item.modelUrl} item={item} /> : <FurniturePrimitive item={item} />}
            {selected && (
                <mesh scale={[1.15, 1.15, 1.15]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="#6B7F5E" wireframe transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
}

function GroundPlane({ onTap, showGrid, dragTarget, onDrag, onDragEnd }) {
    return (
        <group>
            <mesh rotation={[-Math.PI/2,0,0]} visible={false}
                onClick={(e) => { e.stopPropagation(); onTap(e.point); }}
                onPointerMove={(e) => { if (dragTarget) { e.stopPropagation(); onDrag(dragTarget, { x: e.point.x, z: e.point.z }); } }}
                onPointerUp={(e) => { if (dragTarget) { e.target.releasePointerCapture(e.pointerId); onDragEnd(); } }}
                onPointerOut={() => { if (dragTarget) onDragEnd(); }}
            >
                <planeGeometry args={[100,100]} />
                <meshBasicMaterial />
            </mesh>
            {showGrid && <gridHelper args={[20,40,'#B9B3A8','#D4CFC5']} position={[0,0.005,0]} material-opacity={0.3} material-transparent />}
            <ContactShadows position={[0,0.01,0]} opacity={0.4} scale={20} blur={2} far={4} />
        </group>
    );
}

function ARScene({ items, selectedId, onSelect, onTap, showGrid, onDrag }) {
    const [dragTarget, setDragTarget] = useState(null);
    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3,8,5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-4,3,-3]} intensity={0.3} />
            <Suspense fallback={null}><Environment preset="apartment" /></Suspense>
            <GroundPlane onTap={onTap} showGrid={showGrid} dragTarget={dragTarget} onDrag={onDrag} onDragEnd={() => setDragTarget(null)} />
            {items.map(item => (
                <ARItem key={item.id} item={item} selected={selectedId===item.id} onSelect={onSelect} onDragStart={setDragTarget} />
            ))}
        </>
    );
}

/* ═══════════════════ MAIN AR PAGE ═══════════════════ */
export default function ARPage() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [phase, setPhase] = useState('welcome');
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [facingMode, setFacingMode] = useState('environment');
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [activeCat, setActiveCat] = useState('seating');
    const [showGrid, setShowGrid] = useState(true);
    const [showColors, setShowColors] = useState(false);

    const [polyModels, setPolyModels] = useState([]);
    const [polyLoading, setPolyLoading] = useState(false);
    const [polyQuery, setPolyQuery] = useState('');
    const [polySearchResults, setPolySearchResults] = useState([]);
    const [polySearchLoading, setPolySearchLoading] = useState(false);
    const [catalogTab, setCatalogTab] = useState('builtin');

    const selectedItem = useMemo(() => items.find(i => i.id === selectedId), [items, selectedId]);

    /* ── Camera ── */
    const startCamera = useCallback(async (mode) => {
        const facing = mode || facingMode;
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; try { await videoRef.current.play(); } catch(e) {} }
            setCameraOn(true); setCameraError('');
        } catch (err) {
            setCameraError(err.name === 'NotAllowedError' ? 'Camera permission denied.' : err.name === 'NotFoundError' ? 'No camera found.' : 'Camera error: ' + err.message);
            setCameraOn(false);
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraOn(false);
    }, []);

    const flipCamera = useCallback(async () => {
        const m = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(m); await startCamera(m);
    }, [facingMode, startCamera]);

    useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }, []);

    const enterWithCamera = useCallback(async () => { setPhase('ar'); setTimeout(() => startCamera(), 100); }, [startCamera]);
    const enterWithoutCamera = useCallback(() => setPhase('ar'), []);

    /* ── Poly.pizza ── */
    useEffect(() => {
        if (!catalogOpen || catalogTab !== 'poly3d') return;
        const query = SUBCATEGORY_SEARCH[activeCat] || activeCat;
        setPolyLoading(true);
        polyAPI.search(query, 20).then(d => setPolyModels(d.models || [])).catch(() => setPolyModels([])).finally(() => setPolyLoading(false));
    }, [activeCat, catalogOpen, catalogTab]);

    useEffect(() => {
        if (!polyQuery.trim()) { setPolySearchResults([]); return; }
        const t = setTimeout(() => {
            setPolySearchLoading(true);
            polyAPI.search(polyQuery, 20).then(d => setPolySearchResults(d.models || [])).catch(() => setPolySearchResults([])).finally(() => setPolySearchLoading(false));
        }, 400);
        return () => clearTimeout(t);
    }, [polyQuery]);

    /* ── Item Actions ── */
    const handleTap = useCallback(() => { if (selectedId) setSelectedId(null); }, [selectedId]);

    const addItem = useCallback((type) => {
        const item = createItem(type, { x: (Math.random()-0.5)*3, z: (Math.random()-0.5)*3 });
        setItems(prev => [...prev, item]); setSelectedId(item.id); setCatalogOpen(false);
    }, []);

    const addPolyModel = useCallback((model, fallbackType = 'table') => {
        const cat = AR_CATALOG.find(c => c.id === activeCat);
        const type = cat?.defaultType || fallbackType;
        const item = createItem(type, { x: (Math.random()-0.5)*3, z: (Math.random()-0.5)*3 });
        item.modelUrl = model.downloadUrl || '';
        item.thumbnailUrl = model.thumbnail || '';
        item.name = model.title || 'Poly Model';
        setItems(prev => [...prev, item]); setSelectedId(item.id); setCatalogOpen(false);
    }, [activeCat]);

    const removeItem = useCallback((id) => { setItems(prev => prev.filter(i => i.id !== id)); if (selectedId === id) setSelectedId(null); }, [selectedId]);
    const updateItem = useCallback((id, u) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...u } : i)), []);

    const handleDrag = useCallback((id, pos) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, position: { ...i.position, x: pos.x, z: pos.z } } : i));
    }, []);

    const rotateItem = useCallback((dir) => {
        if (!selectedItem) return;
        updateItem(selectedId, { rotation: { ...selectedItem.rotation, y: selectedItem.rotation.y + dir * Math.PI / 8 } });
    }, [selectedId, selectedItem, updateItem]);

    const scaleItem = useCallback((f) => {
        if (!selectedItem) return;
        const s = selectedItem.scale;
        updateItem(selectedId, { scale: { x: s.x*f, y: s.y*f, z: s.z*f } });
    }, [selectedId, selectedItem, updateItem]);

    const duplicateItem = useCallback(() => {
        if (!selectedItem) return;
        const clone = { ...selectedItem, id: uid(), position: { ...selectedItem.position, x: selectedItem.position.x + 0.5, z: selectedItem.position.z + 0.5 } };
        setItems(prev => [...prev, clone]); setSelectedId(clone.id);
    }, [selectedItem]);

    const changeColor = useCallback((color) => { if (!selectedId) return; updateItem(selectedId, { color }); }, [selectedId, updateItem]);
    const clearAll = useCallback(() => { setItems([]); setSelectedId(null); }, []);

    /* ── Screenshot ── */
    const takeScreenshot = useCallback(() => {
        const c = document.querySelector('.ar-canvas-wrapper canvas');
        if (!c) return;
        const off = document.createElement('canvas');
        off.width = window.innerWidth * 2; off.height = window.innerHeight * 2;
        const ctx = off.getContext('2d');
        if (videoRef.current && cameraOn) ctx.drawImage(videoRef.current, 0, 0, off.width, off.height);
        else { ctx.fillStyle = '#F5F1EA'; ctx.fillRect(0, 0, off.width, off.height); }
        ctx.drawImage(c, 0, 0, off.width, off.height);
        ctx.fillStyle = 'rgba(45,42,38,0.5)'; ctx.font = '24px "DM Sans", sans-serif';
        ctx.fillText('✦ DreamSpace AI — AR Preview', 30, off.height - 30);
        const link = document.createElement('a');
        link.download = `dreamspace-ar-${Date.now()}.png`; link.href = off.toDataURL('image/png'); link.click();
    }, [cameraOn]);

    /* ═══════ WELCOME SCREEN ═══════ */
    if (phase === 'welcome') {
        return (
            <div className="ar-welcome-page">
                <div className="ar-welcome-bg">
                    <div className="ar-welcome-orb ar-welcome-orb-1" />
                    <div className="ar-welcome-orb ar-welcome-orb-2" />
                </div>
                <nav className="ar-welcome-nav">
                    <Link to="/dashboard" className="ar-welcome-back"><ArrowLeft size={18} /> Back</Link>
                    <span className="ar-welcome-logo">✦ DreamSpace</span>
                </nav>
                <div className="ar-welcome-content">
                    <div className="ar-welcome-badge anim-fade-up"><Eye size={14} /> Augmented Reality</div>
                    <h1 className="ar-welcome-title anim-fade-up anim-delay-1">See furniture<br/><em>in your space</em></h1>
                    <p className="ar-welcome-desc anim-fade-up anim-delay-2">
                        Place real 3D furniture in your room using your camera. Drag, rotate, scale — 
                        and browse thousands of premium models.
                    </p>
                    <div className="ar-welcome-features anim-fade-up anim-delay-3">
                        <div className="ar-wf"><Smartphone size={20}/><div><strong>Any Device</strong><span>iOS & Android</span></div></div>
                        <div className="ar-wf"><Move size={20}/><div><strong>Drag & Place</strong><span>Touch to move</span></div></div>
                        <div className="ar-wf"><Maximize2 size={20}/><div><strong>Scale & Rotate</strong><span>Pinch & twist</span></div></div>
                        <div className="ar-wf"><Camera size={20}/><div><strong>Screenshot</strong><span>Save designs</span></div></div>
                    </div>
                    <div className="ar-welcome-actions anim-fade-up anim-delay-4">
                        <button className="btn-ar-primary" onClick={enterWithCamera}>
                            <Video size={20}/> Open Camera & Start AR
                        </button>
                        <button className="btn-ar-secondary" onClick={enterWithoutCamera}>
                            Continue without camera
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════ AR VIEW ═══════ */
    const displayModels = polyQuery.trim() ? polySearchResults : polyModels;
    const isSearching = polyQuery.trim() ? polySearchLoading : polyLoading;

    return (
        <div className="ar-page ar-layout">
            <video ref={videoRef} className="ar-camera-feed" autoPlay playsInline muted
                style={{ display: cameraOn ? 'block' : 'none', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
            {!cameraOn && <div className="ar-camera-fallback ar-fallback-warm" />}

            <div className="ar-canvas-wrapper">
                <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} camera={{ position: [0,2.8,5], fov: 55 }} shadows onPointerMissed={() => setSelectedId(null)}>
                    <ARScene items={items} selectedId={selectedId} onSelect={setSelectedId} onTap={handleTap} showGrid={showGrid} onDrag={handleDrag} />
                </Canvas>
            </div>

            {/* ══ TOP BAR ══ */}
            <div className="ar-topbar">
                <Link to="/dashboard" className="ar-topbar-btn"><ArrowLeft size={18}/></Link>
                <div className="ar-topbar-center">
                    {cameraOn && <span className="ar-live-dot"/>}
                    <span>{cameraOn ? 'Live AR' : 'Preview Mode'}</span>
                </div>
                <div className="ar-topbar-right">
                    <button className="ar-topbar-btn" onClick={() => setShowGrid(g => !g)} title="Grid"><Grid3X3 size={16}/></button>
                    {cameraOn ? (
                        <>
                            <button className="ar-topbar-btn" onClick={flipCamera} title="Flip"><FlipHorizontal size={16}/></button>
                            <button className="ar-topbar-btn ar-btn-danger" onClick={stopCamera} title="Stop"><CameraOff size={16}/></button>
                        </>
                    ) : (
                        <button className="ar-topbar-btn ar-btn-accent" onClick={() => startCamera()} title="Camera"><Camera size={16}/></button>
                    )}
                    <button className="ar-topbar-btn" onClick={takeScreenshot} title="Capture"><Download size={16}/></button>
                    {items.length > 0 && <button className="ar-topbar-btn ar-btn-danger" onClick={clearAll} title="Clear"><Trash2 size={16}/></button>}
                </div>
            </div>

            {/* Camera prompt */}
            {!cameraOn && !cameraError && items.length === 0 && (
                <div className="ar-camera-prompt anim-fade-up" onClick={() => startCamera()}>
                    <div className="ar-camera-prompt-icon"><Camera size={28}/></div>
                    <span>Tap to enable AR camera</span>
                    <span className="ar-camera-prompt-sub">or add furniture below</span>
                </div>
            )}

            {/* Item count */}
            {items.length > 0 && <div className="ar-item-badge">{items.length} item{items.length !== 1 ? 's' : ''}</div>}

            {/* ══ SELECTED ITEM CONTROLS ══ */}
            {selectedItem && (
                <div className="ar-inspector anim-scale-in">
                    <div className="ar-inspector-header">
                        <div className="ar-inspector-label">
                            <span className="ar-inspector-icon">{AR_CATALOG.find(c => c.items.some(i => i.type === selectedItem.type))?.icon || '📦'}</span>
                            <span className="ar-inspector-name">{selectedItem.name}</span>
                        </div>
                        <button className="ar-inspector-close" onClick={() => setSelectedId(null)}><X size={18}/></button>
                    </div>
                    <div className="ar-inspector-actions">
                        <button onClick={() => rotateItem(-1)} title="Rotate Left"><RotateCcw size={16}/><span>Left</span></button>
                        <button onClick={() => rotateItem(1)} title="Rotate Right"><RotateCw size={16}/><span>Right</span></button>
                        <button onClick={() => scaleItem(1.15)} title="Bigger"><Plus size={16}/><span>Bigger</span></button>
                        <button onClick={() => scaleItem(0.85)} title="Smaller"><Minus size={16}/><span>Smaller</span></button>
                        <button onClick={duplicateItem} title="Duplicate"><Copy size={16}/><span>Copy</span></button>
                        <button onClick={() => setShowColors(c => !c)} title="Color" className={showColors ? 'active' : ''}><Palette size={16}/><span>Color</span></button>
                        <button className="danger" onClick={() => removeItem(selectedId)} title="Delete"><Trash2 size={16}/><span>Delete</span></button>
                    </div>
                    {showColors && (
                        <div className="ar-inspector-colors anim-fade-up">
                            {COLOR_CHOICES.map(c => (
                                <button key={c} className={`ar-color-dot ${selectedItem.color === c ? 'active' : ''}`}
                                    style={{ background: c }} onClick={() => changeColor(c)} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══ ADD FURNITURE BUTTON ══ */}
            {!catalogOpen && (
                <button className="ar-add-btn anim-scale-in" onClick={() => setCatalogOpen(true)}>
                    <Plus size={20}/><span>Add Furniture</span>
                </button>
            )}

            {/* ══ CATALOG DRAWER ══ */}
            {catalogOpen && (
                <div className="ar-drawer anim-slide-up">
                    <div className="ar-drawer-handle" onClick={() => setCatalogOpen(false)}><div className="ar-drawer-pill"/></div>
                    <div className="ar-drawer-tabs">
                        <button className={catalogTab === 'builtin' ? 'active' : ''} onClick={() => setCatalogTab('builtin')}>Essentials</button>
                        <button className={catalogTab === 'poly3d' ? 'active' : ''} onClick={() => setCatalogTab('poly3d')}>🌐 Premium 3D</button>
                        <button onClick={() => setCatalogOpen(false)} className="ar-drawer-close-tab"><ChevronDown size={18}/></button>
                    </div>

                    <div className="ar-drawer-cats">
                        {AR_CATALOG.map(cat => (
                            <button key={cat.id} className={`ar-drawer-cat ${activeCat === cat.id ? 'active' : ''}`} onClick={() => setActiveCat(cat.id)}>
                                <span>{cat.icon}</span><span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ar-drawer-body">
                        {catalogTab === 'builtin' ? (
                            <div className="ar-drawer-grid anim-fade-up">
                                {AR_CATALOG.find(c => c.id === activeCat)?.items.map(item => (
                                    <button key={item.type} className="ar-drawer-item" onClick={() => addItem(item.type)}>
                                        <span className="ar-drawer-item-icon">{item.icon}</span>
                                        <span className="ar-drawer-item-name">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="anim-fade-up">
                                <div className="ar-poly-search-bar">
                                    <Search size={14} />
                                    <input type="text" placeholder="Search 10,000+ 3D models..." value={polyQuery}
                                        onChange={e => setPolyQuery(e.target.value)} />
                                </div>
                                {isSearching ? (
                                    <div className="ar-drawer-loading"><div className="spinner" /> Loading models...</div>
                                ) : displayModels.length > 0 ? (
                                    <div className="ar-poly-grid">
                                        {displayModels.map(m => (
                                            <button key={m.id} className="ar-poly-card" onClick={() => addPolyModel(m)}>
                                                {m.thumbnail ? <img src={m.thumbnail} alt={m.title} loading="lazy" /> : <div className="ar-poly-ph">📦</div>}
                                                <div className="ar-poly-meta">
                                                    <span className="ar-poly-title">{m.title}</span>
                                                    <span className="ar-poly-author">by {m.author}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="ar-drawer-empty">No models found{polyQuery ? ` for "${polyQuery}"` : ''}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {cameraError && (
                <div className="ar-error-toast anim-fade-up">
                    <CameraOff size={16}/><span>{cameraError}</span>
                    <button onClick={() => setCameraError('')}><X size={14}/></button>
                </div>
            )}
        </div>
    );
}
