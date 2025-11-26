# arruma-ruyter

Monorepo com o bot Probot (`/bot`) e a aplicação Next.js (`/web-app`).

## Pré-requisitos
- Node 18+
- GitHub App configurado para o bot (APP_ID, PRIVATE_KEY, WEBHOOK_SECRET)

## Instalação
1. Instale as dependências do bot: `cd bot && npm install`
2. Instale as dependências do web: `cd web-app && npm install`
3. Na raíz, instale as dependências de tooling (para `dev:all`): `npm install`

## Scripts na raiz
- `npm run dev:bot` — compila o bot (`tsc`) e sobe o Probot (`probot run ./lib/index.js`)
- `npm run dev:web` — roda o Next.js em modo dev (`next dev`)
- `npm run dev:all` — roda bot e web em paralelo

## Rodando cada app direto
- Bot: `cd bot && npm run build && npm start`
- Web: `cd web-app && npm run dev`
