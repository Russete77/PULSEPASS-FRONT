# Auditoria Técnica & Análise de Produto — PulsePass

**Plataforma:** PulsePass — Sistema Operacional de Eventos (Ticketeria + Guest List + Bar Cashless)
**Visão:** junção otimizada de **Sympla + AzList + Zig**
**Data da auditoria:** 21/06/2026
**Perspectiva:** CTO — avaliação sincera, sem maquiagem
**Escopo auditado:** `api`, `web`, `admin`, `mobile`, `design-system` (código-fonte completo, migrations e configurações)

---

## TL;DR — Veredito do CTO

O PulsePass **não é um protótipo**. É um MVP de engenharia **acima da média**, com decisões de arquitetura corretas que muita startup só acerta depois de quebrar a cara em produção. O backend único existe de verdade, a segurança do dinheiro está bem feita, e o design system é coeso. Isso é raro.

Mas "estar no nível que queremos" — concorrer de igual para igual com Sympla, AzList e Zig — ainda **não está**. A distância não é de arquitetura; é de **cobertura de produto, robustez operacional e maturidade de engenharia** (testes, observabilidade, modo offline, RBAC de equipe e meios de pagamento reais).

**Nota geral por área (0–10):**

| Área | Nota | Comentário |
|---|---|---|
| Arquitetura & backend único | **9** | Backend único real, camadas limpas, RPCs transacionais. |
| Segurança | **8** | RLS + SECURITY DEFINER + idempotência. Faltam testes e RBAC de equipe. |
| Integridade financeira (dinheiro) | **8.5** | Locks, sem saldo negativo, idempotente. Falta pagamento real e estorno. |
| Paridade visual (front igual) | **7** | Tokens idênticos web/admin; mobile diverge na tipografia. |
| Qualidade de engenharia | **5** | **Zero testes automatizados.** Sem CI/CD, sem observabilidade. |
| Cobertura de produto vs. os 3 | **5.5** | MVP dos 3 mundos existe, mas faltam features-chave de cada um. |
| Prontidão operacional (evento real) | **4** | **Sem modo offline** — risco crítico em casa noturna/festival. |

**Maturidade estimada:** MVP forte / início de "early-stage product". Para produção em evento real de médio porte, faltam ~3 a 5 frentes críticas (detalhadas abaixo).

---

## 1. Arquitetura & Backend Único — ✅ Requisito atendido

> *"Todas as versões devem compartilhar do mesmo backend."*

**Confirmado. O requisito está cumprido de forma limpa.**

Existe **um único backend** (`pulse-back`, Express 5 + Supabase + Asaas). Os três frontes (web do cliente, admin da produtora, app mobile) apontam para a mesma API:

```
web/.env     → VITE_API_URL=http://localhost:4000/api
admin/.env   → VITE_API_URL=http://localhost:4000/api
mobile/.env  → EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

O padrão de acesso é consistente e correto em todas as plataformas:

- **Supabase no front = só autenticação** (JWT). O comentário no código é explícito: *"Os dados de negócio passam sempre pelo backend único."*
- **Toda regra de negócio e escrita** passa pela API, que usa a `service_role` server-side.
- Camadas bem separadas: `routes → controllers (HTTP/validação) → services (regra) → RPCs no Postgres`.

**Stack por módulo:**

| Módulo | Stack | Papel |
|---|---|---|
| `api` | Express 5, Supabase, Zod, helmet/cors | Backend único |
| `web` | React + Vite + React Router | App do cliente (compra/ingresso) |
| `admin` | React + Vite + React Router | Console da produtora (PDV, porta, promoters) |
| `mobile` | Expo + expo-router + RN | App do cliente (cashless/carteira) |
| `design-system` | React (showcase) | Catálogo visual de referência |

**Pontos fortes:**
- Health checks corretos: `/health` (liveness) e `/health/ready` (readiness com checagem de banco). Isso é coisa de quem pensa em deploy/load balancer.
- `trust proxy` configurado para IP correto atrás de proxy.
- Tratamento de erro centralizado (`errorHandler`, `asyncHandler`, `ApiError`).

**Observação arquitetural (não-bloqueante):** o rate limiter é **em memória** (`Map` por IP). O próprio código admite: *"Suficiente para 1 instância; em cluster, troque por Redis."* No momento em que escalar horizontalmente (2+ instâncias), o rate limit e a proteção contra abuso furam. **Trocar por Redis antes de escalar.**

---

## 2. Segurança — ✅ Forte, com lacunas pontuais

Esta é a parte que me deixou positivamente surpreso. O modelo de segurança é **maduro**:

**O que está bem feito:**

1. **RLS (Row Level Security) ativo** em todas as tabelas sensíveis (`orders`, `tickets`, `wallets`, `wallet_transactions`, etc.). Políticas são *owner-scoped*: um usuário só lê o que é dele (`auth.uid() = owner_id`).
2. **Escritas nunca acontecem direto pelo front.** Toda mutação de dinheiro/estoque passa por funções `SECURITY DEFINER` (`place_order`, `spend_wallet`, `credit_topup`, `confirm_order_payment`).
3. **Hardening explícito (migration 0007):** as RPCs têm `search_path` fixo (evita SQL injection via search_path) e `EXECUTE` revogado de `public/anon/authenticated` — só o `service_role` executa. Isso é defesa em profundidade de quem leu o Supabase Advisor.
4. **Autorização server-side consistente:** todo endpoint de produtora chama `assertOrgOwner` / `assertEventOwner` antes de qualquer ação (check-in, PDV, promoters, dashboard). Não há endpoint operacional sem checagem de dono.
5. **Webhook Asaas robusto:** comparação de token *timing-safe* (`crypto.timingSafeEqual`), idempotência por `event_id`, reconciliação de valor. Profissional.
6. **Boot fail-fast:** envs obrigatórias quebram o boot se ausentes; modo *mock* de pagamento é **recusado em produção**.
7. `.env` corretamente fora do git (`.gitignore`), `helmet`, CORS com allowlist, body limit de 1MB.

**Lacunas de segurança a corrigir:**

| Severidade | Item | Recomendação |
|---|---|---|
| 🔴 Alta | **Sem RBAC de equipe.** O modelo é *single-owner*: só o dono da organização opera porta/PDV. Um porteiro ou bartender não tem acesso scoped. | Modelar `event_staff (event_id, user_id, role)` com papéis `doorman/bar/manager`. Sem isso, a produtora compartilha login — risco real. |
| 🟡 Média | **Service_role JWT real em `api/.env` no disco.** Não está no git (ok), mas é um segredo de altíssimo poder (ignora RLS). | Rotacionar antes de qualquer compartilhamento do repo; usar secret manager em produção (não `.env` em disco). |
| 🟡 Média | **PII/CPF em texto.** Armazena CPF e telefone — exposição LGPD. | Avaliar criptografia em repouso / minimização; política de retenção; mapear base legal LGPD. |
| 🟢 Baixa | Rate limit não distribuído (ver §1). | Redis ao escalar. |

---

## 3. Integridade Financeira — ✅ Bem resolvida (o ponto mais crítico de um produto desses)

Num produto que vende ingresso e movimenta saldo de bar, **o dinheiro é o coração**. Aqui o trabalho está sólido:

- **`place_order`**: trava as `ticket_tiers` com `FOR UPDATE` (lock de linha), valida estoque atomicamente, reserva quantidade, e cria pedido com expiração de 30 min. **Sem oversell.**
- **`spend_wallet`**: débito atômico condicional (`WHERE balance_cents >= p_amount`). Retorna `NULL` em saldo insuficiente. **Impossível ficar negativo, impossível corrida.**
- **`confirm_order_payment`**: **idempotente** (checa `status='paid'` antes de emitir), lock `FOR UPDATE`, emite ingressos uma única vez.
- **`expire_pending_orders`**: devolve o estoque reservado de pedidos vencidos.

Esse nível de cuidado transacional é exatamente o que separa um produto que pode rodar com dinheiro de verdade de um que vai gerar fraude/inconsistência.

**Dois reparos importantes:**

1. 🔴 **`expire_pending_orders` não roda em agenda.** Hoje só é chamada *oportunisticamente* dentro de `orders.service` quando alguém acessa o endpoint. Se o evento esfria, o estoque reservado **fica preso** e ingressos somem do mercado indevidamente. → Agendar via `pg_cron` (Supabase suporta) ou job externo a cada 1–5 min.
2. 🟡 **Pagamento não está "live".** `ASAAS_API_KEY` está vazia → API roda em **modo MOCK**. Só PIX está modelado; o parâmetro `split` (repasse automático para a produtora) existe mas não é populado. Sem split, não há **repasse financeiro** — que é core no Sympla/Zig.

---

## 4. Paridade Visual ("front igual") — ⚠️ Parcial

> *"O front deve ser o mesmo visualmente falando também."*

**Fundação compartilhada: ótima. Execução no mobile: divergente.**

**O que está idêntico (✅):**
- `web/src/styles/tokens.css` e `admin/src/styles/tokens.css` são **byte-a-byte iguais**: mesma marca (`--pp-pulse #00FF85`), mesma escala de *ink*, mesmas superfícies *glass*, mesmas bordas. Identidade "v3 Premium Glass" coesa.
- `mobile/src/theme/tokens.ts` **porta a mesma paleta** (mesmos hex) para React Native. A intenção de paridade está clara.

**Onde quebra (⚠️):**

| Item | Web/Admin | Mobile | Impacto |
|---|---|---|---|
| **Tipografia** | Space Grotesk + Inter + Newsreader (Google Fonts) | **Fonte do sistema** (`'System'`) — nenhuma fonte custom carregada | 🔴 Alto: o app **não parece** o web. Tipografia é 60% da identidade. |
| Tokens duplicados | `tokens.css` copiado em 2 lugares | `tokens.ts` é terceira cópia manual | 🟡 Drift garantido: mudar a marca exige editar 3 arquivos. |

**Correções:**
1. **Carregar as fontes da marca no mobile** via `expo-font` + `useFonts` (Space Grotesk/Inter) e mapear `F.display/F.body`. Sem isso, a promessa de "front igual" não se cumpre no celular.
2. **Fonte única de verdade para tokens:** gerar `tokens.css` e `tokens.ts` a partir de um único arquivo-fonte (ex.: JSON de design tokens / Style Dictionary). Hoje são 3 cópias manuais que vão divergir.

**Sobre o `design-system/`:** são ~9.000 linhas de telas de showcase (iPhone/iPad/produtora). É um ótimo catálogo de referência visual, mas é um **artefato de design desconectado do código de produção** — os componentes reais (`web/components`, `mobile/components/ui.tsx`) são reimplementações. Vale transformar o design-system em **biblioteca de componentes compartilhada de verdade** (publicável) em vez de mockup, senão ele vira documentação que envelhece.

---

## 5. Cobertura de Produto vs. Sympla + AzList + Zig — ⚠️ MVP dos 3, mas com buracos

O mapeamento conceitual está **correto e presente**:

| Referência | Função | Onde está no PulsePass | Status |
|---|---|---|---|
| **Sympla** | Ticketeria | `admin/EventWizard`, `web/Checkout`, `web/EventDetail`, `tickets` | ✅ MVP |
| **AzList** | Guest list / promoters | `admin/Promoters`, `web/GuestSignup`, tabelas `promoters/guests` | ✅ MVP |
| **Zig** | Bar cashless / PDV | `mobile/carteira+bar+recarga`, `admin/PDV`, `admin/Porta`, `wallets` | ✅ MVP |

Isso é um feito real — ter os três domínios num backend único e coerente. Mas "no nível deles" exige fechar lacunas que são **o motivo de as pessoas pagarem** por cada um:

### Gaps vs. Sympla (ticketeria)
- 🔴 **Só PIX.** Falta cartão de crédito, parcelamento, Apple/Google Pay. No Brasil, cartão parcelado é maioria da receita de ingresso.
- 🔴 **Sem repasse/split financeiro** ao produtor (o `split` existe no código mas não é usado).
- 🟡 **Sem cupom/desconto, sem taxa de serviço configurável, sem meia-entrada**.
- 🟡 **Sem entrega de ingresso** por e-mail/PDF/Wallet (Apple/Google Pass).
- 🟡 **Sem assento marcado / mapa de lugares** (teatro, camarote numerado).
- 🟡 **Sem reembolso/cancelamento** e sem dashboard financeiro de conciliação para o produtor.

### Gaps vs. AzList (guest list)
- 🔴 **Sem portal/app do promoter** e **sem comissionamento** (rastrear venda/check-in por promoter e pagar comissão é o core do AzList).
- 🟡 **Sem tipos de lista** (free até X horas, aniversário, VIP, mesa/camarote/bottle service).
- 🟡 **Sem analytics por link de promoter** (cliques → cadastros → check-ins).

### Gaps vs. Zig (cashless/bar)
- 🔴 **SEM MODO OFFLINE.** Casa noturna/festival vive com internet ruim. Porta e bar **precisam** operar offline e sincronizar depois. Hoje tudo depende de chamada à API em tempo real — **isso reprova o produto num evento real**.
- 🔴 **Sem cartão físico / pulseira NFC-RFID** vinculável à carteira (o jeito Zig de operar bar).
- 🟡 **Sem estoque/inventário por produto**, sem **fechamento de caixa/conciliação** por operador, sem multi-PDV.
- 🟡 **Sem estorno de saldo não usado** ao fim do evento (devolução do que sobrou na carteira).

---

## 6. Qualidade de Engenharia — 🔴 O calcanhar de Aquiles

Aqui é onde, como CTO, eu seguro o passo antes de chamar de "pronto":

1. 🔴 **Zero testes automatizados.** Nenhum dos 5 módulos tem dependência de teste ou script de teste. **Código que mexe com dinheiro sem um único teste é o maior risco do projeto.** As RPCs (`place_order`, `spend_wallet`, `confirm_order_payment`) precisam de testes de integração cobrindo corrida, idempotência, oversell e saldo insuficiente. **Prioridade #1.**
2. 🔴 **Sem observabilidade.** `morgan` só em dev. Sem logging estruturado, sem rastreamento de erro (Sentry/equivalente), sem métricas. Em produção, você fica cego quando algo falha num evento ao vivo.
3. 🟡 **Sem CI/CD / Dockerfile / manifesto de deploy** visível. Deploy hoje é manual e não reprodutível.
4. 🟡 **Sem testes E2E** dos fluxos críticos (compra → pagamento → emissão → check-in).
5. 🟢 ESLint configurado (bom), mas sem *type safety* no backend e no web (só o mobile usa TypeScript). Considerar TS no `api` — é onde o dinheiro mora.

---

## 7. Roadmap priorizado (o que eu faria, nesta ordem)

**Bloco 0 — Antes de qualquer evento real com dinheiro (4–6 semanas)**
1. Testes de integração das RPCs financeiras (corrida, idempotência, oversell, saldo). *(não-negociável)*
2. Agendar `expire_pending_orders` (pg_cron). *(estoque preso)*
3. Pagamento real: ativar Asaas live + **cartão de crédito/parcelado** + popular `split` (repasse). *(receita)*
4. Observabilidade mínima: Sentry + logs estruturados.
5. RBAC de equipe (`event_staff` + papéis). *(operação real)*

**Bloco 1 — Robustez operacional (paralelo/seguinte)**
6. **Modo offline** para Porta e Bar (fila local + sync). *(o que reprova/aprova num evento)*
7. Carregar fontes da marca no mobile (paridade visual real).
8. CI/CD + Dockerfile + ambientes (staging/prod).

**Bloco 2 — Fechar gaps de produto vs. os 3**
9. Portal do promoter + comissionamento (AzList).
10. Entrega de ingresso (e-mail/PDF/Wallet), cupom, taxa de serviço, meia (Sympla).
11. Estorno de saldo, fechamento de caixa, estoque, NFC/pulseira (Zig).
12. Reembolso/cancelamento + dashboard financeiro do produtor.

**Bloco 3 — Higiene técnica contínua**
13. Fonte única de design tokens (Style Dictionary).
14. Transformar `design-system` em biblioteca de componentes real e compartilhada.
15. TypeScript no backend; LGPD (CPF/PII).

---

## 8. Conclusão sincera

Você tem uma **base de engenharia que vale dinheiro** — a parte difícil e perigosa (backend único, transações de dinheiro corretas, segurança RLS bem feita) está num nível que muitos produtos no mercado não têm. Quem escreveu isso sabe o que faz.

Mas "ser a junção otimizada de Sympla + AzList + Zig" hoje é uma **promessa de arquitetura, ainda não uma realidade de produto**. O que separa o estado atual do objetivo não é refazer nada — é **endurecer** (testes, observabilidade, offline) e **preencher** (pagamento real, RBAC de equipe, comissionamento, estorno, NFC).

Em resumo: **fundação de A, produto de B-, prontidão operacional de C.** Com os Blocos 0 e 1 fechados (~2–3 meses focados), isso vira um produto que aguenta um evento real de médio porte sem passar vergonha. Os três gaps que eu **não** deixaria passar para um evento ao vivo são, em ordem: **(1) testes no código de dinheiro, (2) modo offline na porta/bar, (3) pagamento real com cartão + split.**
