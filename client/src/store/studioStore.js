import { create } from 'zustand';

const useStudioStore = create((set, get) => ({
    items: [],
    selectedItemId: null,
    transformMode: 'translate',

    addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }],
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    })),

    updateItem: (id, updates) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updates } : i),
    })),

    selectItem: (id) => set({ selectedItemId: id }),
    clearSelection: () => set({ selectedItemId: null }),
    setTransformMode: (mode) => set({ transformMode: mode }),

    loadLayout: (items) => set({ items, selectedItemId: null }),
    clearScene: () => set({ items: [], selectedItemId: null }),

    getLayoutJson: () => get().items.map(({ id, type, position, rotation, scale, material, color, name }) => ({
        id, type, position, rotation, scale, material, color, name,
    })),
}));

export default useStudioStore;
