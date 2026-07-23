# PulsePass · Frontend

Monorepo dos **frontends**. O backend vive em outro repositório: **`pulsepass-api`**.
A única fronteira entre eles é **HTTP** (contrato em `pulsepass-api/openapi.yaml`).

```
pulsepass-frontend/
├── apps/
│   ├── web/      app do cliente — descoberta, compra, ingresso (QR rotativo),
│   │             carteira cashless, pedido no bar, lista, camarotes
│   ├── admin/    cockpit da produtora + PulseADM (god-mode da plataforma)
│   └── mobile/   app Expo / React Native
├── packages/
│   └── shared/   design system (tokens, componentes, ícones, api-client)
├── design-system/  especificação visual (53 telas)
└── docs/           auditorias e planos
```

## Rodar

```bash
npm install
npm run dev            # sobe web + admin (Turborepo)
npm run dev:web        # só o app do cliente   → http://localhost:5173
npm run dev:admin      # só o cockpit          → http://localhost:5174
npm run dev:mobile     # Expo / Metro
```

O backend precisa estar rodando separadamente (repositório `pulsepass-api`, porta 4000).

## Como aponta para a API

Cada app lê a URL da API de uma variável de ambiente — é assim que trocamos
entre local, staging e produção **sem tocar no código**.

| App | Variável | Exemplo local |
|---|---|---|
| web / admin | `VITE_API_URL` | `http://localhost:4000/api` |
| mobile | `EXPO_PUBLIC_API_URL` | `http://localhost:4000/api` |

Copie `.env.example` para `.env` em cada app e ajuste. Em produção, aponte
para o domínio do deploy da API.

> Auth é Supabase direto no cliente (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`);
> o token vai no `Authorization: Bearer` das chamadas à API.

## Build

```bash
npm run build          # gera dist/ em apps/web e apps/admin
```

Cada app é estático e deploya independentemente (Vercel, Cloudflare Pages, etc.),
com domínios próprios — o cockpit não precisa estar no mesmo domínio do cliente.
