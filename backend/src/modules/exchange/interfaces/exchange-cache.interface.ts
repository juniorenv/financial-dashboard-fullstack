/**
 * Estrutura do cache em memória do ExchangeService.
 */
export interface ExchangeCache {
  rate: number;
  fetchedAt: Date;
}
