# PulsePass · Auditoria CTO + CMO v6 — verdade sem maquiagem

Data: 15/07/2026. Escopo: os dois repos separados (`pulsepass-api`, `pulsepass-frontend`).

---

## RESPOSTA DIRETA À SUA PERGUNTA

> "Já estamos completos no nível Sympla + Zig + AzList? Temos todas as features?"

**Não.** Estamos em **~55–60% da superfície combinada.** O núcleo é sólido e o alinhamento
front↔back é saudável, mas faltam blocos inteiros — e três coisas travam qualquer verificação final:

1. 🔴 **Banco não está montado no projeto que você pagou** (`xupoayhlqbaypxcowgaa`). O MCP
   conectado é de **outra conta** (VIGI/PLATAFORMA/SMU-ESTOQUE) — não enxerga esse projeto.
2. 🔴 **Push bloqueado**: as credenciais git em cache (`Russete77`) não têm acesso à org `SMU-Prod`.
3. 🟡 Sem os dois acima resolvidos, não dá pra provar o app rodando ponta a ponta.

---

## 1. Nível por concorrente (medido, honesto)

| Domínio | Nível | Temos | Falta (o que fecha o gap) |
|---|---|---|---|
| **Sympla (ticket)** | ~60% | catálogo, evento, lotes (meia/taxa/janela), cupom, checkout PIX+cartão, ciclo do pedido, **QR rotativo** (superior), transfer, refund, check-in **offline** | mapa de assentos, **NFe/fiscal**, relatórios/export, e-mail em escala, SEO público, lista de espera |
| **AzList (lista)** | ~68% | promoter+link, inscrição, cliques, **check-in na porta**, portal (comissão/meta), tipos de lista | equipes/hierarquia de promoter, WhatsApp, import em massa, app do promoter, ranking |
| **Zig (cashless)** | ~45% | carteira única, recarga PIX, **pedido no bar**, **PDV**, cardápio+estoque, fechamento, ledger+reconciliação | **NFC/pulseira (core de hardware da Zig)**, PDV offline, KDS, multi-bar/terminais, cartão pré-pago |
| **PulseADM (extra)** | — | dashboard, orgs, antifraude (ledger real), financeiro/repasse, audit log | suporte, taxas, feature flags (sistemas novos) |

**Veredito:** dinheiro **testado (9/9)**, largura faltando. Não é um sistema pronto pra evento grande.

---

## 2. Alinhamento FRONT ↔ BACK — ✅ saudável

- **51 rotas** no backend · **46 chamadas** no api-client dos fronts — todas mapeiam para rotas reais.
- Contrato central em `pulsepass-api/openapi.yaml`. Auth Supabase no cliente, `Bearer` nas chamadas.
- Fronteira limpa: o backend **não importa nada dos fronts** (0 deps de `@pulsepass/shared`).
- **Risco:** o contrato não é validado automaticamente (sem geração de tipos/cliente do OpenAPI).
  Uma mudança de rota no back pode quebrar o front sem CI pegar. → gerar cliente do OpenAPI.

---

## 3. Engenharia / Arquitetura

**Bom:** backend modular vertical (routes/controller/service/repo), lint de fronteira, RPCs
atômicas SECURITY DEFINER com `search_path` fixo, dois repos com deploy independente, runner
de migrations idempotente.

**Falta:**
- **Testes**: 1 suíte (dinheiro) para 13 módulos. Ingresso/porta/lista/plataforma sem teste.
- **Pooling de conexão** (pgBouncer/pooler) — gargalo #1 em pico de venda.
- **Redis + fila**: rate limit é em memória; e-mail e retry de webhook não são duráveis.
- **Observabilidade**: Sentry opcional (sem DSN); sem tracing/metrics.
- **Deploy**: nenhuma config (nem Vercel, nem Fly/Railway).

---

## 4. Regras de negócio — pontos fortes e riscos

**Sólidas (testadas):** anti-oversell, idempotência por usuário, meia/taxa, invariante de ledger
(saldo = Σ transações), reconciliação de valor no webhook, carteira única (0027).

**Riscos de negócio a decidir:**
- **Reembolso**: devolve estoque e cancela ingresso — falta política (janela, taxa retida, parcial).
- **Split/repasse Asaas**: existe no código, mas o fluxo de KYC/saque da produtora não está fechado.
- **Comissão de promoter**: calculada, mas o **pagamento** é manual (marca "pago"); sem automação.
- **Expiração de pedido** (30 min) via cron — depende do cron do Postgres estar ativo no projeto.

---

## 5. Segurança — o que está bom e o que falta

**Bom:** RLS aplicada, `WITH CHECK` contra auto-escalação de role, webhook **fail-closed**
(`asaas-access-token`, compare em tempo constante), QR de entrada rotativo (anti-print),
super-admin por allowlist (`ADMIN_EMAILS`), segredos fora do git, helmet + CORS restrito.

**Falta / verificar:**
- **Rodar o `get_advisors` do Supabase** no projeto real (RLS faltando, índices, políticas) — só
  possível quando o banco estiver no projeto certo.
- Rate limit **distribuído** (hoje em memória — some com múltiplas instâncias).
- Rotação de segredos e gestão por ambiente (staging ≠ prod).
- Auditoria de acesso do super-admin (hoje o audit log é de negócio, não de ações admin).
- LGPD: retenção/anonimização de dados de convidado (CPF/telefone na lista).

---

## 6. CMO — posicionamento e go-to-market

**Narrativa forte que já temos:** "1 app = ticket + lista + bar cashless, com QR anti-golpe e
carteira única." Isso é vendável — nenhum dos três concorrentes entrega os três juntos.

**O que falta pra VENDER (não só pra funcionar):**
1. **Prova social / caso real**: rodar 1 evento piloto de verdade (hoje é impossível — banco).
2. **Fiscal (NFe)**: produtora séria não adota ticketeira sem nota. É bloqueador de venda B2B.
3. **Onboarding da produtora**: criar evento → publicar → vender em < 10 min, sem suporte.
4. **Página pública com SEO + compartilhamento** (a Sympla vende muito por busca/orgânico).
5. **Dashboard de resultado pro produtor** (vendas em tempo real, curva, ticket médio) — existe
   parcial; precisa virar "o motivo de abrir o app todo dia".
6. **App do promoter** (a AzList cresce por promoter; sem app deles, não escala boca-a-boca).

**Ordem de maior ROI comercial:** piloto real → NFe → onboarding self-service → SEO público.

---

## 7. Plano priorizado (o que fazer, em ordem)

1. **Destravar infra** (você): banco no projeto certo + acesso GitHub.
2. Rodar `npm run migrate` no projeto novo → `get_advisors` de segurança → corrigir o que apontar.
3. **Deploy** dos dois (API container + fronts edge) → **evento piloto real**.
4. **Testes** dos outros 12 módulos no CI + **pooling** de conexão.
5. **NFe/fiscal** + **onboarding self-service** (destrava venda B2B).
6. Largura: relatórios/export, app do promoter, KDS. NFC só se for pro segmento da Zig.
