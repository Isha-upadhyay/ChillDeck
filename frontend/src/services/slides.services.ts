// src/services/slides.service.ts
import api from "@/lib/axiosClient";
import type { SlideIn, SlideOut } from "@/types/slide";

export async function fetchSlideById(id: string): Promise<SlideOut> {
  const res = await api.get<SlideOut>(`/slides/${id}`);
  return res.data;
}

export async function updateSlide(id: string, payload: SlideIn): Promise<SlideOut> {
  const res = await api.put<SlideOut>(`/slides/${id}`, payload);
  return res.data;
}
