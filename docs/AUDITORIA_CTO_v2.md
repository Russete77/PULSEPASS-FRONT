# Auditoria Técnica v2 — PulsePass (pós-implementações)

**Data:** 22/06/2026 · **Perspectiva:** CTO, sincera · **Escopo:** api, web, admin, mobile, packages/shared

Esta é a segunda auditoria, depois de um ciclo grande de trabalho (unificação dos fronts,
pagamento por cartão, RBAC, observabilidade, testes, modo offline, paridade do app).

---

## Veredito em uma linha

O projeto **subiu de patamar**: deixou de ser "MVP com fundação boa" e virou um **MVP robusto
e deployável dos três domínios**, com engenharia madura. Mas **ainda não está no nível
Sympla + AzList + Zig** — a distância agora é de **profundidade de features** (e de validação em
infra real), não mais de arquitetura.

**Resposta direta: chegamos no nível dos três? NÃO — mas estamos bem mais perto.**
Estimativa de cobertura: **Sympla ~50%, AzList ~45%, Zig ~40%** (era 35/40/30 na 1ª auditoria).

---

## 1. O que mudou desde a 1ª auditoria (entregue)

| Item crítico (1ª auditoria) | Status agora |
|---|---|
| Zero testes no código de dinheiro | ✅ Suíte de integração (oversell, corrida, saldo, idempotência, expiração) |
| `expire_pending_orders` não agendado | ✅ pg_cron a cada 2 min (migration 0008) |
| Sem observabilidade | ✅ Logger estruturado + Sentry opcional |
| Só PIX, sem cartão/repasse | ✅ Cartão + parcelamento + tokenização Asaas + split (migrations 0010) |
| Sem RBAC de equipe | ✅ event_staff + has_event_access (migration 0009) — porta/bar/manager |
| Sem modo offline | ✅ Porta offline (manifesto + fila + sync). Bar segue online (decisão de risco) |
| Tokens/format/api duplicados nos fronts | ✅ Pacote único @pulsepass/shared + workspaces |
| Mobile sem tipografia da marca | ✅ Space Grotesk + Inter carregadas |
| Mobile não comprava ingresso | ✅ Paridade: evento, checkout PIX/cartão, lista de promoter (deep link) |

Isso é **muita coisa certa**. A base de engenharia hoje é sólida.

---

## 2. Estado por área (notas atualizadas)

| Área | 1ª aud. | Agora | Comentário |
|---|---|---|---|
| Arquitetura & backend único | 9 | **9** | Continua excelente; agora com fonte única de front |
| Segurança | 8 | **8.5** | RBAC adicionado; tokenização reduz exposição do cartão |
| Integridade financeira | 8.5 | **9** | Testes cobrindo os caminhos críticos |
| Paridade visual/front | 7 | **8.5** | Pacote compartilhado + fontes + paridade mobile |
| Qualidade de engenharia | 5 | **7** | Testes + observabilidade + cron; falta CI/CD e cobertura ampla |
| Cobertura de produto vs os 3 | 5.5 | **6.5** | Cartão/repasse/RBAC/offline-porta; ainda faltam features-chave |
| Prontidão operacional | 4 | **6** | Porta offline + RBAC ajudam muito; falta validar em campo |

---

## 3. Cobertura vs cada produto (o que falta)

### 🎫 Sympla (~50%)
Temos: catálogo, lotes, reserva/expiração, **PIX + cartão parcelado**, **split/repasse**, tokenização.
Falta:
- 🔴 **Entrega do ingresso** (e-mail / PDF / Apple-Google Wallet) — hoje não envia nada
- 🟡 Cupom / desconto / cortesia / meia-entrada / taxa de serviço configurável
- 🟡 Reembolso / cancelamento
- 🟡 Assento marcado / mapa de lugares
- 🟡 Painel financeiro de conciliação para o produtor (só métricas básicas)

### 📋 AzList (~45%)
Temos: promoters, link público de lista, inscrição (web + **app via deep link**), comissão calculada,
check-in de guest, **RBAC** (porta/manager operam a lista).
Falta:
- 🔴 **Portal/app do promoter** e **pagamento** da comissão (hoje só calcula)
- 🟡 Tipos de lista (free até X, aniversário, VIP, mesa/camarote/bottle service)
- 🟡 Analytics por link (cliques → cadastros → check-ins), metas, ranking

### 🍸 Zig (~40%)
Temos: carteira por evento, recarga (PIX + **cartão**), pedido no bar, PDV, **check-in offline na porta**.
Falta:
- 🔴 **Bar offline** (deixado de fora de propósito — risco de débito sem rede)
- 🔴 **Cartão físico / pulseira NFC-RFID**
- 🟡 Estoque/inventário por produto, **fechamento de caixa**, multi-PDV
- 🟡 **Estorno de saldo** não usado ao fim do evento

---

## 4. Gaps que apareceram nesta auditoria (novos/honestos)

1. 🟡 **Falta UI no admin** para 2 features que existem só no backend:
   - Gestão de **equipe** (event_staff) — endpoints prontos, sem tela.
   - Configurar a **carteira Asaas** da produtora (split) — endpoint pronto, sem tela.
   → Hoje só dá pra usar via API direta. Precisa de telas no cockpit.
2. 🟡 **Webhook de cartão**: o fluxo confia na confirmação síncrona do Asaas; cartões com
   análise antifraude assíncrona (status pendente → confirmado depois) dependem do webhook,
   que já existe e é idempotente — mas esse caminho não foi testado ponta a ponta.
3. 🟢 **Sem CI/CD / Dockerfile** ainda.

---

## 5. O que NÃO foi validado (importante)

O código está escrito e a **lógica pura foi testada** (format, tokens, validação de cartão — passaram).
Mas ainda **não rodou em infra real**:
- Migrations 0008–0010 **não aplicadas** (você recriou o banco — precisa rodar 0001→0010).
- Testes das RPCs de dinheiro **não executados** (precisam de um Supabase de teste).
- Builds de Vite/Metro **não compilados** aqui (acontecem na sua máquina).
- Asaas **em mock** (sem API key) — cartão/PIX/split não testados de verdade.

Enquanto isso não for validado, "está pronto" é no papel, não em produção.

---

## 6. Conclusão sincera

Você saiu de **"fundação A, produto B-, operação C"** para **"fundação A, produto B, operação B-"**.
O salto real foi em **engenharia** (testes, observabilidade, RBAC, tokenização, unificação) e em
**paridade** (app faz tudo que o web faz). Isso vale muito.

Mas igualar Sympla + AzList + Zig é igualar **profundidade**, e aí faltam peças que são o motivo
de as pessoas pagarem por cada um: **entrega de ingresso e meios/descontos** (Sympla), **portal e
pagamento de comissão do promoter** (AzList), **bar offline, NFC e fechamento de caixa** (Zig).

**Para um primeiro evento real de médio porte, o produto está perto do suficiente** — desde que você
(1) aplique as migrations e valide o fluxo de dinheiro com Asaas real, (2) adicione **entrega do
ingresso** (o gap mais sentido pelo cliente final) e as **telas de admin** que faltam, e
(3) garanta conexão no bar. Os demais gaps são evolução pós-primeiro-case.

**Próximos 3 que eu faria, nesta ordem:** entrega de ingresso (e-mail/PDF/QR) · telas de admin
(equipe + wallet de repasse) · validar pagamento real (Asaas live + migrations + testes rodando).
