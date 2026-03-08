import { api } from "@/lib/axios";
import type {
  CreatePayableDto,
  Payable,
  UpdatePayableDto,
} from "@/schemas/payable.schema";

export const payablesService = {
  findAll: () => api.get<Payable[]>("/payables"),

  findOne: (id: string) => api.get<Payable>(`/payables/${id}`),

  create: (data: CreatePayableDto) => api.post<Payable>("/payables", data),

  update: (id: string, data: UpdatePayableDto) =>
    api.put<Payable>(`/payables/${id}`, data),

  markAsPaid: (id: string) => api.patch<Payable>(`/payables/${id}/pay`),

  remove: (id: string) => api.delete(`/payables/${id}`),
};

