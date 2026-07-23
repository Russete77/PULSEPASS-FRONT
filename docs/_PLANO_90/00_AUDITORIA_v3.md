# Auditoria Técnica v3 — PulsePass (auditoria total do código)

**Data:** 01/07/2026 · **Escopo:** 100% dos arquivos (api, web, admin, mobile, packages, migrations, tooling)
**Método:** 5 auditorias paralelas independentes, leitura arquivo-a-arquivo, com referências `file:line`.
**Objetivo:** estabelecer o nível e a estrutura organizacional atuais vs. os líderes (Sympla / AzList / Zig) e servir de base para o roadmap até 90%.

---

## Veredito em uma linha

A **fundação de produto e a integridade transacional estão em nível de mercado**; a **fundação de engenharia de escala e operação não estão**. O código é maduro onde importa (dinheiro em RPCs atômicas no Postgres), mas está organizado como **MVP solo**, não como produto de time — falta camada de dados (repository), modularização vertical, fila durável, cache, CI/CD, e há **bugs financeiros e furos de segurança concretos** a corrigir antes de escalar.

---

## Placar consolidado (0–10)

| Camada | Área | Nota | Comentário-chave |
|---|---|---:|---|
| **Backend** | Arquitetura | 7 | Camadas limpas, mas monolito organizado por camada técnica (não por domínio); sem repository layer; 2 idiomas de autorização conflitantes |
| | Escalabilidade | 5 | Agregação em SQL ✅; mas rate-limit e cache de token **em memória** (trava scale horizontal), N+1 no check-in batch, manifest sem limite |
| | Segurança | 6.5 | Webhook timing-safe ✅, RPCs travadas p/ service_role ✅; mas autorização = disciplina de código (service_role bypassa RLS) |
| | Qualidade | 6.5 | Bom error handling; mas só 5 testes (gated), sem config de eslint, sem CI, duplicação |
| | Gaps enterprise | 4 | Sem fila, CI, migration tool, versionamento de API, audit log, feature flags, cache |
| **Banco** | Modelo/normalização | 8 | Modelo coeso nos 3 domínios, dinheiro em centavos, snapshot de preço correto |
| | Integridade transacional | 6 | `place_order`/`confirm`/`credit_topup` sólidos; mas ver **bugs de dinheiro** abaixo |
| | Segurança (RLS/definer) | 6 | Hardening de definer excelente; mas 3 furos reais (ver abaixo) |
| | Escalabilidade/perf | 5 | `expire_pending_orders` faz **full scan** a cada 2min; FKs sem índice; sem partição |
| **Web+Admin** | Estrutura | 7 | React Router limpo; mas sem code-splitting (viola regra do próprio projeto), sem Data Router |
| | Código compartilhado | 6 | `@pulsepass/shared` bem usado; mas AuthContext/supabase.js duplicados web↔admin |
| | Offline (porta) | 6.5 | Dual-index inteligente; mas escritas IndexedDB **não-atômicas e não-aguardadas** |
| | Qualidade | 6 | Sem TypeScript nos caminhos de dinheiro; sem error boundary; a11y fraca |
| | Escalabilidade | 4 | Sem design system, sem cache de dados (react-query), sem testes, sem i18n |
| **Mobile** | Estrutura | 8 | expo-router limpo, auth-gating correto, deep link de lista |
| | Paridade | 9 | **Superset do web** — carteira/recarga/bar/transferência são exclusivos do mobile |
| | Qualidade | 6 | Reuso do shared excelente; mas tipagem frouxa nas bordas, QR é **placeholder**, sem push |
| **Repo** | Monorepo | 5 | Workspaces reais ✅; mas sem orquestrador (Turbo/Nx), sem scripts na raiz, sem config compartilhada |
| | Dev experience | 6 | START.md forte; mas 4 terminais manuais e migrations por copy-paste |
| | **CI/CD & Ops** | **1** | **Nada**: sem CI, sem Docker, sem IaC, sem secret manager, `dist/` commitado |
| | Documentação | 6 | Auditorias honestas; mas sem ADR, sem OpenAPI, sem runbook |
| | Estrutura organizacional | 5 | Layout de MVP solo; falta split `apps/`+`infra/`, libs compartilhadas decompostas, TS consistente |

**Média ponderada ≈ 5.8/10.** Produto forte, engenharia de escala incipiente.

---

## 🔴 Bugs de dinheiro (corrigir ANTES de qualquer cobrança real)

1. **`place_bar_order` não é idempotente** (`migrations/0005:147`). Sem chave de idempotência externa (diferente de orders/topups que têm `external_reference UNIQUE`). Retry do PDV/app após timeout → **cliente debitado 2×** e 2 pedidos. É o bug de dinheiro mais provável em campo.
2. **`redeem_coupon` incrementa `used_count` no checkout** (`0011:49`), não na confirmação. Carrinhos abandonados/expirados **queimam** um cupom limitado (100 usos → esgotado por 100 checkouts não pagos). `expire_pending_orders` e `refund_order` não decrementam.
3. **`refund_order` não valida estado do pedido** antes de devolver estoque (`0012:25`). Reembolsar um pedido já expirado/cancelado (cujo estoque o cron já devolveu) **corrompe `quantity_sold` para baixo**.
4. **`spend_wallet` debita sem registrar `wallet_transactions`** (`0003:110`). Qualquer uso direto dessa RPC cria saldo que **não reconcilia** com o log → deriva de ledger silenciosa. Não há invariante `balance = sum(transactions)`.
5. **Sem chave de idempotência em writes do cliente** (criar pedido, recarga). Duplo-clique em "comprar" antes do attach cria 2 pedidos + 2 cobranças Asaas.

## 🔴 Furos de segurança (corrigir cedo)

6. **Auto-escalação de privilégio:** `profiles_self_update` (`0001:259`) não tem `WITH CHECK` — um `cliente` pode `UPDATE profiles.role = 'adm'` pela chave authenticated.
7. **`coupons_public_read` (`0011:29`) vaza TODOS os cupons ativos** (código + valor) para anônimos. Qualquer um faz `SELECT * FROM coupons` e coleta descontos.
8. **Sem isolamento multi-tenant no banco (RLS).** Isolamento é só filtro em código sobre a chave `service_role` (god-mode). Um `SELECT` sem filtro de dono = IDOR/vazamento cross-tenant sem backstop.

## 🟠 Bloqueadores de escala / correção

9. **Rate-limiter e cache de token em memória** (`middleware/rateLimit.js:6`, `config/supabase.js:18`) → com >1 instância o limite vira `max×N` e o cache duplica. **Bloqueia escala horizontal.**
10. **`expire_pending_orders` full scan de `orders` a cada 2min** (cron) — sem índice parcial `orders(expires_at) WHERE status='pending'`. Cresce linearmente com o histórico.
11. **Dois idiomas de autorização:** `admin.service.js` usa `assertEventOwner` (só dono) e ignora o papel `manager` — contradiz a migration `0009`. `manager` não funciona no cockpit.
12. **QR é placeholder** no web e no mobile (não renderiza QR real). **Bloqueia a porta** de verdade.
13. **N+1 no `checkInBatch`** (até 4000 round-trips seriais) e **`eventManifest` sem limite** (dump de 50k tickets + `qr_secret`).
14. **Entrega de ingresso inline fire-and-forget** (`orders.service.js:207`) — outage do Resend = ingresso perdido, sem retry/fila.
15. **Offline da porta: escritas IndexedDB não-atômicas e não-aguardadas** (`offlineDoor.js`) — pode marcar usado sem enfileirar (sub-contagem) num contexto de entrada paga.

---

## Estrutura organizacional: atual vs. líderes

**Hoje (MVP solo):**
```
pulsepass/
  api/  web/  admin/  mobile/     ← apps na raiz, misturados
  packages/shared/                ← 1 pacote grab-bag (format+tokens+api+card)
  design-system/                  ← órfão (sem package.json, não é lib consumível)
  (sem apps/, sem infra/, sem CI, sem Docker, sem tsconfig/eslint compartilhado)
```
- Backend organizado **por camada técnica** (routes/controllers/services), não por domínio.
- Só o mobile é TypeScript; a API ("onde vive o dinheiro") é JS puro.
- Nested `.git` obsoletos em `api/` e `web/`; `dist/` commitado.

**Como um scale-up organiza (alvo):**
```
pulsepass/
  apps/            api, web, admin, mobile (deployáveis)
  packages/        ui, design-tokens, api-client, types, config (libs focadas)
  infra/           docker, IaC, CI templates, deploy manifests
```
- Backend organizado **por bounded context** (módulos verticais) — ver `01_ARQUITETURA_ALVO.md`.
- TypeScript em todos os apps; tokens gerados de fonte única (Style Dictionary).
- `design-system` vira `packages/ui` de verdade (consumido, não catálogo morto).

---

## Nível vs. mercado (recalibrado após auditoria)

| Domínio | Concorrente | Nível | O que trava chegar a 90% |
|---|---|---:|---|
| Ticketeria | Sympla | **~60%** | QR real + leitor, wallet passes, meia-entrada, taxa de serviço, conciliação financeira, painel de checkout |
| Guest list | AzList | **~55%** | **Portal do promoter** (self-service), pagamento de comissão, tipos de lista, analytics de funil, ranking |
| Cashless | Zig | **~40%** | **Bar offline**, ledger double-entry, inventário, fechamento de caixa, multi-PDV (NFC/RFID = fase futura) |

> ⚠️ **Ressalva de estado:** migrations `0008–0014` precisam estar aplicadas no Supabase recriado; Asaas em mock; testes de dinheiro não rodados em infra real. "Pronto no papel", não comprovado em produção.
