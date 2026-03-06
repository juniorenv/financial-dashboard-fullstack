export interface AwesomeApiResponse {
  USDBRL: {
    bid: string; // taxa de compra (quanto custa 1 USD em BRL)
    ask: string; // taxa de venda
    high: string; // máxima do dia
    low: string; // mínima do dia
  };
}
