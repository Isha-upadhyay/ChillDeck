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




// src/store/editorStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { SlideOut, SlideDesign } from "@/types/slide";

export interface EditorState {
  // MULTI SLIDE
  slides: SlideOut[];
  setSlides: (slides: SlideOut[]) => void;

  currentIndex: number;
  selectSlide: (index: number) => void;

  addSlide: () => void;
  deleteSlide: (index: number) => void;
  updateSlide: (index: number, data: Partial<SlideOut>) => void;

  // SINGLE SLIDE OLD FLOW (BACKWARD COMPAT)
  slide: SlideOut | null;
  setSlide: (slide: SlideOut | null) => void;
  clearSlide: () => void;

  // EDITING FIELDS
  updateTitle: (title: string) => void;
  updateNotes: (notes: string) => void;

  updateBullet: (index: number, value: string) => void;
  addBullet: () => void;
  removeBullet: (index: number) => void;

  updateDesign: (design: Partial<SlideDesign>) => void;

  // UI
  loading: boolean;
  setLoading: (value: boolean) => void;
  error: string | null;
  setError: (msg: string | null) => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    slides: [],
    currentIndex: 0,
    slide: null,

    // -----------------------
    // MULTI SLIDE
    // -----------------------
    setSlides: (slides) =>
      set((state) => {
        state.slides = slides;
        state.currentIndex = 0;
        state.slide = slides[0] ?? null;
      }),

    selectSlide: (index) =>
      set((state) => {
        state.currentIndex = index;
        state.slide = state.slides[index];
      }),

    addSlide: () =>
      set((state) => {
        const newSlide: SlideOut = {
          id: crypto.randomUUID(),
          heading: "New Slide",
          title: "New Slide",
          bullets: [],
          notes: "",
          design: {},
        };

        state.slides.push(newSlide);
        state.currentIndex = state.slides.length - 1;
        state.slide = newSlide;
      }),

    deleteSlide: (index) =>
      set((state) => {
        state.slides.splice(index, 1);
        state.currentIndex = Math.max(0, index - 1);
        state.slide = state.slides[state.currentIndex] ?? null;
      }),

    updateSlide: (index, data) =>
      set((state) => {
        Object.assign(state.slides[index], data);
        if (index === state.currentIndex) {
          state.slide = state.slides[index];
        }
      }),

    // -----------------------
    // OLD SINGLE SLIDE FLOW
    // -----------------------
    setSlide: (slide) =>
      set((state) => {
        state.slide = slide;
      }),

    clearSlide: () =>
      set((state) => {
        state.slide = null;
      }),

    // -----------------------
    // FIELD EDITORS
    // -----------------------
    updateTitle: (title) =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].title = title;
          state.slides[idx].heading = title;
          state.slide = state.slides[idx];
        }

        if (state.slide) state.slide.title = title;
      }),

    updateNotes: (notes) =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].notes = notes;
          state.slide = state.slides[idx];
        }
      }),

    updateBullet: (i, val) =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].bullets[i] = val;
          state.slide = state.slides[idx];
        }
      }),

    addBullet: () =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].bullets.push("");
          state.slide = state.slides[idx];
        }
      }),

    removeBullet: (i) =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].bullets.splice(i, 1);
          state.slide = state.slides[idx];
        }
      }),

    updateDesign: (design) =>
      set((state) => {
        const idx = state.currentIndex;

        if (state.slides[idx]) {
          state.slides[idx].design = {
            ...state.slides[idx].design,
            ...design,
          };
          state.slide = state.slides[idx];
        }
      }),

    // -----------------------
    // UI
    // -----------------------
    loading: false,
    setLoading: (value) =>
      set((state) => {
        state.loading = value;
      }),

    error: null,
    setError: (msg) =>
      set((state) => {
        state.error = msg;
      }),
  }))
);

