import { create } from 'zustand';

const NUDGE_AMOUNT = 0.1;
const ROTATE_STEP = Math.PI / 12; // 15 degrees
const SNAP_ANGLE = Math.PI / 2;   // 90 degrees

const useStudioStore = create((set, get) => ({
    items: [],
    selectedItemId: null,
    transformMode: 'translate',
    snapEnabled: false,
    uniformScale: true,
    undoStack: [],
    redoStack: [],

    addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }],
        undoStack: [...state.undoStack, state.items].slice(-30),
        redoStack: [],
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        undoStack: [...state.undoStack, state.items].slice(-30),
        redoStack: [],
    })),

    updateItem: (id, updates) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updates } : i),
    })),

    // Save snapshot for undo before a transform action
    pushUndo: () => set((state) => ({
        undoStack: [...state.undoStack, state.items].slice(-30),
        redoStack: [],
    })),

    undo: () => set((state) => {
        if (state.undoStack.length === 0) return state;
        const prev = state.undoStack[state.undoStack.length - 1];
        return {
            items: prev,
            undoStack: state.undoStack.slice(0, -1),
            redoStack: [...state.redoStack, state.items].slice(-30),
            selectedItemId: null,
        };
    }),

    redo: () => set((state) => {
        if (state.redoStack.length === 0) return state;
        const next = state.redoStack[state.redoStack.length - 1];
        return {
            items: next,
            redoStack: state.redoStack.slice(0, -1),
            undoStack: [...state.undoStack, state.items].slice(-30),
            selectedItemId: null,
        };
    }),

    selectItem: (id) => set({ selectedItemId: id }),
    clearSelection: () => set({ selectedItemId: null }),
    setTransformMode: (mode) => set({ transformMode: mode }),
    toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
    toggleUniformScale: () => set((s) => ({ uniformScale: !s.uniformScale })),

    loadLayout: (items) => set({ items, selectedItemId: null, undoStack: [], redoStack: [] }),
    clearScene: () => set((state) => ({
        items: [],
        selectedItemId: null,
        undoStack: [...state.undoStack, state.items].slice(-30),
        redoStack: [],
    })),

    getLayoutJson: () => get().items.map(({ id, type, position, rotation, scale, material, color, name, modelUrl, thumbnailUrl }) => ({
        id, type, position, rotation, scale, material, color, name, modelUrl, thumbnailUrl,
    })),

    /* ═══ TRANSFORM HELPERS ═══ */

    // Nudge position by delta (arrow keys)
    nudgeItem: (id, axis, amount) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            const pos = { ...i.position };
            pos[axis] = (pos[axis] || 0) + amount;
            return { ...i, position: pos };
        }),
    })),

    // Rotate by fixed increment
    rotateItem: (id, axis, angle) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            const rot = { ...i.rotation };
            rot[axis] = (rot[axis] || 0) + angle;
            return { ...i, rotation: rot };
        }),
    })),

    // Snap rotation to nearest 90°
    snapRotation: (id) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            return {
                ...i,
                rotation: {
                    x: Math.round(i.rotation.x / SNAP_ANGLE) * SNAP_ANGLE,
                    y: Math.round(i.rotation.y / SNAP_ANGLE) * SNAP_ANGLE,
                    z: Math.round(i.rotation.z / SNAP_ANGLE) * SNAP_ANGLE,
                },
            };
        }),
    })),

    // Reset rotation to 0,0,0
    resetRotation: (id) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, rotation: { x: 0, y: 0, z: 0 } } : i),
    })),

    // Flip/mirror on an axis
    flipItem: (id, axis) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            const rot = { ...i.rotation };
            rot[axis] = rot[axis] + Math.PI;
            return { ...i, rotation: rot };
        }),
    })),

    // Set exact numeric position
    setItemPosition: (id, pos) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, position: { ...i.position, ...pos } } : i),
    })),

    // Set exact numeric rotation (in degrees, will convert)
    setItemRotation: (id, rot) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, rotation: { ...i.rotation, ...rot } } : i),
    })),

    // Set exact numeric scale
    setItemScale: (id, scale, uniform = false) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            if (uniform && Object.keys(scale).length === 1) {
                const axis = Object.keys(scale)[0];
                const factor = scale[axis] / (i.scale[axis] || 1);
                return { ...i, scale: { x: i.scale.x * factor, y: i.scale.y * factor, z: i.scale.z * factor } };
            }
            return { ...i, scale: { ...i.scale, ...scale } };
        }),
    })),

    // Align to wall (snap Z to back wall, X to side walls)
    alignToWall: (id, wall, roomDims) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            const pos = { ...i.position };
            switch (wall) {
                case 'back':   pos.z = -roomDims.depth / 2 + 0.2; break;
                case 'front':  pos.z = roomDims.depth / 2 - 0.2; break;
                case 'left':   pos.x = -roomDims.width / 2 + 0.2; break;
                case 'right':  pos.x = roomDims.width / 2 - 0.2; break;
                case 'center': pos.x = 0; pos.z = 0; break;
                default: break;
            }
            return { ...i, position: pos };
        }),
    })),

    // Drop to floor (reset Y to default for type)
    dropToFloor: (id, defaultY) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, position: { ...i.position, y: defaultY } } : i),
    })),

    // Raise/lower Y elevation
    elevateItem: (id, delta) => set((state) => ({
        items: state.items.map(i => {
            if (i.id !== id) return i;
            return { ...i, position: { ...i.position, y: Math.max(0, (i.position.y || 0) + delta) } };
        }),
    })),
}));

export default useStudioStore;
