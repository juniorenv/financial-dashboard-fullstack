import path from 'path';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import { PayableStatus, ReceivableStatus } from 'src/generated/prisma/enums';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// ─── Cliente Prisma isolado para o seed ───────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Dados de referência ──────────────────────────────────────────────────────

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
] as const;

const CATEGORIAS_RECEBER = [
  'Venda de Produtos',
  'Prestação de Serviços',
  'Consultoria',
  'Licenciamento',
  'Mensalidade',
  'Comissão',
  'Aluguel de Equipamentos',
  'Suporte Técnico',
] as const;

type CategoriaPagar = (typeof CATEGORIAS_PAGAR)[number];
type CategoriaReceber = (typeof CATEGORIAS_RECEBER)[number];

// ─── Faixas de valor por categoria ───────────────────────────────────────────

const FAIXAS_PAGAR: Record<CategoriaPagar, [number, number]> = {
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

const FAIXAS_RECEBER: Record<CategoriaReceber, [number, number]> = {
  'Venda de Produtos': [1500, 30000],
  'Prestação de Serviços': [800, 15000],
  Consultoria: [2000, 20000],
  Licenciamento: [500, 8000],
  Mensalidade: [300, 5000],
  Comissão: [400, 6000],
  'Aluguel de Equipamentos': [600, 4000],
  'Suporte Técnico': [500, 3000],
};

// ─── Descrições por categoria (geradas com Faker) ─────────────────────────────

function descricaoPagar(categoria: CategoriaPagar): string {
  const map: Record<CategoriaPagar, () => string> = {
    Aluguel: () =>
      `Aluguel ${faker.helpers.arrayElement(['mensal da sede', 'do galpão logístico', 'sala comercial'])}`,
    'Energia Elétrica': () =>
      `Conta de energia — ${faker.location.streetAddress()}`,
    'Água e Saneamento': () =>
      faker.helpers.arrayElement([
        'Conta de água mensal',
        'Taxa de esgoto e saneamento',
      ]),
    'Telefone e Internet': () =>
      `${faker.company.buzzNoun()} — plano ${faker.helpers.arrayElement(['corporativo', 'empresarial', 'fibra 500MB'])}`,
    'Folha de Pagamento': () =>
      `Salários ${faker.helpers.arrayElement(['equipe administrativa', 'equipe comercial', 'equipe técnica'])} — ${faker.date.month()}`,
    'Impostos e Tributos': () =>
      faker.helpers.arrayElement([
        'DAS Simples Nacional',
        'IPTU sede',
        'ISS mensal',
        'FGTS competência',
        'INSS folha',
      ]),
    Fornecedores: () =>
      `${faker.helpers.arrayElement(['Reposição de estoque', 'Compra de insumos', 'Material de escritório'])} — ${faker.company.name()}`,
    Manutenção: () =>
      `${faker.helpers.arrayElement(['Manutenção preventiva', 'Reparo', 'Revisão'])} — ${faker.commerce.department()}`,
    Marketing: () =>
      `${faker.helpers.arrayElement(['Campanha', 'Impulsionamento', 'Produção de conteúdo'])} — ${faker.company.buzzPhrase()}`,
    'Serviços Terceirizados': () =>
      `${faker.helpers.arrayElement(['Serviço de limpeza', 'Honorários contábeis', 'Assessoria jurídica', 'Consultoria TI'])} — ${faker.date.month()}`,
  };
  return map[categoria]();
}

function descricaoReceber(categoria: CategoriaReceber): string {
  const map: Record<CategoriaReceber, () => string> = {
    'Venda de Produtos': () =>
      `${faker.helpers.arrayElement(['Pedido', 'Venda', 'Fornecimento'])} — ${faker.commerce.productName()}`,
    'Prestação de Serviços': () =>
      `${faker.helpers.arrayElement(['Serviço de instalação', 'Serviço de manutenção', 'Execução de serviço'])} — ${faker.company.buzzVerb()}`,
    Consultoria: () =>
      `Consultoria ${faker.helpers.arrayElement(['estratégica', 'financeira', 'operacional', 'de TI'])} — ${faker.date.month()}`,
    Licenciamento: () =>
      `Licença ${faker.helpers.arrayElement(['anual', 'mensal', 'trimestral'])} — ${faker.commerce.productName()}`,
    Mensalidade: () =>
      `Mensalidade plano ${faker.helpers.arrayElement(['básico', 'intermediário', 'empresarial', 'premium'])} — ${faker.date.month()}`,
    Comissão: () =>
      `Comissão ${faker.helpers.arrayElement(['sobre vendas', 'parceiro comercial', 'indicação'])} — ${faker.date.month()}`,
    'Aluguel de Equipamentos': () =>
      `Locação de ${faker.helpers.arrayElement(['impressoras', 'equipamentos audiovisuais', 'servidores', 'câmeras'])}`,
    'Suporte Técnico': () =>
      `${faker.helpers.arrayElement(['Contrato de suporte', 'Atendimento técnico', 'Suporte remoto'])} — ${faker.date.month()}`,
  };
  return map[categoria]();
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function sortearInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

function sortearValor(min: number, max: number): number {
  return faker.number.float({ min, max, fractionDigits: 2 });
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
    mesesAtras = sortearInt(3, 12);
  } else if (tendencia === 'futuro') {
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
    return faker.datatype.boolean({ probability: 0.75 })
      ? PayableStatus.PAID
      : PayableStatus.PENDING;
  }
  // Contas futuras: 15% já antecipadas, 85% pendentes
  return faker.datatype.boolean({ probability: 0.15 })
    ? PayableStatus.PAID
    : PayableStatus.PENDING;
}

function definirStatusReceber(dueDate: Date): ReceivableStatus {
  const vencida = dueDate < new Date();
  if (vencida) {
    // 80% recebidas, 20% inadimplentes
    return faker.datatype.boolean({ probability: 0.8 })
      ? ReceivableStatus.RECEIVED
      : ReceivableStatus.PENDING;
  }
  // Contas futuras: 10% já recebidas antecipadamente, 90% pendentes
  return faker.datatype.boolean({ probability: 0.1 })
    ? ReceivableStatus.RECEIVED
    : ReceivableStatus.PENDING;
}

// ─── Geradores ────────────────────────────────────────────────────────────────

function gerarPayables() {
  return Array.from({ length: 100 }, () => {
    const categoria = faker.helpers.arrayElement(CATEGORIAS_PAGAR);
    const dueDate = gerarData('uniforme');
    const [min, max] = FAIXAS_PAGAR[categoria];

    return {
      supplier: faker.company.name(),
      description: descricaoPagar(categoria),
      amount: sortearValor(min, max),
      dueDate,
      category: categoria,
      status: definirStatusPagar(dueDate),
    };
  });
}

function gerarReceivables() {
  return Array.from({ length: 100 }, () => {
    const categoria = faker.helpers.arrayElement(CATEGORIAS_RECEBER);
    const dueDate = gerarData('uniforme');
    const [min, max] = FAIXAS_RECEBER[categoria];

    return {
      client: faker.company.name(),
      description: descricaoReceber(categoria),
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

  await prisma.payable.deleteMany();
  await prisma.receivable.deleteMany();
  console.log('🗑️  Dados anteriores removidos');

  const payables = gerarPayables();
  await prisma.payable.createMany({ data: payables });

  const pagas = payables.filter((p) => p.status === PayableStatus.PAID).length;
  const pendPag = payables.length - pagas;
  console.log(
    `✅ ${payables.length} contas a pagar criadas (${pagas} pagas | ${pendPag} pendentes)`,
  );

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
