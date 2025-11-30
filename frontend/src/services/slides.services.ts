// // src/services/slides.service.ts
// import api from "@/lib/axiosClient";
// import type { SlideIn, SlideOut } from "@/types/slide";

// export async function fetchSlideById(id: string): Promise<SlideOut> {
//   const res = await api.get<SlideOut>(`/slides/${id}`);
//   return res.data;
// }

// export async function updateSlide(id: string, payload: SlideIn): Promise<SlideOut> {
//   const res = await api.put<SlideOut>(`/slides/${id}`, payload);
//   return res.data;
// }



// src/services/slides.service.ts
import api from "@/lib/axiosClient";
import type { SlideIn, SlideOut } from "@/types/slide";

//
// 1) Fetch entire presentation (all slides)
// ----------------------------------------
export async function fetchPresentationById(id: string): Promise<{
  presentation_id: string;
  title: string;
  slides: SlideOut[];
}> {
  const res = await api.get(`/slides/presentation/${id}`);
  return res.data;
}

//
// 2) Update entire presentation (bulk save)
// ----------------------------------------
export async function updatePresentation(
  id: string,
  slides: SlideOut[]
): Promise<{ success: boolean }> {

  const payload = {
    presentation_id: id,
    slides: slides.map((s) => ({
      id: s.id,
      title: s.title,
      bullets: s.bullets,
      notes: s.notes,
      design: s.design,
    })),
  };

  const res = await api.put(`/slides/presentation/${id}`, payload);
  return res.data;
}

//
// 3) (Optional) Fetch single slide
// ----------------------------------------
export async function fetchSlideById(id: string): Promise<SlideOut> {
  const res = await api.get<SlideOut>(`/slides/${id}`);
  return res.data;
}

//
// 4) (Optional) Update single slide
// ----------------------------------------
export async function updateSlide(id: string, payload: SlideIn): Promise<SlideOut> {
  const res = await api.put<SlideOut>(`/slides/${id}`, payload);
  return res.data;
}

//
// 5) Generate slides from topic
// ----------------------------------------
export async function generateSlides(topic: string, detail: string, theme: string) {
  const res = await api.post("/slides/generate", {
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
  const res = await api.post("/slides/generate", {
    document_id: documentId,
    style: theme,
  });
  return res.data;
}

//
// 7) Export slides (pptx/pdf/md/json)
// ----------------------------------------
export async function exportSlides(slides: SlideOut[], topic: string, format: string) {
  const res = await api.post(
    "/slides/export",
    { slides, topic, format },
    { responseType: "blob" }
  );

  return res.data;
}
