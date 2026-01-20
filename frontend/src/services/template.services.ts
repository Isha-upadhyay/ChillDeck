import {
  fetchTemplates,
  fetchTemplateById,
  createTemplate,
  deleteTemplate,
} from "@/lib/api";

import type { Template, TemplateCreatePayload } from "@/types/template";






// export const TemplatesService = {
//   async list(options?: {
//     category?: string;
//     limit?: number;
//     offset?: number;
//   }): Promise<Template[]> {
//     return await fetchTemplates(options);
//   },

//   async get(templateId: string): Promise<Template> {
//     return await fetchTemplateById(templateId);
//   },

//   async create(payload: TemplateCreatePayload): Promise<Template> {
//     return await createTemplate(payload);
//   },

//   async remove(templateId: string): Promise<void> {
//     await deleteTemplate(templateId);
//   },
// };


export const TemplatesService = {
  async list(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Template[]> {
    return fetchTemplates(options);
  },

  async get(templateId: string): Promise<Template> {
    return fetchTemplateById(templateId);
  },

  // Admin / internal only
  async create(payload: TemplateCreatePayload): Promise<Template> {
    return createTemplate(payload);
  },

  // Admin / internal only
  async remove(templateId: string): Promise<void> {
    await deleteTemplate(templateId);
  },
};
