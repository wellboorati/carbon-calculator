# Carbon Calculator

Calculadora de pegada de carbono que estima emissões anuais de CO₂ com base em energia doméstica, transporte, voos e alimentação. Gera um relatório em PDF comparando o resultado com médias nacionais e mundiais.

## Arquitetura

```
carbon-calculator/
├── backend/    # Node.js + Express + GraphQL (Apollo Server)
├── frontend/   # React + Vite + Material UI
├── e2e/        # Testes end-to-end com Playwright
└── docker-compose.yml
```

O frontend se comunica com o backend exclusivamente via GraphQL. Não há banco de dados — todo o cálculo é stateless.

---

## Pré-requisitos

- Node.js 18+
- npm

---

## Modo desenvolvimento

Execute cada serviço em um terminal separado:

```bash
# Backend → http://localhost:3002
cd backend
npm install
npm run dev

# Frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

As variáveis de ambiente padrão já estão configuradas para desenvolvimento local. Se necessário, crie os arquivos `.env`:

```bash
# backend/.env
PORT=3002
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:3002
```

---

## Modo Docker

```bash
docker compose up --build
```

| Serviço  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:8080  |
| Backend  | http://localhost:3003  |

No Docker, o nginx do frontend faz proxy das chamadas `/graphql` para o container do backend internamente — o backend não precisa ser acessado diretamente pelo browser.

---

## Testes unitários

### Backend (Jest)

```bash
cd backend
npm test
```

Cobre os serviços de cálculo: housing, transportation, flights e diet.

### Frontend (Vitest)

```bash
cd frontend
npm test
```

---

## Testes end-to-end (Playwright)

Os testes E2E sobem o backend e o frontend automaticamente antes de executar.

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

Para ver o relatório após a execução:

```bash
npx playwright show-report
```

---

## Categorias de cálculo

| Categoria      | Entradas                                               |
|----------------|--------------------------------------------------------|
| Energia doméstica | Eletricidade, gás natural, óleo de aquecimento, propano |
| Transporte     | Veículo próprio (gasolina/diesel) e transporte público |
| Voos           | Busca por aeroporto ou distância manual, classe da cabine |
| Alimentação    | Consumo semanal de carne bovina, outras carnes, peixe e laticínios |

O resultado é expresso em toneladas de CO₂ por ano e comparado com médias por país e a média mundial.
