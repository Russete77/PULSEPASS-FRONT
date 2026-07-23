# PulsePass — Spec de Design: Telas iPhone (mockups do design system)

Fonte: `design-system/src/iPhoneScreens1.jsx` … `iPhoneScreens6.jsx`
Dependências compartilhadas: `design-system/src/Components.jsx` (PBadge), `design-system/styles/tokens.css`, `design-system/styles/canvas.css`

Viewport de todas as telas: **390 × 844** (iPhone), `overflow: hidden`, `color: #fff`, `fontFamily: var(--pp-font-body)`.

---

## 0. TOKENS E COMPONENTES COMPARTILHADOS

### 0.1 Paleta (constantes literais nos arquivos)

| Token | Hex | Uso |
|---|---|---|
| G (pulse/verde) | `#00FF85` | cor primária, CTAs, estados ativos, dinheiro positivo |
| V (violet) | `#A78BFA` | promoter, premium, secundária |
| C (cyan) | `#22D3EE` | cashless, informação |
| PINK | `#FF3D88` | live/urgência, VIP |
| AMBER | `#FFB800` | avisos, tier Gold, loyalty |
| BG base | `#06070A` | fundo do app |
| BG flyer | `#0a0a0c` | fundo de artes/flyers |
| Glass escuro | `rgba(11,13,18, 0.55–0.9)` | superfícies glass |
| Texto sobre verde | `#003C1F` | texto de CTAs verdes |
| Texto sobre violeta | `#1A0040` | texto de CTAs violeta |
| Verde claro (top do gradiente CTA) | `#4DFFA8` | — |
| Violeta claro (top do gradiente CTA violeta) | `#C4B5FD` | — |
| Amber claro (texto) | `#FFD15C` | badges amber |
| Vermelho claro (texto) | `#FF7A75` | badge "Esgotado" (base `rgba(255,59,48,…)`) |

### 0.2 Fontes (tokens.css)

```css
--pp-font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
--pp-font-body:    'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
--pp-font-mono:    'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
--pp-font-serif:   'Newsreader', Georgia, 'Times New Roman', serif;
```

- **Display** (Space Grotesk 700): títulos. letterSpacing sempre negativo: `-0.01em` a `-0.04em` (quanto maior o tamanho, mais negativo). lineHeight 0.95–1.15.
- **Serif itálico** (Newsreader italic 400): palavra de destaque dentro do título, quase sempre em verde `#00FF85` — assinatura visual da marca.
- **Mono** (JetBrains Mono): eyebrows/labels uppercase, preços, códigos, timestamps, KPIs.
- **Body** (Inter): texto corrido, nomes, subtítulos.

### 0.3 Classes utilitárias usadas nas telas

```css
/* canvas.css */
.pp-eyebrow { font-family: var(--pp-font-mono); font-size: 11px; letter-spacing: 0.18em;
              text-transform: uppercase; color: var(--pp-pulse); font-weight: 500; }
.pp-label   { font: 600 12px/1 var(--pp-font-body); letter-spacing: 0.04em;
              text-transform: uppercase; color: var(--pp-fg-3); margin: 0; }

/* tokens.css */
.pp-pulse-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%;
                background: var(--pp-pulse); box-shadow: 0 0 0 0 rgba(0,255,133,0.7);
                animation: pp-pulse-ring 1.6s var(--pp-ease) infinite; }
@keyframes pp-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(0,255,133,0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(0,255,133,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,255,133,0); }
}
```

### 0.4 `Aurora` — fundo padrão (iPhoneScreens1.jsx)

Wrapper absoluto `inset: 0`, `background: #06070A`, `overflow: hidden`, com camada interna `inset: -15%`:

```
background:
  radial-gradient(45% 30% at 18% 12%, rgba(0,255,133,{0.35*intensity}), transparent 65%),
  radial-gradient(40% 30% at 82% 8%,  rgba(167,139,250,{0.32*intensity}), transparent 65%),
  radial-gradient(50% 40% at 60% 90%, rgba(34,211,238,{0.22*intensity}), transparent 65%),
  radial-gradient(30% 30% at 8% 75%,  rgba(255,61,136,{0.18*intensity}), transparent 65%);
filter: blur(40px) saturate(160%);
```

Intensidades usadas por tela: Home 1 (default) · Onboarding 1.2 · Wallet/Recharge/Loyalty 0.7 · Checkout 0.6 · Ticket/OrderAhead/Promoter/Profile/Withdraw/TransferTicket/Catalog 0.5 · Search/Notifications/MyTickets 0.4.

### 0.5 `StatusBar` — status bar iOS

Altura 44, `padding: 0 24px`, flex space-between, `color: #fff`, fontSize 15, `fontFamily: '-apple-system, "SF Pro", system-ui'`, fontWeight 600, letterSpacing `-0.01em`, zIndex 10. Esquerda: `9:41`. Direita: SVGs de sinal (4 barras) e bateria.

### 0.6 `TabBar` — tab bar flutuante liquid-glass

```
position: absolute; bottom: 14px; left: 14px; right: 14px; height: 70px;
border-radius: 30px;
background: rgba(20,22,30,0.55);
backdrop-filter: blur(40px) saturate(180%);
border: 1px solid rgba(255,255,255,0.10);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 32px rgba(0,0,0,0.5);
padding: 0 10px; z-index: 20;
```

4 abas (ícones stroke 22×22, strokeWidth 2): `Pulse` (waveform), `Ingressos` (ticket), `Carteira` (wallet), `Você` (user). Item: coluna, gap 3, fontSize 10; ativo → cor `#00FF85`, fontWeight 600, pastilha do ícone 44×32 radius 14 com `background: rgba(0,255,133,0.14)` e `boxShadow: inset 0 0 0 1px rgba(0,255,133,0.3)`; inativo → `rgba(255,255,255,0.55)`, fontWeight 500. Home indicator: 134×5, radius 99, `#fff`, `bottom: -10`, centralizado.

### 0.7 `Flyer` — placeholder de arte de evento

`borderRadius: 18`, `border: 1px solid rgba(255,255,255,0.08)`, `isolation: isolate`. 4 layouts de gradiente:

```
a: radial-gradient(80% 80% at 20% 20%, {hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, {hue2}, transparent 60%), #0a0a0c
b: linear-gradient(135deg, {hue} 0%, {hue2} 100%)
c: radial-gradient(circle at 50% 100%, {hue}, transparent 70%), linear-gradient(180deg, #0a0a0c, {hue2}40)
d: radial-gradient(120% 60% at 50% 0%, {hue}, transparent 60%), #0a0a0c
```

Overlay de leitura: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))`. Tag (top 10, left 10): `padding: 4px 8px`, radius 6, `background: rgba(0,0,0,0.5)`, `backdropFilter: blur(8px)`, fontSize 10, mono, `letterSpacing: 0.1em`, uppercase. Título (bottom 12, left/right 12): display 700, fontSize 18, lineHeight 1.05, letterSpacing `-0.02em`, `textShadow: 0 2px 12px rgba(0,0,0,0.6)`.

### 0.8 `PBadge` (Components.jsx) — badge padrão

```
display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px;
border-radius: 999px; font-size: 11px; font-family: var(--pp-font-mono);
font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;
border: 1px solid {edge};
```

| tone | bg | fg | edge |
|---|---|---|---|
| pulse | rgba(0,255,133,0.14) | #4DFFA8 | rgba(0,255,133,0.22) |
| violet | rgba(167,139,250,0.16) | #C4B5FD | rgba(167,139,250,0.28) |
| cyan | rgba(34,211,238,0.14) | #67E8F9 | rgba(34,211,238,0.24) |
| pink | rgba(255,61,136,0.14) | #FF77AA | rgba(255,61,136,0.24) |
| amber | rgba(255,184,0,0.14) | #FFD15C | rgba(255,184,0,0.24) |
| red | rgba(255,59,48,0.14) | #FF7A75 | rgba(255,59,48,0.24) |
| neutral | rgba(255,255,255,0.08) | rgba(255,255,255,0.85) | rgba(255,255,255,0.14) |

Prop `dot` adiciona `.pp-pulse-dot` 6×6 na cor do texto.

---

## TELA 1 — HOME (Descoberta) · `HomeScreen` · iPhoneScreens1.jsx

**Fluxo:** descoberta de eventos. Tab ativa: `home`.

**Layout (topo→baixo):** Aurora(1) → StatusBar → Header saudação + avatar → Busca pill → Chips de categoria → Card destaque (featured) → Seção "Hoje" com grid 2×Flyer → spacer 110 → TabBar.

**Header** (`padding: 8px 20px 0`, flex space-between):
- Data: fontSize 12, `rgba(255,255,255,0.55)`, mono, letterSpacing `0.08em`, uppercase — "Sex · 22 nov"
- Saudação: display 700, fontSize 26, letterSpacing `-0.02em`, marginTop 2 — "Boa noite, *Erick*" (nome em serif itálico 400 verde `#00FF85`)
- Avatar: 42×42 círculo, `background: linear-gradient(135deg, #A78BFA, #FF3D88)`, `border: 2px solid rgba(255,255,255,0.16)`, inicial 700/14.

**Busca** (`padding: 16px 20px 0`): pill h 50, `borderRadius: 999`, `background: rgba(255,255,255,0.06)`, `backdropFilter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.10)`, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.08)`, `padding: 0 18px`, gap 10. Ícone lupa 18 stroke `rgba(255,255,255,0.5)`. Placeholder: "Buscar evento, artista, casa…" fontSize 14 `rgba(255,255,255,0.5)`. Atalho `⌘K` à direita: `padding: 3px 6px`, `border: 1px solid rgba(255,255,255,0.15)`, radius 6, mono 11, `rgba(255,255,255,0.4)`.

**Chips de categoria** (`padding: 16px 20px 0`, gap 8): "Tudo, Hoje, Final de semana, Eletrônica, Sertanejo, Funk". Chip: `padding: 8px 14px`, radius 999, fontSize 12, fontWeight 600. Ativo (1º): `background: #00FF85`, `color: #003C1F`, sem borda. Inativo: `background: rgba(255,255,255,0.06)`, `color: rgba(255,255,255,0.85)`, `border: 1px solid rgba(255,255,255,0.1)`.

**Featured card** (`padding: 20px 20px 0`): container `borderRadius: 24`, `border: 1px solid rgba(255,255,255,0.10)`, `boxShadow: 0 20px 40px rgba(0,0,0,0.5)`, `isolation: isolate`.
- Hero h 260: `radial-gradient(80% 80% at 30% 20%, #00FF85, transparent 60%), radial-gradient(80% 80% at 80% 90%, #A78BFA, transparent 60%), #0a0a0c` + overlay `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85))`.
- Badge live (top/left 16): pill `padding: 6px 12px`, radius 999, `background: rgba(0,0,0,0.6)`, `backdropFilter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.16)`; dot 6×6 `#FF3D88` com `animation: pp-pulse-ring 1.6s infinite`; texto mono 10, letterSpacing `0.1em`, uppercase — **"Esgotando · 87% vendido"**.
- Info inferior (bottom/left/right 16): eyebrow mono 10, letterSpacing `0.12em`, uppercase, verde — **"SÁB · 30 NOV · 22H"**; título display 700, 28, lineHeight 1.05, letterSpacing `-0.025em` — "Festival do Sol" + serif itálico verde "edição equinócio".
- Footer bar: `padding: 14`, `background: rgba(11,13,18,0.6)`, `backdropFilter: blur(20px)`, `borderTop: 1px solid rgba(255,255,255,0.06)`. Esquerda: "Audio Club · Vila Olímpia" 13 `rgba(255,255,255,0.75)`; "desde R$ 90 · 4× sem juros" 11 mono `rgba(255,255,255,0.45)`. Direita: botão **"Comprar →"** h 40, `padding: 0 18px`, radius 999, `background: linear-gradient(180deg, #4DFFA8 0%, #00FF85 100%)`, `color: #003C1F`, 700/13, `boxShadow: 0 4px 16px rgba(0,255,133,0.4)`.

**Seção "Hoje"** (`padding: 24px 20px 0`): header eyebrow verde mono 10 letterSpacing `0.12em` uppercase "Hoje" + título display 700/22 letterSpacing `-0.02em` "Acontece agora" + link "Ver todos" 12 `rgba(255,255,255,0.55)`. Grid `1fr 1fr`, gap 12, marginTop 14: `Flyer(cyan/violet, "Boate Roxa", tag "22h", layout a)` e `Flyer(pink/#FFB800, "Sunset Bar", tag "19h · livre", layout b)`.

**Copy:** "Sex · 22 nov" / "Boa noite, Erick" / "Buscar evento, artista, casa…" / "Esgotando · 87% vendido" / "Festival do Sol — edição equinócio" / "Audio Club · Vila Olímpia" / "desde R$ 90 · 4× sem juros" / "Comprar →" / "Hoje — Acontece agora" / "Ver todos".

**Estados:** badge de escassez ("Esgotando · 87% vendido") com dot pulsante; chip de categoria ativo vs. inativo.

---

## TELA 2 — DETALHE DO EVENTO · `EventScreen` · iPhoneScreens1.jsx

**Fluxo:** evento → seleção de lote → checkout. Sem TabBar; CTA fixo no rodapé.

**Layout:** Hero absoluto (h 460) → StatusBar → nav circular (voltar / favoritar / compartilhar) → bloco de título sobre o hero (`padding: 180px 20px 0`) → card meta glass → Line-up chips → seletor de lote → spacer 120 → barra CTA fixa.

**Hero:** `radial-gradient(80% 80% at 30% 20%, #00FF85, transparent 60%), radial-gradient(80% 80% at 80% 90%, #A78BFA, transparent 60%), #0a0a0c` com fade `linear-gradient(180deg, transparent 50%, #06070A 95%)`.

**Botões de nav:** círculos 38×38, `background: rgba(0,0,0,0.4)`, `backdropFilter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.14)`. Ícones stroke #fff (chevron-left strokeWidth 2.5; coração e share strokeWidth 2).

**Título:** chips de tag (gap 8, wrap): `padding: 5px 10px`, radius 999, mono 10, letterSpacing `0.08em`, uppercase —
- "Eletrônica": `background: rgba(0,255,133,0.16)`, `border: 1px solid rgba(0,255,133,0.3)`, color `#00FF85`
- "+18": `rgba(167,139,250,0.16)` / `rgba(167,139,250,0.3)` / `#A78BFA`
- "Cashless": `rgba(34,211,238,0.16)` / `rgba(34,211,238,0.3)` / `#22D3EE`

Título: display 700, fontSize 34, lineHeight 1, letterSpacing `-0.03em`, marginTop 14 — "Festival do Sol" + linha serif itálica verde fontSize 28 "edição equinócio".

**Card meta** (`padding: 24px 20px 0`): `padding: 18`, `borderRadius: 20`, `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.10)`, `backdropFilter: blur(20px)`, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.08)`; grid `auto 1fr` gap 14 rowGap 12. Cada linha: quadrado de ícone 36×36 radius 10 (`background: rgba({cor},0.12)`, `border: 1px solid rgba({cor},0.2)`, ícone stroke na cor) + label mono 11 uppercase `rgba(255,255,255,0.5)` letterSpacing `0.08em` ("Quando"/"Onde") + valor 14/600 ("Sábado · 30 de novembro · 22h" / "Audio Club · Vila Olímpia, SP"). "Quando" usa verde; "Onde" usa violeta.

**Line-up** (`padding: 18px 20px 0`): `.pp-label` "Line-up"; chips `padding: 8px 12px`, radius 999, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.1)`, 12/500 — "Anyma, Vintage Culture, Tóqio (b2b), Marina Lima, KVSH".

**Seletor de lote** (`padding: 20px 20px 0`): `.pp-label` "Selecione o lote"; cards coluna gap 10, `padding: 16`, `borderRadius: 16`, flex space-between:
- **Não selecionado:** `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`.
- **Selecionado:** `background: rgba(0,255,133,0.06)`, `border: 1.5px solid rgba(0,255,133,0.5)`, `boxShadow: 0 0 24px rgba(0,255,133,0.2)`; preço em verde.
- **Esgotado:** `opacity: 0.5`.
- Conteúdo: nome 14/600; sub 12 `rgba(255,255,255,0.55)`; tag pill `padding: 3px 8px` radius 999 mono 10 letterSpacing `0.06em` uppercase (amber: bg `rgba(255,184,0,0.14)` fg `#FFD15C`; violet: `rgba(167,139,250,0.16)`/`#A78BFA`; red: `rgba(255,59,48,0.14)`/`#FF7A75`); preço mono 700/18.
- Dados: "Pista · 2º lote" R$ 90,00 "+ R$ 9 taxa" tag "12 restantes" (amber) / "Pista Premium" R$ 180,00 "área elevada + open bar 1h" tag "Premium" (violet), selecionado / "Camarote VIP" R$ 380,00 "mesa para 4 + welcome drink" tag "Esgotado" (red), disabled.

**Barra CTA fixa** (absolute bottom, `padding: 14px 20px 30px`, `background: linear-gradient(180deg, transparent, rgba(6,7,10,0.95) 30%)`):
- Esquerda: label mono 10 uppercase letterSpacing `0.08em` `rgba(255,255,255,0.55)` "1 ingresso · subtotal"; valor mono 700/22 "R$ **180,00**" (número em verde).
- Botão **"Continuar"** + seta: `flex: 1, maxWidth 220`, h 54, radius 999, `background: linear-gradient(180deg, #4DFFA8 0%, #00FF85 100%)`, `color: #003C1F`, 700/15, `boxShadow: 0 8px 28px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`.

**Estados:** lote selecionado (borda verde 1.5px + glow), esgotado (opacity 0.5), tags de escassez/premium.

---

## TELA 3 — CHECKOUT PIX · `CheckoutPixScreen` · iPhoneScreens2.jsx

**Fluxo:** checkout, passo 3 de 3 (aguardando pagamento). Sem TabBar.

**Layout:** Aurora(0.6) → StatusBar → nav (voltar / "Pagamento · 3 de 3" / badge SEGURO) → stepper → título → countdown → QR branco → código copia-e-cola → resumo do pedido → helper.

**Nav:** botão voltar círculo 38 padrão glass (`rgba(255,255,255,0.06)` + blur 20 + borda 0.10). Centro: "Pagamento · 3 de 3" 13/600. Direita: badge "SEGURO" mono 11 verde, `padding: 4px 8px`, radius 8, `background: rgba(0,255,133,0.12)`, `border: 1px solid rgba(0,255,133,0.25)`.

**Stepper** (`padding: 12px 20px 20px`, flex gap 6): 3 barras `flex:1`, h 4, radius 99; completas: `background: #00FF85` + `boxShadow: 0 0 12px rgba(0,255,133,0.5)`; incompletas: `rgba(255,255,255,0.1)`.

**Título:** `.pp-eyebrow` verde "Aguardando pagamento"; display 700/30, lineHeight 1, letterSpacing `-0.025em` — "Pague com Pix" + serif itálico verde 26 "e seu ingresso é seu.".

**Countdown:** pill `padding: 8px 14px`, radius 999, `background: rgba(255,184,0,0.10)`, `border: 1px solid rgba(255,184,0,0.25)`; ícone relógio stroke `#FFD15C` 2.5; texto mono 13/600 `#FFD15C` — "04:38 restantes".

**QR code:** container centralizado `padding: 18`, `borderRadius: 28`, `background: #fff`, `boxShadow: 0 20px 60px rgba(0,255,133,0.2), 0 0 0 1px rgba(255,255,255,0.2)`. Grid 21×21 (220×220, gap 1), módulos `#06070A`, radius 1, finder patterns nos 3 cantos. Logo central: 50×50, radius 14, `background: #06070A`, `border: 3px solid #fff`, texto "pix" display 800/11 verde.

**Código PIX:** `padding: 12px 14px`, radius 14, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.10)`; string mono 12 `rgba(255,255,255,0.75)` truncada ("00020126580014BR.GOV.BCB.PIX0136pulsepass-87a3e4f2-9c1d-4b8a52040000…"); botão **"Copiar"**: `padding: 8px 12px`, radius 8, `background: #00FF85`, `color: #003C1F`, 700/12, com ícone copy.

**Resumo do pedido:** card `padding: 16`, radius 18, `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, blur 20. Thumb 48×48 radius 10 `radial-gradient(#00FF85, transparent), #A78BFA`; "Festival do Sol · 30 nov" 14/600; "1× Pista Premium" 12 `rgba(255,255,255,0.55)`; preço mono 700/16 verde "R$ 189,00".

**Helper:** centrado, 11, `rgba(255,255,255,0.45)` — "A confirmação chega aqui em **até 30 segundos**. Você pode fechar o app." (destaque #fff 600).

**Estados:** aguardando pagamento (countdown amber), stepper completo, campo com ação de copiar.

---

## TELA 4 — MEU INGRESSO (QR rotativo) · `TicketScreen` · iPhoneScreens2.jsx

**Fluxo:** ingresso. Tab ativa: `tickets`.

**Layout:** Aurora(0.5) → StatusBar → header ("Ingresso" + botão share) → tab pills segmentadas → **ticket card premium com borda cônica** → quick actions 3 colunas → TabBar.

**Header:** título display 700/26 letterSpacing `-0.02em` "Ingresso"; botão share círculo 38 glass padrão.

**Tab pills (segmented):** container `padding: 4`, radius 999, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.08)`, gap 4. Itens `flex:1`, `padding: 8px 12px`, radius 999, 12/600, centro. Ativo: `background: #00FF85`, `color: #003C1F`. Inativo: transparent, `rgba(255,255,255,0.65)`. Labels: "Próximos · 2", "Passados", "Carteira".

**Ticket card (assinatura do produto):**
- Moldura: `borderRadius: 26`, `padding: 2`, `background: conic-gradient(from 90deg, #00FF85, #22D3EE, #A78BFA, #FF3D88, #00FF85)`, `boxShadow: 0 30px 60px -20px rgba(0,255,133,0.4), 0 0 60px rgba(0,255,133,0.25)`. (Existe `@keyframes pp-rotate-border { to { transform: rotate(360deg) } }` no tokens.css para animar.)
- Interior: `background: rgba(11,13,18,0.9)`, `backdropFilter: blur(40px) saturate(180%)`, `borderRadius: 24`, `padding: 20`.
- Topo: eyebrow mono 10 verde uppercase letterSpacing `0.12em` "Sáb · 30 nov · 22h"; título display 700/22 lineHeight 1.05 "Festival do Sol"; local 12 `rgba(255,255,255,0.6)` "Audio Club · Vila Olímpia"; thumb 56×56 radius 14 `radial-gradient(#00FF85, transparent), #A78BFA` borda `rgba(255,255,255,0.1)`.
- **Perfuração de ticket:** linha `borderTop: 1.5px dashed rgba(255,255,255,0.15)` estendida com `margin: 16px -20px`, mais dois círculos 20×20 `background: #06070A` nas pontas (left/right −10, top −10) simulando recorte.
- QR: card branco `padding: 14`, radius 18; grid 19×19 (200×200, gap 1), módulos `#06070A`. Centro: 44×44 radius 12 `background: #00FF85`, `border: 3px solid #fff`, com o glyph waveform stroke `#003C1F` strokeWidth 3.
- **Pill token rotativo:** centralizada, `padding: 8px 14px`, radius 999, `background: rgba(0,255,133,0.08)`, `border: 1px solid rgba(0,255,133,0.2)`; dot 6×6 verde `boxShadow: 0 0 8px rgba(0,255,133,0.8)`; texto mono 11/600 verde — "Token rotativo · 4:38".
- Stub grid 2×2 (gap 12): label mono 10 uppercase letterSpacing `0.08em` `rgba(255,255,255,0.5)` + valor 14/600. Pares: Setor→"Pista Premium" / Código→"PSP-7H29" (mono) / Titular→"Erick Berberian" / Cashless→"R$ 50 carregado" (verde).

**Quick actions:** grid 3 colunas gap 10; card `padding: 14`, radius 16, `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, coluna centrada gap 8; ícone stroke na cor (verde/violeta/cyan) + label 12/600 — "Carregar", "Transferir", "Como chegar".

**Estados:** contagem regressiva do token; contador na tab ("Próximos · 2").

---

## TELA 5 — CARTEIRA CASHLESS · `WalletScreen` · iPhoneScreens2.jsx

**Fluxo:** carteira. Tab ativa: `wallet`.

**Layout:** Aurora(0.7) → StatusBar → header → hero card de saldo → chip de evento ativo → lista de transações → TabBar.

**Header:** overline mono 11 uppercase letterSpacing `0.1em` `rgba(255,255,255,0.55)` "Carteira PulsePass"; título display 700/24 "Cashless"; botão chat círculo 38 glass.

**Hero de saldo:**
```
border-radius: 24; padding: 22;
background: linear-gradient(135deg, rgba(0,255,133,0.18) 0%, rgba(34,211,238,0.12) 50%, rgba(167,139,250,0.18) 100%), rgba(11,13,18,0.7);
backdrop-filter: blur(30px) saturate(180%);
border: 1px solid rgba(255,255,255,0.14);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.4), 0 0 40px rgba(0,255,133,0.15);
```
Glyph decorativo: círculo 200×200 em top −40/right −40, `background: radial-gradient(circle, #00FF8540, transparent 70%)`, `filter: blur(20px)`.
- Label "Saldo disponível" mono 11 uppercase `rgba(255,255,255,0.65)`; à direita 2 retângulos 28×18 radius 4 (um verde, um `rgba(255,255,255,0.2)`).
- Valor: mono 700/42 letterSpacing `-0.02em`, "R$" 22 `rgba(255,255,255,0.55)`, "187" branco, ",50" 28 `rgba(255,255,255,0.6)` (padrão: prefixo/decimais rebaixados).
- Sub: "+ R$ 50,00 carregado · Festival do Sol" 12 `rgba(255,255,255,0.6)`.
- Ações grid 3 (gap 8): botões h 44, radius 14, 600/13. Primário "Recarregar" (`background: #00FF85`, `color: #003C1F`, ícone "+" 18/700); secundários "Transferir"/"Sacar" (`background: rgba(255,255,255,0.10)`, `border: 1px solid rgba(255,255,255,0.14)`, `color: #fff`).

**Chip evento ativo:** `padding: 14px 16px`, radius 16, `background: rgba(0,255,133,0.06)`, `border: 1px solid rgba(0,255,133,0.20)`; thumb 40×40 radius 10; "Festival do Sol · está rolando" 13/600; "Você está em Audio Club" 11 `rgba(255,255,255,0.55)`; dot 8×8 verde `boxShadow: 0 0 10px rgba(0,255,133,0.8)`.

**Transações:** header "Atividade" display 700/18 + "Esta noite" 11 `rgba(255,255,255,0.5)`. Linhas (gap 10, `padding: 8px 4px`): ícone 40×40 radius 12 `background: {cor}20`, `border: 1px solid {cor}40`, emoji 18; nome 14/600; local+hora 11 `rgba(255,255,255,0.5)` ("Bar Central · PDV 03 · 23:47"); valor mono 700/14 — positivo em verde com "+", negativo branco. Dados: "Brahma 600ml" −18 / "Combo Energético" −32 / "Recarga via Pix" (Asaas · aprovado) +50 / "Burger + fritas" −42,50.

**Estados:** evento ao vivo (chip verde + dot glow), transação crédito vs. débito.

---

## TELA 6 — ONBOARDING / LOGIN · `OnboardingScreen` · iPhoneScreens3.jsx

**Fluxo:** autenticação/primeiro uso. Sem TabBar.

**Layout:** Aurora(1.2) → StatusBar → hero com 3 cards empilhados em profundidade + anéis → bottom sheet com título, texto, CTAs e legal.

**Cards empilhados** (180×240, radius 22, `border: 1px solid rgba(255,255,255,0.12)`, gradiente estilo Flyer layout a, overlay `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))`):
- Card 1: rotate −8°, translate(−60, 0), violeta/pink — "Festival Sol"
- Card 2 (frente): rotate 4°, translate(30, −30), verde/cyan — "Boate Roxa"; `boxShadow: 0 30px 60px -10px rgba(0,255,133,0.5), 0 0 0 1px rgba(255,255,255,0.18)`
- Card 3: rotate 12°, translate(90, 30), pink/amber — "Sunset Bar"
- Outros: `boxShadow: 0 20px 40px -10px rgba(0,0,0,0.6)`. Cada card tem eyebrow mono verde "SÁB · 22H" + título display 700/18.
- Fundo: 2 círculos SVG r 180/240 stroke verde opacity 0.10/0.06.

**Bottom sheet:** `padding: 28px 24px 36px`, `background: rgba(11,13,18,0.6)`, `backdropFilter: blur(40px) saturate(180%)`, `borderTop: 1px solid rgba(255,255,255,0.10)`, `borderRadius: 28px 28px 0 0`, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.12)`.
- `.pp-eyebrow` verde "Bem-vindo ao PulsePass".
- Título display 700/32, lineHeight 1, letterSpacing `-0.03em`: "Sua noite," + serif itálico verde "do ingresso ao último gole.".
- Parágrafo 14 `rgba(255,255,255,0.65)` lineHeight 1.5: "Ticketeria, lista de convidados e cashless num app só. Sem fila, sem dinheiro, sem complicação."
- CTA primário: h 54, radius 16, `background: linear-gradient(180deg, #4DFFA8, #00FF85)`, `color: #003C1F`, 700/15, `boxShadow: 0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)` — **"Continuar com Pix · CPF"**.
- Sociais grid 2 (gap 8): h 48, radius 14, `border: 1px solid rgba(255,255,255,0.14)`, `background: rgba(255,255,255,0.06)`, blur 12, 600/13 — "Facebook" / "Apple" (logos fill #fff 16px).
- Link texto: "Já tenho conta · Entrar" 13 `rgba(255,255,255,0.6)`.
- Legal centrado 10 `rgba(255,255,255,0.35)`: "Ao continuar você aceita os **Termos** e a **Política**" (links em verde).

---

## TELA 7 — RESULTADOS DE BUSCA · `SearchScreen` · iPhoneScreens3.jsx

**Fluxo:** descoberta/busca. Tab ativa: `home`.

**Layout:** Aurora(0.4) → StatusBar → nav com voltar + campo de busca ativo → chips de filtro → contagem de resultados → lista de resultados → TabBar.

**Campo de busca ativo:** h 44, radius 999, `background: rgba(255,255,255,0.06)`, blur 20, **`border: 1.5px solid rgba(0,255,133,0.3)`**, `boxShadow: 0 0 16px rgba(0,255,133,0.15)` (foco = borda verde + glow). Lupa stroke verde; texto do query "Audio Club" 13/500 #fff; botão "×" círculo 18 `rgba(255,255,255,0.1)`.

**Chips de filtro:** `padding: 6px 12px`, radius 999, 12/600. Ativo ("São Paulo"): `background: rgba(0,255,133,0.14)`, `color: #00FF85`, `border: 1px solid rgba(0,255,133,0.3)`, com "×" (10, opacity 0.7). Inativos ("Próx. 7 dias", "Eletrônica", "$ até 100"): `rgba(255,255,255,0.05)` / `rgba(255,255,255,0.7)` / `border rgba(255,255,255,0.1)`.

**Contagem:** mono 11 uppercase letterSpacing `0.1em` `rgba(255,255,255,0.55)`: "**5 resultados** · ordenado por relevância" (número em verde) + ícone "↕".

**Card de resultado** (gap 12 na lista): `padding: 12`, radius 18, `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.08)`, blur 20, flex gap 12.
- Poster 80×100, radius 12, gradiente Flyer-a, `border: 1px solid rgba(255,255,255,0.08)`; tag de data (top 6/left 6): `padding: 3px 6px`, radius 4, `background: rgba(0,0,0,0.5)`, blur 8, mono 8, letterSpacing `0.08em`, uppercase.
- Meio: título display 600/16 letterSpacing `-0.01em`; sub 12 `rgba(255,255,255,0.55)`; `PBadge` com tone/dot ("esgotando" pulse+dot, "restam 38" amber, "premium" violet, "recorrente" cyan+dot, "livre" pulse).
- Direita: "desde" mono 10 `rgba(255,255,255,0.5)` + "R$ {p}" mono 700/16; grátis → "LIVRE" mono 700/13 verde.

**Copy dos resultados:** Festival do Sol (SÁB 30/11, Audio Club · SP, R$ 90) / Tropical Heat (SEX 22/11, Praia do Forte · BA, R$ 120) / KVSH no Audio (SÁB 14/12, R$ 70) / Boate Roxa edição 7 (TODA QUI, Roxa Club · SP, R$ 50) / Sunset Bar — DJ Mau (DOM 24/11, Cobertura · RJ, LIVRE).

---

## TELA 8 — PROMOTER (AZList) · `PromoterScreen` · iPhoneScreens3.jsx

**Fluxo:** lista de convidados/promoter. Sem TabBar padrão; CTA fixo no rodapé.

**Layout:** Aurora(0.5) → StatusBar → header + chip identidade promoter → seletor de evento → KPIs 3 col → card link pessoal (violeta) → lista de convidados com filtro → CTA fixo violeta.

**Header:** `.pp-eyebrow` "Promoter mode"; título display 700/26 "Sua lista". Chip identidade: `padding: 6px 10px 6px 8px`, radius 999, `background: rgba(167,139,250,0.14)`, `border: 1px solid rgba(167,139,250,0.3)`; avatar 22 `linear-gradient(135deg, #A78BFA, #FF3D88)`; texto mono 11/600 violeta letterSpacing `0.04em` — "LIA · TIER 3".

**Seletor de evento:** card `padding: 14`, radius 16, glass padrão (`rgba(255,255,255,0.04)` + borda 0.08 + blur 20); thumb 48; "Festival do Sol · 30 nov" 13/600; sub com `.pp-pulse-dot` 6×6 — "Lista aberta · vira 23h59"; chevron down.

**KPIs:** grid 3 gap 8; card `padding: 12`, radius 14, `background: rgba(255,255,255,0.03)`, borda 0.08, blur 20; valor mono 700/18 colorido + label mono 10 uppercase letterSpacing `0.06em` `rgba(255,255,255,0.5)` — "247 Inscritos" (violeta) / "189 Confirmados" (verde) / "R$ 2.834 Comissão" (pink).

**Card link pessoal (destaque violeta):**
```
padding: 18; border-radius: 20;
background: linear-gradient(135deg, rgba(167,139,250,0.22), rgba(255,61,136,0.15) 60%, rgba(34,211,238,0.18));
border: 1px solid rgba(167,139,250,0.35);
backdrop-filter: blur(30px) saturate(180%);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(167,139,250,0.18);
```
- `.pp-eyebrow` violeta "Seu link pessoal"; URL mono 600/16 "pulsepass.app/**lia**" (slug em violeta); microcopy 12 `rgba(255,255,255,0.7)`: "Compartilhe no story · cada inscrito pelo seu link conta na comissão."
- 3 botões (flex 1, h 42, radius 12, `background: rgba(11,13,18,0.5)`, blur 12, `border: 1px solid rgba(255,255,255,0.1)`, 12/600): "📷 Stories" (texto pink), "💬 WhatsApp" (texto verde), "⎘ Copiar" (branco).

**Convidados:** header "Convidados" display 700/18 + mini-segmented (padding 3, radius 999) "Todos · 247" ativo verde / "Check-in · 12". Linha: `padding: 10px 12px`, radius 14, `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.06)`; avatar 36 círculo `background: {tone}30`, `border: 1.5px solid {tone}80`, inicial 700/12 na cor; nome 13/600 (+ badge "CHECKED-IN" 9px, `padding: 2px 6px`, radius 999, `background: rgba(0,255,133,0.12)`, verde mono 600 letterSpacing `0.04em`); sub 11 `rgba(255,255,255,0.5)`; direita: `PBadge` do setor (Pista=pulse, Premium=violet, VIP=pink, Staff=amber) + hora mono 9 `rgba(255,255,255,0.4)`.

**CTA fixo:** absolute bottom 14/14/14, botão full h 54, radius 18, `background: linear-gradient(180deg, #C4B5FD, #A78BFA)`, `color: #1A0040`, 700/14, `boxShadow: 0 8px 24px rgba(167,139,250,0.4), inset 0 1px 0 rgba(255,255,255,0.4)` — "+ Adicionar convidado manualmente".

**Insight:** contexto promoter troca a cor de acento verde→violeta em todo o fluxo (chips, card, CTA).

---

## TELA 9 — INSCRIÇÃO PÚBLICA NA LISTA · `GuestSignupScreen` · iPhoneScreens3.jsx

**Fluxo:** link público AZList (fora do app logado). Sem TabBar.

**Layout:** hero bg violeta/pink full → StatusBar → chip do promoter centrado → título gigante → card de formulário glass → CTA + legal.

**BG:** `radial-gradient(60% 50% at 30% 20%, #A78BFA, transparent 60%), radial-gradient(60% 50% at 80% 80%, #FF3D88, transparent 60%), #06070A` + fade `linear-gradient(180deg, transparent 30%, rgba(6,7,10,0.92) 70%)`.

**Chip do promoter:** pill centrada `padding: 8px 14px 8px 8px`, radius 999, `background: rgba(11,13,18,0.5)`, blur 20, `border: 1px solid rgba(255,255,255,0.14)`; avatar 28 gradiente violeta→pink; "convite de" mono 11 `rgba(255,255,255,0.55)` + "Lia Coelho" 13/600.

**Título:** `.pp-eyebrow` violeta "Sábado · 30 nov · 22h"; display 700/**44**, lineHeight 0.95, letterSpacing `-0.03em` — "Festival / **do Sol**(violeta) / *edição equinócio*(serif itálico branco 36)". Local 13 `rgba(255,255,255,0.65)`.

**Form card:** `padding: 18`, radius 22, `background: rgba(11,13,18,0.55)`, `backdropFilter: blur(40px) saturate(180%)`, `border: 1px solid rgba(255,255,255,0.14)`, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.4)`.
- Título "Entre na lista da Lia" display 600/18; sub 12 `rgba(255,255,255,0.55)`: "Gratuito até 23h59. Após esse horário, pista vira R$ 90."
- Campos (label mono 10 uppercase letterSpacing `0.08em` `rgba(255,255,255,0.5)` acima; input h 42, `padding: 0 14px`, radius 12, `background: rgba(255,255,255,0.04)`): **válido → `border: 1px solid rgba(0,255,133,0.3)` + check verde strokeWidth 3 à direita**; neutro → `border: rgba(255,255,255,0.1)`. Campos: "Nome completo", "CPF", "WhatsApp", "Data de nascimento".
- Checkbox +1: `padding: 12`, radius 12, `background: rgba(167,139,250,0.10)`, `border: 1px solid rgba(167,139,250,0.25)`; caixa 22 radius 6 `background: #A78BFA` com check stroke `#1A0040` — "Quero +1 acompanhante (gratuito)".

**CTA:** botão full h 56, radius 18, gradiente verde padrão, `boxShadow: 0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)` — "Confirmar inscrição" + seta. Abaixo, 10 `rgba(255,255,255,0.4)` centrado: "Anti-fraude PulsePass · ao confirmar você aceita os termos".

**Estados:** validação de campo (borda verde + check).

---

## TELA 10 — RECARGA CASHLESS · `RechargeScreen` · iPhoneScreens4.jsx

**Fluxo:** carteira → recarga. Sem TabBar; CTA no rodapé.

**Layout:** Aurora(0.7) → StatusBar → nav ("Recarregar carteira") → pill saldo atual → valor gigante → grid de valores → valor customizado → forma de pagamento → CTA.

**Pill saldo:** centrada, `padding: 8px 16px`, radius 999, `background: rgba(255,255,255,0.05)`, borda 0.1 — "Saldo atual" mono 11 `rgba(255,255,255,0.6)` + "R$ 187,50" mono 700/14 verde.

**Valor gigante:** `.pp-eyebrow` verde "Quanto carregar?"; mono 700/**72**, letterSpacing `-0.04em`; "R$" e ",00" em 32 `rgba(255,255,255,0.55)`; número central com `textShadow: 0 0 40px #00FF8560`. Sub: "Novo saldo: **R$ 287,50**" (12, valor verde 600).

**Grid de valores** (3 col, gap 10; 30/50/100/150/200/300): botão h 60, radius 16, mono 700/18. Selecionado: `background: rgba(0,255,133,0.10)`, `border: 1.5px solid rgba(0,255,133,0.6)`, texto verde, `boxShadow: 0 0 24px rgba(0,255,133,0.2), inset 0 1px 0 rgba(255,255,255,0.08)`. Não selecionado: `rgba(255,255,255,0.04)` / borda 0.10 / branco / `inset 0 1px 0 rgba(255,255,255,0.04)`. Bônus no R$100: mini-tag absolute top 4/right 4, 8px, `padding: 2px 5px`, radius 999, `background: #A78BFA`, `color: #1A0040`, 700 — "+ R$ 10".

**Valor customizado:** h 50, radius 14, `background: rgba(255,255,255,0.04)`, **`border: 1px dashed rgba(255,255,255,0.18)`**, texto 13/500 `rgba(255,255,255,0.65)` — "+ Valor customizado". (Padrão: dashed = adicionar novo.)

**Forma de pagamento** (`.pp-label` "Forma de pagamento"): cards radio, `padding: 14`, radius 14. Selecionado (Pix): `background: rgba(0,255,133,0.08)`, `border: 1.5px solid #00FF85`, `boxShadow: 0 0 20px #00FF8530`; ícone Pix (4 losangos) stroke verde em quadrado 40 radius 10 `#00FF8520`. Radio: círculo 22, selecionado `border: 6px solid #00FF85` + `background: #06070A`; não `border: 1.5px solid rgba(255,255,255,0.25)`. Copy: "Pix · instantâneo" tag "Recomendado" / "Cartão · 1× R$ 100" tag "4× s/ juros disp.".

**CTA:** full h 56, radius 18, gradiente verde, layout **space-between** (`padding: 0 22px`): "Gerar Pix R$ 100,00" + seta. `boxShadow: 0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`.

---

## TELA 11 — PEDIDO NO BAR (Order Ahead) · `OrderAheadScreen` · iPhoneScreens4.jsx

**Fluxo:** bar/consumo. Tab ativa: `wallet`.

**Layout:** Aurora(0.5) → StatusBar → header ("Zero fila *no bar.*" + pill saldo R$187) → seletor de bares → "Bombando agora" (2 cards) → cardápio (lista) → **barra de carrinho flutuante verde** → TabBar.

**Header:** `.pp-eyebrow` "Pedido pelo app"; título display 700/26 "Zero fila" + serif itálico verde "no bar."; círculo 38 glass com "R$187" mono 700/11 verde.

**Seletor de bares** (chips horizontais): `padding: 10px 14px`, radius 14, minWidth 100, coluna gap 2. Ativo: `background: rgba(0,255,133,0.10)`, `border: 1.5px solid rgba(0,255,133,0.4)`; nome 12/600; fila mono 10 (ativo verde, senão `rgba(255,255,255,0.55)`). Fechado: `opacity: 0.4`. Dados: "Bar Central 4 min" (ativo) / "Bar VIP ★ 1 min" / "Food Truck 8 min" / "Bar Norte fechado".

**Bombando agora:** header mono 11 uppercase letterSpacing `0.1em` **pink** com `.pp-pulse-dot` pink 6×6 — "Bombando agora". Grid 2 (gap 10): card `padding: 12`, radius 18, `background: rgba(255,255,255,0.03)`, borda 0.08; imagem h 80 radius 12 gradiente-a com emoji 40; nome 13/600; preço mono 700/15; botão "+" 32×32 radius 10 `background: #00FF85` `color: #003C1F` 700/16; tag flutuante (`padding: 3px 8px`, radius 6, `rgba(11,13,18,0.7)`, blur 8, mono 9 uppercase letterSpacing `0.06em`) — "+ vendido" / "clássico". Itens: Combo Vodka + RedBull R$ 42 / Caipirinha de limão R$ 24.

**Cardápio** (`.pp-label` "Cardápio · Bar Central"): linhas `padding: 10px 4px`, `borderBottom: 1px solid rgba(255,255,255,0.04)`; thumb 44×44 radius 10 `rgba(255,255,255,0.05)` emoji 20 borda 0.08; nome 14/600 + desc 11 `rgba(255,255,255,0.55)`; preço mono 700/14; botão "+" 30×30 radius 9 `background: rgba(0,255,133,0.14)`, `border: 1px solid rgba(0,255,133,0.3)`, verde. Itens: Brahma 600ml R$18 / Heineken Long Neck R$15 / Gin Tônica premium R$38 / Hot dog premium R$22.

**Barra de carrinho (assinatura):**
```
margin: 10px 14px 14px; padding: 12px 14px 12px 18px; border-radius: 22;
background: linear-gradient(180deg, rgba(0,255,133,0.16), rgba(0,255,133,0.10));
backdrop-filter: blur(30px) saturate(180%);
border: 1px solid rgba(0,255,133,0.35);
box-shadow: 0 8px 24px rgba(0,255,133,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
```
Contador 40×40 radius 12 verde sólido com "3" `#003C1F` 700/18; "3 itens · R$ 84,00" 13/600 + "Pronto em ~4 min" 11 `rgba(255,255,255,0.7)`; botão **invertido**: h 44, `padding: 0 18px`, radius 14, `background: #003C1F`, `color: #00FF85`, 700/13 — "Continuar" + seta.

---

## TELA 12 — MAPA AO VIVO DO EVENTO · `LiveMapScreen` · iPhoneScreens4.jsx

**Fluxo:** evento ao vivo/super-app. Tab ativa: `home`.

**Layout:** mapa SVG do venue (bg `#0a0d14`) → StatusBar → pill do evento + botão localização → chips de legenda → pin "você está aqui" + markers de amigos → bottom sheet "tocando agora" → TabBar.

**Mapa SVG** (opacity 0.4, viewBox 390×844): contorno do venue `fill rgba(34,211,238,0.06)` stroke cyan 1.5 opacity 0.3; Stage rect violeta fillOpacity 0.2 / strokeOpacity 0.5; 2 bares retângulos verdes; comida amber; pista elipse `rgba(0,255,133,0.04)` stroke verde opacity 0.15 `strokeDasharray 4 4`; camarote pink; porta branca; 40 dots de "calor" verdes r 2 fillOpacity 0.3–0.7. Vinheta: `radial-gradient(70% 70% at 50% 50%, transparent 50%, rgba(6,7,10,0.7))`.

**Top pill:** `padding: 8px 14px 8px 10px`, radius 999, `background: rgba(11,13,18,0.65)`, blur 20, borda 0.14; `.pp-pulse-dot` 8×8 + "Festival do Sol" 12/600 verde + "22:38" mono 11 `rgba(255,255,255,0.55)`.

**Legenda:** chips `padding: 4px 10px`, radius 999, `background: rgba(11,13,18,0.6)`, blur 12, borda 0.1, mono 10, com quadradinho 8×8 radius 2 na cor — Stage(violeta)/Bar(verde)/Comida(amber)/Camarote(pink)/Banheiro(branco).

**Pin você-está-aqui:** halo 60×60 verde opacity 0.2 blur 8 com `animation: pp-pulse-ring 2s infinite`; pin 26×26 círculo verde `border: 3px solid #fff`, `boxShadow: 0 0 0 4px rgba(0,255,133,0.3), 0 4px 12px rgba(0,0,0,0.4)`.

**Markers de amigos:** pill `padding: 4px 10px 4px 6px`, radius 999, 10/700; "Lia": `background: #A78BFA`, `color: #1A0040`, avatar 16 invertido, `boxShadow: 0 4px 12px rgba(167,139,250,0.5)`; "Caio": `background: #FF3D88`, `color: #fff`.

**Bottom sheet** (`margin: 0 14px 90px`, `padding: 16`, radius 22, `background: rgba(11,13,18,0.65)`, `backdropFilter: blur(40px) saturate(180%)`, borda 0.14, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.5)`):
- `.pp-eyebrow` violeta "Tocando agora · main stage"; "Vintage Culture" display 700/22; "até 23:30 · próx: **Anyma**" 12 (destaque violeta 600); thumb 70×70 radius 16.
- Stats grid 3 (gap 8): card `padding: 10`, radius 12, glass 0.04/0.08; valor mono 700/16 colorido + label mono 10 uppercase — "Ocupação 85%" (verde) / "Fila bar 4 min" (amber) / "Amigos aqui 2" (violeta).

---

## TELA 13 — NOTIFICAÇÕES · `NotificationsScreen` · iPhoneScreens4.jsx

**Fluxo:** atividade/notificações. Tab ativa: `profile`.

**Layout:** Aurora(0.4) → StatusBar → header + badge "4 novas" → pills de filtro → grupo "Hoje" com notificação destaque + lista → grupo "Esta semana" → TabBar.

**Header:** `.pp-eyebrow` "Atividade"; "Notificações" display 700/28 letterSpacing `-0.025em`; badge `padding: 6px 12px`, radius 999, `background: rgba(0,255,133,0.10)`, `border: 1px solid rgba(0,255,133,0.25)`, mono 11/600 verde — "4 novas".

**Filtros:** "Tudo, Eventos, Cashless, Amigos, Sistema" — `padding: 6px 12px`, radius 999, 12/600; ativo: `background: rgba(255,255,255,0.10)`, branco; inativo: `rgba(255,255,255,0.04)`, `rgba(255,255,255,0.6)`; ambos `border: 1px solid rgba(255,255,255,0.08)`. (Nota: aqui o ativo é neutro, não verde.)

**Separador de grupo:** mono 10 uppercase letterSpacing `0.12em` `rgba(255,255,255,0.45)` — "Hoje" / "Esta semana".

**Notificação destaque:** `padding: 16`, radius 18, `background: linear-gradient(135deg, rgba(0,255,133,0.16), rgba(34,211,238,0.10))`, `border: 1px solid rgba(0,255,133,0.35)`, blur 20, `boxShadow: 0 4px 16px rgba(0,255,133,0.15), inset 0 1px 0 rgba(255,255,255,0.12)`; `.pp-pulse-dot` 8×8 no canto (top/right 12); ícone 44×44 radius 12 verde sólido com waveform `#003C1F`; título 14/700 "Festival do Sol abriu portões 🟢"; sub 12 `rgba(255,255,255,0.7)`; 2 botões h 36 radius 10: primário verde sólido 700/12 "Mostrar ingresso"; secundário `rgba(255,255,255,0.08)` + borda 0.14 "Ver mapa".

**Linha de notificação:** `padding: 12px 4px`, `borderBottom: 1px solid rgba(255,255,255,0.05)`; ícone 36×36 radius 10 `background: {c}18`, `border: 1px solid {c}40`; título 13/600 (+ dot verde 6×6 se não lida); sub 11 `rgba(255,255,255,0.55)`; timestamp mono 10 `rgba(255,255,255,0.4)` ("32min", "1h", "Ter").

**Copy:** "Recarga de R$ 100 confirmada / Pix aprovado em 3s · novo saldo R$ 287,50" · "Lia te marcou na lista do Festival / Bem-vinda à edição equinócio ✨" · "Seu ingresso Premium chegou / PSP-7H29 · Pista Premium" · "Você desbloqueou Tier Gold / 5 eventos PulsePass · 3% cashback" · "Caio fez aniversário no PulsePass / Mande os parabéns" · "Boate Roxa abriu vendas / Convite especial · você foi 3× lá".

**Estados:** lida vs. não lida (dot), destaque acionável com botões, agrupamento temporal.

---

## TELA 14 — SUCESSO DO PEDIDO · `OrderSuccessScreen` · iPhoneScreens5.jsx

**Fluxo:** checkout → confirmação. Sem TabBar.

**Layout:** aurora verde custom + confetti SVG → StatusBar → check gigante com halos → título → card resumo do ingresso → 3 botões (Agenda/Wallet/Share) → CTA branco + link secundário.

**BG:** `radial-gradient(60% 50% at 50% 20%, #00FF85, transparent 60%), radial-gradient(50% 50% at 80% 80%, #22D3EE, transparent 60%), radial-gradient(40% 40% at 20% 90%, #A78BFA, transparent 60%), #06070A` + véu radial. **Confetti:** 22 círculos (r 3–5, cores da paleta, opacity 0.7) + 12 retângulos 6×10 rotacionados (opacity 0.5).

**Check:** 120×120; halos: `inset -16` verde opacity 0.12 blur 12, `inset -8` opacity 0.2 blur 8; círculo `background: linear-gradient(135deg, #4DFFA8, #00FF85)`, `boxShadow: inset 0 2px 0 rgba(255,255,255,0.4), 0 20px 40px rgba(0,255,133,0.5)`; check SVG 60 stroke `#003C1F` strokeWidth 3.

**Título:** `.pp-eyebrow` verde "Pagamento aprovado · agora"; display 700/38 lineHeight 1 letterSpacing `-0.03em` centrado — "Seu ingresso" + serif itálico verde "chegou."; parágrafo 14 `rgba(255,255,255,0.7)` maxWidth 280: "Salvamos um lugar pra você no Festival do Sol. Apresente o QR na entrada."

**Card do ingresso:** `padding: 20`, radius 24, `background: rgba(11,13,18,0.55)`, `backdropFilter: blur(40px) saturate(180%)`, borda 0.14, `boxShadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.4)`; faixa superior decorativa h 60 `linear-gradient(180deg, rgba(0,255,133,0.18), transparent)`. Thumb 64 radius 14; eyebrow verde "SÁB · 30 NOV · 22H"; "Festival do Sol" display 700/20; local 12. Divisor: grid 3 col entre `borderTop/borderBottom: 1px dashed rgba(255,255,255,0.15)`, labels mono 9 uppercase `rgba(255,255,255,0.45)`: Setor "Pista Premium" / Código "PSP-7H29" / Valor "R$ 189,00" (verde). Rodapé mono 11 `rgba(255,255,255,0.55)`: "Comprovante enviado por e-mail · erick@smu.fun".

**Botões utilitários** (3, flex 1, h 44, radius 12, 12/600): "Agenda" e "Share" glass (`rgba(255,255,255,0.05)` + borda 0.12); "Wallet" preto `#000` + `border: 1px solid rgba(255,255,255,0.25)` (Apple Wallet).

**CTA:** botão **branco** full h 54 radius 18, `background: #fff`, `color: #06070A`, 700/14, `boxShadow: 0 8px 24px rgba(255,255,255,0.15)` — "Ver ingresso completo →". Link fantasma abaixo 13 `rgba(255,255,255,0.65)`: "Carregar R$ 50 no cashless · ganhe +R$ 5" (upsell).

---

## TELA 15 — MEUS INGRESSOS · `MyTicketsScreen` · iPhoneScreens5.jsx

**Fluxo:** ingressos (lista multi-evento). Tab ativa: `tickets`.

**Layout:** Aurora(0.4) → StatusBar → header → segmented pills → destaque "Hoje" (borda cônica) → lista "Próximas noites" (com bloco de data) → strip de tier → TabBar.

**Header:** `.pp-eyebrow` "Sua carteira"; título display 700/28: serif itálico verde "*3 noites*" + " à frente".

**Segmented:** mesmo padrão da Tela 4; ativo é o índice 1 — "Próximos · 3", "**Hoje · 1**", "Histórico".

**Destaque de hoje:** label mono 10 verde uppercase letterSpacing `0.12em` com `.pp-pulse-dot` 6×6 — "Hoje · começa em 3h22". Card com moldura `conic-gradient(from 90deg, #00FF85, #22D3EE, #A78BFA, #FF3D88, #00FF85)` (`padding: 2`, radius 22), `boxShadow: 0 20px 40px -10px rgba(0,255,133,0.35), 0 0 40px rgba(0,255,133,0.18)`; interior radius 20, `padding: 16`, `background: rgba(11,13,18,0.9)`, blur 40; poster 60×80 radius 10; "Festival do Sol" display 700/17; "Audio Club · Pista Premium" 11; `PBadge tone=pulse dot` "Ao vivo · QR pronto"; chevron.

**Lista próximas** (label mono 10 uppercase `rgba(255,255,255,0.5)` "Próximas noites"): card `padding: 14`, radius 16, glass 0.03/0.08 blur 20, gap 12.
- **Bloco de data:** 54 largura, `padding: 8px 0`, radius 12, `background: rgba(255,255,255,0.04)`, borda 0.08, centrado; dia display 700/22 branco; mês mono 9/600 letterSpacing `0.1em` na cor de acento (ex.: "14 DEZ").
- Poster 48×60 radius 10 gradiente-a; título 14/600; local 11; `PBadge` (Pista=pulse, Premium=violet, VIP=pink).
- Itens: 14 DEZ KVSH no Audio (Pista) / 21 DEZ Tropical Heat (Premium) / 31 DEZ Réveillon Cobertura, Skye Bar · SP (VIP · open bar).

**Strip de tier:** `padding: 14`, radius 16, `background: linear-gradient(135deg, rgba(255,184,0,0.14), rgba(255,61,136,0.10))`, `border: 1px solid rgba(255,184,0,0.3)`; ícone 40 radius 10 `linear-gradient(135deg, #FFB800, #FF3D88)` com "★"; "Pulse Gold · 5 eventos" 13/600; "Faltam 3 pra Platinum · cashback 5%" 11; chevron.

---

## TELA 16 — PERFIL / TIER / CONQUISTAS · `ProfileScreen` · iPhoneScreens5.jsx

**Fluxo:** perfil. Tab ativa: `profile`. Conteúdo com `overflow: auto`.

**Layout:** Aurora(0.5) → StatusBar → engrenagem (topo direito) → avatar com anel de progresso + nome + badge tier → stats 3 col → card de progressão de tier → grid de conquistas 4 col → lista de configurações → TabBar.

**Avatar hero:** 120×120 círculo `linear-gradient(135deg, #A78BFA, #FF3D88)`, inicial display 700/42, `boxShadow: inset 0 2px 0 rgba(255,255,255,0.3)`. **Anel de progresso** SVG por cima: trilha `stroke: rgba(255,255,255,0.08)` strokeWidth 3; progresso `stroke: url(#tierRing)` (linearGradient `#FFB800 → #FF3D88 → #A78BFA`), `strokeDasharray 289`, `strokeDashoffset 86` (~70%), rotate −90°.
- Nome "Erick Berberian" display 700/24. Badge tier: pill `padding: 6px 12px 6px 8px`, radius 999, `background: linear-gradient(135deg, rgba(255,184,0,0.18), rgba(255,61,136,0.12))`, `border: 1px solid rgba(255,184,0,0.3)`; "★" + "PULSE GOLD · 71%" mono 11/600 letterSpacing `0.06em` amber.

**Stats:** grid 3 (mesmo padrão KPI): "23 Eventos" (verde) / "4,8★ Reputação" (amber) / "R$ 3,2k Cashless" (cyan).

**Progressão de tier:** card glass 0.03/0.08 blur 20, radius 18, `padding: 16`. Header: `.pp-eyebrow` "Próx. tier" + "3 / 10 eventos" mono 11. Steps: círculos 28 (concluído: verde sólido, "✓" `#003C1F`; futuro: `rgba(255,255,255,0.06)` + borda 0.12, número); labels mono 9 letterSpacing `0.06em` (concluído verde); conectores h 2 (concluído verde, senão `rgba(255,255,255,0.08)`). "Silver → Gold → Platinum → Diamond". Rodapé 11: "**+3% cashback** liberado em Platinum".

**Conquistas** (`.pp-label` "Conquistas · 8 de 24"): grid 4 col gap 8; tile `aspectRatio: 1`, radius 14. Desbloqueada: `background: {c}18`, `border: 1px solid {c}50`; bloqueada: `rgba(255,255,255,0.03)` / borda 0.06 / `opacity: 0.4` / emoji com `filter: grayscale(1)`. Emoji 22 + label mono 9 `rgba(255,255,255,0.55)`. Itens: 🎟️ Primeira / 🌙 5 noites / ⚡ Pix < 30s / 👯 +5 amigos (on) · 🏆 10 eventos / 💰 R$ 5k cashless / 🌟 VIP 3× / 🎂 Aniversário (off).

**Configurações** (`.pp-label` "Conta"): container radius 16 glass 0.03/0.08; linhas `padding: 14px 16px`, `borderBottom: 1px solid rgba(255,255,255,0.05)` (exceto última); ícone 32 radius 8 `rgba(255,255,255,0.06)`; título 13/600 + sub 11 `rgba(255,255,255,0.5)`; chevron. Itens: "Métodos de pagamento / 3 cadastrados" · "Notificações / push, e-mail" · "Privacidade & LGPD / preferências" · "Ajuda / 24/7 via chat".

---

## TELA 17 — SAQUE (Withdraw) · `WithdrawScreen` · iPhoneScreens5.jsx

**Fluxo:** carteira → saque de saldo residual. Sem TabBar; CTA no rodapé.

**Layout:** Aurora(0.5) → StatusBar → nav ("Sacar saldo") → valor hero → card breakdown → seleção de chave Pix → nota informativa → CTA.

**Hero:** `.pp-eyebrow` verde "Sobra após Festival do Sol"; valor mono 700/56 letterSpacing `-0.03em` ("R$" 24 rebaixado, "52" com `textShadow: 0 0 32px #00FF8580`, ",40" 24). Sub 12: "Cai na sua conta em até 5 minutos via Pix".

**Breakdown:** card `padding: 16`, radius 18, glass 0.04/0.08 blur 20; `.pp-label` "Resumo do evento"; linhas `padding: 8px 0`, `borderBottom: 1px solid rgba(255,255,255,0.05)`; label 13 `rgba(255,255,255,0.75)` (muted: 0.4) + valor mono 13/600 colorido. Dados: "Recargas +R$ 150,00" (verde) / "Bônus carga R$ 100 +R$ 10,00" (violeta) / "Gasto no PDV (6 itens) −R$ 107,60" / "Taxa de serviço −R$ 0,00" (muted). **Total:** separado por `borderTop: 1px dashed rgba(255,255,255,0.15)`; "Saldo a sacar" 13/700 + "R$ 52,40" mono 700/20 verde.

**Chaves Pix** (`.pp-label` "Sacar para chave Pix"): cards `padding: 14`, radius 14. Selecionada: `background: rgba(0,255,133,0.08)`, `border: 1.5px solid #00FF85`, `boxShadow: 0 0 20px rgba(0,255,133,0.18)`, ícone Pix stroke verde em quadrado `rgba(0,255,133,0.18)`, radio `border: 6px solid #00FF85`. Não selecionada: glass 0.04/0.08, radio `border: 1.5px solid rgba(255,255,255,0.25)`. Adicionar: `border: 1px dashed rgba(255,255,255,0.18)`, "+". Dados: "CPF · 348.***.***-22 / Banco do Brasil · em sua conta" (sel) · "erick@smu.fun / Nubank" · "+ Adicionar nova chave".

**Nota informativa (tom cyan):** `padding: 12`, radius 12, `background: rgba(34,211,238,0.08)`, `border: 1px solid rgba(34,211,238,0.2)`; ícone info stroke cyan; texto 11 `rgba(255,255,255,0.75)` lineHeight 1.5: "Saque gratuito até **30 dias após o evento**. Após esse prazo, R$ 2,50 de taxa."

**CTA:** padrão verde space-between — "Sacar R$ 52,40 via Pix" + seta.

---

## TELA 18 — CATÁLOGO / EXPLORE · `CatalogScreen` · iPhoneScreens6.jsx

**Fluxo:** descoberta por cidade/categoria. Tab ativa: `home`.

**Layout:** Aurora(0.5) → StatusBar → header ("Explore" + cidade serif) → grid de categorias 4 col → strip horizontal "Bombando em SP" → seção "Final de semana" (lista) → TabBar.

**Header:** `.pp-eyebrow` "Explore"; título display 700/28 com serif itálico verde "*São Paulo*" + chevron down (dropdown de cidade).

**Grid de categorias** (4 col, gap 8): tile `aspectRatio: 1`, radius 14, `background: radial-gradient(80% 80% at 30% 30%, {c}30, transparent 60%), rgba(255,255,255,0.04)`, `border: 1px solid {c}30`; emoji 22 + label 10/600 `rgba(255,255,255,0.85)`. Itens: 🪩 Festas(pink) / 🎤 Shows(violeta) / 🎙️ Stand-up(amber) / 🎭 Teatro(cyan) / ⚽ Esporte(verde) / 🍽️ Gastronomia(amber) / ✦ Workshop(violeta) / ★ Grátis(verde).

**Bombando em SP:** header mono 10 pink uppercase letterSpacing `0.12em` com dot pink — "Bombando em SP · 24h"; subtítulo display 700/18 "+ comprados agora". Carrossel horizontal (cards de 160 de largura, gap 10): poster `aspectRatio: 4/5`, radius 14, gradiente-a, overlay `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))`; badge ranking (top 8/left 8) `padding: 3px 8px`, radius 999, `rgba(0,0,0,0.6)`, blur 8, mono 10/700 **pink** — "#1"/"#2"/"#3"; título display 700/13 + preço mono 11 verde "R$ 90+".

**Final de semana:** eyebrow verde "Final de semana" + display 700/18 "Programa pra sábado". Cards horizontais `padding: 10`, radius 14, glass 0.03/0.08: poster 56×70 radius 10; título 13/600; sub 11; `PBadge` (violet "eletrônica", pulse "livre"); preço mono 700/14 ou "LIVRE" verde 13.

---

## TELA 19 — TRANSFERIR INGRESSO · `TransferTicketScreen` · iPhoneScreens6.jsx

**Fluxo:** ingresso → transferência de titularidade. Sem TabBar; CTA no rodapé.

**Layout:** Aurora(0.5) → StatusBar → nav ("Transferir titularidade") → preview do ingresso → visual De→Para → input do destinatário + card de match → contatos frequentes → recado → aviso de segurança → CTA.

**Preview:** card glass 0.04/0.08 blur 20, radius 18, `padding: 16`; poster 56×70; "Festival do Sol · 30 nov" display 700/16; "Pista Premium · PSP-7H29" 12; `PBadge violet` "Premium".

**De→Para:** avatar "Você" 60 círculo `linear-gradient(135deg, #A78BFA, #FF3D88)` inicial 24/700, label mono 11 uppercase `rgba(255,255,255,0.55)` "Você" + "Erick" 13/600; meio: 3 dots 8×8 (central verde com `boxShadow: 0 0 8px #00FF85`) + seta verde; destino: círculo 60 `rgba(255,255,255,0.06)` com **`border: 2px dashed rgba(255,255,255,0.25)`** e "?" — "Para / Selecionar".

**Input destinatário** (`.pp-label` "Quem vai receber?"): h 50, radius 14, `background: rgba(255,255,255,0.05)`, `border: 1.5px solid rgba(0,255,133,0.3)`, `boxShadow: 0 0 20px rgba(0,255,133,0.12)`; ícone user; "+55 11 9 8412-9203" 14; à direita mono 11 verde "achou ✓".
- **Card de match:** `padding: 12`, radius 12, `background: rgba(0,255,133,0.06)`, `border: 1px solid rgba(0,255,133,0.18)`; avatar 36 `linear-gradient(135deg, #22D3EE, #00FF85)`; "Bianca Carvalho" 13/600; "@biac · PulsePass desde 2024" mono 11; check verde strokeWidth 3.

**Frequentes** (`.pp-label`): avatares 50 círculo `linear-gradient(135deg, {c}, {c}99)`, `border: 2px solid rgba(255,255,255,0.08)`, inicial 18/700; nome 11 `rgba(255,255,255,0.7)` — Caio(pink)/Lia(violeta)/Marina(amber)/Pedro(cyan)/Júlia(verde).

**Recado (opcional):** textarea-like `padding: 14`, radius 14, glass 0.04/0.08, minHeight 64; conteúdo em serif itálico verde: `"Bia, esse é o ingresso que combinamos. Te vejo lá!"`.

**Aviso de segurança (tom amber):** `padding: 12`, radius 12, `background: rgba(255,184,0,0.08)`, `border: 1px solid rgba(255,184,0,0.2)`; ícone escudo stroke amber; texto 11 lineHeight 1.5: "Transferência **irreversível** em 24h. Após confirmação dela, o QR sai do seu app e vai pro dela."

**CTA:** padrão verde centrado h 54 — "Enviar para Bianca" + seta.

---

## TELA 20 — PERFIL DA CASA/PRODUTORA · `CasaProfileScreen` · iPhoneScreens6.jsx

**Fluxo:** perfil de venue (seguir casa). Tab ativa: `home`. Conteúdo `overflow: auto`.

**Layout:** hero bg (h 380, violeta/pink) → StatusBar → nav (voltar/share, estilo `rgba(0,0,0,0.4)` blur 16) → logo + nome verificado + handle → stats 3 col → 2 CTAs (Seguindo / Como chegar) → bio serif → próximos eventos → galeria de memórias → TabBar.

**Hero bg:** `radial-gradient(60% 50% at 50% 30%, #A78BFA, transparent 60%), radial-gradient(60% 50% at 20% 90%, #FF3D88, transparent 60%), #06070A` + fade para `#06070A` a 95%.

**Identidade:** logo 100×100, radius 24, `linear-gradient(135deg, #A78BFA, #FF3D88)`, `border: 4px solid rgba(255,255,255,0.14)`, `boxShadow: 0 20px 40px rgba(167,139,250,0.4)`, monograma "AC" display 700/42 letterSpacing `-0.04em`. Nome "Audio Club" display 700/26 + selo verificado (círculo verde com check, stroke `#06070A`). Handle mono 12 `rgba(255,255,255,0.6)`: "@audioclub · Vila Olímpia, SP".

**Stats:** padrão KPI centrado: "247 eventos" (verde) / "128k seguidores" (violeta) / "4.9★ reputação" (amber).

**CTAs:** 2 botões flex 1, h 46, radius 14. "✓ Seguindo": gradiente verde padrão, `boxShadow: 0 4px 16px rgba(0,255,133,0.3)`. "Como chegar": `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.14)`, blur 20, 600/14.

**Bio:** citação serif itálica verde 14 lineHeight 1.5: `"A casa de techno melódico mais querida de SP."`; meta 12 `rgba(255,255,255,0.55)`: "Operando desde 2018 · Cap. 2.300 · Cashless 100%".

**Próximos eventos** (`.pp-label` "Próximos eventos · 5" + link verde 11 "Ver agenda →"): card `padding: 12`, radius 14, glass 0.04/0.08; **bloco de data** 50 largura, `padding: 6px 0`, radius 10 (dia display 700/18, mês mono 8/600 verde letterSpacing `0.08em`); título 13/600 truncado; `PBadge` ("esgotando" pulse / "premium" violet / "abriu venda" pulse); preço mono 700/13 "R$ 90+".

**Galeria** (`.pp-label` "Suas memórias na casa · 11×"): grid 4 col gap 6; tiles `aspectRatio: 1`, radius 8, `radial-gradient(80% 80% at 30% 30%, {c}, transparent 60%), #0a0a0c`, borda 0.06, numerador (bottom/right 4) `padding: 2px 4px`, radius 4, `rgba(0,0,0,0.5)`, mono 8.

---

## TELA 21 — FIDELIDADE / LOYALTY · `LoyaltyScreen` · iPhoneScreens6.jsx

**Fluxo:** recompensas (tema amber). Tab ativa: `wallet`.

**Layout:** Aurora(0.7) → StatusBar → header → hero de pontos (card amber) → quick actions 3 col → lista "Resgate agora" → card "Como ganhar pontos" → TabBar.

**Header:** `.pp-eyebrow` **amber** "Pulse+ Loyalty"; "Recompensas" display 700/26; botão relógio círculo 38 glass.

**Hero de pontos:**
```
padding: 22; border-radius: 24;
background: linear-gradient(135deg, rgba(255,184,0,0.22) 0%, rgba(255,61,136,0.18) 50%, rgba(167,139,250,0.22) 100%), rgba(11,13,18,0.6);
backdrop-filter: blur(30px) saturate(180%);
border: 1px solid rgba(255,184,0,0.3);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(255,184,0,0.15);
```
Glyph decorativo amber (mesmo padrão do Wallet, `#FFB80040`). Eyebrow amber "seus pulse points" + "★". Valor mono 700/48: "1.847" + "pts" 20 rebaixado. Sub 12: "= R$ 92,35 em créditos". Barra de progresso: container `padding: 10px 14px`, radius 12, `background: rgba(0,0,0,0.3)`, blur 20; "Próx. recompensa em 153pts" 11; trilha 100×6 radius 99 `rgba(255,255,255,0.1)`; preenchimento 78% amber com `boxShadow: 0 0 8px #FFB800`.

**Quick actions:** grid 3; tile `padding: 12`, radius 14, `background: {c}10`, `border: 1px solid {c}30` — "⚡ Como ganhar"(verde) / "↻ Histórico"(violeta) / "★ Resgatar"(amber).

**Resgate agora** (`.pp-label`): card `padding: 14`, radius 16, `background: rgba(255,255,255,0.03)`. Disponível: `border: 1.5px solid {c}50`, `boxShadow: 0 0 20px {c}15`, botão de resgate `padding: 8px 14px`, radius 12, fundo sólido na cor, mono 700/12 ("1000 pts"). Bloqueado: borda 0.08, `opacity: 0.65`, pts mono `rgba(255,255,255,0.55)` + "653 pts faltam" 9. Ícone 44 radius 12 `{c}25`/borda `{c}50` emoji 20. Itens: "R$ 50 no cashless / créditos no próximo evento" 1000pts (verde, disp.) / "Upgrade VIP grátis" 2500pts (amber, bloq.) / "Camisa PulsePass / edição limitada" 5000pts (violeta, bloq.) / "Frete grátis na loja / merchandise" 800pts (cyan, disp.).

**Como ganhar:** card `padding: 14`, radius 16, `background: linear-gradient(135deg, rgba(0,255,133,0.10), rgba(34,211,238,0.06))`, `border: 1px solid rgba(0,255,133,0.2)`; `.pp-label` verde; linhas 12 com divisor 0.04: "A cada R$ 1 em ingresso +5 pts" / "A cada R$ 1 cashless +3 pts" / "Check-in confirmado +50 pts" / "Indicar amigo +200 pts" (valores mono 700 verdes).

---

# PADRÕES GLOBAIS

## P1. Fundo e atmosfera
Toda tela é 390×844 sobre `#06070A` com o componente **Aurora** (4 radial-gradients coloridos, `blur(40px) saturate(160%)`, intensidade 0.4–1.2 conforme o "peso" da tela: telas de lista usam 0.4–0.5, telas de dinheiro/hero 0.7, onboarding 1.2). Telas com hero de imagem (Evento, GuestSignup, CasaProfile) trocam a Aurora por um bg radial próprio + fade `linear-gradient(180deg, transparent X%, #06070A ~95%)` para fundir com o fundo.

## P2. Escala de glass (3 níveis de superfície)
1. **Linha/lista:** `background: rgba(255,255,255,0.03–0.04)` + `border: 1px solid rgba(255,255,255,0.06–0.08)` + `backdropFilter: blur(20px)`; radius 14–18.
2. **Card médio:** `rgba(255,255,255,0.04–0.06)` + borda 0.08–0.10 + `boxShadow: inset 0 1px 0 rgba(255,255,255,0.08)`; radius 16–20.
3. **Sheet/hero glass:** `rgba(11,13,18,0.55–0.9)` + `backdropFilter: blur(30–40px) saturate(180%)` + `border: 1px solid rgba(255,255,255,0.14)` + `boxShadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 12–20px 32–40px rgba(0,0,0,0.4–0.5)`; radius 22–28.
O highlight `inset 0 1px 0 rgba(255,255,255,0.08–0.18)` no topo é a marca do liquid-glass — presente em quase toda superfície elevada.

## P3. Headers de tela
Padrão: `padding: 8px 20px 0`, flex space-between. Esquerda: `.pp-eyebrow` (mono 11, letterSpacing 0.18em, uppercase, verde — ou cor do contexto) em cima + título `--pp-font-display` 700, 24–28px, letterSpacing −0.02/−0.025em, marginTop 2. Direita: botão circular 38×38 (`background: rgba(255,255,255,0.06)`, `backdropFilter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.10)`, ícone stroke #fff 18) ou badge de status. Sobre imagem, os círculos ficam `rgba(0,0,0,0.4)` + blur 16 + borda 0.14.

## P4. Título com serif itálico
Assinatura tipográfica: título display 700 com uma palavra/frase em `var(--pp-font-serif)` italic 400, quase sempre `#00FF85` e ~2–8px menor. Ex.: "Boa noite, *Erick*", "Pague com Pix *e seu ingresso é seu.*", "Zero fila *no bar.*", "Seu ingresso *chegou.*", "*3 noites* à frente", "*São Paulo*". Citações/recados também usam serif itálico verde.

## P5. CTA primário
Gradiente vertical claro→cor: `linear-gradient(180deg, #4DFFA8, #00FF85)` (variante promoter: `linear-gradient(180deg, #C4B5FD, #A78BFA)`), texto escuro na cor (`#003C1F` verde / `#1A0040` violeta), fontWeight 700, fontSize 14–15, altura 54–56, radius 16–18 (999 quando pill inline), `boxShadow: 0 8–12px 24–32px rgba({cor},0.4), inset 0 1px 0 rgba(255,255,255,0.4)`. Duas variantes de layout: centrado com seta (gap 8–10) ou space-between (`padding: 0 22px`, valor + seta). CTA branco (`#fff`/`#06070A`) reservado para pós-sucesso. Botão secundário: `rgba(255,255,255,0.05–0.10)` + `border: 1px solid rgba(255,255,255,0.12–0.14)` + texto #fff 600.

## P6. CTA/barra fixa no rodapé
Três receitas: (a) barra full-bleed com fade `linear-gradient(180deg, transparent, rgba(6,7,10,0.95) 30%)` e `padding: 14px 20px 24–30px` contendo resumo + botão (Evento); (b) botão flutuante absolute `bottom: 14, left: 14, right: 14` (Promoter); (c) barra-cartão com margem 14 e fundo tintado da cor de ação (carrinho do bar). Telas com TabBar reservam spacer final de 80–110px.

## P7. Seleção e estados
- **Selecionado:** fundo tintado `rgba(0,255,133,0.06–0.10)` + `border: 1.5px solid rgba(0,255,133,0.4–0.6)` (ou cor cheia) + glow `0 0 20–24px rgba(0,255,133,0.18–0.2)`; valor/texto vira verde.
- **Radio:** círculo 20–22; marcado = `border: 6px solid {cor}` + `background: #06070A`; desmarcado = `border: 1.5px solid rgba(255,255,255,0.25)`.
- **Desabilitado/esgotado/bloqueado:** `opacity: 0.4–0.65` (+ grayscale em emojis).
- **Adicionar novo:** `border: 1px dashed rgba(255,255,255,0.18–0.25)` + "+".
- **Campo válido:** `border: 1px solid rgba(0,255,133,0.3)` + check verde strokeWidth 3.
- **Foco de input:** `border: 1.5px solid rgba(0,255,133,0.3)` + `boxShadow: 0 0 16–20px rgba(0,255,133,0.12–0.15)`.
- **Live/tempo real:** `.pp-pulse-dot` (6–8px, animation pp-pulse-ring 1.6s) + label; urgência usa amber (`rgba(255,184,0,0.10)` + `#FFD15C`), avisos amber, info cyan, erro/esgotado red.

## P8. Chips e pills
Sempre `borderRadius: 999`. Filtro: `padding: 6–8px 12–14px`, 12/600; ativo verde sólido (`#00FF85`/`#003C1F`) ou tintado (`rgba(0,255,133,0.14)` + texto verde + borda 0.3); inativo `rgba(255,255,255,0.04–0.06)` + borda 0.08–0.1. Segmented control: container `padding: 3–4`, radius 999, `rgba(255,255,255,0.05)` + borda 0.08; item ativo verde sólido com texto `#003C1F`. Badges de status = componente **PBadge** (tabela §0.8).

## P9. Listas (transações, convidados, notificações, eventos)
Receita: linha flex gap 10–12, `padding: 8–14px`; ícone/avatar quadrado 36–44 radius 10–12 com **fundo `{cor}18–30` + borda `{cor}40–80`** (hex+alpha concatenado); centro com título 13–14/600 + sub 11–12 `rgba(255,255,255,0.5–0.55)` marginTop 2–3; direita com valor mono 700 e/ou timestamp mono 9–10 `rgba(255,255,255,0.4)`. Cards independentes usam glass nível 1; listas densas usam apenas `borderBottom: 1px solid rgba(255,255,255,0.04–0.05)`.

## P10. Dinheiro e números
Sempre `--pp-font-mono` 700. Displays grandes (42–72px): prefixo "R$" e decimais rebaixados (~45% do tamanho, `rgba(255,255,255,0.55–0.6)`), inteiro branco com `textShadow: 0 0 32–40px #00FF8560–80`. Crédito = verde com "+"; débito = branco com "−". Grátis = "LIVRE" mono verde. Datas em bloco: dia display 700/18–22 + mês mono 8–9 uppercase na cor de acento.

## P11. Ticket premium (moldura cônica)
Ingressos "vivos" usam moldura `padding: 2` com `background: conic-gradient(from 90deg, #00FF85, #22D3EE, #A78BFA, #FF3D88, #00FF85)`, radius externo 22–26 e glow `0 20–30px 40–60px -10/-20px rgba(0,255,133,0.35–0.4), 0 0 40–60px rgba(0,255,133,0.18–0.25)`; interior `rgba(11,13,18,0.9)` blur 40 radius −2. Perfuração: `border dashed rgba(255,255,255,0.15)` + círculos 20 `#06070A` nas bordas. QR sempre em card branco (`padding: 14–18`, radius 18–28) com módulos `#06070A` e selo central com `border: 3px solid #fff`.

## P12. Artes de evento (Flyer)
Nunca imagem real: gradientes de 2 cores da paleta sobre `#0a0a0c` (receitas §0.7), radius 10–18 conforme tamanho, borda 0.06–0.08, overlay de leitura `linear-gradient(180deg, transparent 40–50%, rgba(0,0,0,0.7–0.85))`, tag mono uppercase sobre `rgba(0,0,0,0.5–0.6)` + blur 8. Thumbs pequenos usam a forma curta `radial-gradient({cor}, transparent), {cor2}`.

## P13. Cor semântica por contexto
Verde `#00FF85` = marca, ação, dinheiro, ao vivo. Violeta `#A78BFA` = promoter/premium (fluxo promoter troca o acento inteiro para violeta, incl. CTA). Cyan `#22D3EE` = cashless/informação. Pink `#FF3D88` = urgência/hot/VIP. Amber `#FFB800` = escassez, avisos, tier/loyalty (tela Loyalty troca o acento para amber). A técnica `{hex}{alphaHex}` (ex.: `#00FF8540`, `${c}18`, `${c}30`) é usada em todo lugar para tints.

## P14. Grid e espaçamento
Gutter horizontal fixo de **20px** (elementos flutuantes de rodapé/TabBar usam 14px). Ritmo vertical entre seções: `padding-top` 14–24px. Gaps: listas 6–12, grids 8–12. KPI = grid 3 colunas gap 8 (valor mono 700/16–18 colorido + label mono 10 uppercase letterSpacing 0.06em `rgba(255,255,255,0.5–0.55)`).

## P15. Ícones
SVG stroke (Lucide-like) 14–22px, `strokeWidth 2` (2.5 em navegação/CTAs, 3 em checks), `strokeLinecap/Linejoin: round`, cor via stroke direto. Seta padrão de CTA: `M5 12h14M13 6l6 6-6 6`. Voltar: `m15 18-6-6 6-6`. Emojis são usados como ícones ilustrativos em listas de produto/conquistas/categorias.
