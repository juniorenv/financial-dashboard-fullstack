import { useQuery } from "@tanstack/react-query";

import { exchangeService } from "@/services/exchange.service";

export const exchangeKeys = {
  rate: () => ["exchange", "rate"] as const,
};

export function useExchangeRate() {
  return useQuery({
    queryKey: exchangeKeys.rate(),
    queryFn: async () => {
      const { data } = await exchangeService.getRate();
      return data;
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

