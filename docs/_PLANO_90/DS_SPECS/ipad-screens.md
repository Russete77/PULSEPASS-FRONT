# DS SPEC — iPad Screens (PulsePass Design System)

Fonte: `design-system/src/iPadScreens.jsx`, `iPadScreens2.jsx`, `iPadScreens3.jsx`, `iPadScreens4.jsx`
Todas as telas: dark theme sobre `#06070A`, verde neon `#00FF85`, glassmorphism (`backdropFilter: blur(20px)`).

## Paleta de constantes (idêntica nos 4 arquivos, só muda o sufixo do nome)

| Token | Valor | Uso |
|---|---|---|
| G (G3/G6/G9/GA) | `#00FF85` | verde pulse — primário, sucesso, live, dinheiro |
| V (V3/V6/V9/VA) | `#A78BFA` | violeta — premium, promoter, "pronto" |
| C (C3/C6/C9/CA) | `#22D3EE` | ciano — check-in, relatórios, IA |
| PINK | `#FF3D88` | pink — VIP, alerta/fraude, comissão |
| AMBER | `#FFB800` | âmbar — warning, cozinha, ocupado, estoque baixo |

Cores de texto sobre botão sólido: verde → `#003C1F`; violeta → `#1A0040`; ciano → `#06070A`; branco → `#06070A`.
Vermelho de erro/negativo: `rgba(255,59,48,…)` (log de check-in) e `#FF7A75` (delta negativo).

Fontes (CSS vars do DS): `var(--pp-font-body)` (corpo), `var(--pp-font-display)` (títulos, weight 600–700, letterSpacing -0.01em a -0.025em), `var(--pp-font-mono)` (números, labels uppercase, timestamps), `var(--pp-font-serif)` (itálico de destaque em títulos, weight 400).

Classes utilitárias referenciadas (definidas fora destes arquivos): `pp-eyebrow` (label mono uppercase pequeno colorido acima do título), `pp-label` (label mono uppercase de seção). Componente compartilhado: `PBadge` com props `tone` (`pulse` | `violet` | `pink` | `amber` | `neutral` | `red`) e `dot` (boolean — pontinho de status).

---

## 0. IPadFrame (moldura do device) — arquivo 1

Wrapper decorativo (não vai pro app; só referência de canvas 1180×820).
- Externo: `width+36 × height+36`, `borderRadius: 44`, `background: linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)`, `padding: 18`
- `boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 4px #0a0a0c, inset 0 0 0 5px rgba(255,255,255,0.06), 0 50px 100px -30px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,133,0.08)'`
- Câmera: dot 8×8 `#2a2a30`, `borderRadius: 50%`, `boxShadow: inset 0 0 0 1px rgba(255,255,255,0.1)`, top 8, centralizada
- Tela interna: `borderRadius: 26`, `overflow: hidden`, `background: #06070A`

---

## 1. ProducerDashboard — Dashboard do Produtor (role: produtor)

### Layout (esquerda→direita, cima→baixo)
1. **Aurora bg** (absolute inset 0, z 0): `radial-gradient(50% 40% at 20% 10%, rgba(0,255,133,0.10), transparent 60%), radial-gradient(50% 40% at 80% 90%, rgba(167,139,250,0.10), transparent 60%), #06070A`
2. **Sidebar 220px** (glass): logo + nav + card upgrade
3. **Main**: top bar → título+filtros de período → grid 4 KPIs → grid `1fr 360px` (chart grande + coluna lateral com ocupação e feed)

### Sidebar
- `width: 220`, `padding: '20px 14px'`, `borderRight: 1px solid rgba(255,255,255,0.06)`, `background: rgba(11,13,18,0.4)`, `backdropFilter: blur(20px)`, flex column `gap: 6`
- **Logo**: SVG 32×32 (círculo r29 stroke G opacity .5 strokeWidth 2.5 + círculo r22 strokeWidth 2 + waveform path `M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32` strokeWidth 2.5, linecap/linejoin round). Texto: `Pulse` + `PASS` em verde (display 700, 16, ls -0.02em). Subtítulo "Produtor": mono 9, `letterSpacing: 0.12em`, uppercase, `rgba(255,255,255,0.45)`.
- **Label de grupo** "Operar": mono 10, ls 0.12em, uppercase, `rgba(255,255,255,0.4)`, padding `6px 12px`
- **Itens de nav** (ícones unicode): Visão geral `◐` (ativo), Eventos `▦` (count 12), Vendas `⤿`, Guest List `☷` (count 1247), Check-in `◉` (live dot), Cashless `◈`, Promoters `◇`
  - Item: `padding: '10px 12px'`, `borderRadius: 12`, fontSize 13
  - Ativo: `background: rgba(0,255,133,0.10)`, `border: 1px solid rgba(0,255,133,0.22)`, cor G, weight 600
  - Inativo: transparente, `border: 1px solid transparent`, `rgba(255,255,255,0.75)`, weight 500
  - Count: mono 10 `rgba(255,255,255,0.5)`. Live dot: 6×6 round PINK com `boxShadow: 0 0 8px rgba(255,61,136,0.8)`
- **Card Upgrade** (marginTop auto): `padding: 12`, `borderRadius: 14`, `background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(34,211,238,0.10))`, `border: 1px solid rgba(167,139,250,0.25)`. Label "Upgrade" mono 10 ls 0.1em uppercase violeta; copy "Pulse+ libera relatório Excel premium" 12/600 lineHeight 1.3.

### Top bar
- `padding: '14px 24px'`, `borderBottom: 1px solid rgba(255,255,255,0.06)`, `background: rgba(11,13,18,0.35)`, blur(20px)
- **Pill live**: `padding: '6px 12px 6px 8px'`, `borderRadius: 999`, `background: rgba(0,255,133,0.08)`, `border: 1px solid rgba(0,255,133,0.2)`; dot 6×6 verde `boxShadow: 0 0 8px rgba(0,255,133,0.8)`; texto "FESTIVAL DO SOL · AO VIVO" mono 11/600 verde ls 0.05em
- Data "30 nov 2026 · 22h00" 12 `rgba(255,255,255,0.5)`
- Botão sino 36×36 `borderRadius: 10` `rgba(255,255,255,0.06)` border `rgba(255,255,255,0.1)`
- **Chip usuário**: pill `padding: '6px 10px'` radius 999 mesmo fundo; avatar 24×24 round `linear-gradient(135deg, #A78BFA, #FF3D88)` com inicial "E" 11/700; nome "Erick" 12/600

### Título + filtros
- Eyebrow "Visão geral" mono 11 ls 0.12em uppercase verde
- H1 "Boa noite, *SMU*" — display 700 32 ls -0.025em; "SMU" em serif itálico 400 verde (padrão recorrente: palavra de destaque em serif itálico verde)
- Pills período `['Esta noite','7 dias','Mês','Total']`: `padding: '8px 14px'` radius 999, 12/600; ativa: `rgba(255,255,255,0.1)` + border `rgba(255,255,255,0.14)` + branco; inativa: transparente `rgba(255,255,255,0.55)`

### KPI cards (grid 4 col, gap 14)
- Card: `padding: 18`, `borderRadius: 18`, `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.08)`, blur(20px), `boxShadow: inset 0 1px 0 rgba(255,255,255,0.06)`
- **Top stripe** de cor: absolute top, height 2, cor do KPI, opacity 0.6
- Label mono 11 ls 0.08em uppercase `rgba(255,255,255,0.55)`; valor mono 700 26 ls -0.02em branco; delta `↑ …` 11/600 na cor do KPI; sparkline SVG 60×20 polyline strokeWidth 1.5 na cor
- Dados: Faturamento `R$ 184.320` `+18,4%` (G) · Ingressos vendidos `2.184` `+312 hoje` (V) · Check-ins `1.872` `85,7% do público` (C) · Cashless gasto `R$ 47.890` `R$ 22 ticket médio` (PINK)

### Chart grande (glass card, padding 22, radius 18)
- Header: label mono "Vendas em tempo real" + valor display 600 22 "R$ 184.320,`00`" (centavos em `rgba(255,255,255,0.45)`); legenda à direita: quadradinho 8×8 radius 2 + label 11 + % mono 11/600 — Pista G 62%, Premium V 28%, VIP C 10%
- SVG `viewBox 0 0 700 200` preserveAspectRatio none: 4 gridlines `rgba(255,255,255,0.05)`; área Pista com `linearGradient` verde `stopOpacity 0.35 → 0`; 3 polylines (G 2.5px, V 2px, C 2px, linecap round); **live dot** no fim: circle r5 verde + circle r10 verde opacity 0.3
- Eixo X: `['20h','20h30','21h','21h30','22h','22h30','23h','agora']` mono 10 `rgba(255,255,255,0.4)`

### Coluna lateral (360px)
- **Ocupação ao vivo** (glass card padding 18 radius 18 + dot verde live): 3 barras — `Pista geral 1432/1800` (G), `Premium 312/400` (V), `Camarote VIP 76/80` (PINK). Linha: nome 12/600 + `now/cap` mono 11; barra height 6 radius 99 track `rgba(255,255,255,0.06)`, fill na cor com `boxShadow: 0 0 8px {cor}80`
- **Eventos recentes** (feed): avatar-inicial 28×28 radius 8 `background: {tone}20` `border: 1px solid {tone}50`; texto `<b>{quem}</b> {ação}` 12; timestamp mono 10 `rgba(255,255,255,0.4)`; valor `+R$ {n}` mono 600 11 verde. Itens: "Bia C. comprou Premium · agora · +R$ 189" (G), "João M. check-in portaria 2 · 32s" (C), "Lia P. recarregou cashless · 1m · +R$ 100" (V), "Caio R. comprou 2× Pista · 2m · +R$ 180" (G), "Door 1 fraude bloqueada · 3m" (PINK)

---

## 2. PDVScreen — PDV Cashless (role: operador de bar)

### Layout
1. Bg: `radial-gradient(50% 40% at 10% 0%, rgba(0,255,133,0.06), transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(255,61,136,0.06), transparent 60%), #06070A`
2. **Esquerda (flex 1, padding 22)**: top bar → busca + categorias → grid produtos 4 col
3. **Direita (380px)**: cliente → comanda (carrinho) → totais + CTA NFC

### Top bar esquerda
- Pill status: "PDV 03 · BAR CENTRAL" (mesmo padrão pill live verde: bg `rgba(0,255,133,0.10)`, border `rgba(0,255,133,0.25)`, dot glow)
- "Operador: Marcos S. · Caixa #4720" 12 `rgba(255,255,255,0.55)`
- **Toggle "Modo Offline"** (desligado): pill radius 999 `rgba(255,255,255,0.06)`; track 32×18 radius 99 `rgba(255,255,255,0.1)`; knob 14×14 branco à esquerda
- **Relógio** "23:47": mono 16/700, `padding: '8px 14px'`, radius 12, `rgba(255,255,255,0.04)` + border `rgba(255,255,255,0.1)`

### Busca + categorias
- Search: `height: 48`, `borderRadius: 14`, `rgba(255,255,255,0.05)` border `rgba(255,255,255,0.1)`, ícone lupa 18, placeholder "Buscar produto, código de barras…" 14 `rgba(255,255,255,0.5)`
- Chips `['Tudo','Cerveja','Drink','Combo','Comida']`: height 48 radius 14, 13/600; **ativa = verde sólido** `#00FF85` texto `#003C1F` sem border; inativa `rgba(255,255,255,0.05)` texto `rgba(255,255,255,0.85)` border `rgba(255,255,255,0.1)`

### Grid de produtos (4 col, gap 12)
- Card: `padding: 14`, `borderRadius: 16`, glass padrão (`rgba(255,255,255,0.03)` + border 0.08 + blur + inset highlight)
- **Stripe lateral esquerda**: absolute, width 4, height 100%, cor da categoria, opacity 0.7
- Ícone: 40×40 radius 10 `background: {cor}20` `border: 1px solid {cor}40`, emoji 20px (🍺🍸🥃⚡🥤💧🍔🍟🌭🍕)
- Estoque: número mono 9 `rgba(255,255,255,0.4)` OU badge "Baixo": `padding: '2px 6px'` radius 6 mono 9 uppercase `background: rgba(255,184,0,0.2)` cor AMBER 600 (estado low stock); `∞` para ilimitado
- Categoria mono 12 uppercase ls 0.05em `rgba(255,255,255,0.5)`; nome 13/600 lh 1.2; preço mono 700 16 formato `R$ 18,00` (vírgula)
- 12 produtos: Brahma 600ml 18 (AMBER), Heineken Long Neck 15 (G), Caipirinha de limão 24 (G), Moscow Mule 32 (C), Gin Tônica premium 38 (V, low), Energético Red Bull 18 (PINK), Combo Vodka + RedBull 42 (PINK), Água sem gás 8 (C), Burger artesanal 32 (AMBER), Batata frita G 24 (AMBER), Hot dog premium 22 (V), Pizza brotinho 28 (PINK)

### Painel direito (carrinho)
- `width: 380`, `borderLeft: 1px solid rgba(255,255,255,0.06)`, `background: rgba(11,13,18,0.5)`, blur(20px)
- **Cliente**: label mono 10 "CLIENTE"; avatar 44×44 radius 12 gradient V→PINK inicial "B"; "Bianca C." 14/600; "PSP-9C3K · Premium" mono 11; à direita label "SALDO" + `R$ 187,50` mono 700 18 **verde**
- **Comanda**: título display 700 18 + "3 itens" mono 11
- Item do carrinho: `padding: '12px 14px'` radius 14 `rgba(255,255,255,0.04)` border 0.08; nome 13/600; `2 × R$ 18,00` mono 11; steppers: botão `−` 26×26 radius 8 ghost, qty mono 600 13, botão `+` 26×26 radius 8 **verde sólido** texto `#003C1F`; total da linha mono 700 14 alinhado à direita
- **Totais**: Subtotal / Taxa de serviço (10%) em 12 `rgba(255,255,255,0.6)`; divisor `borderTop: 1px solid rgba(255,255,255,0.06)`; "Total" 14/600 + valor mono 700 **28** com o número em verde ("R$" branco)
- **CTA primário**: `height: 56`, `borderRadius: 16`, `background: linear-gradient(180deg, #4DFFA8 0%, #00FF85 100%)`, texto `#003C1F` 700 16, `boxShadow: '0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'`, ícone QR + label **"Aproximar pulseira NFC"**
- Secundários (2 col, gap 8): height 40 radius 12 `rgba(255,255,255,0.05)` border `rgba(255,255,255,0.14)` 12/600 — "QR do cliente" e "PIX no balcão"

---

## 3. DoorScannerScreen — Portaria / Check-in Scanner (role: porteiro; core do AZList)

### Layout
1. **Esquerda (flex 1, padding 24)**: top bar → viewport do scanner (flex 1) → strip de 4 KPIs
2. **Direita (380px)**: último check-in (card grande) → log dos últimos 7

### Top bar
- Pill "PORTARIA 1 · OPERANDO" (padrão pill live verde, padding `8px 14px 8px 10px`)
- **Toggle Offline LIGADO**: label mono 11 "Offline"; track 28×16 radius 99 **verde**, knob 12×12 branco à direita
- Relógio "23:47" (mesmo padrão do PDV)

### Viewport do scanner
- Container: `borderRadius: 24`, `background: #0a0a0c`, border 0.08, overflow hidden
- Fundo câmera simulada: `radial-gradient(40% 40% at 50% 40%, rgba(167,139,250,0.15), transparent 70%), radial-gradient(50% 60% at 50% 100%, rgba(0,255,133,0.10), transparent 70%), #08080a`
- Telefone com QR simulado: 220×220 radius 24 branco, padding 16, rotate(-3deg), `boxShadow: 0 30px 60px rgba(0,0,0,0.6)`; QR = grid 17×17 com finder patterns
- Overlay escurecedor: `rgba(0,0,0,0.45)`
- **Cutout de mira**: 280×280 centrado, radius 24, `boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(0,255,133,0.5)'`
  - 4 corner brackets: 40×40, `border: 4px solid #00FF85` (só 2 lados cada), radius no canto 24, `boxShadow: 0 0 24px #00FF8580`
  - **Scan line**: height 2, `background: linear-gradient(90deg, transparent, #00FF85, transparent)`, `boxShadow: 0 0 24px #00FF85`, em top 40%
- Instrução flutuante (top 24, centrada): pill radius 999 `rgba(11,13,18,0.7)` blur(20px) border `rgba(255,255,255,0.14)`, "Aponte para o QR do ingresso" 13/600
- Botões flutuantes (bottom 24): "Buscar por nome / CPF" (com lupa) e "Modo lote" — `padding: '12px 22px'` radius 14 `rgba(255,255,255,0.08)` border 0.14 blur(20px) 13/600

### KPI strip (4 col, gap 12)
- Card menor: `padding: 14` radius 14 glass; valor mono 700 **22 na cor** (não branco)
- Check-ins `1.872` 85,7% (G) · Pendentes `312` "ainda fora" (AMBER) · Rejeitados `14` "fraude/expirado" (PINK) · Por minuto `24` "tx média" (C)

### Painel direito
- **Aprovado** (estado sucesso): label mono 10 verde "✓ Aprovado · agora"; avatar 72×72 radius 22 `linear-gradient(135deg, #00FF85, #22D3EE)` inicial display 700 28 `#003C1F`, `boxShadow: '0 0 30px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'`; nome "Caio Ramos" display 700 22; "CPF 348.***.***-22 · 27 anos" mono 12
- **Bloco de detalhes**: radius 12 `rgba(0,255,133,0.06)` border `rgba(0,255,133,0.2)`; linhas chave/valor 11 (chave mono `rgba(255,255,255,0.55)` ls 0.06em, valor 600 branco): SETOR "Premium · mesa 04" / LISTA "Lia (promoter)" / TOKEN "PSP-9C3K · válido" (valor em **verde mono**) / HISTÓRICO "11º evento PulsePass"
- **Alerta aniversariante** (estado warn): radius 10 `rgba(255,184,0,0.10)` border `rgba(255,184,0,0.3)`, ícone smiley âmbar, "Aniversariante · ofereça shot da casa" 11/600 âmbar
- **Log "Últimos 7 check-ins"** + hint "auto-refresh" mono 10: linha com ícone-status 26×26 radius 8 — ok: `rgba(0,255,133,0.14)`/border 0.35 + check verde; warn: `rgba(255,184,0,0.14)` + "!" âmbar; fail: `rgba(255,59,48,0.14)` + "×" pink. Nome 12/600 (fail = nome em PINK, ex. "Token expirado"); sub "{lista} · {setor}" mono 10; hora mono 10 (formato `23:47:12`). Estado de rejeição: "PSP-3K2L · rejeitado", setor "—".

---

## 4. GuestListManagerScreen — Gestão de Guest List (role: produtor)

### Layout
1. Bg: `radial-gradient(50% 40% at 20% 10%, rgba(167,139,250,0.08), transparent 60%), #06070A` — **accent da tela é VIOLETA**
2. **Mini sidebar colapsada 72px**: logo 36 + 6 ícones 44×44 radius 12 (ativo `☷`: `rgba(167,139,250,0.14)` border `rgba(167,139,250,0.3)` cor V)
3. **Top bar**: eyebrow violeta "Guest List" + título "Festival do Sol · 30 nov" display 700 22; botões: "Excel" ghost (ícone download) e **"+ Adicionar convidados"** — `background: linear-gradient(180deg, #C4B5FD, #A78BFA)`, texto `#1A0040` 13/700, `boxShadow: 0 4px 16px rgba(167,139,250,0.4)` (CTA violeta = padrão do fluxo guest list/promoter)
4. **Coluna de listas 280px** → **detalhe (header do promoter + toolbar + tabela)**

### Coluna de listas
- Label "Listas · 8" mono 10. Item: `padding: '10px 12px'` radius 12; ativo: `rgba(167,139,250,0.12)` + border `rgba(167,139,250,0.3)` + nome violeta
- Ícone 28×28 radius 8 `background: {tone}25` border `{tone}50`; promoter = inicial, system = `#`, special = `★`
- Sub: `{c} conv · {p}% check` mono 10
- Listas: Todas 1247/89% · **Lia Coelho 247/47% (V, ativa)** · Marcos S. 189/52% (PINK) · Júlia Reis 124/38% (C) · Cortesia 80/12% (AMBER) · Equipe 24/100% (G) · Imprensa 14/14% (branco) · Aniversariantes 6/100% (PINK, ★)

### Header do promoter (hero card)
- `padding: 18` radius 18, `background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(255,61,136,0.10))`, `border: 1px solid rgba(167,139,250,0.3)`, blur(20px), `boxShadow: inset 0 1px 0 rgba(255,255,255,0.14)`
- Avatar 56×56 radius 14 gradient V→PINK "L"; eyebrow "Promoter · Tier 3" mono violeta; nome display 700 22; "pulsepass.app/lia · comissão 12%" mono 12
- 3 mini-stats: valor mono 700 18 colorido / label mono 9 uppercase — Inscritos 247 (V), Check 47 (G), R$ comissão R$ 2.8k (PINK)

### Toolbar
- Search height 40 radius 12 "Buscar nome, CPF, telefone…"
- Filtros `['Todos · 247','Check-in · 47','No-show · 0']`: height 40 radius 12; ativo violeta (`rgba(167,139,250,0.14)` border 0.3 texto V)

### Tabela
- Container radius 14 border 0.06. Header: grid `24px 1.5fr 1fr 0.8fr 0.8fr 0.6fr`, bg `rgba(255,255,255,0.03)`, colunas mono 10 uppercase: Nome, Contato, Setor, Inscrito, Status; checkbox 16×16 radius 4 border 1.5px
- Linha: `padding: '12px 16px'`, zebra `rgba(255,255,255,0.015)` nas ímpares, divisor `rgba(255,255,255,0.04)`; nome 13/600 + CPF mascarado mono 10 (`231.***.***-04`); telefone mascarado mono 12 (`+55 11 9 8412-•••`); hora mono 11 (`23h12`)
- Badge de setor: `PBadge` tone: VIP→pink, Premium→violet, Staff→amber, Pista→pulse
- Badge de status: checked-in → `PBadge tone="pulse" dot`; aguarda → `tone="neutral"`; no-show → `tone="red"`
- Microcopy notável: "João Mendonça (+1)" (acompanhante), "Caio Ramos 🎂" (aniversariante)

---

## 5. EventWizardScreen — Wizard de Criação de Evento (role: produtor)

### Layout
1. Bg: `radial-gradient(40% 30% at 80% 10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(0,255,133,0.10), transparent 60%), #06070A`
2. **Sidebar de progresso 320px** (glass `rgba(11,13,18,0.4)` blur): logo + "Novo evento" / "passo 3 de 6" → barra de progresso → 6 steps verticais
3. **Main (padding '32px 40px')**: eyebrow → título → descrição → lista de lotes → card sugestão IA
4. **Barra de ações fixa** no rodapé (left 320): gradiente pra opaco

### Sidebar de progresso
- Progress bar: height 4 radius 99 track `rgba(255,255,255,0.06)`; fill 50% `linear-gradient(90deg, #00FF85, #22D3EE)` `boxShadow: 0 0 12px #00FF8580`
- Steps: `Básicos` (done) · `Identidade` (done) · `Ingressos` (**ativo**) · `Guest list` · `Cashless` · `Revisar & publicar`; sublabels: "Nome, data, local" / "Banner, descrição, lineup" / "Lotes, preços, capacidades" / "Promoters, comissões, listas" / "PDVs, produtos, NFC" / "Pré-visualização"
- Círculo do step 28×28: done = verde sólido + check `#003C1F`; ativo = `rgba(0,255,133,0.14)` + `border: 1.5px solid #00FF85` + `boxShadow: 0 0 16px #00FF8560` + número verde; futuro = `rgba(255,255,255,0.05)` border 0.1 número `rgba(255,255,255,0.4)`
- Linha conectora vertical: width 1.5, verde se done, `rgba(255,255,255,0.08)` senão
- Nome do step: 13/600 — ativo verde, done branco, futuro `rgba(255,255,255,0.5)`

### Main
- Eyebrow `pp-eyebrow` verde "03 · Ingressos"; título display 700 32 "Como você vai *vender?*" (serif itálico verde); descrição 14 `rgba(255,255,255,0.65)` maxWidth 560: "Crie lotes com regras automáticas. PulsePass faz a virada de lote sozinho quando o anterior esgota ou a data chega."
- **Cards de lote** (gap 12): `padding: 18` radius 18; ativo: `background: {tone}10` + `border: 1.5px solid {tone}50`; done: glass padrão com `opacity: 0.6`
  - Stripe vertical 6×56 radius 3 na cor (opacity 0.8)
  - Nome 16/700 + badges: done → `PBadge neutral` "finalizado"; ativo → `PBadge dot` (violet/pink/pulse conforme tone) com status
  - Meta: "PREÇO" mono 10 uppercase + `R$ 90` mono 700 16; divisor vertical 1×28; "VENDIDOS · 312/600" + barra height 6 radius 99 maxWidth 280 com fill na cor + glow `0 0 8px {tone}80`
  - Botão editar 36×36 radius 10 ghost (ícone lápis)
  - Lotes: 1º lote · Pista R$70 600/600 "esgotado" (G done) · 2º lote · Pista R$90 312/600 "ativo" (G ativo) · Pista Premium R$180 89/400 "ativo" (V ativo) · Camarote VIP R$380 76/80 "restam 4" (PINK)
- **Add lote** (empty/add state): height 56 radius 18, `border: 1px dashed rgba(255,255,255,0.18)`, `background: rgba(255,255,255,0.02)`, "+ Adicionar lote · auto-virada por capacidade ou data" 13/600 `rgba(255,255,255,0.65)`
- **Card Sugestão Pulse AI** (accent ciano): radius 16 `background: linear-gradient(135deg, rgba(34,211,238,0.10), rgba(167,139,250,0.06))` border `rgba(34,211,238,0.25)`; ícone info 36×36 radius 10 `rgba(34,211,238,0.15)`; título "Sugestão Pulse AI" 13/600; copy 12 lh 1.4: 'Eventos similares da Audio Club venderam **+34%** com lote "Solo Mulheres" a R$ 60 nos 7 dias antes. *Criar?*' (Criar? em ciano 600)

### Barra de ações
- `background: linear-gradient(180deg, transparent, rgba(6,7,10,0.95) 30%)`
- "← Identidade" e "Salvar rascunho": ghost `padding: '12px 22px'` radius 14 `rgba(255,255,255,0.06)` border 0.14 13/600
- **"Próximo · Guest list →"**: `padding: '12px 28px'` radius 14, `linear-gradient(180deg, #4DFFA8, #00FF85)`, `#003C1F` 700 14, `boxShadow: '0 8px 24px rgba(0,255,133,0.35), inset 0 1px 0 rgba(255,255,255,0.4)'`

---

## 6. KDSScreen — Kitchen Display System (role: cozinha)

### Layout
1. **Top bar** (glass `rgba(11,13,18,0.5)` blur): pill "🔥 COZINHA · ATIVA" (bg `rgba(255,184,0,0.12)` border `rgba(255,184,0,0.28)` texto AMBER mono 11/600) + "Festival do Sol · 5 pedidos em fila"; direita: "Tempo médio: `4m 12s`" (valor verde mono) + relógio 18/700
2. **Filter pills**: `Todos · 5` (sel, `rgba(255,255,255,0.08)`) · `Novos · 1` (verde) · `Preparando · 2` (âmbar) · `Prontos · 1` (violeta) · `Entregues · 1` (cinza) — pill `padding: '8px 14px'` radius 999 12/600, bg `{cor}0.08` border `{cor}0.25` texto na cor
3. **Grid de tickets 5 col** (gap 14)

### Card de pedido (semáforo por estado)
- radius 16, `border: 1.5px solid {tone}60`, `boxShadow: 0 0 30px {tone}20, inset 0 1px 0 rgba(255,255,255,0.08)`
- Estados: **new** → verde (`rgba(0,255,133,0.08)`); **cooking** → âmbar (`rgba(255,184,0,0.06)`); **ready** → violeta (`rgba(167,139,250,0.10)`); **delivered** → cinza (`rgba(255,255,255,0.025)`, border 0.06, sem glow, `opacity: 0.45`)
- **Top stripe** height 4 na cor com `boxShadow: 0 0 8px {cor}80` (delivered = `#444` sem glow)
- Header: id `#4720` mono 11; nome display 700 16; timer mono 700 16 na cor do estado + "EM FILA" mono 9 uppercase
- Origem mono 10: "Mesa 04 · Premium" / "PDV 01 · Bar Central" / "Pedido pelo app" / "Food Truck Norte"
- **Item**: bloco `padding: '8px 10px'` radius 10 `background: rgba(0,0,0,0.3)`; qty `1×` mono 700 16 **verde**; nome 13/600; modificadores `· + bacon` mono 11 **âmbar** paddingLeft 22 (ex.: "+ bacon", "sem cebola", "+ catupiry", "point ao ponto")
- **Botão de ação por estado** (height 40 radius 10 700 13):
  - new → verde sólido "Iniciar preparo" (`#003C1F`)
  - cooking → violeta sólido "Marcar pronto ★" (`#1A0040`)
  - ready → **branco sólido** "Entregar →" (`#06070A`)
  - delivered → placeholder `rgba(255,255,255,0.04)` mono 12 "✓ entregue 04:55"

---

## 7. CashierClosingScreen — Fechamento de Caixa (role: operador/gerente)

### Layout
1. Bg: `radial-gradient(40% 30% at 80% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(34,211,238,0.08), transparent 60%), #06070A`
2. **Main (flex 1)**: header → 4 cards de totais → grid `1.4fr 1fr` (top produtos + conferência)
3. **Painel direito 320px**: preview do Cupom Z + ações

### Header
- Eyebrow verde "Fechamento · em 15 min"; título display 700 32 "Caixa *03 · Bar Central*" (serif itálico verde); sub "Marcos Silva · turno aberto às 20h00" 13
- Botões ghost: "🖨️ Imprimir Z" e "📊 Excel" (`padding: '10px 16px'` radius 12)

### Totais (grid 4, padrão KPI com top stripe height 2 opacity 0.7)
- Total operado `R$ 14.872` "328 transações" (G) · Cashless `R$ 11.940` "80,3% do total" (C) · Pix balcão `R$ 2.180` "14,7%" (V) · Cartão maquininha `R$ 752` "5,0%" (PINK); valor mono 700 26

### Top produtos do turno (glass card)
- Título display 600 18 + hint "Estoque atual" mono 11
- Linha ranking: número `01` mono 13 `rgba(255,255,255,0.45)`; nome 13/600; barra height 5 radius 99 fill na cor + glow; `{sold}/{of}` mono 10 (aceita `∞`); receita `R$ 4.464` mono 700 14 à direita (toLocaleString pt-BR)

### Conferência (glass card)
- Título display 600 18 "Conferência" + sub "Sistema vs. conferido fisicamente"
- Linha: radius 12; ok → `rgba(0,255,133,0.06)` border `rgba(0,255,133,0.2)` + check verde + valor mono 700 verde; pendente → `rgba(255,255,255,0.04)`
- Itens: Dinheiro físico R$ 0,00 "sem dinheiro (cashless)" · Cartão (adquirência) 752 · Pix balcão 2.180 · Estorno aprovado 38 "2 estornos no turno"
- **Card Diferença** (estado sucesso): `background: linear-gradient(135deg, rgba(0,255,133,0.16), rgba(34,211,238,0.10))` border `rgba(0,255,133,0.3)`; "Diferença" 13/700 + `R$ 0,00` mono 700 18 verde; sub com dot verde glow: "Caixa bate · pronto pra fechar"

### Preview Cupom Z (painel direito)
- **Papel claro em tela dark**: `padding: 18` radius 14, `background: #F5F3EE`, `color: #06070A`, mono 11 lh 1.6, `boxShadow: 0 8px 24px rgba(0,0,0,0.4)`
- Conteúdo: "PULSEPASS · CUPOM Z" 700 12 centrado; "CNPJ 14.512.528/0001-54"; separadores `1px dashed rgba(0,0,0,0.2)`; blocos Evento/PDV/Operador/Abertura/Fechamento; valores Cashless 11.940,00 / Pix 2.180,00 / Cartão 752,00 / Estornos −38,00 / TOTAL 14.834,00 (borda sólida `rgba(0,0,0,0.3)` + 700); rodapé 9 centrado "328 transações · 6 produtos / SAT 19385 · NSU 4720"
- CTAs: **"Confirmar fechamento ✓"** height 52 radius 14 gradiente verde padrão (shadow 0.35); "Reportar divergência" ghost height 44 radius 12

---

## 8. ReservationsScreen — Reservas / Mesas (role: hostess/gerente, casa noturna)

### Layout
1. **Esquerda**: header (eyebrow ÂMBAR "Mesas · ao vivo" + "Audio Club · planta baixa" display 700 28) + 3 contadores + **planta baixa** (mapa)
2. **Direita 340px**: mesa selecionada → próximas reservas → CTA "Nova reserva"

### Contadores de status
- Chips: `padding: '8px 14px'` radius 12, `background: {c}10` `border: 1px solid {c}30`; Livres 2 (G) · Ocupadas 5 (AMBER) · Reservadas 2 (V); valor mono 700 18 na cor

### Planta baixa
- Container: radius 18 `rgba(255,255,255,0.02)` border 0.06; grid pattern SVG 40×40 stroke branco 0.5 opacity 0.04
- **Stage**: barra radius 8 `linear-gradient(180deg, rgba(167,139,250,0.18), rgba(167,139,250,0.05))` border `rgba(167,139,250,0.3)`; "STAGE · ANYMA 22h" mono 11 ls 0.2em violeta
- **Mesa** (posicionamento absoluto x/y/w/h): radius 12, `border: 1.5px solid {statusColor}`, bg por status — free `rgba(0,255,133,0.10)`/G, occupied `rgba(255,184,0,0.15)`/AMBER (+ `boxShadow: 0 0 20px {c}30`), reserved `rgba(167,139,250,0.15)`/V
- Conteúdo: id `M02` mono 700 12 na cor do status; VIP = `★`; ocupada: nome 10/600 + consumo `R$ 287` mono 9 verde + tempo mono 8; reservada: `→ 23h`; livre: "livre · 4p" 10
- Labels de zona: "BAR" (pill verde 9 mono ls 0.15em) e "SAÍDA" (pill neutra)

### Painel direito
- **Mesa selecionada**: `pp-label`; "M08 · Aniversário Bia" display 700 22; "12 pessoas · setor central"; `PBadge tone="amber" dot` "ocupada · 2h47"
- 3 mini-KPIs (radius 12 `rgba(255,255,255,0.04)`): Consumo R$ 2.180 (G) · Por pessoa R$ 182 (V) · Itens 38 (C) — valor mono 700 14
- **Próximas reservas · esta noite**: card radius 12; próximo (st next) destacado violeta (`rgba(167,139,250,0.10)` border `#A78BFA50`); time-box 48px radius 8 `rgba(0,0,0,0.3)` com hora mono 700 13 violeta + countdown mono 8 ("15min", "1h13min"); nome 13/600 (+★ âmbar p/ VIP); sub "M03 · 4 pessoas"
- CTA "+ Nova reserva": height 48 radius 14 gradiente verde, `boxShadow: 0 4px 16px rgba(0,255,133,0.35)`

---

## 9. SalesReportScreen — Relatório de Vendas / Preview Excel 9 abas (role: produtor, pós-evento)

### Layout
1. **Sidebar 280px** (glass): eyebrow CIANO "Relatório completo" + "Festival do Sol" + "30 nov · pós-evento" mono → label "9 ABAS EXCEL" → 9 itens de nav → card Pulse Premium
2. **Main**: título → 5 KPIs → **preview estilo planilha** → hint de rodapé

### Sidebar
- Item de aba: radius 10; selecionado **ciano**: `rgba(34,211,238,0.10)` border `rgba(34,211,238,0.25)` texto CA
- Abas: Resumo executivo ◐ · Vendas por lote ▤ · Cashless por produto ◈ · Cashless por PDV ⊞ · Cashless por hora ⌛ · Guest list & check-in ☷ · Comissões promoter ◇ · Conciliação financeira $ · CRM cross-evento ◉
- **Card Pulse Premium**: radius 14 `linear-gradient(135deg, rgba(34,211,238,0.18), rgba(0,255,133,0.10))` border `rgba(34,211,238,0.3)`; copy "Excel formatado · gráficos · data bars · color scales"; **CTA ciano sólido** "⬇ Baixar .xlsx" height 38 radius 10 bg `#22D3EE` texto `#06070A` 700 12

### Main
- Eyebrow ciano "01 · Resumo executivo"; título display 700 28 "Festival do Sol fechou em *R$ 312k.*" (serif itálico **verde**)
- Botões ghost "📧 Enviar" e "📄 PDF"
- 5 KPIs (grid 5, gap 10, padding 14 radius 14, label mono **9**): Faturamento total R$ 312k "+R$ 184k vs último" (G) · Margem líquida R$ 264k "84,6%" (V) · Público pagante 2.184 "85,7% check-in" (C) · Ticket médio R$ 142,87 "ingresso + cashless" (PINK) · NPS pós-evento 72 "👍 4.8★ (212 reviews)" (AMBER)

### Preview Excel
- Shell: radius 14, `background: #0E1116`, border 0.08
- Toolbar: bg `#11151D`, filename "FestivalDoSol_30nov.xlsx" mono 12; 3 dots 12×12 (PINK/AMBER/G — traffic lights invertidos)
- Tabs de sheet: `['Resumo','Vendas','Cashless','PDVs','Por hora','Guests','Promoters','Conciliação','CRM']` — radius `8px 8px 0 0`, ativa: bg `#0E1116` + `borderTop: 2px solid #22D3EE` + branco
- Grid: colunas `40px 200px 110px 110px 110px 110px 110px 1fr`; header de letras A–G (bg `#0A0D12` mono 10); header real bg `#12161E` 11/700: Item, Valor, Qtd, Médio, % total, YoY, Visual; números de linha mono 10
- Linhas zebradas `rgba(255,255,255,0.015)`; valores mono alinhados à direita; YoY positivo em **verde**
- **Data bar** (coluna Visual): track height 14 radius 3 `rgba(255,255,255,0.04)`; fill `linear-gradient(90deg, {tone}80, {tone}40)` largura `bar*3.5%`; cinza p/ cortesias
- **Linha TOTAL**: `background: rgba(0,255,133,0.06)`, `borderTop: 2px solid #00FF85`, divisórias `rgba(0,255,133,0.2)`, "TOTAL FATURAMENTO" 700 + `R$ 312.500` / `R$ 142,87` / `100%` / `+18%` mono 700 verdes
- Hint rodapé mono 11: "Geração automática via ExcelJS (ciano) · 9 abas formatadas com gráficos embutidos"

---

## 10. PromoterManagerScreen — Gestão de Promoters + Leaderboard (role: produtor)

### Layout
1. **Header**: eyebrow VIOLETA "Time de promoters"; "Ranking · *Festival do Sol*" display 700 24 (serif itálico violeta); chip "Pago 12% · meta 247+"; CTA violeta "+ Convidar promoter" (`linear-gradient(180deg, #C4B5FD, #A78BFA)`, `#1A0040`, shadow `0 4px 16px rgba(167,139,250,0.35)`)
2. **Coluna esquerda 320px**: card comissão total → donut de tiers → regras de tier
3. **Direita**: toolbar (busca + ordenação) → pódio top 3 → tabela completa

### Coluna esquerda
- **Comissão total a pagar** (hero): radius 18 `linear-gradient(135deg, rgba(167,139,250,0.20), rgba(255,61,136,0.10))` border `rgba(167,139,250,0.30)` inset highlight 0.12; valor mono 700 **32** `R$ 10.450`; "8 promoters · 1.095 inscritos"; botão glass interno "Pagar via Pix em lote →" height 38 radius 10 `rgba(11,13,18,0.5)` blur(12px)
- **Donut "Distribuição por tier"**: SVG 100×100, circle r40 strokeWidth 14; track `rgba(255,255,255,0.06)`; segmentos via strokeDasharray/offset (V 125, PINK 80, C 46 de 251), rotate -90; número central "8" mono 16/700; legenda quadradinho 8×8 radius 2 — Tier 3 · gold 2 (V) / Tier 2 · silver 3 (PINK) / Tier 1 · bronze 3 (C)
- **Como sobe de tier**: dot 6×6 + nome 600 + regra mono 10 — "Tier 1 · bronze 0-49 check-ins" / "Tier 2 · silver 50-149 + comissão 10%" / "Tier 3 · gold 150+ check-ins · comissão 12%"

### Pódio top 3 (ordem visual 2º-1º-3º)
- Cards radius 18; **1º lugar (centro)**: `background: linear-gradient(135deg, rgba(255,184,0,0.18), rgba(167,139,250,0.10))`, `border: 1.5px solid #FFB80050`, `boxShadow: '0 12px 32px rgba(255,184,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)'`; labels "🥇 1º / 🥈 2º / 🥉 3º" mono 11 ls 0.1em (1º em âmbar)
- Avatar 56×56 round `linear-gradient(135deg, {c}, {c}99)`; 1º com `border: 3px solid #FFB800` + `boxShadow: 0 0 24px #FFB80050`
- Stats: check-in (mono 700 13 branco) | divisor 1px | comissão `R$ 2.8k` (mono 700 verde)

### Tabela ranking
- Grid `40px 1.5fr 90px 90px 100px 100px 80px`; headers mono 10 uppercase: `#, Promoter, Inscritos, Check, Receita, Comissão, Δ`
- Rank ≤3 em **âmbar** mono 700; avatar 30×30 round `{c}30` border `{c}60`; nome 13/600 + "Tier n" mono 10; comissão mono 700 **verde**; delta: positivo verde / negativo `#FF7A75`
- 8 promoters: Lia Coelho T3 247/189 R$22.3k R$2.834 +12% … Tomás Vieira T1 42/28 R$3.1k R$312 −14%

---

# PADRÕES GLOBAIS

## Superfícies
- **Fundo de tela**: sempre `#06070A` + 1–2 radial-gradients "aurora" a 6–15% de opacity nas cores de accent da tela (formato: `radial-gradient(40-50% 30-60% at X% Y%, rgba(cor,0.06–0.15), transparent 60–70%)`)
- **Glass card padrão**: `background: rgba(255,255,255,0.03)` · `border: 1px solid rgba(255,255,255,0.08)` · `backdropFilter: blur(20px)` · `boxShadow: inset 0 1px 0 rgba(255,255,255,0.06)` · radius 14–18
- **Painéis laterais/barras** (sidebar, rails, top bars): `background: rgba(11,13,18,0.35–0.5)` + `backdropFilter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.06)` no lado adjacente
- **Card hero/destaque**: gradiente diagonal de 2 accents a baixa opacity, ex. `linear-gradient(135deg, rgba(accent1,0.18–0.20), rgba(accent2,0.10))` + border `rgba(accent1,0.25–0.30)` + `inset 0 1px 0 rgba(255,255,255,0.12–0.14)`

## Border-radius (escala)
999 (pills) · 6–10 (badges, ícones pequenos, botões de linha) · 12 (chips, inputs, itens de nav) · 14 (cards menores, botões grandes, inputs 48px) · 16 (cards de produto/ticket) · 18 (cards principais) · 22–24 (avatares grandes, scanner, molduras)

## Tipografia
- Display (`--pp-font-display`): títulos 700, tamanhos 16/18/20/22/24/28/32, `letterSpacing: -0.02em` a `-0.025em`
- **Serif itálico verde/violeta** (`--pp-font-serif`, fontStyle italic, weight 400) para a palavra de ênfase dentro de títulos display — assinatura da marca
- Mono (`--pp-font-mono`) para: TODOS os números/valores/moeda, timestamps, IDs, labels eyebrow. Eyebrow/label: 9–11px, `letterSpacing: 0.06em–0.12em`, `textTransform: uppercase`, cor `rgba(255,255,255,0.4–0.55)` ou accent
- Body: 12–14px, weight 500–600; texto secundário `rgba(255,255,255,0.5–0.7)`

## Hierarquia de opacidade de branco (texto)
1.0 primário · 0.85 forte · 0.7–0.75 secundário · 0.5–0.6 terciário · 0.4–0.45 hint/timestamps

## Botões
- **CTA primário verde**: `background: linear-gradient(180deg, #4DFFA8 0%, #00FF85 100%)` · texto `#003C1F` 700 · `boxShadow: 0 8px 24px rgba(0,255,133,0.35–0.4), inset 0 1px 0 rgba(255,255,255,0.4)` · height 48–56 · radius 14–16
- **CTA violeta** (fluxo guest list/promoter): `linear-gradient(180deg, #C4B5FD, #A78BFA)` · texto `#1A0040` 700 · shadow `0 4px 16px rgba(167,139,250,0.35–0.4)`
- **CTA ciano** (relatórios): sólido `#22D3EE` texto `#06070A`
- **Ghost/secundário**: `rgba(255,255,255,0.05–0.08)` · `border: 1px solid rgba(255,255,255,0.10–0.14)` · texto branco 600 12–13
- Botões sólidos de estado (KDS): verde/violeta/branco conforme fase

## Pills de status "live"
`borderRadius: 999` · `background: rgba(accent,0.08–0.12)` · `border: 1px solid rgba(accent,0.2–0.28)` · dot 6×6 round na cor com `boxShadow: 0 0 8px rgba(accent,0.8)` · texto mono 11/600 uppercase ls 0.05em

## Barras de progresso
height 5–6 · radius 99 · track `rgba(255,255,255,0.06)` · fill na cor do contexto com glow `boxShadow: 0 0 6–8px {cor}80`

## Convenção de alpha em hex (sufixos usados no código)
`{cor}10` ≈ 6% · `{cor}20`/`25` ≈ 12–15% · `{cor}30` ≈ 19% · `{cor}40`/`50` ≈ 25–31% (borders) · `{cor}60` (borders fortes) · `{cor}80` ≈ 50% (glows)

## Avatares
Inicial única; quadrado radius 8–14 ou círculo; `background: {cor}20–30` + `border: 1px solid {cor}50–60` (pequenos) ou `linear-gradient(135deg, corA, corB)` (destaque). Tamanhos: 24/28/30 (linhas), 44 (cliente), 56 (hero/pódio), 72 (check-in aprovado, com glow `0 0 30px rgba(0,255,133,0.4)`)

## Tabelas
Container radius 12–14 + border `rgba(255,255,255,0.06)`; header bg `rgba(255,255,255,0.03)` com colunas mono 10 uppercase ls 0.08em `rgba(255,255,255,0.5)`; zebra `rgba(255,255,255,0.015)` nas linhas ímpares; divisores `rgba(255,255,255,0.04)`; nome 13/600 + sub mono 10; números sempre mono; dados sensíveis mascarados (`348.***.***-22`, `+55 11 9 8412-•••`)

## Semântica de cor por estado
- Verde `#00FF85`: sucesso, aprovado, live, dinheiro/receita, deltas positivos, CTA principal
- Âmbar `#FFB800`: warning, ocupado, preparando, estoque baixo, aniversariante, 1º lugar/gold
- Violeta `#A78BFA`: premium, promoter, pronto (KDS), reservado
- Ciano `#22D3EE`: check-in/velocidade, relatórios, sugestões de IA
- Pink `#FF3D88`: VIP, fraude/rejeição, comissão
- Vermelho suave `rgba(255,59,48,…)` / `#FF7A75`: erro, no-show, delta negativo

## Estados representados nos mockups
- Live/operando (pill + dot glow pulsante)
- Toggle on/off (track 28–32×16–18, knob branco; on = track verde)
- Estoque: número, `∞`, badge "Baixo" âmbar
- Check-in: ok (verde) / warn "!" (âmbar) / fail "×" (pink+vermelho)
- Wizard step: done (círculo verde + check) / ativo (outline verde + glow) / futuro (cinza)
- KDS: new / cooking / ready / delivered (delivered com opacity 0.45)
- Lote: esgotado (opacity 0.6 + badge "finalizado") / ativo (bg+border tintados) / "restam 4"
- Empty-add: dashed border `rgba(255,255,255,0.18)` + bg `rgba(255,255,255,0.02)`
- Conferência ok: bg/border verdes + check
- Papel impresso (Cupom Z): `#F5F3EE` com texto `#06070A` e dashed dividers — único elemento claro do sistema
