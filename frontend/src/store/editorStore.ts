// // src/store/editorStore.ts
// import { create } from "zustand";
// import type { SlideOut, SlideDesign } from "@/types/slide";

// interface EditorState {
//   slide: SlideOut | null;
//   loading: boolean;
//   error: string | null;

//   setSlide: (slide: SlideOut) => void;
//   setLoading: (value: boolean) => void;
//   setError: (msg: string | null) => void;

//   updateTitle: (title: string) => void;
//   updateNotes: (notes: string) => void;

//   updateBullet: (index: number, value: string) => void;
//   addBullet: () => void;
//   removeBullet: (index: number) => void;

//   updateDesign: (design: Partial<SlideDesign>) => void;
//   clearSlide: () => void;
// }

// export const useEditorStore = create<EditorState>((set) => ({
//   slide: null,
//   loading: false,
//   error: null,

//   setSlide: (slide) => set({ slide }),
//   setLoading: (value) => set({ loading: value }),
//   setError: (msg) => set({ error: msg }),

//   updateTitle: (title) =>
//     set((state) =>
//       state.slide ? { slide: { ...state.slide, title } } : state
//     ),

//   updateNotes: (notes) =>
//     set((state) =>
//       state.slide ? { slide: { ...state.slide, notes } } : state
//     ),

//   updateBullet: (index, value) =>
//     set((state) => {
//       if (!state.slide) return state;
//       const bullets = [...state.slide.bullets];
//       bullets[index] = value;
//       return { slide: { ...state.slide, bullets } };
//     }),

//   addBullet: () =>
//     set((state) => {
//       if (!state.slide) return state;
//       const bullets = [...state.slide.bullets, ""];
//       return { slide: { ...state.slide, bullets } };
//     }),

//   removeBullet: (index) =>
//     set((state) => {
//       if (!state.slide) return state;
//       const bullets = state.slide.bullets.filter((_, i) => i !== index);
//       return { slide: { ...state.slide, bullets } };
//     }),

//   updateDesign: (designPart) =>
//     set((state) => {
//       if (!state.slide) return state;
//       const prevDesign = state.slide.design ?? {};
//       return {
//         slide: {
//           ...state.slide,
//           design: { ...prevDesign, ...designPart },
//         },
//       };
//     }),

//   clearSlide: () => set({ slide: null }),
// }));




// frontend/src/store/editorStore.ts
import { create } from "zustand";
import type { SlideOut } from "@/types/slide";

interface EditorState {
  slide: SlideOut | null;
  setSlide: (slide: SlideOut) => void;
  clearSlide: () => void;
  
  // Actions
  updateTitle: (title: string) => void;
  updateHeading: (heading: string) => void;
  updateNotes: (notes: string) => void;
  updateBullet: (index: number, value: string) => void;
  addBullet: () => void;
  removeBullet: (index: number) => void;
  updateDesign: (designUpdates: Partial<SlideOut["design"]>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  slide: null,

  setSlide: (slide) => set({ slide }),
  clearSlide: () => set({ slide: null }),

  updateTitle: (title) =>
    set((state) => (state.slide ? { slide: { ...state.slide, title } } : {})),

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
}));