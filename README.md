[TYPESCRIPT__BADGE]: https://img.shields.io/badge/typescript-D4FAFF?style=for-the-badge&logo=typescript
[NESTJS__BADGE]: https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white
[REACT__BADGE]: https://img.shields.io/badge/react-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[PRISMA__BADGE]: https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[POSTGRES__BADGE]: https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[DOCKER__BADGE]: https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[VITE__BADGE]: https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[TAILWIND__BADGE]: https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[ZOD__BADGE]: https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white
[NGINX__BADGE]: https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white
[TANSTACK__BADGE]: https://img.shields.io/badge/tanstack-FF4154?style=for-the-badge&logo=reactquery&logoColor=white

<h1 align="center">
  💰 Financial Dashboard
</h1>

<p align="center">
  Sistema fullstack de gestão financeira empresarial com dashboard BI em tempo real.
</p>

<div align="center">

![][TYPESCRIPT__BADGE]
![][NESTJS__BADGE]
![][REACT__BADGE]
![][PRISMA__BADGE]
![][POSTGRES__BADGE]
![][DOCKER__BADGE]
![][VITE__BADGE]
![][TAILWIND__BADGE]
![][ZOD__BADGE]
![][NGINX__BADGE]
![][TANSTACK__BADGE]

</div>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#arquitetura">Arquitetura</a> •
  <a href="#como-rodar">Como rodar</a> •
  <a href="#endpoints-da-api">API</a> •
  <a href="#variáveis-de-ambiente">Variáveis de ambiente</a>
</p>

---

## 📋 Sobre o projeto

O **Financial Dashboard** é uma aplicação fullstack para gestão de contas a pagar e a receber, com um painel de controle BI que consolida KPIs financeiros, gráficos de distribuição por categoria, comparativo de pagamentos vs recebimentos e fluxo de caixa mensal.

A cotação do dólar é atualizada automaticamente a cada 30 segundos via integração com a [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas), permitindo visualizar o saldo projetado convertido em USD em tempo real.

---

## ✨ Funcionalidades

### Contas a Pagar
- Cadastro, edição e exclusão de contas com fornecedor, valor, vencimento e categoria
- Marcação de contas como **pagas** com um clique
- Indicadores de contas **vencidas** e **pendentes**
- Totais em aberto e pagos exibidos no cabeçalho da página

### Contas a Receber
- Cadastro, edição e exclusão de receitas com cliente, valor, vencimento e categoria
- Marcação de contas como **recebidas** com um clique
- Indicadores de contas **vencidas** e **pendentes**
- Totais a receber e já recebidos exibidos no cabeçalho da página

### Dashboard BI
- **5 KPIs:** Total a receber, Total a pagar, Total pendente, Saldo projetado (BRL + USD) e Saldo realizado
- **Gráfico de barras:** Comparativo entre contas pagas/recebidas vs pendentes
- **Gráfico de donut:** Distribuição por categoria (alternável entre a pagar e a receber)
- **Gráfico de linha:** Fluxo de caixa mensal com receitas, despesas e saldo
- Cotação USD/BRL atualizada automaticamente com timestamp da última busca

---

## Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Contas a Pagar

![Contas a Pagar](screenshots/contas_a_pagar.png)

### Contas a Receber

![Contas a Receber](screenshots/contas_a_receber.png)

### Formulário de nova conta

![Formulario Nova conta](screenshots/nova_conta.png)

---

## Arquitetura

```
financial-dashboard-fullstack/
├── backend/                  # API REST — NestJS + Prisma + PostgreSQL
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── modules/
│   │   │   ├── payables/
│   │   │   ├── receivables/
│   │   │   ├── dashboard/
│   │   │   └── exchange/
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       ├── prisma.service.ts
│   │       └── seed.ts
│   ├── Dockerfile
│   └── entrypoint.sh
├── frontend/                 # SPA — React + Vite + TanStack
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── router.tsx
│   │   └── main.tsx
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── default.conf
│   └── Dockerfile
├── compose.yaml
└── .env.example
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 11, TypeScript, Prisma 7, PostgreSQL 17 |
| Frontend | React 19, Vite 7, TanStack Router, TanStack Query |
| UI | shadcn/ui, Tailwind CSS v4, Recharts |
| Formulários | React Hook Form + Zod |
| Infra | Docker, Docker Compose, nginx |
| Câmbio | AwesomeAPI (polling a cada 30s com cache em memória) |

---

## Como rodar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/)
- **ou** [Node.js 22+](https://nodejs.org/) e [pnpm](https://pnpm.io/) para rodar sem Docker

---

### Com Docker (recomendado)

**1. Clone o repositório**

```bash
git clone https://github.com/juniorenv/financial-dashboard-fullstack.git
cd financial-dashboard-fullstack
```

**2. Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações. Para rodar com Docker, os valores padrão já funcionam sem alterações.

**3. Suba os serviços**

```bash
docker compose up --build
```

Aguarde o healthcheck do PostgreSQL e as migrations automáticas do backend.

**4. Acesse a aplicação**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend (API) | http://localhost/api |

**5. Popular o banco com dados de exemplo (opcional)**

Após os serviços estarem rodando, execute em outro terminal:

```bash
docker compose exec backend pnpm db:seed
```

O seed insere 100 contas a pagar e 100 contas a receber com dados realistas distribuídos nos últimos 12 meses.

---

### Sem Docker (desenvolvimento local)

**1. Clone e configure o ambiente**
```bash
git clone https://github.com/seu-usuario/financial-dashboard-fullstack.git
cd financial-dashboard-fullstack
cp .env.example .env
```

No `.env`, ajuste estas duas variáveis para usar `localhost` em vez do nome do serviço Docker:
```bash
DATABASE_URL=postgresql://admin:secret@localhost:5432/financial_db
FRONTEND_URL=http://localhost:5173
```

**2. Suba apenas o PostgreSQL**
```bash
docker compose up postgres -d
```

**3. Configure e inicie o backend**
```bash
cd backend
pnpm install

# Aplica as migrations e gera o Prisma Client
pnpx prisma migrate deploy
pnpx prisma generate

# Inicia em modo desenvolvimento com hot reload
pnpm start:dev
```

> O backend lê as variáveis de ambiente do `.env` na raiz do projeto. Certifique-se de rodar o comando a partir da pasta `backend/` com o `.env` na raiz.

**4. Configure e inicie o frontend**

Em outro terminal, a partir da raiz do projeto:
```bash
cd frontend
pnpm install
pnpm dev
```

> O frontend lê `VITE_API_URL` do `.env` na raiz via Vite. O valor padrão `http://localhost:3000/api` já aponta para o backend em modo local.

**5. Acesse a aplicação**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:3000/api |

**6. Popular o banco (opcional)**
```bash
cd backend
pnpm db:seed
```

---

## Endpoints da API

Base URL: `/api`

### Contas a Pagar — `/api/payables`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/payables` | Listar todas |
| `GET` | `/payables/:id` | Buscar por ID |
| `POST` | `/payables` | Criar |
| `PUT` | `/payables/:id` | Editar |
| `PATCH` | `/payables/:id/pay` | Marcar como pago |
| `DELETE` | `/payables/:id` | Excluir |

### Contas a Receber — `/api/receivables`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/receivables` | Listar todas |
| `GET` | `/receivables/:id` | Buscar por ID |
| `POST` | `/receivables` | Criar |
| `PUT` | `/receivables/:id` | Editar |
| `PATCH` | `/receivables/:id/receive` | Marcar como recebido |
| `DELETE` | `/receivables/:id` | Excluir |

### Dashboard e Câmbio

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/dashboard` | KPIs + dados dos 3 gráficos |
| `GET` | `/exchange` | Cotação USD/BRL atual |

### Formato de erros

```json
{
    "message": "Conta a pagar com id 6fd2272a-cdb5-4f52-9ecd-2d0a1f290279 não encontrada",
    "error": "Not Found",
    "statusCode": 404
}
```
---

## Validação de dados

### Backend

O backend utiliza `class-validator` e `class-transformer` para validar todos os dados recebidos via `ValidationPipe` global com `whitelist: true` — campos não declarados nos DTOs são automaticamente rejeitados.

Exemplos de validação no payload:

| Campo | Regras |
|-------|--------|
| `supplier` / `client` | Obrigatório, string, máx. 255 caracteres |
| `amount` | Obrigatório, numérico, positivo, máx. 2 casas decimais, máx. `99.999.999,99` |
| `dueDate` | Obrigatório, data válida |
| `category` | Opcional, string, máx. 100 caracteres |
| `description` | Opcional, string, máx. 255 caracteres |
| `status` | Opcional, enum — `PENDING \| PAID` ou `PENDING \| RECEIVED` |

Exemplo de resposta para payload inválido (`400 Bad Request`):
```json
{
  "message": [
    "Valor deve ser positivo",
    "Data de vencimento é obrigatória"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Frontend

O frontend utiliza **Zod** + **React Hook Form** para validação em tempo real antes do envio, com feedback visual por campo:

- Valor: obrigatório, numérico, positivo, máx. 2 casas decimais, máx. `R$ 99.999.999,99`
- Data de vencimento: obrigatória, formato `YYYY-MM-DD`
- Fornecedor/Cliente: obrigatório, entre 2 e 100 caracteres
- Categoria e descrição: opcionais, com limite de caracteres

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```bash
# ─── PostgreSQL ───────────────────────────────────────────────────────────────
POSTGRES_DB=financial_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_PORT=5432

# ─── Prisma / Backend ─────────────────────────────────────────────────────────
# Docker: host = nome do serviço "postgres"
# Local (sem Docker): trocar para localhost
DATABASE_URL=postgresql://admin:secret@postgres:5432/financial_db

# ─── Backend ──────────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Docker: frontend está na porta 80 (nginx)
# Local (sem Docker): trocar para http://localhost:5173
FRONTEND_URL=http://localhost

# ─── API de câmbio ────────────────────────────────────────────────────────────
EXCHANGE_API_URL=https://economia.awesomeapi.com.br/json/last/USD-BRL
EXCHANGE_API_KEY=        # opcional — aumenta o rate limit da AwesomeAPI

# ─── Frontend ─────────────────────────────────────────────────────────────────
# Com Docker: não necessária (nginx faz proxy de /api → backend)
# Local (sem Docker): necessária para o Vite saber onde está o backend
VITE_API_URL=http://localhost:3000/api
```

---

## Modelo de dados

```prisma
model Payable {
  id          String        @id @default(uuid())
  supplier    String
  description String?
  amount      Decimal       @db.Decimal(10, 2)
  dueDate     DateTime      @db.Date
  category    String?
  status      PayableStatus @default(PENDING)  // PENDING | PAID
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Receivable {
  id          String           @id @default(uuid())
  client      String
  description String?
  amount      Decimal          @db.Decimal(10, 2)
  dueDate     DateTime         @db.Date
  category    String?
  status      ReceivableStatus @default(PENDING)  // PENDING | RECEIVED
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```