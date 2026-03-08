export const queryKeys = {
  payables: {
    all: ()           => ["payables"]       as const,
    detail: (id: string) => ["payables", id]   as const,
  },
  receivables: {
    all: ()           => ["receivables"]       as const,
    detail: (id: string) => ["receivables", id]   as const,
  },
  dashboard: {
    summary: () => ["dashboard", "summary"] as const,
  },
  exchange: {
    rate: () => ["exchange"] as const,
  },
};
