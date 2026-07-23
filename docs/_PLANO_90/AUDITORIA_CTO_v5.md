# PulsePass · Auditoria CTO v5 — nível real + arquitetura de repositórios

Data: 15/07/2026 · Base: código medido, não estimado.

---

## 0. Correção honesta sobre os "90%"

Os 90% **sempre foram a META** do plano (a pasta se chama `_PLANO_90` = plano *para chegar* a 90%).
**Nunca foram o estado atingido.** Este documento mede onde realmente estamos.

---

## 1. O que existe (medido)

| Superfície | Linhas | Arquivos | Observação |
|---|---:|---:|---|
| `api` (backend) | 6.169 | 89 | 13 módulos verticais · **72 endpoints** · 27 migrations |
| `web` (cliente) | 2.607 | 27 | 12 telas |
| `admin` (produtora + PulseADM) | 2.899 | 33 | 12 telas cockpit + 5 god-mode |
| `mobile` (Expo/RN) | 2.113 | 25 | **quase intocado** nesta fase |
| `packages/shared` | 998 | 10 | tokens, components.css, Icon, Logo, api-client |
| `design-system` (mockups) | 10.674 | 24 | 53 telas especificadas |

Stack backend enxuta e correta: `express, helmet, cors, zod, morgan, @supabase/supabase-js`.
Monorepo já existe: **npm workspaces + Turborepo**. Fronteira modular com lint próprio.

---

## 2. Nível real vs Sympla + AzList + Zig

Estimativas por domínio, com o raciocínio à vista.

### 2.1 Ticketeria (Sympla) — **~55–65%**
**Temos:** catálogo, página de evento, lotes (inteira/meia/taxa/janela por data), cupons, checkout PIX+cartão (Asaas), ciclo do pedido (pending/paid/expired/refunded), **QR rotativo anti-golpe** (superior ao QR estático da Sympla), transferência, reembolso, check-in na porta **com modo offline** (manifesto + fila + sync), conciliação, fechamento de caixa.
**Falta:** mapa de assentos (lugar marcado), boleto/parcelamento na UI, **relatórios/exportação**, **NFe/fiscal**, ferramentas de marketing/afiliados, e-mail transacional em escala, lista de espera, multi-idioma/multi-moeda, SEO das páginas públicas.

### 2.2 Guest list (AzList) — **~65–70%** *(nosso ponto mais forte)*
**Temos:** promoters com link/código, inscrição pública, tracking de cliques, **check-in de lista na portaria**, portal do promoter (cliques/inscritos/presenças/comissão/meta), marcação de comissão paga, tipos de lista (grátis-até/aniversário/VIP).
**Falta:** hierarquia/equipes de promoter, integração WhatsApp, importação em massa, app do promoter, ranking/gamificação, automação de pagamento de comissão.

### 2.3 Cashless (Zig) — **~40–50%** *(nosso ponto mais fraco)*
**Temos:** carteira (unificada na 0027), recarga PIX via Asaas, **pedido no bar pelo app** com código de retirada, **PDV do operador**, cardápio com estoque, fechamento por operador, **ledger com invariante + reconciliação**, estorno do residual.
**Falta:** **NFC/RFID (pulseira/cartão) — o core de hardware da Zig**, PDV offline, gestão de múltiplos bares/terminais, **KDS (cozinha)**, profundidade de estoque, integração com impressoras/maquininhas, emissão de cartão pré-pago, painel ao vivo em escala de evento.

### 2.4 Plataforma (além dos três) — diferencial
**PulseADM god-mode**: dashboard da plataforma, orgs multi-tenant, integridade de ledger, financeiro/repasses, trilha de auditoria. A maioria dos concorrentes mantém isso interno e tosco.

### **Veredito honesto: ~55–60% da superfície combinada.**
O **núcleo de dinheiro é sólido e testado** (9/9 testes contra Postgres real). A **largura** (relatórios, fiscal, hardware, mapas de assento) é o que falta.

---

## 3. Prontidão de produção (o que realmente trava escalar)

| Item | Estado |
|---|---|
| CI | ✅ existe (`.github/workflows/ci.yml`) |
| Dockerfile da API | ✅ existe |
| Config de deploy (Vercel/Fly/Railway) | ❌ nenhuma |
| **Testes** | ⚠️ **1 suíte (dinheiro) para 13 módulos** — sem testes de ingresso/porta/lista/plataforma |
| Observabilidade | ⚠️ código existe, Sentry opcional (sem DSN) |
| **Redis / fila** | ❌ inexistente — rate limit em memória, e-mail/webhook sem retry durável |
| **Pooling de conexão** | ❌ não configurado (gargalo em pico) |
| Migrations | ⚠️ aplicadas **à mão** no SQL Editor (sem runner no CI) |
| Banco agora | 🔴 **Supabase inacessível — provavelmente pausado** |
| Mobile | ⚠️ 2.113 linhas, fora do rollout |

**Conclusão:** temos um bom produto em desenvolvimento, **não um sistema pronto para um evento real de grande porte.**

---

## 4. Separação de repositórios — a resposta honesta de CTO

### O que os grandes de verdade fazem
Google, Meta, Uber, Airbnb, Shopify, Vercel: **monorepo**. Não polyrepo.
Polyrepo aparece quando há **times independentes com cadências de release diferentes** ou código aberto ao público.

**Separar repositório ≠ escalar.** Escalabilidade vem de **deploy independente**, API sem estado, pooling, cache e fila — nada disso exige repos separados.

### Risco concreto de separar agora
Temos `packages/shared` (tokens, CSS, Icon, Logo, api-client) consumido por web + admin + mobile.
Separar obriga a **publicar pacote versionado** → *version skew*, 4 CIs, PR cruzado para uma feature só. Para um time de 1–2 pessoas, é imposto puro.

### ✅ Recomendação: manter monorepo, separar DEPLOYS
```
pulsepass/                      (um repo)
├── apps/
│   ├── api/      → container próprio  (Fly/Railway/Render) — escala horizontal
│   ├── web/      → estático/edge      (Vercel) — domínio do cliente
│   ├── admin/    → estático/edge      (Vercel) — domínio separado
│   └── mobile/   → EAS build
├── packages/
│   ├── shared/       (design system + helpers)
│   ├── api-contract/ (tipos/OpenAPI = contrato back↔front)
│   └── config/       (eslint/tsconfig)
└── turbo.json    → pipeline por app, cache, deploy só do que mudou
```
Ganho: cada app **sobe e escala sozinho**, com uma fonte de verdade e um PR por feature.

### Se ainda assim quiser polyrepo — a ordem correta
1. Publicar `@pulsepass/shared` em registry privado (semver de verdade).
2. Extrair `pulsepass-api` (repo + CI + container próprios).
3. Extrair `pulsepass-web` e `pulsepass-admin`, consumindo o pacote publicado.
4. Congelar o contrato da API (OpenAPI) **antes** de separar — senão quebra em produção.

---

## 5. O que realmente destrava escala (ordem de prioridade)

1. 🔴 **Retomar o Supabase** (pausado) e aplicar **0026 + 0027**.
2. **Pooling de conexão** (Supabase pooler/pgBouncer) — gargalo #1 em pico de venda.
3. **Testes além do dinheiro** (ingresso, porta, lista, plataforma) rodando no CI.
4. **Configs de deploy** + gestão de env por ambiente.
5. **Redis**: rate limit distribuído, cache de catálogo, **fila** (e-mail, retry de webhook, QR).
6. **Sentry com DSN** em produção + logs estruturados.
7. **Teste de carga** do funil de compra (`place_order` + Postgres).
8. Só então: largura de produto (relatórios, fiscal, mapa de assentos, NFC).
