import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard.service";
import { queryKeys } from "#/lib/queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: async () => {
      const { data } = await dashboardService.getSummary();
      return data;
    },
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

