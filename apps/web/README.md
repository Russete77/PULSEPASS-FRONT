# PulsePass · Web (pulse-front)

Frontend **web responsivo** da PulsePass — React + **Vite** + **CSS globals**.
Consome o backend único (`pulse-back`). Fase 1: fluxo do Cliente comprar ingresso.

Repositório: `https://github.com/Russete77/pulse-front`

## Stack

- **React 19** + **React Router 7**
- **Vite 6** (dev server + build)
- **CSS global puro** — design tokens em `src/styles/tokens.css` (do design system PulsePass), estilos em `src/styles/global.css`. Sem Tailwind, sem CSS-modules.
- **@supabase/supabase-js** — somente para autenticação (login/cadastro)
- Camada de dados via **fetch** (`src/lib/api.js`) → backend único

## Estrutura

```
src/
  styles/    tokens.css (design system) + global.css (responsivo)
  lib/       api.js (fetch), supabase.js (auth), format.js
  context/   AuthContext.jsx
  components/ Layout, States
  pages/     Discover, EventDetail, Checkout, Login, MyTickets, TicketView
```

## Rodando

```bash
cp .env.example .env       # VITE_API_URL + VITE_SUPABASE_*
npm install
npm run dev                # http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:4000` em dev, então com o
backend rodando o catálogo já aparece. Login/checkout exigem o Supabase configurado.

## Fluxo (Fase 1)

`/` Discover → `/eventos/:slug` (escolhe lotes) → cria pedido → `/checkout/:orderId`
(QR Pix + copia-e-cola, polling de confirmação) → `/meus-ingressos` → `/ingresso/:id` (QR de entrada).

> Em dev há o botão **"Simular pagamento confirmado"** no checkout, para testar a
> emissão de ingressos sem depender do webhook do Asaas.

## Responsividade

Mobile-first com breakpoints em 600 / 768 / 900 / 980px. Grid de eventos colapsa
de 3 → 2 → 1 coluna; a página do evento vira coluna única no mobile. As telas
nativas (iPhone super-app, iPad cockpit) entram nas Fases 2 e 3.

## Roadmap

- **Fase 1 (atual):** web responsivo — comprar ingresso
- **Fase 2:** mobile (super-app Cliente, Promoter, Garçom)
- **Fase 3:** iPad/tablet (Produtora: PDV, KDS, porta, reservas)
