import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { receivablesService } from "@/services/receivables.service";
import type {
  CreateReceivableDto,
  Receivable,
  UpdateReceivableDto,
} from "@/schemas/receivable.schema";
import { queryKeys } from "#/lib/queryKeys";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const receivableKeys = {
  all: ()           => ["receivables"]     as const,
  detail: (id: string) => ["receivables", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useReceivables() {
  return useQuery({
    queryKey: receivableKeys.all(),
    queryFn: async () => {
      const { data } = await receivablesService.findAll();
      return data;
    },
  });
}

export function useReceivable(id: string) {
  return useQuery({
    queryKey: receivableKeys.detail(id),
    queryFn: async () => {
      const { data } = await receivablesService.findOne(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function useReceivablesSummary(receivables: Receivable[] | undefined) {
  return useMemo(() => {
    if (!receivables)
      return { totalPending: 0, totalReceived: 0, countPending: 0, countOverdue: 0 };

    const today = new Date();

    return receivables.reduce(
      (acc, item) => {
        const amount = Number(item.amount);
        if (item.status === "PENDING") {
          acc.totalPending += amount;
          acc.countPending += 1;
          if (new Date(item.dueDate) < today) {
            acc.countOverdue += 1;
          }
        } else {
          acc.totalReceived += amount;
        }
        return acc;
      },
      { totalPending: 0, totalReceived: 0, countPending: 0, countOverdue: 0 },
    );
  }, [receivables]);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReceivableDto) =>
      receivablesService.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivableKeys.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useUpdateReceivable(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReceivableDto) =>
      receivablesService.update(id, data).then((r) => r.data),
    onSuccess: (updated: Receivable) => {
      queryClient.invalidateQueries({ queryKey: receivableKeys.all() });
      queryClient.setQueryData(receivableKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => receivablesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivableKeys.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}

export function useMarkAsReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      receivablesService.markAsReceived(id).then((r) => r.data),
    onSuccess: (updated: Receivable) => {
      queryClient.invalidateQueries({ queryKey: receivableKeys.all() });
      queryClient.setQueryData(receivableKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
    },
  });
}
