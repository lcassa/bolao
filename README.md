# Bolão da Copa 2026

App de bolão para a Copa do Mundo 2026, feito com Next.js e Vercel KV.

## Setup local

```bash
npm install
```

Copie o arquivo de variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Preencha o `.env.local` com as credenciais do seu Vercel KV (veja abaixo).

```bash
npm run dev
```

Acesse http://localhost:3000

---

## Deploy no Vercel

### 1. Suba o projeto no GitHub e importe no Vercel
- No painel do Vercel: **Add New Project** → selecione o repositório
- O Vercel detecta Next.js automaticamente → clique em **Deploy**

### 2. Crie o banco Vercel KV
- No painel do projeto: aba **Storage** → **Create Database** → **KV**
- Dê um nome (ex: `bolao-kv`) → **Create**
- Clique em **Connect to Project** → selecione seu projeto → **Connect**
- As variáveis de ambiente são adicionadas automaticamente ao projeto

### 3. Para desenvolvimento local com o KV real
- No painel do KV: aba **.env.local** → copie as variáveis
- Cole no seu `.env.local` local

### 4. Redeploy
Após conectar o KV, faça um novo deploy (ou um push no Git) para ativar.

---

## Senha de admin padrão

```
copa2026
```

Troque a constante `ADMIN_PASSWORD` em `pages/index.jsx` antes de usar em produção.

---

## Estrutura

```
pages/
  index.jsx       → App principal (React)
  api/
    storage.js    → API route que lê/grava no Vercel KV
  _app.js         → Carrega CSS global
styles/
  globals.css     → Reset básico
```
