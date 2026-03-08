import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  type CreatePayableDto,
  type Payable,
  type UpdatePayableDto,
} from "@/schemas/payable.schema";
import { queryKeys } from "#/lib/queryKeys";

// ─── Service ──────────────────────────────────────────────────────────────────

export const payablesService = {
  findAll: ()                               => api.get<Payable[]>("/payables"),
  findOne: (id: string)                     => api.get<Payable>(`/payables/${id}`),
  create: (data: CreatePayableDto)         => api.post<Payable>("/payables", data),
  update: (id: string, data: UpdatePayableDto) => api.put<Payable>(`/payables/${id}`, data),
  markAsPaid: (id: string)                     => api.patch<Payable>(`/payables/${id}/pay`),
  remove: (id: string)                     => api.delete(`/payables/${id}`),
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const payableKeys = {
  all: ()           => ["payables"]       as const,
  detail: (id: string) => ["payables", id]   as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePayables() {
  return useQuery({
    queryKey: payableKeys.all(),
    queryFn: async () => {
      const { data } = await payablesService.findAll();
      return data;
    },
  });
}

export function usePayable(id: string) {
  return useQuery({
    queryKey: payableKeys.detail(id),
    queryFn: async () => {
      const { data } = await payablesService.findOne(id);
      return data;
    },
  });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function usePayablesSummary(payables: Payable[] | undefined) {
  return useMemo(() => {
    if (!payables)
      return { totalPending: 0, totalPaid: 0, countPending: 0, countOverdue: 0 };

    const today = new Date();

    return payables.reduce(
      (acc, item) => {
        const amount = Number(item.amount);
        if (item.status === "PENDING") {
          acc.totalPending += amount;
          acc.countPending += 1;
          if (new Date(item.dueDate) < today) {
            acc.countOverdue += 1;
          }
        } else {
          acc.totalPaid += amount;
        }
        return acc;
      },
      { totalPending: 0, totalPaid: 0, countPending: 0, countOverdue: 0 },
    );
  }, [payables]);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayableDto) => payablesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payableKeys.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useUpdatePayable(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayableDto) => payablesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payableKeys.all() });
      queryClient.invalidateQueries({ queryKey: payableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payablesService.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payableKeys.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useRemovePayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payablesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payableKeys.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}
