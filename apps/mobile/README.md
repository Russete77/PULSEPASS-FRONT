# PulsePass · Mobile (super-app do Cliente)

App nativo do Cliente — **Expo SDK 56** + **expo-router** (file-based) + TypeScript.
Consome o mesmo backend único (`pulse-back`). Fase 2: carteira cashless, bar, ingressos.

## Stack

- **Expo SDK 56** · React Native 0.85 · React 19 (New Architecture)
- **expo-router** — navegação file-based com bottom-tabs
- **@supabase/supabase-js** + **AsyncStorage** — auth com sessão persistida
- Camada de dados via **fetch** (`src/lib/api.ts`) → backend único
- Tokens do design system PulsePass portados em `src/theme/tokens.ts`

## Estrutura (file-based routing)

```
src/
  app/
    _layout.tsx          root: AuthProvider + gate de login
    login.tsx            entrar / criar conta
    (tabs)/
      _layout.tsx        bottom-tabs
      index.tsx          Início (descobrir eventos)
      carteira.tsx       saldo cashless + extrato
      bar.tsx            cardápio + carrinho + pagar com saldo
      ingressos.tsx      meus ingressos
      perfil.tsx         conta / sair
    recarga.tsx          modal de recarga via Pix
    ingresso/[id].tsx    QR de entrada + transferência
  lib/      supabase, api, format, useActiveEvent
  context/  AuthContext
  components/ ui (Button, Card, Screen, Badge…)
  theme/    tokens
```

## Rodando

```bash
cp .env.example .env     # EXPO_PUBLIC_API_URL + EXPO_PUBLIC_SUPABASE_*
npm install
npx expo install --fix   # alinha versões nativas ao SDK 56
npx expo start           # abra no Expo Go (iOS/Android) ou emulador
```

> Em device físico, troque `localhost` por o IP da sua máquina em
> `EXPO_PUBLIC_API_URL` (ex.: `http://192.168.0.10:4000/api`), senão o
> celular não enxerga o backend.

## Fluxo (Fase 2 — slice)

- **Início:** lista eventos publicados (backend `/events`).
- **Carteira:** saldo do evento ativo + extrato; botão **Recarregar** abre o
  modal Pix (Asaas). Em dev há **"Simular pago"** para creditar sem webhook.
- **Bar:** cardápio do evento (`/events/:slug/menu`), carrinho e **pagar com
  saldo** (débito atômico no backend via `spend_wallet`).
- **Ingressos:** lista + tela do ingresso com QR e **transferência por e-mail**.

O "evento ativo" é o 1º publicado (`useActiveEvent`) só para o slice — no
produto real virá do check-in/geolocalização.

## Notas

- O QR do ingresso está como placeholder; a lib de geração/leitura entra na
  fase de **porta/scanner** (Fase 3 — Produtora).
- `react-native-clipboard` não é usado; o Pix copia-e-cola usa texto
  selecionável (toque e segure) para manter as dependências enxutas.

## Git

Crie um repo (ex.: `pulse-mobile`) e:

```bash
git init -b main
git add .
git commit -m "feat: super-app Cliente (Fase 2)"
git remote add origin https://github.com/Russete77/pulse-mobile.git
git push -u origin main
```
