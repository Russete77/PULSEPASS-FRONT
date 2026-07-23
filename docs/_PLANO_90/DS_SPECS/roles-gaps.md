# DS Spec — Roles & Gaps (PulsePass Design System)

Fonte: `design-system/src/Roles.jsx`, `Gaps1.jsx`, `Gaps2.jsx`, `App.jsx`
Tema: dark `#06070A`, verde neon `#00FF85`, glassmorphism. Valores abaixo são literais do código dos mockups.

## Paleta de constantes (idêntica nos 3 arquivos)

| Token | Valor | Uso |
|---|---|---|
| `GR/GG/GW` (verde) | `#00FF85` | Cliente, primário, CTAs, "selecionado", OK |
| `VR/VG/VW` (violeta) | `#A78BFA` | Promoter, seat map "Plateia", status "pronto" |
| `CR/CG/CW` (ciano) | `#22D3EE` | Produtora, info, "Plateia Premium" |
| `PINKR/PINKG/PINKW` | `#FF3D88` | ADM, "chamando garçom", combos |
| `AMBERR/AMBERG/AMBERW` | `#FFB800` | Garçom, estoque/CMV, "repor" |
| `REDG/REDW` | `#FF3B30` | Ruptura, crítico, erro |
| Vermelho de "não pode" | `#FF7A75` (texto) sobre `rgba(255,255,3D,48…)` — ver seção Roles | |
| Texto sobre verde | `#003C1F` | Sempre que o fundo é o verde neon |
| Texto sobre âmbar | `#06070A` | CTAs âmbar |
| Fundo base | `#06070A` (telas), `rgba(11,13,18,…)` (painéis glass) | |

Fontes (CSS vars): `--pp-font-display` (títulos, weight 700, letterSpacing −0.02/−0.045em), `--pp-font-serif` (itálico weight 400, destaque colorido dentro do título), `--pp-font-body`, `--pp-font-mono` (números, labels uppercase, preços).

---

## 1. ROLES (`Roles.jsx`)

Dois artboards: **RolesMap** (diagrama de arquitetura 1560×1080) e **MultiRoleLoginScreen** (mobile 390×844).

### 1.1 Os 4 roles definidos

| Role | Cor | Ícone | Sub | Escala | Auth | Device |
|---|---|---|---|---|---|---|
| **Cliente** | `#00FF85` | 🎟️ | Participante final | ~milhões | Pix · CPF · Apple · Google | iPhone · super app |
| **Promoter** | `#A78BFA` | ◇ | Vende lista + comissão | ~1k+ | CPF + chave de promoter da casa | iPhone (primário) · Web |
| **Produtora** | `#22D3EE` | ◐ | Casa / Organização | ~100k orgs | CNPJ + 2FA · contas multi-usuário | iPad (operação) · Web |
| **ADM PulsePass** | `#FF3D88` | ◉ | Super-admin da plataforma | ~20 internos | SSO Okta + WebAuthn + IP allowlist | iPad / Web · acesso restrito |

**Permissões (copy literal):**

- **Cliente pode:** Descobrir e comprar ingressos · Carteira cashless (recarga e gasto) · Pedido no app, zero fila · QR rotativo, transferir · Acessar mapa, super app, loyalty. **Não pode:** ver vendas de outros, editar eventos, acessar painel admin.
- **Promoter pode:** Link público pessoal · Convidar e ver inscritos · Acompanhar comissão em tempo real · Stories/WhatsApp share · Ver ranking dos pares. **Não pode:** editar evento ou lotes, ver dados financeiros completos, acessar outras listas.
- **Produtora pode:** Criar e administrar eventos · Painel ao vivo (sales/check-in/cashless) · Gerenciar promoters + comissões · Operar PDV, KDS, porta, mesas · Sacar via Pix, gerar Excel. **Não pode:** ver dados de outras produtoras, bypass do antifraude PulsePass, alterar taxas da plataforma.
- **ADM pode:** Visão multi-tenant de tudo · Aprovação de orgs e eventos · Monitor antifraude global · Suporte com acesso assistido · Ajustar taxas, features e LGPD. **Não pode:** ver dados criptografados E2E, sacar saldo de terceiros, burlar audit log ("tudo é trilhado").

### 1.2 Role card (anatomia visual exata)

- Container: `borderRadius: 22`, `padding: 22`, `background: linear-gradient(180deg, ${cor}12, rgba(255,255,255,0.02))`, `border: 1.5px solid ${cor}40`, `backdropFilter: blur(20px) saturate(180%)`, `boxShadow: 0 12px 32px ${cor}15, inset 0 1px 0 rgba(255,255,255,0.12)`.
- Barra superior de accent: absoluta, `height: 3`, `background: cor`, `opacity: 0.7`.
- Ícone: 48×48, `borderRadius: 14`, `background: ${cor}25`, `border: 1px solid ${cor}50`, fontSize 22.
- Título: display 700, fontSize 22, letterSpacing −0.02em; sub: 11px `rgba(255,255,255,0.55)`.
- Chip "usuários": `padding: 6px 10px`, radius 8, `background: rgba(0,0,0,0.3)`; label 9px mono uppercase 0.08em `rgba(255,255,255,0.5)` + valor 11px mono 700 na cor do role.
- Bloco **"Pode"**: `padding: 14`, radius 12, `background: ${cor}08`, `border: 1px solid ${cor}25`; header 10px mono uppercase 0.08em 700 na cor do role, com check SVG strokeWidth 3; itens 12px `rgba(255,255,255,0.85)`, bullet `·` na cor do role, lineHeight 1.4, gap 6.
- Bloco **"Não pode"**: mesmo layout, `background: rgba(255,59,48,0.04)`, `border: 1px solid rgba(255,59,48,0.18)`, header e X em `#FF7A75`, itens `rgba(255,255,255,0.6)`.
- Rodapé auth+device: `marginTop: auto`, `borderTop: 1px solid rgba(255,255,255,0.06)`, ícones cadeado/monitor SVG stroke na cor do role, texto 10px mono `rgba(255,255,255,0.55)` letterSpacing 0.06em.
- Grid dos 4 cards: `repeat(4, 1fr)`, gap 18, marginTop 36.

### 1.3 Fluxo de roteamento pós-login (diagrama)

Container: padding 24, radius 22, `rgba(255,255,255,0.03)` + border `rgba(255,255,255,0.08)` + blur(20px). Label: "Roteamento pós-login · single sign-on inteligente".

1. Nó **Login único** (180px): 🔐, `background: linear-gradient(135deg, #00FF8525, #22D3EE15)`, `border: 1.5px solid #00FF8550`, `boxShadow: 0 0 24px #00FF8525`, sub mono "CPF · Pix · biometria".
2. Seta → nó **Detector de role** (200px): ⚡, `rgba(167,139,250,0.10)` + border `1.5px rgba(167,139,250,0.4)`, sub mono: "JWT carries · role · org_id · permissions".
3. Ramifica em 4 destinos (pill radius 10, `${cor}10` bg, `1px solid ${cor}30`, label mono 11px na cor):
   - `role: customer →` iPhone super app · home discover
   - `role: promoter →` iPhone modo promoter · web painel
   - `role: organizer →` iPad operação · web back office
   - `role: admin →` Web restrito · multi-tenant overview

**Regra de produto:** um único login detecta o perfil e roteia. O JWT carrega `role`, `org_id`, `permissions`.

### 1.4 MultiRoleLoginScreen (mobile 390×844)

Estrutura (top→bottom): `Aurora intensity={1.1}` + StatusBar → logo → título → input CPF → lista de roles detectados → card "mais opções" → métodos de auth → CTA.

- **Logo:** SVG 56×56 — círculo externo r29 stroke verde 2.5 opacity 0.5, círculo interno r22 stroke 2, waveform path `M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32` stroke 2.5. Wordmark: display 700 28px −0.03em, "Pulse" branco + "PASS" verde.
- **Título:** eyebrow "Identificação"; "Quem é você?" display 700 28px lineHeight 1.05, quebra para "(detectamos automaticamente)" em serif itálico verde.
- **Input CPF:** label "Seu CPF ou e-mail corporativo"; campo `height: 56`, `padding: 0 20px`, `radius 16`, `background: rgba(255,255,255,0.05)`, `border: 1.5px solid rgba(0,255,133,0.3)`, `boxShadow: 0 0 24px rgba(0,255,133,0.15)`; ícone user stroke `rgba(255,255,255,0.5)`; valor mascarado "231.\*\*\*.\*\*\*-04" 16px; badge "✓ válido" 11px mono verde 600.
- **Roles detectados:** label mono 11px uppercase 0.1em "Detectamos esses acessos · 2". Cards (padding 16, radius 16):
  - Selecionado: `background: ${cor}10`, `border: 1.5px solid ${cor}`, `boxShadow: 0 0 24px ${cor}20`.
  - Não selecionado: `rgba(255,255,255,0.04)` + `1px solid rgba(255,255,255,0.08)`.
  - Conteúdo: ícone 48×48 radius 12 (`${cor}25` bg, `${cor}50` border) · título 14px 600 · sub 12px 0.6. Exemplos de copy: "Você (Cliente)" / "3 ingressos · R$ 187 cashless" (verde, selecionado); "Promoter · Audio Club" / "Tier 3 · R$ 2.834 comissão" (violeta).
  - Radio à direita: 24×24 circular; selecionado = `border: 7px solid ${cor}` + `background: #06070A`; não = `1.5px solid rgba(255,255,255,0.25)`.
- **Mais opções:** card `padding 14, radius 14`, `background rgba(255,255,255,0.03)`, `border: 1px dashed rgba(255,255,255,0.15)`; copy centralizada: "Acesso de **Produtora** ou **ADM**? Use o portal corporativo · pulsepass.app/biz" (ADM em rosa, URL em verde). → **Produtora/ADM NÃO logam pelo app mobile; portal web separado.**
- **Métodos de auth:** grid 3 col gap 8 — Face ID (selecionado: `#00FF8510` bg, `1.5px #00FF8550` border, ícone verde), Senha, E-mail (inativos `rgba(255,255,255,0.04)`).
- **CTA:** "Continuar como Cliente" — botão full-width `height: 54`, `radius 18`, `background: linear-gradient(180deg, #4DFFA8, #00FF85)`, `color: #003C1F`, 700 15px, `boxShadow: 0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`, seta SVG à direita. **Este é o CTA primário canônico do DS.**

---

## 2. GAPS — telas que faltavam

### 2.1 `Gaps1.jsx` — Seat Map · Totem · Estoque/CMV

#### PSideG — sidebar da produtora (compartilhada)

`width: 72`, `padding: 20px 12px`, `borderRight: 1px solid rgba(255,255,255,0.06)`, `background: rgba(11,13,18,0.4)`, blur(20px). Logo 32×32 no topo. 9 itens de nav (ordem): `overview ◐, events ▦, sales ⤿, finance $, marketing ★, boxoffice ⊞, stock ◰, guests ☷, team ◇`. Item 48×48 radius 12; ativo: `rgba(0,255,133,0.10)` bg + `1px solid rgba(0,255,133,0.3)` + cor verde; inativo: transparente, `rgba(255,255,255,0.55)`.

#### A) SeatMapScreen — mapa de assentos numerados ("Sympla mode", iPad 1216×856)

- **Fluxo:** cliente escolhe assento numerado → assentos vão para painel lateral → checkout. Reserva temporária de **8 minutos**, "Lugares juntos garantidos".
- **Fundo:** `radial-gradient(50% 40% at 50% 0%, rgba(167,139,250,0.10), transparent 60%), #06070A`. Cor dominante da tela: violeta.
- **Header:** eyebrow violeta "Ingresso numerado · Sympla mode"; título display 700 26px "Escolha seu lugar · *Teatro Bradesco*" (nome do teatro em serif itálico violeta). Legenda à direita: Disponível (violeta outline), Selecionado (verde fill), Vendido (`rgba(255,255,255,0.25)` fill) — swatch 12×12 radius 3.
- **Palco:** 60% de largura, `height: 36`, `borderRadius: 0 0 40px 40px`, `background: linear-gradient(180deg, #A78BFA40, #A78BFA10)`, border violeta40 sem topo; texto "PALCO" mono 12px letterSpacing 0.3em violeta.
- **Assento:** 16×16, `borderRadius: 4`. Estados: free = `${tone}20` bg + `1px solid ${tone}50`; sold = `rgba(255,255,255,0.04)` bg + `rgba(255,255,255,0.06)` border; selected = verde sólido + `boxShadow: 0 0 8px #00FF85`. Gap 4 entre assentos e fileiras; rótulo da fileira (A, B…) 9px mono `rgba(255,255,255,0.4)` largura 16.
- **Setores (3, cada um com sua cor-tom):** Plateia Premium · R$ 280 (ciano, 4 fileiras × 20); Plateia · R$ 180 (violeta, 6 × 24); Balcão · R$ 90 (verde, 3 × 28). Título do setor: 10px mono uppercase 0.12em na cor do setor. Assentos selecionados no mock: B10 e B11 do Premium.
- **Painel direito (340px):** `borderLeft rgba(255,255,255,0.06)`, `background rgba(11,13,18,0.5)`, blur(20px), padding 20. Label "Seus assentos · 2". Card de assento: padding 14, radius 14, `rgba(0,255,133,0.06)` + border `rgba(0,255,133,0.25)`; chip do número 36×36 radius 8 verde sólido, texto `#003C1F` mono 700 13px; título "Premium · B10" 13px 600; preço 11px mono; "×" para remover à direita.
- **Aviso info:** card `rgba(34,211,238,0.06)` + border `rgba(34,211,238,0.2)`, ícone info ciano, texto 11px: "Assentos reservados por **8 minutos**. Lugares juntos garantidos."
- **Rodapé:** "Total · 2 assentos" + "R$ **560**" (24px mono 700, número em verde); CTA "Continuar · checkout" (padrão verde: height 54, radius 16, gradiente `#4DFFA8→#00FF85`, `#003C1F`, shadow `0 8px 24px rgba(0,255,133,0.4)`).

#### B) TotemScreen — autoatendimento self-checkout ("Zig", iPad 1216×856)

- **Fluxo:** cliente toca produtos → carrinho lateral → paga aproximando pulseira NFC (primário) ou QR/Pix ou cartão. Tudo em escala touch grande (totem público).
- **Fundo:** aurora dupla `radial-gradient(50% 40% at 25% 15%, rgba(0,255,133,0.20)…)` + `(at 80% 85%, rgba(167,139,250,0.18)…)` sobre `#06070A`.
- **Header:** logo 44×44; "Autoatendimento" display 700 28px; sub mono 13px "Totem 02 · Bar Central · toque para pedir". Pill "ONLINE": radius 999, `rgba(0,255,133,0.10)` + border 0.25, dot 8px verde com `boxShadow: 0 0 8px`.
- **Tabs de categoria:** Tudo · Cervejas · Drinks · Combos · Comidas — `padding: 14px 24px`, radius 16, 16px 600; ativa = verde sólido com texto `#003C1F`; inativa = `rgba(255,255,255,0.05)` + border 0.1.
- **Grid de produtos:** 3 colunas, gap 18, cards radius 22 padding 20, `rgba(255,255,255,0.04)` + border 0.1 + blur(20px) + `inset 0 1px 0 rgba(255,255,255,0.08)`; barra de accent no topo `height: 4` na cor do produto, opacity 0.6. Ícone 64×64 radius 16 (`${cor}20` bg / `${cor}40` border, emoji 34px); botão "+" 48×48 radius 14 verde sólido `#003C1F` 26px, `boxShadow: 0 4px 16px #00FF8550`. Nome 18px 600; preço mono 700 24px branco. Catálogo do mock: Brahma 600ml R$18 (âmbar), Heineken LN R$15, Caipirinha R$24 (verde), Gin Tônica R$38 (violeta), Combo Vodka R$42, Red Bull R$18 (rosa), Água R$8 (ciano), Burger R$32, Batata G R$24 (âmbar).
- **Carrinho (380px):** `rgba(11,13,18,0.6)` + blur(30px), padding 28. Título "Seu pedido" display 700 24px. Linha de item: padding 14 radius 16; stepper −/+ 36×36 radius 10 ("−" glass `rgba(255,255,255,0.08)`, "+" verde sólido), quantidade mono 700 18px.
- **Total:** 16px 600 "Total" + "R$ **78**,00" mono 700 32px (número verde).
- **CTA gigante:** `height: 72`, radius 20, gradiente verde padrão, 18px 700 — "Pagar · aproxime pulseira" com ícone QR. Secundários abaixo: "QR / Pix" e "Cartão", height 48 radius 14 glass (`rgba(255,255,255,0.06)` + border 0.14).

#### C) StockScreen — Estoque & CMV (produtora, iPad 1216×856)

- **Fluxo:** painel de gestão de estoque com CMV, margens, rupturas e sugestão de reposição da "Pulse AI". Cor de identidade da tela: **âmbar** `#FFB800`.
- **Fundo:** `radial-gradient(40% 30% at 80% 10%, rgba(255,184,0,0.08)…)` + `(at 20% 90%, rgba(0,255,133,0.06)…)`. Sidebar PSideG com `active="stock"`.
- **Topbar:** pill de contexto org (avatar 28×28 radius 8 `linear-gradient(135deg, #A78BFA, #FF3D88)` iniciais "AC"; "Audio Club" 12px 600 / "Festival do Sol" 9px mono). Botão "+ Entrada de estoque": `padding 10px 16px`, radius 12, `background: linear-gradient(180deg, #FFB800, #E6A600)`, texto `#06070A` 13px 700, `boxShadow: 0 4px 16px rgba(255,184,0,0.35)`.
- **Título:** eyebrow âmbar "Estoque & CMV"; "Onde o lucro *realmente mora*" (serif itálico âmbar).
- **KPIs (grid 4):** card padding 14 radius 14 `rgba(255,255,255,0.03)` + border 0.08, barra topo `height 2` na cor semântica. Valores: CMV médio **31,2%** ("meta < 35%", verde) · Margem bruta **68,8%** ("R$ 32.940 lucro", verde) · Rupturas hoje **2** ("Gin · Pizza", vermelho) · Valor em estoque **R$ 84.200** ("1.842 itens", violeta). Label 10px mono uppercase; valor mono 700 22px; delta 10px na cor.
- **Tabela:** radius 16, border 0.06. Colunas (grid `2fr 100px 100px 110px 110px 90px 1fr`): Produto · Custo un. · Venda un. · Margem · Vendidos · Estoque · Nível. Header 10px mono uppercase `rgba(255,255,255,0.5)`, fundo `rgba(255,255,255,0.03)`. Zebra: linhas ímpares `rgba(255,255,255,0.012)`; linha em ruptura inteira com `rgba(255,59,48,0.04)`.
  - Margem calculada `(venda−custo)/venda`; cor: >60% verde, >45% âmbar, senão vermelho (mono 700 13px).
  - Coluna Nível: barra de progresso `height 6` radius 99 track `rgba(255,255,255,0.06)`, fill na cor com `boxShadow 0 0 6px ${cor}80`; ou badges `PBadge`: `tone="red"` "ruptura" (estoque 0), `tone="red" dot` "crítico" (baixo), `tone="amber"` "repor" (médio).
  - Dados: Brahma 600ml 6,20/18 (252/500) · Heineken LN 5,80/15 (152/350) · Caipirinha 4,50/24 (∞) · Gin Tônica premium 14,20/38 (2/80 crítico) · Combo Vodka 18,40/42 (64/150) · Burger 12,80/32 (28/200 repor) · Pizza brotinho 9,50/28 (0/100 ruptura).
- **Alerta rodapé:** card radius 14 `rgba(255,59,48,0.06)` + border `rgba(255,59,48,0.2)`, ícone triangle vermelho. Copy: "2 produtos em ruptura · Pulse AI sugere reposição" + "Pizza brotinho zerou às 23h12 (perdeu ~R$ 540 em vendas). Gin Premium acaba em ~18min no ritmo atual." Botão "Pedir reposição": vermelho sólido `#FF3B30`, texto branco 12px 700, radius 10.

### 2.2 `Gaps2.jsx` — App do Garçom (mobile 390×844, cor de identidade: âmbar)

#### D) WaiterScreen — "Suas mesas"

- **Fluxo:** garçom em turno vê suas mesas, filtra por chamados/pedidos prontos, abre mesa ou inicia pedido novo.
- `Aurora intensity={0.5}` + StatusBar.
- **Header:** eyebrow âmbar "Garçom · turno ativo"; título "Suas mesas · 5" display 700 24px. Pill do garçom: radius 999 `rgba(255,184,0,0.14)` + border 0.3; avatar 24px `linear-gradient(135deg, #FFB800, #FF3D88)` letra "R"; texto mono 11px âmbar "RAFA · 10% gorjeta".
- **Stats do turno (grid 3):** cards padding 12 radius 14 `rgba(255,255,255,0.03)`. R$ 3.840 Vendido (verde) · R$ 384 Gorjeta (âmbar) · 5/8 Mesas (violeta). Valor mono 700 16px; label 10px mono uppercase.
- **Filtros (pills radius 999, 12px 600):** "Minhas · 5" ativa (âmbar sólido, texto `#06070A`) · "Chamados · 2" (`rgba(255,61,136,0.14)` bg, texto rosa, border rosa 0.3, com `pp-pulse-dot` 6px rosa) · "Prontas · 1" (glass 0.05).
- **Card de mesa** (padding 14, radius 18, row): estados —
  - `calling`: `rgba(255,61,136,0.08)` bg, `1.5px solid #FF3D8850`, `boxShadow 0 0 20px #FF3D8820`, badge `PBadge tone="pink" dot` "chamando garçom".
  - `ready`: `rgba(167,139,250,0.08)`, `1.5px #A78BFA50`, badge `PBadge tone="violet"` "pedido pronto · entregar".
  - `open`: `rgba(255,255,255,0.03)` + border 0.08, sem badge.
  - Chip da mesa: 54×54 radius 14, `${cor}25` bg / `${cor}50` border, código mono 700 16px ("M08"…). Nome 15px 600 (+ "★" 11px se VIP); meta mono 11px "12 pessoas · 38 itens · 2h47". Total à direita mono 700 16px **verde**; chevron `rgba(255,255,255,0.4)`.
  - Mock: M08 Aniversário Bia (rosa, calling, VIP, R$ 2.180) · M02 Caio R. (violeta, ready) · M05 Reis / M07 Lima x9 (verde, open) · M04 Marina L. (âmbar, calling, VIP).
- **Ações fixas no rodapé** (absolute bottom 14): CTA "Novo pedido na mesa" — height 54 radius 18, `linear-gradient(180deg, #FFB800, #E6A600)`, texto `#06070A` 700 14px, `boxShadow 0 8px 24px rgba(255,184,0,0.35)`, ícone "+". Botão quadrado 54×54 glass com ícone QR (scan).

#### E) WaiterOrderScreen — comanda na mesa

- **Fluxo:** dentro da mesa, garçom adiciona itens do cardápio por categoria e envia para cozinha & bar; comanda acumulada visível.
- **Nav:** botão voltar circular 38×38 glass; centro "Mesa M08 · Aniversário Bia" 13px 600 + "12 pessoas · comanda aberta" 10px mono; direita botão "★" 38×38 violeta (`rgba(167,139,250,0.14)` + border 0.3).
- **Categorias (pills):** Drinks (ativa, verde sólido `#003C1F`) · Cervejas · Combos · Comidas · Doses — `padding 8px 14px`, radius 999, 12px 600.
- **Lista de itens:** label "Drinks · toque pra adicionar". Linha: padding 12, radius 14; com quantidade > 0 vira verde (`rgba(0,255,133,0.06)` + border `rgba(0,255,133,0.25)`); ícone emoji 44×44 radius 12; nome 14px 600; preço mono 13px **verde** 600. Controles: q=0 → botão "+" 36×36 radius 10 `rgba(0,255,133,0.12)` + border 0.3, texto verde; q>0 → stepper −/+ 30×30 radius 8 ("+" verde sólido). Mock: Caipirinha 24 (q4) · Moscow Mule 32 (q2) · Gin Tônica 38 · Aperol Spritz 36 · Negroni 34 (q1).
- **Resumo flutuante (bottom sheet):** `margin 10px 14px 14px`, padding 16, radius 22, `background rgba(11,13,18,0.7)` + blur(30px), border 0.12, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 32px rgba(0,0,0,0.5)`. Esquerda: "Adicionando · 7 novos itens" (11px mono uppercase) + "R$ **248**,00" (mono 700 22px, número verde). Direita: "comanda total" 10px mono + "R$ 2.428" mono 600 14px 0.8.
- **CTA:** "Enviar p/ cozinha & bar" — height 52, radius 16, gradiente verde padrão, `#003C1F`, ícone check.

---

## 3. Organização do canvas (`App.jsx`)

Root: `DesignCanvas` > `DCSection` > `DCArtboard`. Telas mobile embrulhadas em `IPhoneShell` (410×864, radius 54, padding 10, moldura `linear-gradient(180deg, #1a1a1f, #0a0a0c)`, tela interna radius 44 `#06070A`, Dynamic Island 124×36 radius 999 preta no topo); iPad em `IPadFrame` (artboards 1216×856). Artboards mobile: 430×884; painéis grandes 1560×420/1080.

Ordem das seções:

1. **intro** — Hero 1560×420: "Sinta o pulso *do evento.*" (display 88px −0.045em), stats 53 telas / 4 roles / 5 engines / 38 tokens.
2. **roles** — "Roles & Permissões": `RolesMap` (00) + `MultiRoleLoginScreen` (00b, em IPhoneShell).
3. **foundation** — Brand (01), Color (02), Type (03), System (04), Components (05).
4. **cliente** (Role 1, 17+ telas, A–S): Onboarding, Home Discover, Catálogo, Busca, Página do Evento, **Mapa de assentos (E2 — SeatMapScreen em IPadFrame)**, Casa/Perfil do Produtor, Checkout Pix, Compra confirmada, Meus Ingressos, QR rotativo, Transferir, Carteira Cashless, Recarregar, Pedido no bar, Mapa live, Saque residual, Loyalty, Notificações, Perfil.
5. **promoter** (Role 2): Promoter mode (T), Inscrição pública (U), e — alocados nesta seção — **App do Garçom: suas mesas (U2) e comanda na mesa (U3)** (WaiterScreen/WaiterOrderScreen, mobile).
6. **produtora** (Role 3, V–AL): Multi-evento, Dashboard ao vivo, Criar Evento wizard, Marketing, PDV Cashless, **Totem (Z2)**, **Estoque & CMV (Z3)**, KDS, Reservas/Mesas, Box Office, Porta/Scanner, Guest List, Promoters ranking, Financeiro, Fechamento de Caixa, Relatório Excel, Time & Staff, Branding white-label, API & Webhooks.
7. **adm** (Role 4, AJ–AQ, tudo iPad): Visão da Plataforma multi-tenant, Organizações (248 orgs health), Antifraude ML, Suporte + Pulse AI, Audit log WORM, Feature flags, Taxas & planos/split, Financeiro MRR/cohort.

Nota: as telas de Gaps foram inseridas nas seções dos roles que as usam (SeatMap → Cliente E2; Waiter → seção Promoter como U2/U3, embora funcionalmente seja staff da casa; Totem/Stock → Produtora Z2/Z3). O garçom NÃO aparece como 5º role no RolesMap — é um sub-perfil operacional (staff) da Produtora, com identidade visual âmbar.

---

## 4. PADRÕES GLOBAIS

1. **CTA primário verde:** `background: linear-gradient(180deg, #4DFFA8, #00FF85)`, texto `#003C1F` 700, radius 16–20, height 52–72 (52 mobile denso, 54 padrão, 72 totem), `boxShadow: 0 8–12px 24–32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`.
2. **CTA âmbar (staff/estoque):** `linear-gradient(180deg, #FFB800, #E6A600)`, texto `#06070A`, shadow `rgba(255,184,0,0.35)`.
3. **Card glass base:** `background: rgba(255,255,255,0.03–0.05)`, `border: 1px solid rgba(255,255,255,0.08–0.10)`, `backdropFilter: blur(20px)` (painéis pesados 30px), `inset 0 1px 0 rgba(255,255,255,0.08–0.12)`; painéis laterais/sheets usam `rgba(11,13,18,0.4–0.7)`.
4. **Tinting por cor de role/estado:** fórmula hex+alpha em sufixo — bg `${cor}08–12`, chip/ícone bg `${cor}20–25`, border `${cor}25–50`, glow `0 0 20–24px ${cor}15–25`. Seleção ativa: border sobe para `1.5px solid` e ganha glow.
5. **Barra de accent no topo do card:** absoluta, height 2–4, cor do item, opacity 0.6–0.7.
6. **Escala de radius:** 4 (assento) · 8–10 (chips, botões pequenos) · 12–14 (ícones, cards pequenos) · 16–18 (inputs, cards, CTAs) · 20–22 (cards grandes, sheets) · 999 (pills) · 44/54 (device).
7. **Tipografia recorrente:** eyebrow (`pp-eyebrow`) na cor da tela; título display 700 24–28px letterSpacing ≈ −0.02/−0.025em com trecho final em serif itálico 400 colorido; labels mono 10–11px uppercase letterSpacing 0.06–0.12em `rgba(255,255,255,0.5–0.55)`; números/preços sempre mono 700 (o valor numérico em verde, "R$ " e centavos em branco).
8. **Hierarquia de texto branco:** 1.0 títulos · 0.85 corpo positivo · 0.7–0.75 secundário · 0.55–0.6 terciário · 0.4–0.5 hints/ícones apagados · 0.25 desabilitado.
9. **Status por cor fixa:** verde = ok/venda/dinheiro entrando; violeta = pronto/reservado/premium; rosa = urgência humana (chamando, ADM, fraude); âmbar = staff/atenção/repor; vermelho `#FF3B30` = ruptura/crítico; ciano = informação/produtora.
10. **Componentes globais reutilizados** (definidos fora destes arquivos, expostos via `window`): `Aurora`, `StatusBar`, `PBadge` (tones: red, amber, violet, pink; prop `dot`), `PButton`, `IPhoneShell`, `IPadFrame`, `DesignCanvas/DCSection/DCArtboard`, classes CSS `pp-aurora`, `pp-eyebrow`, `pp-label`, `pp-pulse-dot`.
11. **Steppers de quantidade:** "−" sempre glass (`rgba(255,255,255,0.08)` + border 0.14), "+" sempre verde sólido com texto `#003C1F`; tamanhos 30/36/48 conforme densidade (mobile garçom / carrinho / totem).
12. **Logo PulsePass:** círculo(s) stroke verde + waveform `M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32`; wordmark "Pulse" branco + "PASS" verde.
