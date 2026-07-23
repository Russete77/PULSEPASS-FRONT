# Arquitetura-Alvo — Monolito Modular Vertical Escalável

**Decisão (confirmada):** manter **backend único Express**, mas reorganizar em **módulos verticais isolados** por bounded context. Escala vertical + times por módulo, sem o custo prematuro de microserviços. Estratégia "strangler-ready": qualquer módulo pode ser extraído para serviço próprio depois, quando (e se) provar necessidade de carga (candidato natural: `cashless` em evento de alto volume).

**Princípio-guia:** *cada vertical é dono do seu schema, suas rotas, seus serviços e seus dados; a comunicação entre verticais é por interface explícita (contrato), nunca por acesso direto às tabelas do vizinho.*

---

## 1. Bounded contexts (módulos verticais)

| Módulo | Responsabilidade | Tabelas próprias |
|---|---|---|
| **identity** | Auth, perfis, organizações, RBAC de equipe | profiles, organizations, event_staff |
| **catalog** | Eventos, lotes, locais, cardápio (definição) | events, ticket_tiers, venues, menu_items |
| **ticketing** | Pedidos, ingressos, transferência, entrega | orders, order_items, tickets, ticket_transfers |
| **payments** *(kernel)* | Asaas, PIX/cartão, split, webhooks, reembolso, cupom | coupons, webhook_events, payment_intents |
| **cashless** | Carteira, recarga, bar, **ledger double-entry** | wallets, wallet_ledger, wallet_topups, bar_orders, bar_order_items |
| **guestlist** | Promoters, convidados, comissão, **portal do promoter** | promoters, guests, commissions, list_types |
| **door** | Check-in, modo offline, manifesto | check_ins (+ views sobre tickets/guests) |
| **notifications** | Push, e-mail, jobs de entrega | notification_tokens, outbox |
| **platform** *(infra transversal)* | Fila, cache, audit log, feature flags, observability | audit_log, feature_flags, jobs |

`payments` e `identity` são **kernels compartilhados** (todo mundo depende deles). Os demais são verticais de negócio.

---

## 2. Estrutura de pastas (backend)

```
apps/api/src/
  modules/
    identity/     { routes.js  controller.js  service.js  repo.js  schema.js  events.js }
    catalog/      { ... }
    ticketing/    { ... }
    payments/     { ...  providers/asaas.js }
    cashless/     { ...  ledger.js }
    guestlist/    { ... }
    door/         { ...  offline.js }
    notifications/{ ...  channels/{push,email}.js }
  platform/
    db/           { client.js  migrate.js }        # cliente pg pooled + migration runner
    queue/        { index.js }                      # pg-boss/BullMQ (fila durável)
    cache/        { index.js }                      # Redis (rate-limit, token, catálogo)
    audit/        { index.js }                      # audit_log append-only
    flags/        { index.js }                      # feature flags
    obs/          { logger.js  metrics.js  sentry.js }
    http/         { app.js  middleware/ }           # express factory, auth, errors, rate-limit
  server.js
```

**Regras de dependência (impostas por lint de fronteira, ex. `eslint-plugin-boundaries`):**
- Um módulo importa de outro **só via seu `service.js`/`events.js`** (a fachada), nunca `repo.js`/tabelas.
- `repo.js` é a **única** camada que fala com o banco (mata o acoplamento de `supabase.from()` espalhado — achado #1 da auditoria de backend).
- `platform/*` pode ser importado por qualquer módulo; módulos de negócio não se importam em ciclo.

---

## 3. Camada de dados (a peça que falta hoje)

Introduzir **repository layer** por módulo:
- Substitui o singleton `supabase` inline por `repo.js` com queries nomeadas.
- Migrar do cliente PostgREST (HTTP por query) para **`pg` pooled + PgBouncer** nos caminhos de dinheiro (menor latência, transações reais no Node quando preciso).
- **Migration runner de verdade** (Drizzle/sqitch): tabela `schema_migrations`, DDL transacional, rollback, checksum. Mata o copy-paste manual no SQL Editor.

---

## 4. Plataforma transversal (o que destrava escala)

| Peça | Substitui | Por quê |
|---|---|---|
| **Redis** | `Map()` de rate-limit e token (achado #9) | Estado compartilhado entre instâncias → **escala horizontal** |
| **Fila durável** (pg-boss → BullMQ/SQS) | entrega de ingresso inline (achado #14) | At-least-once com retry/DLQ: e-mail, PDF, push, side-effects de pagamento |
| **Cache de catálogo** (Redis/CDN) | Postgres a cada request anônimo | Endpoint mais quente do sistema |
| **audit_log** append-only | nada | Trilha de quem fez o quê (reembolso, status, staff, comissão, PDV) — compliance |
| **feature_flags** | `!env.isProd` espalhado | Rollout gradual por evento/org |
| **Ledger double-entry** | saldo single-entry (achado #4) | Dinheiro real exige débito/crédito reconciliável (`balance = sum(entries)`) |

---

## 5. Contratos & API

- **Versionamento:** prefixo `/api/v1/*` (hoje é flat; quebra de contrato não tem onde morar).
- **OpenAPI** gerado do zod (`zod-to-openapi`) → doc viva + tipos p/ os fronts.
- **Idempotency-Key** header em writes do cliente (pedido, recarga, pedido de bar) — mata os achados #1 e #5.

---

## 6. Frontend (alinhado ao vertical)

```
apps/{web,admin,mobile}
packages/
  ui/             # design system real (variantes, dark/light) — absorve design-system/
  design-tokens/  # fonte única → gera .css (web/admin) e .ts (mobile) via Style Dictionary
  api-client/     # + tipos gerados do OpenAPI
  data/           # hook useQuery/cache (react-query) compartilhável
  config/         # tsconfig/eslint/prettier compartilhados
  types/          # tipos de domínio compartilhados
```
- **TypeScript em todos** (hoje só mobile). Prioridade: caminhos de dinheiro (checkout, carteira, porta).
- **react-query** mata o `loading/done/error` copiado ~15× e dá cache/retry/dedup de graça.
- **Code-splitting por rota** (`React.lazy` — hoje viola a própria regra do projeto).

---

## 7. Ops mínima para produção (hoje nota 1/10)

- **CI** (GitHub Actions): lint + `money.test.js` contra DB efêmero + build, gate no PR.
- **Container** (Dockerfile por app) + deploy manifest (Vercel/Fly/Render).
- **Ambientes** dev → staging → prod, com **secret manager** (tirar `service_role` do disco).
- **Observability**: métricas (latência/erro/RPS), tracing nas chamadas Asaas, alertas/SLO.

---

## 8. Sequência de migração (sem parar o barco — strangler)

1. Introduzir `platform/` (db pooled, Redis, fila, migration runner) **sem** mover regra de negócio.
2. Extrair `repo.js` por módulo, um vertical de cada vez, começando por **payments** (kernel).
3. Mover rotas/serviços existentes para dentro de `modules/*` (mecânico, cobre com testes).
4. Ligar lint de fronteira → congela o desenho.
5. A partir daí, cada feature do roadmap nasce já dentro do seu módulo.
