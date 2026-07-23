# Auditoria de Paridade Front ↔ Back — e correções aplicadas

**Data:** 02/07/2026 · **Método:** 3 auditorias paralelas (web, admin, mobile) mapeando cada endpoint do backend contra o cliente de API e o uso real na UI. Objetivo: **nenhuma função de backend escondida (sem UI) e nenhum método de front morto (sem função real).**

## Resultado por superfície (antes → depois)

### 🛠️ Admin (cockpit da produtora) — já estava 100%
- **22/22 endpoints `/admin/*` wired**, 0 método morto, 0 página órfã.
- Gaps suaves de UX (backend faz mais que a UI expõe) — **deixados documentados, baixa prioridade**:
  - Criar organização adicional (a UI só mostra o onboarding com zero orgs).
  - Voltar evento para `draft` (o toggle do Dashboard só alterna publicado⇄pausado).

### 💻 Web (cliente — fatia de ticketing)
| Antes | Ação |
|---|---|
| `POST /tickets/:id/transfer` sem UI | ✅ **Religado**: botão "Transferir ingresso" no `TicketView` |
| `api.health` método morto | ✅ **Removido** |
| Carteira/bar/recarga sem UI no web | ⚪ **Decisão de produto**: são exclusivos do mobile (super-app), não escondidos — existem e funcionam no mobile |
| `POST /orders/:id/refund` sem UI | ⚪ **Diferido com motivo**: reembolso self-service exige uma tela de "meus pedidos" e é decisão de política (a maioria das ticketeiras não faz 1-clique) |

### 📱 Mobile (super-app do cliente)
| Antes | Ação |
|---|---|
| 🔴 Recarga PIX **não confirmava sozinha** (`getTopup` morto, sem polling) | ✅ **Religado**: polling a cada 5s confirma e volta automático — corrige bug real de produção |
| Histórico do bar sem UI (`myBarOrders` morto) | ✅ **Religado**: seção "Meus pedidos" no `bar.tsx` |
| Busca de eventos sem UI (backend suporta `q`) | ✅ **Religado**: campo de busca com debounce no `index.tsx` |
| `half`/OrderCreate sem tipo/contrato | ✅ **Corrigido**: tipo em `api.ts` + `half` no `openapi.yaml` |
| Seletor de evento p/ carteira/bar multi-evento (`useActiveEvent` fixa o 1º) | ⚪ **Follow-up de UX**: precisa de tela de seleção/persistência do evento ativo |
| `POST /orders/:id/refund` sem UI | ⚪ **Diferido** (mesmo motivo do web) |

## Situação final

- **Métodos mortos: ZERO** em todos os fronts (web `api.health` removido; mobile `getTopup` e `myBarOrders` religados).
- **Backend escondido resolvido**: transferência (web), polling de recarga, histórico de bar, busca de eventos — todos agora com função real na UI.
- **`/orders/:id/refund`** — ✅ **RESOLVIDO (F2.8)**: novo `GET /orders` + tela "Meus pedidos" (web `MyOrders`, mobile `pedidos`) com botão Reembolsar em pedidos pagos. **Nenhum endpoint de backend fica sem UI agora.**
- **Verificação**: `mobile tsc` 0 erros · `web vite build` ok · `api lint` (eslint + fronteira) 0 erros · OpenAPI válido (40 paths).

## Follow-ups registrados (não bloqueiam)
1. Tela "Meus pedidos" (web + mobile) → habilita reembolso self-service com contexto.
2. Seletor de evento ativo no mobile (carteira/bar multi-evento).
3. Admin: criar org adicional; controle de status `draft`.
