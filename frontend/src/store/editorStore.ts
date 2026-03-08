// frontend/src/store/editorStore.ts
import { create } from "zustand";
import type { SlideOut } from "@/types/slide";

interface EditorState {
  slide: SlideOut | null;
  setSlide: (slide: SlideOut) => void;
  clearSlide: () => void;

  // Undo/Redo
  history: SlideOut[];
  historyIndex: number;
  pushHistory: (slide: SlideOut) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions
  updateTitle: (title: string) => void;
  updateHeading: (heading: string) => void;
  updateNotes: (notes: string) => void;
  updateBullet: (index: number, value: string) => void;
  addBullet: () => void;
  removeBullet: (index: number) => void;
  updateDesign: (designUpdates: Partial<SlideOut["design"]>) => void;
  updateLayout: (layout: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  slide: null,
  history: [],
  historyIndex: -1,

  setSlide: (slide) => set({ slide, history: [slide], historyIndex: 0 }),
  clearSlide: () => set({ slide: null, history: [], historyIndex: -1 }),

  pushHistory: (slide) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(structuredClone(slide));
    // Keep max 50 history items
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ slide: structuredClone(history[newIndex]), historyIndex: newIndex });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ slide: structuredClone(history[newIndex]), historyIndex: newIndex });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  updateTitle: (title) =>
    set((state) => {
      if (!state.slide) return {};
      const updated = { ...state.slide, title };
      return { slide: updated };
    }),

  updateHeading: (heading) =>
    set((state) => (state.slide ? { slide: { ...state.slide, heading } } : {})),

  updateNotes: (notes) =>
    set((state) => (state.slide ? { slide: { ...state.slide, notes } } : {})),

  updateBullet: (index, value) =>
    set((state) => {
      if (!state.slide) return {};
      const newBullets = [...(state.slide.bullets || [])];
      newBullets[index] = value;
      return { slide: { ...state.slide, bullets: newBullets } };
    }),

  addBullet: () =>
    set((state) => {
      if (!state.slide) return {};
      return { slide: { ...state.slide, bullets: [...(state.slide.bullets || []), "New point"] } };
    }),

  removeBullet: (index) =>
    set((state) => {
      if (!state.slide) return {};
      const newBullets = (state.slide.bullets || []).filter((_, i) => i !== index);
      return { slide: { ...state.slide, bullets: newBullets } };
    }),

  updateDesign: (designUpdates) =>
    set((state) => {
      if (!state.slide) return {};
      return {
        slide: {
          ...state.slide,
          design: { ...state.slide.design, ...designUpdates },
        },
      };
    }),

  updateLayout: (layout) =>
    set((state) => {
      if (!state.slide) return {};
      return {
        slide: {
          ...state.slide,
          design: { ...state.slide.design, layout },
        },
      };
    }),
}));
