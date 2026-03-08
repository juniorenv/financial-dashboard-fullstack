import { api } from "@/lib/axios";
import type {
  CreateReceivableDto,
  Receivable,
  UpdateReceivableDto,
} from "@/schemas/receivable.schema";

export const receivablesService = {
  findAll: () => api.get<Receivable[]>("/receivables"),

  findOne: (id: string) => api.get<Receivable>(`/receivables/${id}`),

  create: (data: CreateReceivableDto) =>
    api.post<Receivable>("/receivables", data),

  update: (id: string, data: UpdateReceivableDto) =>
    api.put<Receivable>(`/receivables/${id}`, data),

  markAsReceived: (id: string) =>
    api.patch<Receivable>(`/receivables/${id}/receive`),

  remove: (id: string) => api.delete(`/receivables/${id}`),
};

