# PulsePass · Admin (pulse-admin)

Cockpit da **Produtora** — React + **Vite** + **CSS globals**. Tablet/desktop.
Consome o mesmo backend único (`pulse-back`). Fase 3: criar evento + dashboard ao vivo.

## Stack

- **React 19** + **React Router 7** + **Vite 6**
- **CSS global puro** — tokens em `src/styles/tokens.css`, cockpit em `src/styles/admin.css`
- **@supabase/supabase-js** — autenticação (mesmas contas do ecossistema)
- Dados via **fetch** (`src/lib/api.js`) → endpoints `/api/admin/*`

## Estrutura

```
src/
  styles/    tokens.css + admin.css (layout sidebar responsivo)
  lib/       api.js, supabase.js, format.js
  context/   AuthContext.jsx
  components/ Shell (sidebar + topbar), Loading, ErrorBox
  pages/     Login, Events (+ onboarding de organização), EventWizard, Dashboard
```

## Rodando

```bash
cp .env.example .env       # VITE_API_URL + VITE_SUPABASE_*
npm install
npm run dev                # http://localhost:5174
```

Roda na porta **5174** (o pulse-front do Cliente usa 5173), então os dois
podem rodar ao mesmo tempo apontando para o mesmo backend.

## Fluxo (Fase 3 — slice)

1. **Login** (Supabase).
2. **Onboarding:** se você ainda não tem organização, cria uma (vira `produtora`).
3. **Eventos:** lista os seus; botão **Criar evento**.
4. **Wizard:** título, local, data, UF, descrição e **lotes** (nome/preço/qtd);
   salva rascunho ou **publica**.
5. **Dashboard ao vivo:** receita total, ingressos vendidos, check-ins, receita
   do bar, tabela de lotes e pedidos recentes — atualiza a cada 5s. Botão de
   **publicar/pausar** vendas.

## Backend usado

`GET /api/admin/me`, `POST /api/admin/organizations`, `GET/POST /api/admin/events`,
`GET /api/admin/events/:id`, `PATCH /api/admin/events/:id/status`,
`GET /api/admin/events/:id/dashboard`. Todos exigem `Authorization: Bearer <token>`
e checam se o evento/organização pertence ao usuário.

## Git

```bash
git init -b main
git add .
git commit -m "feat: cockpit Produtora (Fase 3)"
git remote add origin https://github.com/Russete77/pulse-admin.git
git push -u origin main
```

## Roadmap (próximas telas do cockpit)

Porta (scanner check-in), PDV cashless, KDS, reservas/mesas, financeiro/saque,
fechamento de caixa, promoters/comissão, relatórios, white-label.
