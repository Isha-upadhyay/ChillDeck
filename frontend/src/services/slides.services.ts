// src/services/slides.service.ts
import api from "@/lib/axiosClient";
import type { SlideIn, SlideOut } from "@/types/slide";



export interface PresentationCard {
  id: string;
  topic: string;
  slideCount: number;
  updated: string;
  theme: string;
  thumbnail?: string | null;
}

//
// 1) Fetch entire presentation (all slides)
// ----------------------------------------
export async function fetchPresentationById(id: string): Promise<{
  presentation_id: string;
  title?: string;
  slides: SlideOut[];
}> {
  const res = await api.get(`/api/slides/presentation/${id}`);
  return res.data;
}

//
// 2) Update entire presentation (bulk save)
// ----------------------------------------
export async function updatePresentation(
  id: string,
  slides: {
    title: string;
    theme: string;
    slides: SlideOut[];
  }
): Promise<{ success: boolean }> {

  const payload = {
    presentation_id: id,
    title: slides.title,
    theme: slides.theme,
    slides: slides.slides.map((s) => ({
      id: s.id,
      title: s.title,
      bullets: s.bullets,
      notes: s.notes,
      design: s.design,
    })),
  };

  const res = await api.put(`/api/slides/presentation/${id}`, payload);
  return res.data;
}



// -----------------------------------------------------
// FETCH ALL PRESENTATIONS FOR DASHBOARD
// -----------------------------------------------------
export async function fetchAllPresentations() {
  const res = await api.get(`/api/slides/all`);
  return res.data;
}


//
// 3) Fetch single slide
// ----------------------------------------
export async function fetchSlideById(id: string): Promise<SlideOut> {
  const res = await api.get(`/api/slides/${id}`);
  return res.data;
}

//
// 4) Update single slide
// ----------------------------------------
export async function updateSlide(id: string, payload: SlideIn): Promise<SlideOut> {
  const res = await api.put(`/api/slides/${id}`, payload);
  return res.data;
}

//
// 5) Generate slides from topic
// ----------------------------------------
export async function generateSlides(topic: string, detail: string, theme: string) {
  const res = await api.post(`/api/slides/generate`, {
    topic,
    detail,
    style: theme,
  });
  return res.data;
}

//
// 6) Generate slides from uploaded document
// ----------------------------------------
export async function generateSlidesFromDocument(
  documentId: string,
  theme: string
) {
  const res = await api.post(`/api/slides/generate`, {
    document_id: documentId,
    style: theme,
  });
  return res.data;
}

//
// 7) Export slides
// ----------------------------------------
export async function exportSlides(slides: SlideOut[], topic: string, format: string) {
  const res = await api.post(
    `/api/slides/export`,
    { slides, topic, format },
    { responseType: "blob" }
  );

  return res.data;
}


export async function deletePresentation(id: string) {
  const res = await api.delete(`/api/slides/presentation/${id}`);
  return res.data;
}
