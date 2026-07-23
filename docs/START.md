# ▶ Rodar o PulsePass localmente

Portas: **API 4000** · **Web (cliente) 5173** · **Admin (produtora) 5174** · **Mobile (Expo)**.

---

## Passo 1 — Apontar os `.env` para o banco NOVO

Você recriou o Supabase, então atualize as chaves nos **4** arquivos `.env`
(pegue em Supabase → Project Settings → API):

**`api/.env`**
```
SUPABASE_URL=https://SEU-NOVO-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # chave service_role (server-side)
SUPABASE_ANON_KEY=...                # anon/publishable
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
ASAAS_API_KEY=                       # vazio = modo mock (sem cobrança real)
```

**`web/.env`** e **`admin/.env`**
```
VITE_SUPABASE_URL=https://SEU-NOVO-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**`mobile/.env`**
```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-NOVO-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# Em celular físico, troque localhost pelo IP da sua máquina:
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Passo 2 — Aplicar as migrations no banco (ORDEM IMPORTA)

No Supabase → **SQL Editor**, rode em ordem, do `0001` ao `0013`:

```
api/migrations/0001_init.sql
api/migrations/0002_seed.sql            (opcional — dados de exemplo)
api/migrations/0003_cashless_bar.sql
api/migrations/0004_guestlist.sql
api/migrations/0005_integrity.sql
api/migrations/0006_auth_profile.sql
api/migrations/0007_harden_functions.sql
api/migrations/0008_cron_expire.sql     (precisa da extensão pg_cron)
api/migrations/0009_event_staff_rbac.sql
api/migrations/0010_org_asaas_wallet.sql
api/migrations/0011_coupons.sql
api/migrations/0012_refunds_commission.sql
api/migrations/0013_event_promoters_commission.sql
```
> Se a `0008` reclamar do `pg_cron`: Supabase → Database → Extensions → ative **pg_cron** e rode a 0008 de novo.

---

## Passo 3 — Instalar dependências (pela RAIZ, é monorepo)

```bash
cd C:\Users\erick\pulsepass
npm install
```

Mobile — reconcilia fontes/libs com o SDK do Expo:
```bash
cd mobile
npx expo install @expo-google-fonts/inter @expo-google-fonts/space-grotesk expo-font
cd ..
```

---

## Passo 4 — Subir os apps (um terminal para cada)

```bash
# 1) Backend (porta 4000)
cd api && npm run dev

# 2) Web do cliente  → http://localhost:5173
cd web && npm run dev

# 3) Admin da produtora → http://localhost:5174
cd admin && npm run dev

# 4) App mobile (Expo) — o -c limpa o cache do Metro
cd mobile && npx expo start -c
```

No Expo: aperte **w** (abre no navegador), ou leia o QR com o app **Expo Go** no celular.

---

## Onde olhar / como visualizar

| O quê | Onde |
|---|---|
| Cliente compra ingresso (PIX/cartão/cupom) | http://localhost:5173 |
| Produtora: criar evento, dashboard, porta, PDV, promoters, equipe, repasse | http://localhost:5174 |
| App do cliente (carteira, bar, recarga, ingressos) | Expo (tecla **w** ou Expo Go) |
| API no ar? | http://localhost:4000/api/health |
| Banco respondendo? | http://localhost:4000/api/health/ready |

---

## Conferência rápida (se algo não abrir)

- **API não sobe** → falta variável no `api/.env` (ela falha-rápido e diz qual).
- **Front mostra erro de evento** → API não está rodando, ou banco sem migrations.
- **Login não funciona** → `SUPABASE_*` errado nos `.env`, ou e-mail não confirmado no Supabase.
- **Pagamento "mock"** → normal sem `ASAAS_API_KEY`. Use os botões "(dev) Simular pago".
- **Sem eventos na home** → crie um no admin (http://localhost:5174 → Criar evento) e publique.

---

## (Opcional) Rodar os testes de dinheiro

Precisa de um Supabase **de teste** (NUNCA produção). Em `api/.env`:
```
TEST_SUPABASE_URL=...
TEST_SUPABASE_SERVICE_ROLE_KEY=...
```
```bash
cd api && npm test
```
