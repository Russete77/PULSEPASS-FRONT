# Itens Críticos — Implementados

Os 6 itens do Bloco 0 da auditoria foram implementados no código. Abaixo o que mudou
e **o que você precisa rodar no terminal / Supabase** para ativar.

---

## 1. ✅ Testes automatizados nas RPCs de dinheiro
- `api/test/money.test.js` + `api/test/helpers.js` (cria/destrói fixtures reais).
- Cobre: anti-oversell, **corrida**, saldo insuficiente, **idempotência** da confirmação,
  devolução de estoque na expiração.
- Script: `npm test` (usa `node --test`, sem dependências novas).

## 2. ✅ Agendar expire_pending_orders
- `api/migrations/0008_cron_expire.sql` — `pg_cron` roda a cada 2 min.

## 3. ✅ Observabilidade
- `api/src/lib/logger.js` (log estruturado JSON em prod) + `api/src/lib/observability.js`
  (Sentry **opcional**, ativa só com `SENTRY_DSN`). Integrado no `server.js` e `errorHandler.js`.

## 4. ✅ Pagamento real: cartão + split/repasse
- `asaas.js`: `createCardPayment` (parcelado) + `buildSplit` (repasse à produtora).
- `orders.service`/`orders.controller`: aceita `paymentMethod: 'pix' | 'card'`, dados do cartão,
  e monta o split pela carteira da produtora.
- `migrations/0010` adiciona `organizations.asaas_wallet_id`.
- Endpoint novo: `PATCH /admin/organizations/:orgId/asaas-wallet`.
- Config: `PLATFORM_FEE_PERCENT` (% retido pela plataforma).

## 5. ✅ RBAC de equipe (porteiro / bar / gerente)
- `migrations/0009_event_staff_rbac.sql`: tabela `event_staff` + função `has_event_access`.
- `api/src/services/access.js`: `assertEventAccess(user, event, roles)`.
- `ops`/`guestlist` agora aceitam staff (não só o dono).
- Endpoints: `GET/POST/DELETE /admin/events/:id/staff`.

## 6. ✅ Modo offline na porta
- Backend: `GET /admin/events/:id/manifest` + `POST /admin/events/:id/checkin-batch` (idempotente).
- Admin: `admin/src/lib/offlineDoor.js` (IndexedDB: cache do manifesto + fila + validação local + sync).
- Tela `Porta.jsx`: status online/offline, baixar manifesto, fallback automático sem internet, sincronização ao reconectar.

---

## ▶ Comandos / passos para ativar

**1) Aplicar as migrations no Supabase** (SQL Editor ou CLI), em ordem:
```
api/migrations/0008_cron_expire.sql
api/migrations/0009_event_staff_rbac.sql
api/migrations/0010_org_asaas_wallet.sql
```
> A 0008 usa `pg_cron`. Se o Supabase recusar o `create extension`, ative em
> Dashboard → Database → Extensions → **pg_cron**, e rode a 0008 de novo.

**2) Backend — instalar (Sentry é opcional):**
```bash
cd api
npm install
# Sentry (opcional): só se for usar
npm i @sentry/node
```

**3) Rodar os testes de dinheiro** (use um Supabase de TESTE, não produção):
```bash
# em api/.env, preencha:
#   TEST_SUPABASE_URL=...   TEST_SUPABASE_SERVICE_ROLE_KEY=...
cd api
npm test
```

**4) Variáveis novas em `api/.env`** (ver `.env.example`):
```
PLATFORM_FEE_PERCENT=0     # % retido pela plataforma no split
SENTRY_DSN=                # vazio = Sentry desativado
```

**5) Ativar cartão + repasse:**
- Preencha `ASAAS_API_KEY` (sandbox ou live).
- Configure a carteira de cada produtora: `PATCH /admin/organizations/:orgId/asaas-wallet`
  com `{ "asaas_wallet_id": "<walletId Asaas da produtora>" }`.
  Sem isso, a venda funciona mas **sem** repasse (split).

**6) Front (admin/web/mobile):** nenhuma dependência nova. O modo offline usa IndexedDB nativo.
Se já rodou a unificação, basta subir os apps normalmente.

---

## Observações honestas
- **Cartão**: o backend está pronto (incl. parcelamento e split). Falta o **formulário de cartão no front**
  (web/mobile) chamando `createOrder` com `paymentMethod: 'card'`. O endpoint já aceita.
- **Offline**: implementado para a **porta** (admin). O **bar offline** é mais complexo (débito de saldo
  sem rede gera risco financeiro) e ficou de fora de propósito — recomendo manter o bar exigindo conexão.
- Verifiquei a sintaxe dos arquivos; o build real (Vite/Metro/Node) deve ser validado por você ao subir,
  já que a instalação de pacotes acontece na sua máquina.
