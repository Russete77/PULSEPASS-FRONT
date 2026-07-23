# PulsePass — Inventário de Features & Comparativo (Sympla + AzList + Zig)

Documento de referência. Lista **tudo que o app tem hoje** (verificado no código) e compara,
feature a feature, com os três produtos de referência. Sem otimismo: o que existe, existe;
o que falta, está marcado.

---

## 1. O que o app TEM hoje (inventário real, por superfície)

### 🟢 Web — App do Cliente (`pulse-front`)
Rotas verificadas em `web/src/App.jsx`:

| Tela | Rota | O que faz |
|---|---|---|
| Descobrir | `/` | Catálogo público de eventos publicados |
| Detalhe do evento | `/eventos/:slug` | Página do evento, seleção de ingressos por lote, iniciar compra |
| Inscrição em lista | `/lista/:code` | Cadastro público em lista de promoter (guest list) |
| Login | `/entrar` | E-mail/senha, OAuth (provider), cadastro |
| Redefinir senha | `/redefinir-senha` | Fluxo de reset |
| Checkout | `/checkout/:orderId` | Pagamento via **PIX** (QR + copia-e-cola) |
| Meus ingressos | `/meus-ingressos` | Lista de ingressos do usuário |
| Ingresso | `/ingresso/:id` | Visualização com **QR code** |

### 🟢 Admin — Cockpit da Produtora (`pulse-adm`)
Rotas verificadas em `admin/src/App.jsx`:

| Tela | Rota | O que faz |
|---|---|---|
| Eventos | `/` | Lista de eventos da organização |
| Novo evento | `/novo` | Wizard: cria evento + lotes de ingresso (tiers) |
| Dashboard | `/eventos/:id` | Métricas: receita total, receita de bar, vendas, pedidos |
| Porta | `/eventos/:id/porta` | **Check-in** / validação de QR na entrada |
| PDV | `/eventos/:id/pdv` | **Cashless**: busca cliente, cobra do saldo, gera código de retirada |
| Promoters | `/eventos/:id/promoters` | Cria promoters, vê inscritos/presentes, **comissão devida** |

### 🟢 Mobile — App do Cliente (`pulse-app`, Expo/RN)
Telas verificadas em `mobile/src/app/`:

| Tela | O que faz |
|---|---|
| Início | Descobrir eventos |
| Carteira | Saldo **cashless** + extrato de transações |
| Bar | Pedir itens do bar pagando com saldo |
| Ingressos | Meus ingressos |
| Perfil | Dados do usuário |
| Ingresso `[id]` | Detalhe com QR |
| Recarga | **Top-up** de saldo via PIX |
| Login | Sessão persistida (AsyncStorage) |

### 🟢 Backend único (`pulse-back`) — capacidades expostas
Endpoints e RPCs verificados:

- **Eventos:** listar, detalhe, cardápio (menu)
- **Pedidos:** criar (reserva estoque, expira em 30 min), consultar, simular pago
- **Ingressos:** listar, detalhe, **transferência** (`ticket_transfers`)
- **Carteira:** saldo, criar recarga (top-up), consultar, simular pago
- **Bar:** criar pedido (debita saldo, gera código de retirada), histórico
- **Admin:** perfil, criar organização, CRUD de eventos, publicar, dashboard, check-in, cardápio, lookup de carteira, cobrança PDV, promoters (criar/listar), guests, check-in de guest
- **Guest list:** página pública por código, inscrição
- **Webhooks:** Asaas (confirmação de pagamento, idempotente)

**Tabelas no banco:** profiles, organizations, events, ticket_tiers, orders, order_items,
tickets, wallets, wallet_transactions, webhook_events, menu_items, wallet_topups, bar_orders,
bar_order_items, ticket_transfers, promoters, guests.

**Motor financeiro (RPCs transacionais):** place_order, attach_order_payment,
confirm_order_payment, expire_pending_orders, place_bar_order, spend_wallet, credit_topup,
event_dashboard, event_promoters.

---

## 2. Chegamos no nível SYMPLA + AZLIST + ZIG? — Resposta honesta: **AINDA NÃO.**

Você tem um **MVP coerente que cobre os três domínios** num backend único — isso é real e raro.
Mas "estar no nível deles" significa profundidade de feature, e aí a distância é grande.
Estimativa de cobertura por produto: **Sympla ~35%, AzList ~40%, Zig ~30%.**

### 🎫 vs SYMPLA (ticketeria) — temos a base, falta o que gera receita

| Feature | Temos? |
|---|---|
| Catálogo de eventos + página do evento | ✅ |
| Lotes de ingresso (tiers) com estoque e limite | ✅ |
| Reserva de estoque + expiração de pedido | ✅ |
| Pagamento **PIX** | ✅ |
| **Cartão de crédito / parcelado** | ❌ |
| **Repasse ao produtor (split)** | ❌ (campo existe, não usado) |
| Entrega do ingresso (e-mail / PDF / Apple-Google Wallet) | ❌ |
| Cupom / desconto / cortesia | ❌ |
| Meia-entrada / taxa de serviço configurável | ❌ |
| Assento marcado / mapa de lugares | ❌ |
| Reembolso / cancelamento | ❌ |
| Painel financeiro / conciliação do produtor | ⚠️ parcial (só métricas básicas) |
| Página de checkout com múltiplos meios | ❌ |

### 📋 vs AZLIST (guest list / promoters) — o esqueleto existe

| Feature | Temos? |
|---|---|
| Promoters por evento | ✅ |
| Link/código público de inscrição | ✅ |
| Inscritos, presentes, **comissão devida** | ✅ |
| Check-in de guest | ✅ |
| **Portal/app do promoter** | ❌ |
| **Pagamento de comissão** (não só cálculo) | ❌ |
| Tipos de lista (free até X, aniversário, VIP) | ❌ |
| **Mesa / camarote / bottle service** | ❌ |
| Analytics por link (cliques → cadastros → check-ins) | ❌ |
| Metas e ranking de promoters | ❌ |

### 🍸 vs ZIG (cashless / bar) — funciona, mas não aguenta a operação real

| Feature | Temos? |
|---|---|
| Carteira por evento + saldo | ✅ |
| Recarga (top-up) via PIX | ✅ |
| Pedido no bar debitando saldo | ✅ |
| PDV (operador cobra do cliente) | ✅ |
| Código de retirada | ✅ |
| **Modo OFFLINE** (porta e bar sem internet) | ❌ **crítico** |
| **Cartão físico / pulseira NFC-RFID** | ❌ |
| Estoque/inventário por produto | ❌ |
| Fechamento de caixa / conciliação por operador | ❌ |
| Multi-PDV simultâneo | ⚠️ não testado/garantido |
| **Estorno de saldo** não usado (fim do evento) | ❌ |
| Comanda / mesa | ❌ |

---

## 3. Estética dos fronts — alinhada, mas não "idêntica"

| Camada | Estado |
|---|---|
| Linguagem visual (cores, fontes, espaçamento, glass) | ✅ **unificada** (`@pulsepass/shared`) |
| Formatação (datas, moeda) | ✅ unificada |
| Fontes da marca (Space Grotesk + Inter) | ✅ nos três (mobile depende do `expo install`) |
| **Componentes / layouts** | ❌ **separados por app** (web `Layout`, admin `Shell`, mobile `ui.tsx`) |

Conclusão: os três **parecem da mesma marca**, mas **não são telas idênticas** — e nem deveriam,
porque são superfícies diferentes (cliente navegador, produtora tablet, cliente celular).
Uma biblioteca de componentes compartilhada de verdade (botões, cards, inputs) seria o próximo
passo se você quiser paridade também no nível de componente.

---

## 4. Itens críticos ainda 100% pendentes (não começamos)

1. Testes automatizados nas RPCs de dinheiro — **maior risco**
2. Agendar `expire_pending_orders` — estoque trava sem isso
3. Observabilidade (Sentry / logs estruturados)
4. Pagamento real (Asaas live, cartão, split/repasse)
5. RBAC de equipe (porteiro / bar / gerente)
6. Modo offline na porta/bar

---

## Veredito de uma linha

Cobertura dos três domínios: **sim, num MVP**. Nível Sympla+AzList+Zig: **não — ~⅓ do caminho**,
e os pedaços que faltam (pagamento real, offline, RBAC, testes, repasse) são justamente os que
fazem produtoras pagarem por essas plataformas.
