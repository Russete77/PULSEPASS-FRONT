# Plano de Execução — 8 Semanas (Solo) · PulsePass

**Contexto:** 1 desenvolvedor · meta = produto vendável para grupos de eventos · prazo 1-2 meses
**Estratégia:** estreitar escopo → vender **pilotos de design partner** → liderar pela ponta **Ticketeria (cartão + repasse)**
**Princípio:** não competir em features com Sympla+AzList+Zig agora. Entregar **uma vertical impecável** que toca dinheiro com segurança.

---

## Regra de ouro

> Em 8 semanas, sozinho, "completo" é impossível. "Vendável e confiável numa vertical" é possível.
> Venda o piloto **antes** de terminar — o evento real do cliente é seu prazo e seu QA.

---

## Fase 0 — Fundação inegociável (Semanas 1-2)

> Sem isto, você não pode tocar dinheiro de cliente. Vale para qualquer caminho.

| # | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 1 | **Testes de integração das RPCs financeiras** (`place_order`, `spend_wallet`, `confirm_order_payment`): corrida, oversell, saldo insuficiente, idempotência | 4-5 dias | Código de dinheiro sem teste é o maior risco do projeto |
| 2 | **Agendar `expire_pending_orders`** via `pg_cron` (Supabase) a cada 2-5 min | 2 horas | Hoje só roda oportunisticamente → estoque reservado trava |
| 3 | **Sentry + logs estruturados** (substituir `morgan`-só-dev) | 1 dia | Em evento ao vivo, você precisa enxergar falha em tempo real |
| 4 | **Backup/restore do Supabase testado** + rotacionar `service_role` | meio dia | Antes de qualquer cliente real |

**Entregável da fase:** você confia no seu próprio backend com dinheiro real.

---

## Fase 1 — Faturar de verdade (Semanas 3-4)

> O que faz o grupo de eventos dizer "sim": eles recebem o dinheiro deles.

| # | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 5 | **Asaas LIVE** (sair do mock) + **cartão de crédito/parcelado** | 4-5 dias | No Brasil, cartão parcelado é a maioria da receita de ingresso |
| 6 | **Popular `split`** (repasse automático ao produtor) | 2 dias | Já existe o parâmetro no código, só não é usado. É o core do negócio |
| 7 | **Entrega de ingresso**: e-mail com QR + PDF | 2-3 dias | Cliente final espera receber o ingresso, não só ver na tela |
| 8 | **Dashboard financeiro do produtor** (vendido, repasse, líquido) | 2 dias | É o que o dono do grupo abre todo dia |

**Entregável da fase:** dá pra rodar uma venda real, cliente paga no cartão, produtor vê o dinheiro entrar.

---

## Fase 2 — Operar o evento sem vergonha (Semanas 5-6)

> O que separa demo de produto: aguentar a porta e o caixa no dia do evento.

| # | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 9 | **RBAC de equipe** (`event_staff` + papéis: porteiro/bar/gerente) | 3 dias | Hoje só o dono opera. O grupo precisa dar acesso scoped à equipe |
| 10 | **Check-in offline-first na porta** (fila local + sync ao reconectar) | 4-5 dias | Internet de evento é ruim. Porta **precisa** funcionar offline |
| 11 | **Validação anti-fraude de QR** (rate, replay, ticket já usado) | 1 dia | Porta é onde a fraude acontece |

**Nota honesta:** bar cashless 100% offline é grande demais pra esta janela solo. Para o piloto, **exija conectividade no bar** (4G dedicado/cabo) e deixe offline-de-bar para a v2. Seja transparente com o cliente sobre isso.

**Entregável da fase:** a equipe do cliente opera a porta mesmo com internet caindo.

---

## Fase 3 — Vender e impressionar (Semanas 7-8)

> Polir o que o comprador vê e fechar a primeira ponta diferenciada.

| # | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 12 | **Fontes da marca no mobile** (`expo-font` + `useFonts`) | meio dia | Sem isso o app não parece o web — quebra a paridade visual |
| 13 | **Portal do promoter + comissionamento básico** (link, cadastros, check-ins, comissão) | 4 dias | Diferencial AzList. Grupos com promoter compram por isso |
| 14 | **Onboarding de produtora** (criar org → evento → publicar em < 10 min) | 2 dias | Sem onboarding fluido, não escala a venda |
| 15 | **Dry-run completo** (compra → cartão → e-mail → porta → relatório) com você cronometrando | 1 dia | Ensaio antes do palco |

**Entregável da fase:** produto demoável, com cara de marca, e uma vertical (ticketeria + repasse + promoter) que você vende com confiança.

---

## O que NÃO fazer agora (cortes conscientes)

Estes são reais, mas **não** cabem em 8 semanas solo. Diga "v2" sem culpa:

- ❌ Bar cashless 100% offline (exija conectividade no piloto)
- ❌ NFC/pulseira RFID
- ❌ Assento marcado / mapa de lugares
- ❌ Estoque/inventário por produto + fechamento de caixa multi-PDV
- ❌ Reembolso self-service / estorno automático de saldo
- ❌ Cupom, meia-entrada, taxa configurável (faça manual no piloto)
- ❌ Transformar `design-system` em lib publicável (refator, não feature)
- ❌ Multi-tenant comercial completo (faça onboarding manual nos 2 primeiros clientes)

---

## Estratégia de venda em paralelo (não espere terminar)

1. **Semana 1-2:** liste 5-10 grupos de eventos que você conhece. Ofereça **piloto de design partner**: usam no próximo evento, preço simbólico, suporte total seu.
2. **Semana 3-4:** com pagamento real funcionando, faça uma demo ao vivo de uma compra com cartão + repasse. Feche 1-2 pilotos.
3. **Semana 5-8:** construa apontando para a **data do evento do piloto**. O evento real é seu deadline e seu teste de carga.
4. **Pós-piloto:** vira case. Grave depoimento, números (ingressos vendidos, uptime na porta). Use pra vender os próximos sem precisar do produto "completo".

---

## Marcos de verificação (gates — não avance sem)

- ✅ **Fim da Fase 0:** suíte de testes de dinheiro passando em verde. *Se não passou, não venda.*
- ✅ **Fim da Fase 1:** uma transação real no cartão, com repasse, conciliada no painel.
- ✅ **Fim da Fase 2:** simular queda de internet na porta e o check-in continuar.
- ✅ **Fim da Fase 3:** dry-run completo cronometrado, sem intervenção manual.

---

## Resumo de uma linha

Não persiga "completo". Persiga **uma vertical de receita (ticketeria + cartão + repasse + promoter) impecável e operacionalmente segura**, venda como piloto agora, e deixe os gaps do Zig/AzList completo para depois do primeiro case real.
