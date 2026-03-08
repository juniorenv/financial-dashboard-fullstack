import path from 'path';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import { PayableStatus, ReceivableStatus } from 'src/generated/prisma/enums';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// ─── Cliente Prisma isolado para o seed ───────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Dados de referência ──────────────────────────────────────────────────────

const FORNECEDORES = [
  'Eletropaulo Energia',
  'Sabesp',
  'Claro Empresas',
  'Vivo Fibra',
  'Correios',
  'Localfrio Refrigeração',
  'Papelaria Central',
  'TechSuprimentos Ltda',
  'Limpeza Total Serviços',
  'Gráfica Rápida',
  'Contabilidade Souza & Filhos',
  'Advocacia Mendes Associados',
  'Seguradora Porto Alegre',
  'Locadora de Veículos Movida',
  'Café & Cia Distribuidora',
];

const CLIENTES = [
  'Construtora Horizonte',
  'Supermercado Estrela',
  'Clínica Vida Saudável',
  'Escola Aprender Mais',
  'Restaurante Sabor & Arte',
  'Academia FitLife',
  'Farmácia São João',
  'Auto Peças Roda Viva',
  'Imobiliária Morar Bem',
  'Transportadora Caminho Certo',
  'Padaria Pão Quente',
  'Pet Shop Amigo Fiel',
  'Salão Beleza Única',
  'Escritório Contábil Oliveira',
  'Distribuidora Norte Sul',
];

const CATEGORIAS_PAGAR = [
  'Aluguel',
  'Energia Elétrica',
  'Água e Saneamento',
  'Telefone e Internet',
  'Folha de Pagamento',
  'Impostos e Tributos',
  'Fornecedores',
  'Manutenção',
  'Marketing',
  'Serviços Terceirizados',
];

const CATEGORIAS_RECEBER = [
  'Venda de Produtos',
  'Prestação de Serviços',
  'Consultoria',
  'Licenciamento',
  'Mensalidade',
  'Comissão',
  'Aluguel de Equipamentos',
  'Suporte Técnico',
];

const DESCRICOES_PAGAR: Record<string, string[]> = {
  Aluguel: [
    'Aluguel mensal da sede',
    'Aluguel do galpão logístico',
    'Aluguel sala comercial',
  ],
  'Energia Elétrica': [
    'Conta de energia do escritório',
    'Conta de energia do depósito',
  ],
  'Água e Saneamento': ['Conta de água mensal', 'Taxa de esgoto'],
  'Telefone e Internet': [
    'Plano corporativo de telefonia',
    'Internet fibra óptica 500MB',
  ],
  'Folha de Pagamento': [
    'Salários equipe administrativa',
    'Salários equipe comercial',
    'Pró-labore sócios',
  ],
  'Impostos e Tributos': [
    'DAS Simples Nacional',
    'IPTU sede',
    'ISS mensal',
    'FGTS competência',
  ],
  Fornecedores: [
    'Reposição de estoque',
    'Compra de insumos',
    'Material de escritório',
  ],
  Manutenção: [
    'Manutenção preventiva ar-condicionado',
    'Reparo sistema elétrico',
    'Manutenção frota',
  ],
  Marketing: [
    'Campanha redes sociais',
    'Impulsionamento Google Ads',
    'Produção de conteúdo',
  ],
  'Serviços Terceirizados': [
    'Serviço de limpeza mensal',
    'Honorários contábeis',
    'Assessoria jurídica',
  ],
};

const DESCRICOES_RECEBER: Record<string, string[]> = {
  'Venda de Produtos': [
    'Venda de produtos linha premium',
    'Pedido atacado mensal',
    'Venda e-commerce',
  ],
  'Prestação de Serviços': [
    'Serviço de instalação',
    'Serviço de manutenção contratado',
    'Serviço avulso',
  ],
  Consultoria: [
    'Consultoria estratégica Q1',
    'Projeto de reestruturação',
    'Diagnóstico empresarial',
  ],
  Licenciamento: ['Licença anual de software', 'Licença de uso da plataforma'],
  Mensalidade: [
    'Mensalidade plano básico',
    'Mensalidade plano empresarial',
    'Mensalidade plano premium',
  ],
  Comissão: ['Comissão sobre vendas março', 'Comissão parceiro comercial'],
  'Aluguel de Equipamentos': [
    'Locação de impressoras',
    'Locação de equipamentos audiovisuais',
  ],
  'Suporte Técnico': ['Contrato de suporte mensal', 'Suporte técnico avulso'],
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

function sortear<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sortearInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sortearValor(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Gera uma data distribuída nos últimos 12 meses.
 * O parâmetro `tendencia` inclina a distribuição:
 *   - 'passado'  → concentra nos meses mais antigos  (contas vencidas/pagas)
 *   - 'futuro'   → concentra nos meses mais recentes e futuros (contas pendentes)
 *   - 'uniforme' → distribuição igual ao longo dos 12 meses
 */
function gerarData(
  tendencia: 'passado' | 'futuro' | 'uniforme' = 'uniforme',
): Date {
  const hoje = new Date();
  let mesesAtras: number;

  if (tendencia === 'passado') {
    // Pesa para os meses mais antigos (3–12 meses atrás)
    mesesAtras = sortearInt(3, 12);
  } else if (tendencia === 'futuro') {
    // Pesa para datas próximas ou futuras (-1 a 3 meses a partir de hoje)
    mesesAtras = sortearInt(-3, 1);
  } else {
    mesesAtras = sortearInt(-2, 11);
  }

  const data = new Date(hoje);
  data.setMonth(data.getMonth() - mesesAtras);
  data.setDate(sortearInt(1, 28)); // evita problemas com fevereiro
  return data;
}

/**
 * Define o status com base na data de vencimento.
 * Contas vencidas têm maior chance de já estar pagas/recebidas,
 * simulando inadimplência parcial — mais realista para o dashboard.
 */
function definirStatusPagar(dueDate: Date): PayableStatus {
  const vencida = dueDate < new Date();
  if (vencida) {
    // 75% pagas, 25% inadimplentes (vencidas e ainda pendentes)
    return Math.random() < 0.75 ? PayableStatus.PAID : PayableStatus.PENDING;
  }
  // Contas futuras: 15% já antecipadas, 85% pendentes
  return Math.random() < 0.15 ? PayableStatus.PAID : PayableStatus.PENDING;
}

function definirStatusReceber(dueDate: Date): ReceivableStatus {
  const vencida = dueDate < new Date();
  if (vencida) {
    // 80% recebidas, 20% inadimplentes
    return Math.random() < 0.8
      ? ReceivableStatus.RECEIVED
      : ReceivableStatus.PENDING;
  }
  // Contas futuras: 10% já recebidas antecipadamente, 90% pendentes
  return Math.random() < 0.1
    ? ReceivableStatus.RECEIVED
    : ReceivableStatus.PENDING;
}

// ─── Geradores ────────────────────────────────────────────────────────────────

function gerarPayables() {
  return Array.from({ length: 100 }, () => {
    const categoria = sortear(CATEGORIAS_PAGAR);
    const descricoes = DESCRICOES_PAGAR[categoria];
    const dueDate = gerarData('uniforme');

    // Valores realistas por categoria
    const faixas: Record<string, [number, number]> = {
      Aluguel: [2500, 12000],
      'Energia Elétrica': [300, 1800],
      'Água e Saneamento': [150, 600],
      'Telefone e Internet': [200, 800],
      'Folha de Pagamento': [5000, 35000],
      'Impostos e Tributos': [800, 8000],
      Fornecedores: [1000, 20000],
      Manutenção: [300, 3500],
      Marketing: [500, 5000],
      'Serviços Terceirizados': [600, 4000],
    };

    const [min, max] = faixas[categoria] ?? [200, 5000];

    return {
      supplier: sortear(FORNECEDORES),
      description: sortear(descricoes),
      amount: sortearValor(min, max),
      dueDate,
      category: categoria,
      status: definirStatusPagar(dueDate),
    };
  });
}

function gerarReceivables() {
  return Array.from({ length: 100 }, () => {
    const categoria = sortear(CATEGORIAS_RECEBER);
    const descricoes = DESCRICOES_RECEBER[categoria];
    const dueDate = gerarData('uniforme');

    // Receitas geralmente maiores que despesas unitárias
    const faixas: Record<string, [number, number]> = {
      'Venda de Produtos': [1500, 30000],
      'Prestação de Serviços': [800, 15000],
      Consultoria: [2000, 20000],
      Licenciamento: [500, 8000],
      Mensalidade: [300, 5000],
      Comissão: [400, 6000],
      'Aluguel de Equipamentos': [600, 4000],
      'Suporte Técnico': [500, 3000],
    };

    const [min, max] = faixas[categoria] ?? [500, 10000];

    return {
      client: sortear(CLIENTES),
      description: sortear(descricoes),
      amount: sortearValor(min, max),
      dueDate,
      category: categoria,
      status: definirStatusReceber(dueDate),
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // Limpa os dados existentes antes de repovoar
  await prisma.payable.deleteMany();
  await prisma.receivable.deleteMany();
  console.log('🗑️  Dados anteriores removidos');

  // Payables
  const payables = gerarPayables();
  await prisma.payable.createMany({ data: payables });

  const pagas = payables.filter((p) => p.status === PayableStatus.PAID).length;
  const pendPag = payables.length - pagas;
  console.log(
    `✅ ${payables.length} contas a pagar criadas (${pagas} pagas | ${pendPag} pendentes)`,
  );

  // Receivables
  const receivables = gerarReceivables();
  await prisma.receivable.createMany({ data: receivables });

  const recebidas = receivables.filter(
    (r) => r.status === ReceivableStatus.RECEIVED,
  ).length;
  const pendRec = receivables.length - recebidas;
  console.log(
    `✅ ${receivables.length} contas a receber criadas (${recebidas} recebidas | ${pendRec} pendentes)`,
  );

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
