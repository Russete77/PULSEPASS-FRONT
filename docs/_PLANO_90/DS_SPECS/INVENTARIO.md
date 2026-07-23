# PulsePass · Inventário do Design System → App real

Fonte: `design-system/src/*.jsx`. Mapa completo de TODAS as telas do DS,
mapeadas para a rota real, com status e o que falta (UI e/ou backend).

Legenda status: ✅ feito no padrão · 🟡 existe, fora do padrão · ⛔ não existe (falta construir)

## A) CLIENTE — App/Web (iPhoneScreens 1–21)

| # | Tela DS | Rota real | Status | Falta |
|---|---------|-----------|--------|-------|
| 1 | Home (discover pessoal) | `/` Discover | ✅ | — |
| 2 | Event Detail | `/eventos/:slug` | ✅ | — |
| 3 | Checkout PIX | `/checkout/:id` | ✅ | — |
| 4 | My Ticket (QR) | `/ingresso/:id` | ✅ | **QR rotativo (anti-golpe)** |
| 5 | Wallet (Cashless) | ⛔ (só mobile) | ⛔ | rota web + saldo/extrato |
| 6 | Onboarding/Login | `/entrar` | ✅ | — |
| 7 | Search Results | (embutido na Discover) | 🟡 | página dedicada |
| 8 | Promoter (AZList) | `/promoter` | 🟡 | padronizar |
| 9 | Public Guest Signup | `/lista/:code` | 🟡 | padronizar |
| 10 | Recharge Cashless | ⛔ | ⛔ | recarga via Pix (web) |
| 11 | Order Ahead (bar) | ⛔ | ⛔ | pedir no bar pelo app |
| 12 | Live Event Map | ⛔ | ⛔ | mapa do rolê |
| 13 | Notifications/Activity | ⛔ | ⛔ | central de avisos |
| 14 | Order Success | (redirect p/ ingressos) | 🟡 | tela de sucesso dedicada |
| 15 | My Tickets (lista) | `/meus-ingressos` | ✅ | — |
| 16 | Profile/Tier/Conquistas | ⛔ | ⛔ | perfil + fidelidade |
| 17 | Withdraw (saque saldo) | ⛔ | ⛔ | saque Pix do residual |
| 18 | **Catalog (estilo Sympla)** | `/` (deveria ser a home pública) | 🟡 | **rebuild alta conversão** |
| 19 | Transfer Ticket | (modal no ingresso) | ✅ | — |
| 20 | Casa/Producer Profile | ⛔ | ⛔ | seguir casa/produtora |
| 21 | Loyalty/Fidelidade | ⛔ | ⛔ | programa de pontos |
| — | My Orders | `/meus-pedidos` | ✅ | — |
| — | Camarotes público | `/eventos/:slug/camarotes` | ✅ | — |

## B) PRODUTORA — Cockpit (iPad Screens/Produtora)

| Tela DS | Rota admin | Status |
|---------|-----------|--------|
| Producer Dashboard | `/` admin | 🟡 |
| Multi-Event (org) | `/` (lista) | 🟡 |
| Event Wizard | `/novo` | 🟡 |
| Guest List Manager | (Promoters) | 🟡 |
| PDV | `/pdv` | 🟡 |
| KDS (cozinha) | ⛔ | ⛔ |
| Cashier Closing | `/fechamento` | 🟡 |
| Reservations (mesas) | (Camarotes) | 🟡 |
| Sales Report (Excel 9 abas) | ⛔ | ⛔ |
| Promoter Manager + Leaderboard | (Promoters) | 🟡 |
| Financial / Payout | `/repasse` | 🟡 |
| Marketing / Promo Codes | `/cupons` | 🟡 |
| Box Office (maquininha) | ⛔ | ⛔ |
| Team & Staff | `/equipe` | 🟡 |
| Branding | ⛔ | ⛔ |
| API & Webhooks | ⛔ | ⛔ |

## C) ADMIN PLATAFORMA (iPadAdm) — ⛔ nenhuma existe ainda
Platform Dashboard · Organizations (multi-tenant) · Fraud Monitor · Support Inbox · Audit · Feature Flags · Taxes · Finance.

## D) OPERAÇÃO / GAPS
Door Scanner (check-in) → `/porta` 🟡 · Seat Map ⛔ · Totem ⛔ · Stock ⛔ · Waiter/WaiterOrder ⛔ · Multi-Role Login 🟡

## Resumo honesto
- **Cliente:** ~10/21 no padrão; faltam Wallet, Recharge, Order Ahead, Live Map, Notifications, Profile, Withdraw, Casa, Loyalty, Search dedicada + rebuild da Catalog.
- **Produtora:** todas existem mas **fora do padrão** (classes `ck-` antigas).
- **Admin plataforma:** 0 construídas.
- **Backend a somar p/ fechar o DS:** categoria em eventos, contagem "bombando", QR rotativo, wallet web, saque, fidelidade, relatórios.

## Ordem de execução proposta
1. Homepage pública estilo Catalog (conversão) — **agora**
2. Fechar cliente restante no padrão (Promoter, GuestSignup, Search, Order Success)
3. Cockpit produtora inteiro `ck-`→`pp-`
4. Novas telas cliente (Wallet/Recharge/Profile/Loyalty…)
5. Admin plataforma + operação (KDS/Seat/Totem)
