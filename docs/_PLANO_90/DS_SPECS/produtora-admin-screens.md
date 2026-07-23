# DS SPEC — Telas Produtora (cockpit) & Admin da Plataforma

> Extraído literalmente dos mockups:
> - `design-system/src/iPadProdutora.jsx` (Multi-event, Financeiro, Marketing, Box Office)
> - `design-system/src/iPadProdutora2.jsx` (Time & Staff, Branding white-label, API & Webhooks)
> - `design-system/src/iPadAdm.jsx` (ADM Plataforma, Orgs, Antifraude, Suporte)
> - `design-system/src/iPadAdm2.jsx` (Audit log, Feature flags, Taxas, Financeiro da plataforma)
>
> Todos os valores (cores, gradientes, raios, sombras, tamanhos) são cópias literais do código. Constantes de cor usadas em todos os arquivos:
> `G = '#00FF85'` (verde pulse) · `V = '#A78BFA'` (violeta) · `C = '#22D3EE'` (ciano) · `PINK = '#FF3D88'` · `AMBER = '#FFB800'` · `RED = '#FF3B30'` (só admin/produtora2). Vermelho de texto suavizado: `#FF7A75`.

---

## COMPONENTES COMPARTILHADOS (produtora)

### MiniSidebar / PSide — sidebar de ícones da produtora
- Container: `width: 72`, `padding: '20px 12px'`, `borderRight: '1px solid rgba(255,255,255,0.06)'`, `background: 'rgba(11,13,18,0.4)'`, `backdropFilter: 'blur(20px)'`, flex column, `alignItems: 'center'`, `gap: 4`, `flexShrink: 0`.
- Logo SVG 32×32 (viewBox 0 0 64 64), `marginBottom: 12`: círculo `cx=32 cy=32 r=22` stroke `#00FF85` strokeWidth 2 + path de pulso `M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32` stroke `#00FF85` strokeWidth 2.5, linecap/linejoin round.
- Itens (glifos unicode como ícones): `◐ Visão (overview)`, `▦ Eventos (events)`, `⤿ Vendas (sales)`, `$ Financeiro (finance)`, `★ Marketing (marketing)`, `⊞ Box Office (boxoffice)`, `☷ Guests (guests)`, `◇ Time (team)`. Em iPadProdutora2 acrescenta: `◑ Branding (brand)`, `{} API (api)`.
- Item: `width: 48, height: 48, borderRadius: 12`, `display: grid, placeItems: center`, `fontSize: 18` (16 na variante PSide), `fontWeight: 600`, cursor pointer.
  - Selecionado: `background: 'rgba(0,255,133,0.10)'`, `border: '1px solid rgba(0,255,133,0.3)'`, `color: '#00FF85'`.
  - Não-selecionado: background transparent, `border: '1px solid transparent'`, `color: 'rgba(255,255,255,0.55)'`.

### OrgBadge / POrgBadge — pílula de organização (topbar)
- Pílula: flex, `gap: 8`, `padding: '6px 12px 6px 6px'`, `borderRadius: 999`, `background: 'rgba(255,255,255,0.05)'`, `border: '1px solid rgba(255,255,255,0.1)'`.
- Avatar: 28×28, `borderRadius: 8`, `background: 'linear-gradient(135deg, #A78BFA, #FF3D88)'`, grid center, `fontSize: 12, fontWeight: 700`, texto "AC".
- Nome: "Audio Club" — `fontSize: 12, fontWeight: 600`. Subtítulo: "SMU Produções" — `fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)'`.
- Chevron SVG 14×14 stroke `rgba(255,255,255,0.4)` strokeWidth 2, path `m6 9 6 6 6-6`.

### Topbar padrão da produtora
- `padding: '16px 24px'`, `borderBottom: '1px solid rgba(255,255,255,0.06)'`, flex space-between. Esquerda: OrgBadge. Direita: botões de ação da tela.

### Shell de página (todas as telas)
- Root: `width/height 100%`, `color: '#fff'`, `fontFamily: 'var(--pp-font-body)'`, `background: '#06070A'`, `display: flex`.
- Camada de glow absoluta (`inset: 0`) com 1–2 radial-gradients temáticos por tela sobre `#06070A` (strings exatas listadas por tela abaixo). Conteúdo em `zIndex: 1`.

### Padrão de header de conteúdo
- Eyebrow: classe `pp-eyebrow` (mono uppercase pequeno), colorida com o accent da tela via `style={{ color: ACCENT }}`.
- Título: `fontFamily: 'var(--pp-font-display)'`, `fontWeight: 700`, `fontSize: 26–30`, `letterSpacing: '-0.025em'`, `marginTop: 4` — sempre com uma palavra em `fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400` na cor de accent.

### PBadge (componente externo referenciado)
- Usado com tones: `pulse` (verde), `cyan`, `violet`, `pink`, `amber`, `red`, `neutral`; prop `dot` para bolinha pulsante.

---

# PARTE 1 — COCKPIT DA PRODUTORA

## TELA AF — Multi-Event (organização · lista de eventos) `MultiEventScreen`
**Fluxo:** produtora / eventos.

**Glow de fundo:** `radial-gradient(40% 30% at 20% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 80% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A`

**Layout (cima→baixo):** MiniSidebar (active `events`) → topbar (OrgBadge + 2 botões) → conteúdo `padding: 24`:
1. Eyebrow "organização · 7 eventos" + título "Seus eventos da *temporada*" (temporada em serif itálico `#00FF85`, fontSize 28).
2. Grid resumo `repeat(4, 1fr)`, gap 12.
3. Filtros em pílulas.
4. Grid de cards de evento `repeat(3, 1fr)`, gap 14.

**Botões da topbar:**
- Secundário "Importar de Sympla": `padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600`.
- Primário "+ Novo evento": `padding: '10px 16px', borderRadius: 12, background: 'linear-gradient(180deg, #4DFFA8, #00FF85)', color: '#003C1F', fontSize: 13, fontWeight: 700, border: none, boxShadow: '0 4px 16px rgba(0,255,133,0.35)'`.

**KPI card (padrão "top accent bar"):** `padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'`, posição relative + barra superior absoluta `height: 2, background: COR, opacity: 0.7`. Label: `fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)'`. Valor: `fontFamily: mono, fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4`.
- KPIs: "Faturamento agregado" (R$ Xk, verde) · "Ingressos vendidos" (violeta) · "Capacidade ocupada" (%, ciano) · "Eventos ativos" ("6/7", pink).

**Filtros (pílulas):** textos `'Todos · 7', 'Ao vivo · 1', 'Abertos · 4', 'Esgotados · 1', 'Rascunhos · 1'`. Pílula: `padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600`. Ativa: `background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)'`. Inativa: transparent, `color: 'rgba(255,255,255,0.55)'`, border transparent.

**Card de evento:** `borderRadius: 18, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', overflow: hidden`, flex column.
- Estado live: `border: '1.5px solid #00FF8550'` + `boxShadow: '0 0 24px rgba(0,255,133,0.18)'`. Normal: `border: '1px solid rgba(255,255,255,0.08)'`. Rascunho: `opacity: 0.6`.
- Cover `height: 110`: `radial-gradient(80% 80% at 30% 30%, TONE, transparent 60%), radial-gradient(80% 80% at 80% 80%, #A78BFA, transparent 60%), #0a0a0c` (tone `#444` se cinza/rascunho) + overlay `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))`.
- Badge de status (top 10 left 10): `padding: '4px 10px', borderRadius: 999, background: 'rgba(11,13,18,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)'`; texto `fontSize: 9, mono, fontWeight: 700, letterSpacing: '0.08em', uppercase` na cor tone. Live tem dot pulsante `pp-pulse-dot` 6×6.
- Nome no cover (bottom 10): `display font, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', lineHeight: 1.15`.
- Corpo `padding: 14`: linha data (mono 11 `rgba(255,255,255,0.6)`) × receita (mono 700 fontSize 14 `#00FF85`; rascunho `rgba(255,255,255,0.4)`). Barra de progresso: labels `sold/cap` e `%` em mono 10 `rgba(255,255,255,0.55)`; trilho `height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)'`; fill na cor tone com `boxShadow: '0 0 6px TONE80'`.
- Dados demo: Festival do Sol · equinócio (30/11/26, 2184/2300, R$ 312.500, live, verde) · Anyma all night (aberto, violeta) · KVSH no Audio (verde) · Boate Roxa · ed. 8 (violeta) · Réveillon · Skye Bar (esgotado, pink, 1500/1500) · Tropical Heat · férias (amber) · Carnaval Audio (rascunho, gray, 0 vendas).

**Estados mostrados:** live (borda+glow verde), aberto, esgotado, rascunho (opacity 0.6, cinza).

---

## TELA AG — Financeiro da produtora (saldo/payout) `FinancialScreen`
**Fluxo:** produtora / financeiro.

**Glow:** `radial-gradient(40% 30% at 80% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(34,211,238,0.06), transparent 60%), #06070A`

**Topbar:** OrgBadge + à direita texto mono `fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em'`: "Conta Asaas vinculada · 14.512.528/0001-54".

**Layout:** grid `'1.4fr 1fr'` gap 14 (hero de saldo + coluna de mini-KPIs) → card de tabela de movimentação (flex: 1).

**Hero de saldo (card gradiente "glass premium"):**
- `padding: 26, borderRadius: 22, background: 'linear-gradient(135deg, rgba(0,255,133,0.18), rgba(34,211,238,0.10) 60%, rgba(167,139,250,0.14))', border: '1px solid rgba(0,255,133,0.3)', backdropFilter: 'blur(30px) saturate(180%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 32px rgba(0,255,133,0.15)'`.
- Orbe decorativo: absoluto `top: -60, right: -60, width/height: 280, borderRadius: '50%', background: 'radial-gradient(circle, #00FF8540, transparent 70%)', filter: 'blur(30px)'`.
- Eyebrow verde: "Saldo disponível para saque".
- Valor: mono `fontWeight: 700, fontSize: 56, letterSpacing: '-0.03em'` — "R$" em `fontSize: 24 color rgba(255,255,255,0.55)`, "184.320" com `textShadow: '0 0 40px #00FF8550'`, ",00" em `fontSize: 26 color rgba(255,255,255,0.6)`.
- Microcopy: "após repasse PulsePass · taxa 4,9% + R$ 1,49" (`fontSize: 13, color: 'rgba(255,255,255,0.7)'`).
- CTA branco "Sacar via Pix · 5min": `padding: '12px 22px', borderRadius: 14, background: '#fff', color: '#003C1F', fontWeight: 700, fontSize: 14` + ícone Pix (losangos SVG).
- CTA escuro "Antecipar D+30 · taxa 3,2%": `background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', fontWeight: 600, fontSize: 13, backdropFilter: 'blur(12px)'`.

**Mini-KPIs (padrão "left accent bar"):** `padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'` + barra esquerda absoluta `width: 3, background: COR`; conteúdo com `paddingLeft: 8`. Label mono 10 uppercase; valor mono 700 fontSize 20; sub `fontSize: 11` na cor.
- "A receber em 30d" R$ 92.480 · "Anyma + KVSH" (violeta) / "Bloqueado (chargeback)" R$ 1.840 · "2 pendências" (pink) / "Sacado este mês" R$ 247.300 · "4 saques" (ciano).

**Tabela de movimentação:** card `padding: 18, borderRadius: 18` glass padrão. Título display 600 fontSize 18 "Movimentação · últimos 30 dias" + filtros pílula `'Tudo', 'Entradas', 'Saídas', 'Antecipações'` (`padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600`; ativa `background: 'rgba(255,255,255,0.08)'`).
- Head: `padding: '8px 14px'`, grid `'90px 1fr 130px 130px 110px'` gap 12, `background: 'rgba(255,255,255,0.025)', borderRadius: 10`, texto mono 10 uppercase `letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)'`. Colunas: Data · Descrição · Evento · Valor · Status.
- Row: `padding: '12px 14px'`, mesma grid, `borderBottom: '1px solid rgba(255,255,255,0.04)'` (exceto última), fontSize 12. Data mono `rgba(255,255,255,0.55)`; descrição `fontWeight: 600`; evento `rgba(255,255,255,0.7)` fontSize 11; valor mono 700 fontSize 13 — entradas verdes `#00FF85` com prefixo `+R$`, saídas brancas com `−R$`; status via PBadge (`aprovado`→pulse, `liquidado`→cyan, `pendente`→amber).
- Copy de linhas: "Vendas Festival do Sol · D+2", "Saque via Pix · BB CC 23104", "Antecipação D+30 · taxa 3.2%", "Chargeback · estorno", "Comissão promoter Lia · pago", "Vendas KVSH · D+2", "Saque via Pix · BB".

---

## TELA AH — Marketing / Cupons `MarketingScreen`
**Fluxo:** produtora / marketing.

**Glow:** `radial-gradient(40% 30% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), #06070A` — accent da tela é PINK `#FF3D88`.

**Topbar:** botão primário rosa "+ Nova campanha": `padding: '10px 16px', borderRadius: 12, background: '#FF3D88', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(255,61,136,0.35)'`.

**Header:** eyebrow rosa "Marketing"; título "Cupons · campanhas · *conversão*" (conversão serif itálico rosa, fontSize 28).

**Layout:** grid `'1.4fr 1fr'` gap 14.

**Coluna esquerda — Cupons ativos:** card glass `padding: 20, borderRadius: 18`. Título "Cupons ativos · 4" + nota "Auto-virada por uso" (`fontSize: 11, rgba(255,255,255,0.5)`).
- Card de cupom: `padding: 14, borderRadius: 14, background: 'TONE08', border: '1px solid TONE30'` (hex + alpha-suffix), flex gap 14.
- Chip do código (estilo ticket): `padding: '10px 14px', borderRadius: 12, background: 'rgba(11,13,18,0.5)', border: '1px dashed rgba(255,255,255,0.2)', fontFamily: mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.1em', color: TONE, minWidth: 110, textAlign: center`.
- Meio: descrição `fontSize: 13, fontWeight: 600` + linha "desconto:" (mono 10 `0.55`) valor (mono 700 12 na cor) "· expiração" (mono 10 `0.45`).
- Direita (width 130): usos/max em mono 10 + barra `height: 5, borderRadius: 99` fill TONE com `boxShadow: '0 0 6px TONE80'` (40% quando max `∞`).
- Cupons: `SOL10` "Festival do Sol · 10% off no 1º lote" 412/500 10% "até 25/11" (verde) · `INDIQUE` "Indicação amigo · R$ 20 cashback" 187/∞ R$ 20 "sem expiração" (violeta) · `IMPRENSA` "Cortesia imprensa · 100% off" 14/20 100% "até 30/11" (pink) · `MULHER22` "Solo mulheres · meia até 22h" 89/200 50% "evento ativo" (amber).

**Coluna direita:**
1. **Campanha ativa · push** (card glass padding 18 r18): mock de notificação `padding: 14, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)'` — "PulsePass · agora" (mono 11), "🔥 Anyma — abriu venda" (700, 14), "2º lote a R$ 90 · termina às 23h59. SOL10 dá 10% off." (12, `0.7`). Funil 3 colunas: Recebida 12.480 (branco) / Aberta 4.382 (violeta) / Converteu 847 (verde) — mini-cards `padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: center`, valor mono 700 16, label mono 9 uppercase. Callout verde: `padding: 10, borderRadius: 10, background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)', fontSize: 11` — "Taxa de conversão **19,3%** · 4,2× a média da plataforma".
2. **Canais conectados** (card glass, flex: 1): linhas `padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'` com ícone-box 32×32 `borderRadius: 8, background: 'COR20', border: '1px solid COR40'`, label 12/600 com ellipsis, sub 10 `0.5`, e **toggle** 32×18 `borderRadius: 99` — on: `background: '#00FF85'` + `boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2), 0 0 8px #00FF8550'`; knob 14×14 branco `left: 16` (off: `left: 2`), `boxShadow: '0 1px 2px rgba(0,0,0,0.3)', transition: 'left 0.2s'`.
   - Canais: 🔔 "Push (12.4k seguidores)" / "iOS + Android · expo-notifications" (on) · 📧 "E-mail (8.2k)" / "Resend · domain audioclub.com" (on) · 💬 "WhatsApp Business" / "meta cloud · template aprovado" (on) · 📷 "Instagram Stories" / "auto-post via integração" (off) · g "Google Events Ads" / "reach 28k/semana · CTR 4.2%" (on).

---

## TELA AI — Box Office (venda presencial / maquininha) `BoxOfficeScreen`
**Fluxo:** produtora / box office (bilheteria física).

**Glow:** `radial-gradient(40% 30% at 50% 10%, rgba(0,255,133,0.10), transparent 60%), #06070A`

**Layout:** MiniSidebar (boxoffice) → conteúdo em 2 colunas: área de seleção (flex: 1, padding 24) + painel de comanda fixo à direita (`width: 340, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)', padding: 20`).

**Header:** eyebrow verde "Bilheteria física · Portaria 1"; título "Festival do Sol · vendas no balcão" (26). Pílula do operador: `padding: '8px 14px 8px 10px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)'` + dot 6×6 verde `boxShadow: '0 0 8px #00FF85'` + "OPERADOR · MARIA T." (mono 11 verde 600).

**Seletor de lote** (label classe `pp-label` "Lote selecionado"; grid 3 col gap 12): card `padding: 18, borderRadius: 18`; selecionado: `background: 'TONE12', border: '1.5px solid TONE', boxShadow: '0 0 24px TONE25'`; normal: glass padrão. Nome `fontSize: 14, fontWeight: 700` (na cor se sel) — "Pista · presencial" R$ 110 (verde), "Premium · presencial" R$ 200 (violeta, sel), "Camarote VIP · presencial" R$ 400 (pink). Preço mono 700 fontSize 28 `letterSpacing: '-0.02em'`. Sub mono 11: "+ R$ X taxa · restam N".

**Quantidade + Cliente** (grid 1fr 1fr): cards glass padding 18 r18.
- Stepper: botões 50×50 `borderRadius: 14` — menos: `background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', fontSize: 22`; mais: `background: '#00FF85', color: '#003C1F', fontWeight: 700`. Número central mono 700 fontSize 48.
- Cliente: label "Cliente (opcional · CPF na nota)"; input fake `height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)'` com ícone user, placeholder "CPF do cliente" (13, `0.6`), botão chip "Sem CPF": `padding: '4px 10px', borderRadius: 8, background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.3)', color: '#00FF85', fontSize: 11, fontWeight: 600`.

**Forma de pagamento** (grid 4 col gap 10): card `padding: 16, borderRadius: 16`; sel: `background: 'COR10', border: '1.5px solid COR', boxShadow: '0 0 20px COR20'`. Ícone-box 38×38 r10 (`COR25` se sel) + radio 18×18: sel `border: '5px solid COR', background: '#06070A'`; off `border: '1.5px solid rgba(255,255,255,0.25)'`. Opções: 💳 "Cartão · maquininha" / "1× s/ ou 4× s/ juros" (ciano, sel) · ◇ "Pix · QR balcão" / "aprovado em 3s" (verde) · ◈ "Cashless on the spot" / "cliente tem saldo" (violeta) · $ "Dinheiro" / "troco anotado" (amber).

**Painel comanda (direita):**
- Label `pp-label` "Comanda atual". Card `padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.04)'`: item "2× Pista Premium" — "R$ 400,00" (mono 700 14). Separador `borderTop: '1px dashed rgba(255,255,255,0.12)'`. Subtotal R$ 400,00 / "Taxa serviço (10%)" R$ 40,00 (fontSize 11, `0.65`). Total: "Total" 14/700 × valor mono 700 fontSize 26 — "R$ **440**,00" com 440 em `#00FF85` e centavos em `rgba(255,255,255,0.55)`.
- Card maquininha: `padding: 14, borderRadius: 14, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)'` — 📟 "Maquininha · Stone P2" (12/600), "BT conectada · serial 30482" (mono 10), dot verde 6×6.
- CTA gigante "Cobrar R$ 440,00": `width: 100%, height: 60, borderRadius: 18, background: 'linear-gradient(180deg, #4DFFA8, #00FF85)', color: '#003C1F', fontWeight: 700, fontSize: 16, boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'` + seta →.
- Secundário "Cancelar comanda": `height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 600`.

---

## TELA AR — Time & Staff (matriz de permissões) `TeamStaffScreen`
**Fluxo:** produtora / time. Accent: VIOLETA `#A78BFA`.

**Glow:** `radial-gradient(40% 30% at 20% 10%, rgba(167,139,250,0.08), transparent 60%), #06070A`

**Topbar:** botão primário violeta "+ Convidar pessoa": `borderRadius: 12, background: 'linear-gradient(180deg, #C4B5FD, #A78BFA)', color: '#1A0040', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(167,139,250,0.35)'`.

**Layout master-detail:** lista à esquerda (`width: 380, borderRight: '1px solid rgba(255,255,255,0.06)'`) + detalhe à direita (flex: 1, padding 24).

**Lista:**
- Eyebrow violeta "Time · 8 pessoas"; título "Quem opera *com você*" (22, "com você" serif itálico violeta).
- Filtros: `'Todos · 8', 'Internos · 7', 'Externos · 1'` — `padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600`; ativa `background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)'`; inativa `background: 'rgba(255,255,255,0.04)', border: rgba(255,255,255,0.08)`.
- Row de pessoa: `padding: '12px 20px'`, selecionada: `background: 'rgba(167,139,250,0.06)', borderLeft: '3px solid #A78BFA'` (não-sel: borderLeft transparent 3px), `borderBottom: '1px solid rgba(255,255,255,0.04)'`. Avatar circular 38×38 `background: 'linear-gradient(135deg, COR, COR99)', border: '1.5px solid rgba(255,255,255,0.08)'` com inicial 14/700. Status online: dot 10×10 verde `border: '2px solid #06070A', boxShadow: '0 0 6px #00FF85'` no canto do avatar. Nome 13/600; badge "EXT" para externos: `padding: '1px 6px', borderRadius: 4, background: 'rgba(255,184,0,0.15)', color: '#FFB800', fontSize: 8, mono 700, letterSpacing: '0.06em'`. Role 11 `0.55`; last-seen mono 10 `0.4` à direita.
- Pessoas/roles: Erick Berberian (Owner), Júlia Pereira (Admin, sel), Marcos Silva (PDV Operator), Maria Tavares (Box Office), João Tonon (Door Police, live), Lia Coelho (Promoter Tier 3, external), Pedro Almeida (Marketing), Beatriz Costa (Financial).

**Detalhe (Júlia):**
- Card de perfil: `padding: 18, borderRadius: 18, background: 'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(255,255,255,0.02))', border: '1px solid rgba(167,139,250,0.25)'`. Avatar 64×64 gradiente violeta, letra 28/700 display. Nome display 700 22. Meta mono 12: "julia@smu.fun · Admin · 2FA ativo". Badges: `PBadge violet` "Admin", `PBadge pulse dot` "online", `PBadge cyan` "SSO Google". Ações: "Forçar logout" (ghost 12/600, r10) e "Remover" (`background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF7A75'`).
- Matriz de permissões: card glass r18; título "Permissões · matriz granular" (display 600 16) + contador mono 11 "3 das 13 ativas". Grid 2 colunas gap 8. Item: `padding: '10px 14px', borderRadius: 12`; ativo: `background: '#A78BFA10', border: '1px solid #A78BFA30'`, chave mono 10 violeta; inativo: glass `0.03/0.06`, chave `rgba(255,255,255,0.45)`. Label 12. Toggle 32×18 (violeta quando on).
- Permissões (chave → label): `events` "Eventos · CRUD", `sales` "Vendas · leitura", `finance` "Financeiro · ver", `finance:withdraw` "Sacar · 2FA", `pdv` "PDV · operar", `pdv:close` "PDV · fechar caixa", `boxoffice` "Box Office presencial", `door:scan` "Porta · check-in", `guests` "Guest list · gerenciar", `guests:read` "Guest list · ver", `marketing` "Marketing · campanhas", `team` "Time · convidar", `promoter:own` "Promoter · própria lista".
- Callout amber: `padding: 12, borderRadius: 12, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)'` + escudo SVG amber — "Permissão **finance:withdraw** requer aprovação do Owner + 2FA WebAuthn." Botão "Solicitar": `background: '#FFB800', color: '#06070A', borderRadius: 8, fontSize: 11, fontWeight: 700`.

---

## TELA AS — Branding white-label `BrandingScreen`
**Fluxo:** produtora / branding. Accent: PINK.

**Glow:** `radial-gradient(50% 40% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), radial-gradient(50% 40% at 20% 90%, rgba(167,139,250,0.10), transparent 60%), #06070A`

**Topbar:** "Reverter" (ghost) + "Publicar branding" (primário verde `linear-gradient(180deg, #4DFFA8, #00FF85)`, `color: '#003C1F'`, sombra verde padrão).

**Layout:** grid `'1fr 1fr'` gap 18 — controles à esquerda, preview ao vivo à direita.

**Esquerda:**
1. Header: eyebrow pink "Branding · white-label"; título "Sua casa, *sua cara.*" (26, serif itálico pink); sub 12 `0.6`: `Domínio próprio · paleta · logo · até remover "powered by PulsePass" (Enterprise)`.
2. **Domínio customizado** (card glass r16 padding 16, `pp-label`): input fake `height: 46, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,133,0.3)'` — "https://" mono 13 `0.55` + "ingressos.audioclub.com.br" mono 14 branco 600 + à direita "SSL · A+" mono 10 verde com dot glow.
3. **Logo + paleta** (card glass): logo-tile 120×120 `borderRadius: 16, background: 'linear-gradient(135deg, #A78BFA, #FF3D88)'`, "AC" display 800 fontSize 36 `letterSpacing: '-0.04em'`, `border: '2px solid rgba(255,255,255,0.14)', boxShadow: '0 12px 32px #A78BFA30'`. Swatches (aspectRatio 1, r10, `boxShadow: '0 0 16px COR40'`): primary `#A78BFA`, accent `#FF3D88`, dark `#0A0510`, light `#F8F5FF` — label + hex mono 9. "Display font" box: `padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.3)'`, texto "Space Grotesk" display 700 16.
4. **Personalização avançada** (toggles, mesmo padrão de toggle 32×18 verde): `Remover "powered by PulsePass"` / "apenas em Enterprise" (on) · "E-mails com domínio próprio" / "noreply@audioclub.com.br · DKIM ✓" (on) · "PWA instalável (ícone na home)" / "manifest.json gerado automaticamente" (on) · "Background music ao abrir" / "autoplay com mute · respeita user pref" (off) · "Dark mode personalizado" / "6 esquemas pré-prontos" (on).

**Direita — Preview ao vivo:** card `background: 'rgba(255,255,255,0.025)'` r18. Alternador 📱/💻 (chips r8, ativo `rgba(255,255,255,0.1)`). Browser frame: r14 `background: '#0A0510'`; barra de endereço `background: '#15081B'` com 3 dots macOS (`#FF5F57`, `#FFBD2E`, `#28C840`) e URL pill `background: 'rgba(0,0,0,0.4)'` mono 11 com dot verde. Mock do site: `background: 'linear-gradient(180deg, #A78BFA25, #FF3D8815)'`; header com logo mini 28×28 e nav "eventos fotos contato"; hero "Audio Club / *essa semana*" (display 700 28, serif itálico pink); grid 3 posters `aspectRatio: '3/4'`, r8, `background: 'radial-gradient(C1, transparent), C2'` com overlay escuro e data mono 8 pink / título display 10 / preço mono 9 verde. Rodapé: `powered by · removido (Enterprise)` (verde) + "SSL ✓" — barzinha mono 9.

---

## TELA AT — API & Webhooks `ApiWebhooksScreen`
**Fluxo:** produtora / integrações. Accent: CIANO `#22D3EE`.

**Glow:** `radial-gradient(50% 40% at 20% 10%, rgba(34,211,238,0.08), transparent 60%), #06070A`

**Topbar:** texto mono 11 "API v2.4 · docs.pulsepass.app" + botão "+ Nova API key": `borderRadius: 12, background: 'linear-gradient(180deg, #22D3EE, #0891B2)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 16px rgba(34,211,238,0.35)'`.

**Header:** eyebrow ciano "Integrações"; título "API keys · webhooks · *conexões*" (26).

**KPIs (top accent bar, 4 col):** "Requests 24h" 184k / "99.97% success" (verde) · "p99 latency" 142ms / "SLA 500ms" (ciano) · "Webhooks ativos" 8 / "2 com falha" (amber) · "Rate limit" 60% / "600/1000 req/min" (violeta). Label mono 9 uppercase; valor mono 700 22; delta 10 na cor.

**Grid `1fr 1fr`:**
1. **API keys · 4** (card glass r18): item `padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'` — nome 13/600 + PBadge de scope (red=all server, violet=read, amber=all staging, cyan=mobile); key mascarada em code-box `padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.4)'` mono 11 (`pp_live_sk_***...4j2k` etc.); footer mono 10 com last-use + ações "copiar" (verde) · "revogar" (`#FF7A75`).
2. **Webhooks** (card glass): nota "HMAC SHA-256 · retry 5×". Item `padding: 10, borderRadius: 12` — dot de status 6×6 com `boxShadow: '0 0 6px COR'`; URL mono 11 ellipsis; stats mono 10; chips de evento `padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', fontSize: 9 mono` (`order.paid`, `order.refund`, `user.signup`, `guest.checkin`, `payout.completed`, `*`, `sale.live`, `checkin.live`). Falha: `border: '1px solid rgba(255,59,48,0.25)'` + barra esquerda 3px vermelha.
3. **Integrações nativas · 1-click** (faixa inferior, "5 de 18 conectadas"): chips pill `padding: '8px 14px', borderRadius: 999`; on: `background: '#00FF8510', border: '1px solid #00FF8540', color: '#00FF85'` + check SVG; off: `background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)'`. Lista: Asaas 💰, Sympla import 🎟️, Resend 📧, Cloudflare R2 ☁️, Sentry 🐛 (on) / Meta Pixel, Google Analytics, Zapier ⚡, Make.com ⚙, Spotify (lineup) 🎵, Stripe (intl) (off).

---

# PARTE 2 — ADMIN DA PLATAFORMA (PulseADM)

## COMPONENTES COMPARTILHADOS (admin)

### AdmSidebar / AdmSide — sidebar larga com labels
- `width: 220, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)'`, flex column gap 4.
- Logo: SVG 28×28 com stroke **PINK `#FF3D88`** (strokeWidth 2.5) + wordmark "Pulse**ADM**" (display 700 15, "ADM" em pink) + sub "SUPER-ADMIN" mono 9 pink `letterSpacing: '0.12em'`.
- Section label "Operação": mono 10 uppercase `letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', padding: '6px 12px'`.
- Itens: ◐ Plataforma (platform) · ◇ Orgs · ⚠ Antifraude (fraud) · $ Financeiro (finance) · ◔ Suporte (support) · ◉ Audit log (audit) · % Taxas (fees) · ⚑ Feature flags (flags).
- Item: `padding: '10px 12px', borderRadius: 10, fontSize: 13`, flex gap 10; sel: `background: 'rgba(255,61,136,0.10)', border: '1px solid rgba(255,61,136,0.25)', color: '#FF3D88', fontWeight: 600`; off: `color: 'rgba(255,255,255,0.7)', fontWeight: 500`. Glifo `fontSize: 14, opacity: 0.85, width: 14`.
- Rodapé (marginTop auto): card do admin `padding: 12, borderRadius: 12, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)'` — avatar 28×28 circular `background: '#FF3B30'` "EB"; "Erick B." 12/600; "SSO · ADM-7" mono 9 `#FF7A75`.

### AdmTopBar / AdmTop — barra de segurança
- `padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)'`, flex space-between.
- Pílula de cadeado: `padding: '6px 12px 6px 8px', borderRadius: 999, background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.28)'` + SVG cadeado stroke `#FF3B30` — texto "MODO ADMINISTRATIVO · TUDO É TRILHADO" mono 10 `#FF7A75` 600 `letterSpacing: '0.08em'`.
- Breadcrumb/contexto: `fontSize: 12, color: 'rgba(255,255,255,0.55)'` (prop `where`).
- Direita: chip "p99 · 142ms" (`padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)'` mono 11) + chip "status OK" (`background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)'`, mono 11 verde, dot 5×5 verde glow).

---

## TELA AJ — Dashboard da Plataforma `AdmPlatformScreen`
**Fluxo:** admin / visão geral. Accent: PINK.

**Glow:** `radial-gradient(40% 30% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A`
**Topbar where:** "Multi-tenant · todas as orgs · tempo real".

**Header:** eyebrow pink "ADM PulsePass"; título "A plataforma *respira.*" (30, serif itálico pink).

**KPIs (5 col, top accent bar, valor com `letterSpacing: '-0.02em'`):** "GMV 24h" R$ 4,2M / "+18% vs ontem" (verde) · "Take rate" 4,9% / "R$ 207k receita" (pink) · "Eventos ao vivo" 47 / "em 12 cidades" (violeta) · "Transações/s" 184 / "pico 612 às 21h" (ciano) · "Fraude bloqueada" R$ 8,4k / "32 tentativas" (amber).

**Grid `1.5fr 1fr`:**
1. **GMV hoje** (card glass r18 padding 20): título display 600 18 + sub "histórico de 24h em todas as orgs"; valor à direita mono 700 22 verde "R$ 4.184.320". Area chart SVG `viewBox 0 0 700 220 preserveAspectRatio none`: gridlines `rgba(255,255,255,0.05)`; área com gradiente vertical pink 0.4→0; polyline pink `strokeWidth 2.5` round; ponto final `r=5` pink + halo `r=10 opacity 0.3`. Eixo X mono 10 `0.4`: 00h 04h 08h 12h 16h 20h agora.
   - **Distribuição por cidade · top 6** (barras horizontais): linha = nome (width 110, 11, `0.8`) + trilho `height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.05)'` + fill colorido com glow `0 0 6px COR80` + valor mono 11 600 (width 80, right) + % mono 10 `0.5` (width 36). São Paulo R$ 1840k 44% verde / Rio 720 17% violeta / BH 480 11% ciano / Brasília 320 8% pink / Salvador 260 6% amber / "Outras (8)" 564 14% `rgba(255,255,255,0.3)`.
2. **Alertas ao vivo · 4** (card glass): label amber + `pp-pulse-dot` 7×7 amber. Alerta: `padding: '8px 10px', borderRadius: 10, background: 'COR08', border: '1px solid COR25'`, dot 8×8, msg 12, tempo mono 10 `0.4`. Itens: "Audio Club · cap. 95% Pista" 2min (amber) · "12 chargebacks · Bar Cocó" 8min (red) · "Webhook Asaas atraso 480ms" 14min (ciano) · "Promoter banido auto-detect" 32min (pink).
3. **Top orgs · GMV 24h** (card glass flex 1): linha rank (mono 11 `0.45` width 18) + nome 12/600 + "N ev" mono 11 `0.5` + GMV mono 700 12 colorido; `borderBottom: '1px solid rgba(255,255,255,0.04)'`. Audio Club 312 / Boate Roxa 247 / Cervejaria Aurora 184 / Skye Bar 142 / Festival Pampulha 98 / "Outras 248 orgs" 3201 (cinza).

---

## TELA AK — Organizações (multi-tenant health) `AdmOrgsScreen`
**Fluxo:** admin / orgs. Accent: VIOLETA.

**Glow:** `radial-gradient(40% 30% at 80% 10%, rgba(167,139,250,0.06), transparent 60%), #06070A`
**Topbar where:** "248 organizações ativas · 12 em revisão".

**Header:** eyebrow violeta "Organizações"; título "248 orgs · saúde global" (26). Botões: "📥 Exportar" (ghost) + "+ Cadastrar org" (primário pink sólido `background: '#FF3D88'`, sombra `0 4px 16px rgba(255,61,136,0.35)`).

**Resumo de saúde (4 col, padrão "tinted card"):** `padding: 14, borderRadius: 14, background: 'COR08', border: '1px solid COR25'` — label mono 10 uppercase `0.6`; valor mono 700 22 NA COR + % ao lado 11 `0.5`. Saudáveis 224 90% (verde) / Em observação 12 5% (amber) / Alto risco 8 3% (pink) / Suspensas 4 2% (red).

**Toolbar:** busca fake `flex: 1, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'` + lupa SVG + placeholder "Buscar org por nome, CNPJ ou cidade" (12, `0.5`). Chips de filtro height 40 r12: `'Risco ↓'` (ativo pink: `background: 'rgba(255,61,136,0.12)', border: '1px solid rgba(255,61,136,0.3)', color: '#FF3D88'`), `'GMV ↓', 'KYC pendente', 'Recém-criadas'`.

**Tabela (card com borda própria `borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)'`):**
- Head: `padding: '10px 16px'`, grid `'2fr 120px 70px 70px 90px 110px 100px 100px'` gap 10, `background: 'rgba(255,255,255,0.025)'`; colunas: Org · CNPJ · Cidade · Ev · GMV/mês · KYC · Plano · Risco (mono 10 uppercase `0.5`).
- Row: `padding: '12px 16px'`, zebra: linhas ímpares `background: 'rgba(255,255,255,0.015)'`. Célula Org: avatar 32×32 r8 `background: 'COR30', border: '1px solid COR50'` inicial colorida; nome 13/600; sub: flags de risco `⚠ ...` mono 9 `#FF7A75` OU "desde {idade}" mono 10 `0.45`. CNPJ/cidade mono 11; GMV mono 700 12 "R$ X.XM". KYC via PBadge: verified→pulse, pending→amber, review→red. Plano via PBadge: enterprise→violet, pro→cyan, event→pink, starter→neutral. Risco: dot 8×8 `boxShadow: '0 0 6px COR80'` + texto 12/600 capitalize — low=verde, medium=amber, high=red.
- Flags demo: "chargeback rate 2.1%" (Skye Bar), "12 chargebacks · cap. inflada" (Bar Cocó), "CNPJ < 90 dias" (Studio Bar Goiânia).

---

## TELA AL — Monitor Antifraude `AdmFraudScreen`
**Fluxo:** admin / antifraude. Accent: RED.

**Glow:** `radial-gradient(50% 40% at 80% 20%, rgba(255,59,48,0.10), transparent 60%), radial-gradient(40% 40% at 20% 80%, rgba(255,184,0,0.08), transparent 60%), #06070A`
**Topbar where:** "Engine antifraude · ML em tempo real".

**Header:** eyebrow red "Antifraude · ao vivo"; título `Engine bloqueou *R$ 8.420* em 24h` (26, valor serif itálico red). Pílula direita verde: "ML model · v7.2 · 99.4% precision" (mono 11 verde, dot glow, `padding: '8px 14px', borderRadius: 12, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)'`).

**KPIs (4 col, top accent):** "Bloqueado 24h" R$ 8.420 / "32 tentativas" (red) · "Falsos positivos" 1,2% / "4 disputas" (amber) · "Latência scoring" 78ms / "p99 142ms" (verde) · "Modelos ativos" 7 / "PIX/CC/AZ/QR/Door" (violeta).

**Grid `1.4fr 1fr`:**
1. **Incidentes recentes** (card glass; nota mono 10 "auto-refresh 1s"): incidente `padding: 12, borderRadius: 12, background: 'COR08', border: '1px solid COR25'` com **barra vertical** `width: 6, alignSelf: stretch, borderRadius: 3, background: COR`. Tipo 13/700 + tempo mono 10; detalhe mono 11 `0.65`. Direita: valor mono 700 12 + pill de score: `padding: '2px 8px', borderRadius: 999, background: 'COR20', color: COR, fontSize: 9 mono 700 uppercase` — "score 98 · bloqueado".
   - Incidentes: "PIX duplicado" / "CPF 348.***.***-22 · 4× em 90s" R$ 760 score 98 bloqueado (red) · "QR replay attack" / "PSP-3K2L · token expirado reusado" score 96 bloqueado (red) · "Velocidade compra" / "IP 187.180.* · 11 compras em 2min" R$ 1.840 score 84 review (amber) · "Chargeback cluster" / "Bar Cocó · 12 disputas Visa" R$ 3.240 score 88 org-flag (amber) · "CPF inválido" / "Inscrição lista AZ · dígitos errados" score 72 rejeitado (pink) · "Geo mismatch" / "Compra SP · QR scan Manaus" R$ 420 score 68 review (amber) · "Promoter auto-banido" / "Lia C.² · 14 contas duplicadas" score 91 banido (violeta).
2. **Tipos de fraude · 7 dias** (barras horizontais como na tela AJ, trilho `height: 6`): QR replay attack 84/36% red · PIX duplicado 52/22% pink · Chargeback cluster 38/16% amber · Velocidade compra 28/12% ciano · Geo mismatch 18/8% violeta · Outras 14/6% cinza.
3. **Regras ativas · 14** (+ link "+ regra" mono 10 verde): linha `padding: '8px 10px', borderRadius: 10` glass com **chip de categoria** `padding: '2px 6px', borderRadius: 4, background: 'COR20', color: COR, fontSize: 8, mono 700 uppercase` + texto 11 + mini-toggle 26×14 (knob 10×10). Regras: "JWT QR exp ≤ 5min" (auth, verde) · "Velocity ≥ 6 compras/2min" (velocity, ciano) · "Chargeback rate org > 1%" (org, amber) · "Geo IP vs QR scan ≠" (qr, violeta) · "CPF blacklist Receita" (kyc, red) · "Promoter contas dupl ≥ 3" (azlist, pink).

---

## TELA AM — Inbox de Suporte `AdmSupportScreen`
**Fluxo:** admin / suporte. Accent: CIANO.

**Glow:** `radial-gradient(40% 30% at 20% 10%, rgba(34,211,238,0.06), transparent 60%), #06070A`
**Topbar where:** "Inbox · 24 abertos · 184 resolvidos hoje".

**Layout master-detail:** inbox à esquerda (`width: 420, borderRight`) + detalhe do ticket (flex: 1, padding 24).

**Inbox:**
- Eyebrow ciano "Inbox de suporte"; título "24 abertos" (22). Filtros: `'Tudo · 24'` (sel ciano: `background: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: rgba(34,211,238,0.3)`), `'Alta · 8', 'SLA risco · 3', 'Meus'`.
- Card de ticket: `padding: '14px 20px'`; selecionado: `background: 'rgba(34,211,238,0.06)', borderLeft: '3px solid #22D3EE'`. Linha 1: dot unread 6×6 ciano glow + id mono 10 `0.45` (#PP-7401) + PBadge de role (cliente→pulse, produtora→cyan, promoter→violet) + tempo mono 10 à direita. Assunto 13/600 lineHeight 1.3. Quem 11 `0.5` ("Beatriz S.", "Audio Club · Audio Club"…). **Barra de SLA:** trilho `height: 4, borderRadius: 99` + fill colorido por urgência: `>80%` red, `>50%` amber, senão verde; label "SLA · 28min" mono 10 na mesma cor.
- Tickets: "Não recebi meu QR após pagar via Pix" (cliente, high, SLA 28min/90%) · "Como configurar webhook do Asaas?" (produtora) · "Saque travado · CNPJ pendente KYC" (produtora, high) · "Comissão de promoter não bateu" (promoter) · "Maquininha Stone não conecta no BoxOffice" (produtora) · "Quero cancelar compra de ingresso" (cliente, "fora SLA").

**Detalhe:**
- Header: badges `PBadge pink dot` "SLA risco" + `PBadge pulse` "cliente" + "#PP-7401 · há 2min" mono 11. Título display 700 22: "Não recebi meu QR após pagar via Pix". Sub 12 `0.55`: "Beatriz Souza · @biasouza · CPF 231.***.***-04". Ações "Assumir" / "Escalar" (ghost r10 12/600).
- Contexto do cliente (grid 4): mini-cards `padding: 12, borderRadius: 12` glass — "Pedido" #PSP-7H29 (ciano) · "Pix status" aprovado (verde) · "Tempo desde pag." 2:18 min (amber) · "Eventos no perfil" 4 (violeta). Valor mono 700 13 NA COR.
- Conversa: bolha do usuário `maxWidth: 70%, padding: 14, borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: rgba(255,255,255,0.08)`, texto 13 lineHeight 1.5; timestamp "Beatriz · 22:14" mono 10 `0.45`.
- **Card Pulse AI (sugestão):** `padding: 12, borderRadius: 12, background: 'linear-gradient(135deg, rgba(167,139,250,0.10), rgba(34,211,238,0.06))', border: '1px solid rgba(167,139,250,0.25)'`. Header "✦ Pulse AI · sugere" mono 10 uppercase violeta 600. Diagnóstico 12 `0.85`. Mensagem sugerida em code-box `padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.3)'` mono 12 `0.75`. Botões: "Aceitar e enviar" (`background: '#A78BFA', color: '#1A0040', r8, 11/700`) + "Editar" (ghost).
- Reply box: `padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(34,211,238,0.25)'`; placeholder "Sua resposta…"; botões "+ Anexo", "📋 Snippet" (ghost 11/600), "✦ AI" (`background: '#A78BFA15', border: '#A78BFA30', color violeta`); CTA "Responder · resolver ticket": `padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(180deg, #22D3EE, #0891B2)', color: '#fff', 12/700, boxShadow: '0 4px 12px #22D3EE30'`.

---

## TELA AN — Audit Log `AdmAuditScreen`
**Fluxo:** admin / audit log. Accent: VIOLETA.

**Glow:** `radial-gradient(50% 40% at 20% 10%, rgba(167,139,250,0.06), transparent 60%), #06070A`
**Topbar where:** "Audit log · imutável · WORM storage · retenção 7 anos LGPD".

**Header:** eyebrow violeta "Audit log"; título "Tudo que *aconteceu* · imutável" (28). Botão "🔗 Exportar (.jsonl + assinatura)" (ghost padrão).

**Filtros:** busca fake com query syntax placeholder `actor:erick action:org.* org:audio` + chip contador à direita `padding: '3px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.14)', border: rgba(167,139,250,0.3)` mono 10 violeta "4.2M eventos · 30d". Chips: `'Todos'` (ativo violeta), `'Críticos · 3', 'ADM only', 'Engine'`.

**Stream de log (terminal-like):** container `borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: '#0A0D14', fontFamily: 'var(--pp-font-mono)'` (fundo próprio, mais escuro que os cards).
- Head grid `'90px 1.4fr 100px 1.2fr 1.4fr 110px 130px 90px 40px'` gap 10: Timestamp · Actor · Role · Action · Target · Amount · IP/source · Hash · (status).
- Row: `padding: '10px 16px'`, fontSize 11, zebra `rgba(255,255,255,0.012)`; falha/pendente: `background: 'rgba(255,184,0,0.04)'`. Timestamp `0.6`; actor branco 600 em `var(--pp-font-body)`; role em chip `padding: '2px 6px', borderRadius: 4, background: 'COR15', color: COR, fontSize: 9, 700 uppercase`; action branco (dot-notation: `sale.complete`, `org.suspend.attempted`, `qr.scan.ok`, `fraud.block`, `guest.add`, `support.message.send`, `webhook.fired`, `wallet.recharge`, `feature.flag.update`, `org.kyc.approve`); amount verde 600 (ou `rgba(255,255,255,0.3)` quando "—"); hash `sha256:7a3b…` `0.4` fontSize 10; status dot final 6×6 (verde ok / amber glow para pendente).
- **Linha expandida de 2nd approval:** `padding: 16, background: 'rgba(255,184,0,0.06)', borderTop: '1px solid rgba(255,184,0,0.2)'` + ícone alerta amber. "Ação crítica aguardando 2nd approval" 13/600; sub 11: "Erick B. solicitou suspender **Bar Cocó CE** · 12 chargebacks detectados · requer 2 ADMs Senior". Botões: "Aprovar como 2º ADM" (`background: '#FFB800', color: '#06070A', r10, 12/700`) + "Recusar" (ghost).

---

## TELA AO — Feature Flags `AdmFlagsScreen`
**Fluxo:** admin / feature flags. Accent: VERDE.

**Glow:** `radial-gradient(50% 40% at 80% 10%, rgba(0,255,133,0.06), transparent 60%), #06070A`
**Topbar where:** "Feature flags · LaunchDarkly OSS · rollout gradual e seguro".

**Header:** eyebrow verde "Feature flags"; título "14 flags ativas · *rollout controlado*" (28). Botão "+ Nova flag": `background: '#00FF85', color: '#003C1F', r12, 13/700, boxShadow: '0 4px 16px rgba(0,255,133,0.35)'`.

**Resumo de status (5 col, tinted card com dot):** `padding: 14, borderRadius: 14, background: 'COR08', border: '1px solid COR25'`, dot 8×8 glow `0 0 8px COR`, label mono 10 uppercase, valor mono 700 18 NA COR. "GA · 100%" 5 verde / "Rollout" 3 violeta / "Canary" 4 ciano / "Dark · 0%" 2 amber / "A/B test" 1 pink.

**Grid de flags (2 col, gap 12):** card `padding: 16, borderRadius: 16` glass + **barra esquerda** absoluta `width: 4, background: COR`; conteúdo `paddingLeft: 10`.
- Chave mono 700 13 (`pulse_ai.support`, `cashless.nfc_v2`, `event.split_payment`, `door.face_recognition`, `wallet.crypto_pix`, `sympla.import`, `kds.kitchen_v3`, `promoter.ai_score`).
- Pill de status: `padding: '3px 8px', borderRadius: 999, background: 'COR20', color: COR, fontSize: 9 mono 700 uppercase` — GA (verde), rollout (violeta), canary (ciano), dark (amber), killed (red), A/B (violeta).
- Descrição 12 `0.7` lineHeight 1.4. Barra de rollout: label "rollout" mono 10 uppercase + `{pct}%` mono 700 14 na cor; trilho `height: 6, borderRadius: 99` fill com glow `0 0 8px COR80` (sem glow se 0%).
- Footer mono 10: audiência ("248 orgs", "87 orgs", "8 orgs · whitelist", "staff PulsePass"…) × idade ("há 2 dias", "há 3 sem · em revisão LGPD", "há 6m · regulatório").
- Ações: "Editar" (ghost r8 11/600); "+10% rollout" (`background: 'COR15', border: 'COR40', color: COR`) se pct<100 e não-killed; "Kill switch" (`background: 'rgba(255,59,48,0.10)', border: rgba(255,59,48,0.25), color: '#FF7A75'`) se não-killed.

---

## TELA AP — Taxas & Planos `AdmTaxesScreen`
**Fluxo:** admin / taxas (pricing da plataforma). Accent: AMBER.

**Glow:** `radial-gradient(50% 40% at 20% 10%, rgba(255,184,0,0.08), transparent 60%), radial-gradient(50% 40% at 80% 80%, rgba(34,211,238,0.06), transparent 60%), #06070A`
**Topbar where:** "Taxas, planos e split · alterações entram em vigor no próximo evento".

**Header:** eyebrow amber "Taxas & planos"; título "Como a PulsePass *monetiza*" (28).

**Cards de tier (4 col):** `padding: 18, borderRadius: 18`; selecionado (editando): `background: 'COR10', border: '1.5px solid COR', boxShadow: '0 0 28px COR25'` + tag "EDITANDO" no canto: `padding: '2px 8px', borderRadius: 999, background: COR, color: '#06070A', fontSize: 9, 700 mono, letterSpacing: '0.08em'`.
- Nome display 700 18; desc 11 `0.55`; **fee** mono 700 fontSize 36 `letterSpacing: '-0.03em'` NA COR; sub mono 11 `0.7`; rodapé "orgs ativas" × N (mono 700) com `borderTop: '1px solid rgba(255,255,255,0.06)'`.
- Tiers: Starter / "Eventos pequenos · <500 ingressos" / 7,9% "+ R$ 1,49 por ingresso" / 124 orgs (cinza `rgba(255,255,255,0.4)`) · Pro / "Casas e produtoras ativas" / 5,9% "+ R$ 0,99" / 92 (ciano) · Enterprise / "Negociação custom · split" / 4,9% "+ R$ 0,49" / 28 (violeta, SEL) · Single Event / "Festival 1× · sem mensalidade" / 8,9% "+ R$ 1,99" / 4 (pink).

**Grid `1.4fr 1fr`:**
1. **Editando · Enterprise** (card glass): sub "28 orgs nesse plano · alterações entram no próximo ciclo". Campos (grid 2 col): card `padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)'` com label mono 10 uppercase e input fake `padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid #A78BFA40'`, valor mono 700 18 + unidade 10 `0.45`. Campos: "Taxa percentual" 4,9 "% sobre GMV" · "Taxa fixa" R$ 0,49 "por ingresso" · "Antecipação D+30" 3,2 "% sobre valor" · "Cashless take" 1,8 "% sobre consumo" · "Webhook custom" R$ 0,00 "incluso" · "White label" R$ 0,00 "incluso".
   - Simulação (callout verde `rgba(0,255,133,0.06)/0.2`): "Simulação · MRR projetado"; "Take rate efetivo Enterprise hoje: **4,9%**"; "Receita MRR estimada (28 orgs): **R$ 184k/mês**" (mono 700 22 verde).
   - CTAs: "Aplicar mudanças (próximo ciclo)": `flex: 1, padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(180deg, #FFB800, #E6A600)', color: '#06070A', 13/700` + "Descartar" (ghost).
2. **Split de pagamento · regras Enterprise:** card interno violeta `padding: 16, borderRadius: 14, background: 'rgba(167,139,250,0.08)', border: rgba(167,139,250,0.25)` — "Exemplo · Festival do Sol" (mono 11 uppercase violeta). Linhas de split: quadradinho 8×8 `borderRadius: 2` colorido + label 11 + % mono 11 `0.55` + valor mono 700 11 (width 90 right): "Audio Club (org)" 88% R$ 274.000 (violeta) · "PulsePass (taxa)" 4.9% R$ 15.312 (pink) · "Promoters (comissão)" 3.3% R$ 10.450 (verde) · "Asaas (gateway)" 2.3% R$ 7.187 (ciano) · "Imposto retido (ISS)" 1.5% R$ 4.687 (amber). Total com `borderTop: '1px dashed rgba(255,255,255,0.12)'`: "GMV total" × "R$ 311.636" mono 700 18. Callout ciano: "Split executado em **tempo real** via Asaas split · cada parte vai direto pra conta certa, sem intermediário."

---

## TELA AQ — Financeiro da Plataforma `AdmFinanceScreen`
**Fluxo:** admin / financeiro (MRR/GMV/cohort). Accent: VERDE.

**Glow:** `radial-gradient(50% 40% at 20% 10%, rgba(0,255,133,0.10), transparent 60%), radial-gradient(50% 40% at 80% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A`
**Topbar where:** "Financeiro da plataforma · MRR + GMV + cohort".

**Header:** eyebrow verde "Financeiro da plataforma"; título "A PulsePass fechou *R$ 4,2M MRR.*" (30). Tabs: MRR (ativa verde `rgba(0,255,133,0.12)/0.3`), GMV, Cohort — `padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600`.

**Grid `1.4fr 1fr` (mega KPI + coluna):**
1. **Hero MRR:** `padding: 26, borderRadius: 22, background: 'linear-gradient(135deg, rgba(0,255,133,0.20), rgba(167,139,250,0.10))', border: '1px solid rgba(0,255,133,0.3)', backdropFilter: 'blur(30px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 40px rgba(0,255,133,0.15)'` + orbe `top: -80, right: -80, 320×320, radial-gradient(circle, #00FF8540, transparent 70%), blur(40px)`. Valor mono 700 **fontSize 64** `letterSpacing: '-0.035em'` — "R$" 26 `0.55` + "4,2M" com `textShadow: '0 0 50px #00FF8550'`. Delta: "+R$ 638k vs mês passado · +18%" (14, verde). Mini area chart SVG 400×80 verde (gradiente 0.5→0, polyline strokeWidth 2) com eixo jun–nov mono 10 `0.45`.
2. **KPIs laterais (left accent bar, valor à direita):** "GMV mês" R$ 87,4M / "transactional volume" (violeta) · "Net take rate" 4,8% / "após gateway+impostos" (ciano) · "Churn (orgs)" 1,8% / "4 saídas mês" (amber) · "LTV/CAC ratio" 6,4× / "pay-back 4,2m" (pink). Layout: label+desc à esquerda, valor mono 700 22 branco à direita.

**Grid `1.4fr 1fr` (parte de baixo):**
1. **Cohort · retenção mês a mês** ("% de orgs que continuam ativas após X meses"): heatmap grid `'70px repeat(7, 1fr)'` gap 4, colunas M0–M6. Célula: `padding: '8px 0', borderRadius: 6, textAlign: center, background: rgba(0, 255, 133, intensity*0.45), border: 1px solid rgba(0, 255, 133, intensity*0.5)` onde intensity = v/100; texto mono 10 700, cor `#06070A` se v>50 senão `#fff`. Linhas: mai n=48 [100,92,88,85,82,81,80] · jun n=52 · jul n=64 · ago n=71 · set n=89 · out n=102 · nov n=118 [100]. Label do mês 11/600 + "n=X" mono 9 `0.4`.
2. **Receita por plano** (tinted cards `COR08/COR25`): nome 13/700 + "N orgs" mono 10; valor mono 700 16 NA COR + % mono 10; barra `height: 4, borderRadius: 99` fill na cor. Enterprise R$ 2,4M 57% 28 orgs (violeta) · Pro R$ 1,2M 29% 92 (ciano) · Starter R$ 380k 9% 124 (verde) · Single Event R$ 220k 5% 4 (pink).

---

# PADRÕES GLOBAIS

## Paleta
| Token | Valor | Uso |
|---|---|---|
| Verde pulse (G) | `#00FF85` | brand, dinheiro/receita, sucesso, toggles on, CTAs primários |
| Verde claro (gradiente CTA) | `#4DFFA8` | topo do gradiente de botão primário |
| Texto sobre verde | `#003C1F` | cor de texto em botões verdes |
| Violeta (V) | `#A78BFA` | time/permissões, audit, secundário; texto sobre violeta: `#1A0040`; gradiente claro `#C4B5FD` |
| Ciano (C) | `#22D3EE` | API/integrações, suporte, latência; gradiente escuro `#0891B2` |
| Pink | `#FF3D88` | marketing, identidade ADM, alertas médios |
| Amber | `#FFB800` | avisos, pendências, KYC; gradiente escuro `#E6A600` |
| Red | `#FF3B30` | crítico, fraude, modo admin; texto suavizado `#FF7A75` |
| Fundo base | `#06070A` | todas as telas |
| Fundo terminal (audit) | `#0A0D14` | stream de log |
| Fundo white-label mock | `#0A0510` / `#15081B` | preview de site custom |

## Alpha-suffix em hex (convenção onipresente)
Cores tema recebem sufixo hex de opacidade: `COR08` (bg tint ~3%), `COR10`/`COR12` (bg selecionado), `COR15`, `COR20` (chip bg), `COR25` (borda tint), `COR30`, `COR40` (borda forte), `COR50` (borda live), `COR80` (glow de barra), `COR99` (gradiente de avatar).

## Tipografia
- `var(--pp-font-display)` (Space Grotesk): títulos de tela (700, 22–30, `letterSpacing: '-0.02em'` a `'-0.025em'`), títulos de card (600, 16–18, `-0.015em'`), nomes.
- `var(--pp-font-serif)` itálico 400: SEMPRE uma palavra de destaque no título, colorida com o accent da tela.
- `var(--pp-font-mono)`: TODOS os números/valores/dinheiro, labels uppercase, timestamps, códigos, IDs, hashes, e-mails. Valores grandes: 700 com letterSpacing negativo (`-0.02em` a `-0.035em`). Labels: 9–10, `letterSpacing: '0.06em'–'0.12em'`, `textTransform: 'uppercase'`, cor `rgba(255,255,255,0.5–0.6)`.
- `var(--pp-font-body)`: todo o resto. Corpo 12–13; fontWeight 600 para texto forte, 700 para números/CTAs.
- Classes utilitárias: `pp-eyebrow` (eyebrow mono uppercase), `pp-label` (label de seção), `pp-pulse-dot` (dot pulsante).

## Superfícies (escala de glass)
- Card padrão: `background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'`.
- Card aninhado/linha: `background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'`.
- Head de tabela: `background: 'rgba(255,255,255,0.025)'`. Zebra: `rgba(255,255,255,0.015)` (0.012 no audit). Divisor de linha: `rgba(255,255,255,0.04)`.
- Input/code-box: `background: 'rgba(0,0,0,0.3)'` ou `'rgba(0,0,0,0.4)'`.
- Sidebar: `rgba(11,13,18,0.4–0.5)` + `backdropFilter: 'blur(20px)'`.
- Hero premium: gradiente 135deg de tints do accent + `backdropFilter: 'blur(30px) saturate(180%)'` + `boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 32–40px ACCENT(0.15)'` + orbe decorativo blur(30–40px).

## Border-radius (escala)
999 (pílulas/toggles/barras) · 22 (hero) · 18 (cards grandes/CTA gigante) · 16 (cards médios) · 14 (KPI/subcards) · 12 (botões/linhas/inputs) · 10 (itens nav/chips) · 8 (mini-botões/code-box/ícone-box) · 6 (chips micro) · 4 (tags micro).

## Botões
- **Primário**: `padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: none, boxShadow: '0 4px 16px ACCENT(0.35)'`; background = gradiente `180deg` (claro→accent) ou accent sólido; texto na cor "sobre-accent" (`#003C1F` verde, `#1A0040` violeta, `#06070A` amber, `#fff` pink/ciano).
- **Secundário/ghost**: `background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600`.
- **Destrutivo**: `background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF7A75'`.
- **CTA gigante (checkout)**: height 60, r18, gradiente verde, `boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'`.

## KPI cards (3 variantes)
1. **Top accent bar**: barra superior absoluta `height: 2, background: COR, opacity: 0.7`; label mono 9–10 uppercase; valor mono 700 22 branco; delta opcional 10 na cor.
2. **Left accent bar**: barra esquerda absoluta `width: 3` (4 nas flags); conteúdo com paddingLeft 8–10.
3. **Tinted card**: `background: 'COR08', border: '1px solid COR25'`, valor na própria cor (usado para contagens de status/saúde).

## Barras de progresso
Trilho: `height: 4–8, borderRadius: 99, background: 'rgba(255,255,255,0.05–0.06)', overflow: hidden`. Fill: cor tema + `boxShadow: '0 0 6–8px COR80'` (sem glow em cinza/0%).

## Dots de status
Círculo 5–10px, `background: COR`, `boxShadow: '0 0 6–8px COR'` quando "vivo". Online em avatar: 10×10 + `border: '2px solid #06070A'`.

## Toggles
Trilho 32×18 r99 (mini 26×14); on: accent (+ opcional `inset 0 1px 2px rgba(0,0,0,0.2)` e glow); off: `rgba(255,255,255,0.1)`. Knob branco 14×14 (mini 10×10), `left: 16/2` (mini 13/2), `boxShadow: '0 1px 2px rgba(0,0,0,0.3)'`, `transition: 'left 0.2s'`.

## Tabelas
Sempre CSS grid com colunas fixas (nunca `<table>`). Head: mono 10 uppercase `0.5` sobre `rgba(255,255,255,0.025)`. Rows com `borderBottom: rgba(255,255,255,0.04)` e zebra opcional. Dinheiro em mono 700; entradas com `+` verdes, saídas com `−` brancas. Status sempre via PBadge ou dot+texto.

## Filtros/chips
Pílula r999 (ou retângulo r12 height 40 em toolbars); ativa = tint do accent da tela (`ACCENT(0.10–0.12)` bg + `ACCENT(0.25–0.3)` borda + texto no accent); inativa = `rgba(255,255,255,0.04)` ou transparent. Contagens no label: "Todos · 7".

## Sidebar/nav (2 variantes)
- **Produtora**: 72px, só ícones-glifo 48×48, seleção verde.
- **Admin**: 220px, ícone+label, seleção pink, section header mono, card do usuário no rodapé com tema vermelho (contexto de risco).

## Identidade por role
- Produtora: brand verde `#00FF85`, logo verde, accent varia por seção (finance=verde, marketing=pink, team=violeta, api=ciano, brand=pink).
- Admin: identidade PINK `#FF3D88` (logo, nav) + vermelho para o "modo perigoso" (pílula "MODO ADMINISTRATIVO · TUDO É TRILHADO" em toda topbar, card do usuário). Accent do conteúdo varia por tela (orgs=violeta, fraud=red, support=ciano, audit=violeta, flags=verde, fees=amber, finance=verde).

## Charts (SVG inline, sem lib)
Area chart: `preserveAspectRatio: 'none'`, gridlines `rgba(255,255,255,0.05)`, path de área com linearGradient vertical (accent 0.4–0.5 → 0), polyline accent strokeWidth 2–2.5 round, ponto final com halo (`r 5` + `r 10 opacity 0.3`). Eixos como flex de labels mono 10 `rgba(255,255,255,0.4–0.45)`. Heatmap cohort: células com alpha proporcional (`rgba(0,255,133, v/100 * 0.45)`), texto escuro `#06070A` quando intenso.

## Microcopy (tom de voz)
Português informal-técnico, separador " · " onipresente ("2º lote a R$ 90 · termina às 23h59"), números sempre contextualizados ("4,2× a média da plataforma"), títulos com afirmações vivas ("A plataforma respira.", "Sua casa, sua cara."). Valores monetários: "R$ 184.320" com centavos/prefixo em cor rebaixada.
