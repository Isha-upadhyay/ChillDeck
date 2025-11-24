// src/store/editorStore.ts
import { create } from "zustand";
import type { SlideOut, SlideDesign } from "@/types/slide";

interface EditorState {
  slide: SlideOut | null;
  loading: boolean;
  error: string | null;

  setSlide: (slide: SlideOut) => void;
  setLoading: (value: boolean) => void;
  setError: (msg: string | null) => void;

  updateTitle: (title: string) => void;
  updateNotes: (notes: string) => void;

  updateBullet: (index: number, value: string) => void;
  addBullet: () => void;
  removeBullet: (index: number) => void;

  updateDesign: (design: Partial<SlideDesign>) => void;
  clearSlide: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  slide: null,
  loading: false,
  error: null,

  setSlide: (slide) => set({ slide }),
  setLoading: (value) => set({ loading: value }),
  setError: (msg) => set({ error: msg }),

  updateTitle: (title) =>
    set((state) =>
      state.slide ? { slide: { ...state.slide, title } } : state
    ),

  updateNotes: (notes) =>
    set((state) =>
      state.slide ? { slide: { ...state.slide, notes } } : state
    ),

  updateBullet: (index, value) =>
    set((state) => {
      if (!state.slide) return state;
      const bullets = [...state.slide.bullets];
      bullets[index] = value;
      return { slide: { ...state.slide, bullets } };
    }),

  addBullet: () =>
    set((state) => {
      if (!state.slide) return state;
      const bullets = [...state.slide.bullets, ""];
      return { slide: { ...state.slide, bullets } };
    }),

  removeBullet: (index) =>
    set((state) => {
      if (!state.slide) return state;
      const bullets = state.slide.bullets.filter((_, i) => i !== index);
      return { slide: { ...state.slide, bullets } };
    }),

  updateDesign: (designPart) =>
    set((state) => {
      if (!state.slide) return state;
      const prevDesign = state.slide.design ?? {};
      return {
        slide: {
          ...state.slide,
          design: { ...prevDesign, ...designPart },
        },
      };
    }),

  clearSlide: () => set({ slide: null }),
}));
