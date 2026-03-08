import { api } from "@/lib/axios";

export interface ExchangeRate {
  from: "USD"
  to: "BRL"
  rate: number
  fetchedAt: string
}

export const exchangeService = {
  getRate: () => api.get<ExchangeRate>("/exchange"),
};

