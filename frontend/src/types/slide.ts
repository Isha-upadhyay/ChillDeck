// src/types/slide.ts

export interface SlideDesign {
  layout?: string;          // "title_and_body", "left-image" etc.
  theme?: string;           // "corporate", "dark", ...
  icon?: string | null;
  image_prompt?: string | null;
  image_url?: string | null;
}

export interface SlideIn {
  title: string;
  bullets: string[];
  notes?: string | null;
  design?: SlideDesign;
}

export interface SlideOut extends SlideIn {
  heading: string;
  id: string;
  order?: number | null;
}
