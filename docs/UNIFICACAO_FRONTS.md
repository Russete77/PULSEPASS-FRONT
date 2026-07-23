# Unificação dos Fronts — PulsePass

Os três fronts (web, admin, mobile) agora compartilham **uma única fonte de verdade**:
o pacote **`@pulsepass/shared`** (em `packages/shared`), ligado via **npm workspaces**.

## O que passou a ser compartilhado

| Recurso | Antes | Agora |
|---|---|---|
| Formatação (`brl`, `eventDate`, `dateTime`, `toDatetimeLocal`) | 3 cópias divergentes | `@pulsepass/shared` (uma fonte) |
| Design tokens CSS (web/admin) | 2 cópias idênticas | `@pulsepass/shared/tokens.css` |
| Design tokens JS (mobile `C/S/R/F`) | cópia manual | `@pulsepass/shared` (`tokens.js`) |
| Cliente HTTP do backend (`request`/auth) | 3 cópias quase iguais | `createApiClient()` em `@pulsepass/shared` |
| Fontes da marca no mobile | não carregavam | Space Grotesk + Inter via `@expo-google-fonts` |

Os arquivos locais (`lib/format`, `theme/tokens`, `lib/api`) viraram **re-exports finos**, então
nenhum call site mudou — só a origem do código.

## Estrutura

```
pulsepass/
  package.json            ← workspaces: packages/*, api, web, admin, mobile
  packages/shared/        ← FONTE ÚNICA
    src/format.js
    src/tokens.js
    src/tokens.css
    src/api-client.js
    src/index.js / index.d.ts
  api/  web/  admin/  mobile/   ← consomem @pulsepass/shared
```

## ▶ Comandos para rodar no terminal

> Importante: a partir de agora instale pela **raiz** do repositório (workspaces),
> não app por app.

**1) Instalar tudo (linka o @pulsepass/shared em todos os apps):**
```bash
cd pulsepass
npm install
```

**2) Reconciliar as fontes/deps do mobile com o SDK do Expo:**
```bash
cd mobile
npx expo install @expo-google-fonts/inter @expo-google-fonts/space-grotesk expo-font
```

**3) Subir cada app para validar (terminais separados):**
```bash
# Backend único
cd api && npm run dev

# Front do cliente (web)
cd web && npm run dev

# Cockpit da produtora (admin)
cd admin && npm run dev

# App mobile — o -c limpa o cache do Metro (necessário após mexer no metro.config)
cd mobile && npx expo start -c
```

## Checklist de validação após subir

- [ ] web e admin carregam com o visual igual (mesmos tokens/fonte).
- [ ] Datas de evento aparecem iguais nos três (formato amigável com dia da semana).
- [ ] No admin, a coluna de data de **pedido** mostra o ano (usa `dateTime`).
- [ ] App mobile abre com Space Grotesk nos títulos e Inter no texto (não mais fonte do sistema).
- [ ] Login + uma chamada autenticada funcionam nos três (cliente de API compartilhado).

## Notas

- Se o Metro reclamar de resolução do `@pulsepass/shared`, confirme que o `npm install`
  foi rodado na **raiz** (é ele que cria o symlink em `node_modules`).
- Os arquivos `web/src/styles/tokens.css` e `admin/src/styles/tokens.css` ficaram como
  ponteiros vazios e podem ser removidos quando quiser.
