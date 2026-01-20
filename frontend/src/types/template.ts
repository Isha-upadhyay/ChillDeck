export interface Template {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  thumbnail_url?: string | null;
    // ✅ REQUIRED for preview + generation
  structure: TemplateStructure;

  created_at?: string;
}

export interface TemplateCreatePayload {
  title: string;
  category: string;
  description?: string;
  structure: Record<string, any>;
  thumbnail_url?: string;
}
export interface TemplateStructure {
  slides: {
    type: string;
    title: string;
    description?: string;
  }[];
}
