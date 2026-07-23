# Roadmap até 90% — Sympla + AzList + Zig

Arquitetura-alvo: **monolito modular vertical** (ver `01_ARQUITETURA_ALVO.md`). Cashless nesta rodada = **bar offline por software**; **NFC/RFID fica para fase futura**.

Cada fase tem um **portão de saída** (definition of done). As fases 0–1 são pré-requisito de tudo; 2–4 sobem cada vertical a 90%; a 5 garante que aguenta produção.

---

## FASE 0 — Estancar sangramento (segurança + dinheiro) 🔴
*Nada de feature nova até fechar isto. É barato e evita perder dinheiro/dados.*

- [ ] **F0.1** `WITH CHECK` em `profiles_self_update` bloqueando mudança de `role` (auto-escalação) `[banco]`
- [ ] **F0.2** Remover/escopar `coupons_public_read`; validar cupom só via `redeem_coupon` `[banco]`
- [ ] **F0.3** Tornar `place_bar_order` idempotente (Idempotency-Key / dedup) — mata cobrança em dobro `[banco+api]`
- [ ] **F0.4** Mover incremento de `used_count` do cupom para a confirmação de pagamento (ou decrementar no expire/refund) `[banco]`
- [ ] **F0.5** `refund_order` validar `status='paid'` antes de devolver estoque `[banco]`
- [ ] **F0.6** `spend_wallet` registrar `wallet_transactions` + invariante de reconciliação `[banco]`
- [ ] **F0.7** Idempotency-Key em criar pedido e recarga `[api]`
- [ ] **F0.8** Índice parcial `orders(expires_at) WHERE status='pending'` + índices FK (`tickets.order_id`, `ticket_tier_id`, `bar_order_items.menu_item_id`, `orders.event_id`) `[banco]`

**Portão:** suíte de dinheiro roda contra Supabase de teste e passa; nenhum caminho de auto-escalação/vazamento de cupom; retries não duplicam cobrança.

---

## FASE 1 — Fundação modular + ops mínima 🏗️
*Reorganiza sem trocar comportamento; destrava escala e velocidade de time.*

- [ ] **F1.1** `platform/`: cliente `pg` pooled + PgBouncer nos caminhos de dinheiro `[api]`
- [ ] **F1.2** Migration runner real (Drizzle/sqitch) + `schema_migrations` + rollback `[api/banco]`
- [ ] **F1.3** Redis: mover rate-limit e cache de token p/ store compartilhado `[api]`
- [ ] **F1.4** Fila durável (pg-boss): entrega de ingresso/e-mail/PDF/push com retry+DLQ `[api]`
- [x] **F1.5** `repo.js` por módulo + lint de fronteira `[api]` ✅ — repo.js nos 9 módulos + `scripts/check-boundaries.mjs` (sem deps) ligado ao `npm run lint` e ao CI
- [x] **F1.6** Reorganizar backend em `modules/*` `[api]` ✅ **COMPLETO** — 9 módulos (tickets, catalog, cashless, orders, guestlist, door, payments, identity, notifications), verificados por boot + smoke test; `services/`+`controllers/` eliminados
- [x] **F1.7** Unificar autorização: `admin.service` usar `assertEventAccess` (faz `manager` funcionar) `[api]` ✅ verificado (boot ok)
- [ ] **F1.8** `audit_log` append-only + `feature_flags` `[api]`
- [x] **F1.9** Versionar API em `/v1` + OpenAPI `[api]` ✅ — /v1 verificado + `api/openapi.yaml` (3.1, 40 paths, validado). Geração a partir do zod fica como evolução futura (precisa da dep)
- [~] **F1.10** CI (lint + testes em DB efêmero + build) + Dockerfile por app + secret manager `[repo]` — CI + Dockerfile API + eslint config ✅; falta secret manager + Docker web/admin
- [~] **F1.11** Monorepo: `apps/`+`packages/`+`infra/`, Turborepo, tsconfig/eslint compartilhados, remover `.git` obsoletos e `dist/` commitado `[repo]` — Turborepo + scripts raiz + .gitignore + limpeza `.git`/`dist` ✅; falta mover para `apps/`, decompor libs, TS compartilhado
- [ ] **F1.12** Frontends: TypeScript nos caminhos de dinheiro + react-query + code-splitting por rota + error boundary `[web/admin/mobile]`

**Portão:** `turbo run build test lint` verde na raiz; deploy reproduzível em staging; um evento sobe do zero por migration automatizada.

---

## FASE 2 — Ticketeria → 90% (Sympla) 🎫

- [x] **F2.1** **QR real** no web e mobile + **leitor** de câmera na porta ✅ — servidor gera `qr_data_url` (payload `PULSEPASS:id:secret`); web/mobile renderizam; scanner `BarcodeDetector` no Porta.jsx já existia e é compatível. Zero dep nova. Verificado (PNG gerado, boot ok)
- [ ] **F2.2** Endurecer entrega de ingresso (via fila): e-mail + PDF + reenvio `[ticketing]`
- [ ] **F2.3** **Apple/Google Wallet passes** (PassKit / Google Wallet) `[ticketing/mobile]`
- [x] **F2.4** **Meia-entrada** + **taxa de serviço configurável** `[catalog/ticketing]` ✅ **COMPLETO** — backend+schema (0016) + UI: seleção de meia + quebra da taxa no checkout (web + mobile) + campos no EventWizard (taxa % + meia por lote). Verificado: mobile `tsc` 0 erros, web `vite build` ok
- [x] **F2.5** Cupom: **UI no admin** ✅ — módulo backend `coupons` (CRUD sob `/admin/events/:id/coupons`) + tela `Cupons.jsx` (criar percentual/fixo, limite de usos, validade, ativar/desativar, excluir) + link no Dashboard. Verificado: admin `vite build` ok, boot + fronteira ok
- [x] **F2.6** Lotes por data (virada automática) `[catalog]` ✅ — migration 0017 (`sales_start`/`sales_end`); `place_order` recusa fora da janela; catalog expõe `sale_state` (upcoming/on_sale/ended/sold_out); EventWizard configura janela por lote; web+mobile desabilitam com "Vendas a partir de…/encerradas". Verificado (tsc/builds ok)
- [x] **F2.7** Painel de **conciliação financeira** do produtor `[ticketing/admin]` ✅ — migration 0018 (`event_reconciliation` RPC) + tela `Conciliacao.jsx`: bruto, taxa de serviço, descontos, reembolsos, vendas líquidas, taxa da plataforma e **repasse líquido**; + receita de bar (informativo). Verificado (admin build + 401)
- [x] **F2.8** Tela "Meus pedidos" + **reembolso self-service** com UI `[web/mobile]` ✅ — novo `GET /orders` (listar pedidos do comprador) + página `MyOrders` (web) e tela `pedidos` (mobile) com botão Reembolsar em pedidos pagos. Fecha o último endpoint hidden (`/orders/:id/refund`). Verificado (tsc/builds/401)
- [ ] **F2.9** (opcional p/ 90%) Lista de espera / waitlist quando esgotado `[ticketing]`

**Portão:** cliente compra → recebe ingresso com QR real → é validado na porta; produtor vê conciliação; meia/taxa/cupom operáveis pela UI.

---

## FASE 3 — Guest list → 90% (AzList) 📋

- [x] **F3.1** **Portal do promoter** (self-service) ✅ — migration 0019 (`promoter_dashboard` RPC + índice); endpoints `/promoter/me` e `/promoter/promoters/:id/guests` (auth); vínculo por e-mail no cadastro (admin) → habilita o portal; página web `PromoterPortal` (link copiável, inscritos, check-ins, comissão devida/paga, drill-down de inscritos). Verificado (builds web/admin ok, 401)
- [ ] **F3.2** **Pagamento de comissão** de verdade (não só cálculo): repasse/registro `[guestlist/payments]`
- [x] **F3.3** **Tipos de lista**: free-até-X, aniversário, VIP `[guestlist]` ✅ (código) — migration 0024 (`list_type` + `free_until` em promoters); tipo no cadastro (admin) + badge na página pública (web+mobile). Verificado por builds/tsc. ⚠️ **Requer aplicar a migration 0024** (as 0015→0023 já estão).
- [x] **F3.4** **Mesa / camarote / bottle service** `[guestlist/ticketing]` ✅ (código) — migration 0025 (`event_tables` + `table_reservations`); novo módulo `tables`; admin `Camarotes.jsx` (CRUD de camarotes com consumação mínima + aprovar/recusar reservas); cliente web `CamarotesPublic.jsx` (lista + solicitar reserva) com link no evento. Verificado (builds ok, 404/401). ⚠️ **Requer aplicar 0025**. (Reserva no mobile = follow-up.)
- [x] **F3.5** **Analytics de funil por link** (cliques → cadastros → check-ins) `[guestlist]` ✅ — migration 0020 (`promoters.clicks` + `increment_promoter_hit` + `clicks` nos RPCs `event_promoters`/`promoter_dashboard`); beacon público em `/lists/:code/hit` disparado na página de inscrição (web+mobile); funil + % de conversão no admin Promoters e no portal do promoter. Verificado (tsc/builds/200)
- [x] **F3.6** **Metas e ranking** de promoters `[guestlist/admin]` ✅ — migration 0021 (`goal_checkins` + nos RPCs); meta por promoter no cadastro; **ranking** (ordena por presenças + medalhas 🥇🥈🥉) e **barra de progresso da meta** no admin Promoters e no portal do promoter. Verificado (builds/401)

**Portão:** promoter opera sozinho pelo portal, vê funil e comissão; produtor cria tipos de lista e paga comissão pela plataforma.

---

## FASE 4 — Cashless → 90% (Zig, sem NFC) 🍸

- [ ] **F4.1** **Bar offline** por software (manifesto de saldo + fila local + sync, espelhando a porta) com **transações atômicas** `[cashless/admin]`
- [~] **F4.2** **Integridade de ledger** da carteira `[cashless]` — ✅ **reconciliação/drift-check**: `spend_wallet` lança transação (F0.6) + view `wallet_reconciliation` + endpoint `/admin/events/:id/ledger-check` (detecta saldo ≠ soma das transações) exibido no Fechamento; teste de inventário add. ⏳ **double-entry completo** (contas de contraparte débito/crédito) diferido — é refactor grande do núcleo de dinheiro, fazer só após validar a pilha de migrations no banco (tarefa #14)
- [x] **F4.3** **Inventário/estoque** por produto + **gestão de cardápio** `[cashless]` ✅ — migration 0022 (`menu_items.stock` + baixa atômica no `place_bar_order`, bloqueia ruptura); **CRUD de cardápio no admin** (`Cardapio.jsx`: criar/editar/excluir item, preço, estoque, disponível) — que não existia; mobile mostra "esgotado". Verificado (builds/tsc/401). Obs.: gestão de cardápio era pré-requisito ausente.
- [x] **F4.4** **Fechamento de caixa** por operador de PDV `[cashless/admin]` ✅ — migration 0023 (`bar_orders.operator_id` + RPC `cashier_report`); PDV passa a registrar o operador (staff); tela `Fechamento.jsx` com total processado por operador + totais. (Cashless = sem dinheiro em espécie, então não há sangria/conferência física.) Verificado (build/401)
- [ ] **F4.5** **Multi-PDV** validado sob concorrência (teste de carga) `[cashless]`
- [ ] **F4.6** Estorno de saldo ao fim do evento com **UI** + relatório `[cashless/admin]`
- [ ] **F4.7** (opcional) Comanda/mesa e combos `[cashless]`
- [ ] **F4.8** *(FUTURO, fora desta rodada)* Cartão físico / pulseira **NFC-RFID** `[hardware]`

**Portão:** bar opera sem rede e reconcilia ao voltar; caixa fecha por operador; estoque baixa; ledger bate com saldo.

---

## FASE 5 — Escala & prova de produção 🚀

- [ ] **F5.1** Cache de catálogo (Redis/CDN) no endpoint público mais quente `[api]`
- [ ] **F5.2** Particionamento das tabelas quentes (orders/tickets/wallet_ledger/webhook_events) `[banco]`
- [ ] **F5.3** RLS de isolamento multi-tenant (defesa em profundidade além do filtro em código) `[banco]`
- [ ] **F5.4** Observability completa: métricas, tracing Asaas, alertas/SLO, correlation-id `[api]`
- [ ] **F5.5** Teste de carga do fluxo de dinheiro (porta, bar, checkout) + E2E `[repo]`
- [ ] **F5.6** Backup/restore testado + runbook de dia de evento + ADRs `[repo]`

**Portão:** evento de médio porte real sustentado; SLO medido; recuperação de desastre ensaiada.

---

## Resumo de esforço (ordem de grandeza, 1 dev sênior)

| Fase | Foco | Estimativa |
|---|---|---|
| 0 | Segurança + dinheiro | 1–2 semanas |
| 1 | Fundação modular + ops | 4–6 semanas |
| 2 | Sympla → 90% | 5–7 semanas |
| 3 | AzList → 90% | 4–6 semanas |
| 4 | Zig → 90% (sem NFC) | 5–7 semanas |
| 5 | Escala/produção | 3–4 semanas |

**Total ≈ 5–7 meses** solo; ~metade com 2–3 devs paralelos por vertical (que é justamente o que a arquitetura modular habilita).

> As fases 2–4 podem ser paralelizadas **depois** da Fase 1, porque cada vertical fica isolado no seu módulo. Antes da Fase 1, paralelizar gera conflito no monolito atual.
