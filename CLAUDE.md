# Carbon Calculator

## Visão Geral

Calculadora de carbono com frontend e backend separados, rodando em portas distintas. Sem persistência em banco de dados.

## Estrutura do Projeto

```
carbon-calculator/
├── frontend/   # React + Vite + Material UI (porta 5173)
├── backend/    # Node.js + Express (porta 3001)
└── CLAUDE.md
```

> **Nota:** Next.js e Vite são alternativas de bundler — não são usados juntos. Este projeto usa **React + Vite** (SPA simples, sem SSR), que é adequado para uma calculadora sem banco de dados.

---

## Frontend

- **Stack:** TypeScript, React, Vite, Material UI (MUI)
- **Porta:** `5173` (padrão do Vite)
- **Diretório:** `./frontend`

### Comandos

```bash
cd frontend
npm install          # instalar dependências
npm run dev          # iniciar em desenvolvimento
npm run build        # build de produção
npm run preview      # preview do build
```

### Convenções

- Componentes em `src/components/` (PascalCase)
- Páginas em `src/pages/`
- Serviços/API calls em `src/services/`
- Tipagens em `src/types/`
- Use MUI components como base — evite CSS custom desnecessário
- Axios ou fetch nativo para chamadas ao backend

---

## Backend

- **Stack:** TypeScript, Node.js, Express
- **Porta:** `3001`
- **Diretório:** `./backend`
- **Sem banco de dados** — toda lógica de cálculo é stateless

### Comandos

```bash
cd backend
npm install          # instalar dependências
npm run dev          # iniciar com hot-reload (ts-node-dev ou nodemon)
npm run build        # compilar TypeScript
npm start            # rodar build compilado
```

### Convenções

- Rotas em `src/routes/`
- Lógica de negócio em `src/services/`
- Tipagens em `src/types/`
- Controllers em `src/controllers/`
- Entry point: `src/index.ts`
- CORS habilitado para `http://localhost:5173`

---

## Rodando o Projeto Completo

Em dois terminais separados:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Variáveis de Ambiente

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```
PORT=3001
```
