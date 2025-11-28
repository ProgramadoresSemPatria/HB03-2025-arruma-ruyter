# arruma-ruyter

Monorepo with the Probot bot (`/bot`) and the Next.js app (`/web-app`).

## Prerequisites
- Node 18+
- GitHub App configured for the bot (APP_ID, PRIVATE_KEY, WEBHOOK_SECRET). Use `bot/.env.example` as a template.

## Quick setup
1) At repo root, install shared tooling:
```
npm install
```
2) Install app dependencies:
```
npm install --prefix bot
npm install --prefix web-app
```
3) Configure the bot `.env` (port 3001 is set in the start script):
```
cd bot
copy .env.example .env   # or: cp .env.example .env (Linux/Mac)
# Fill APP_ID, PRIVATE_KEY (PEM), WEBHOOK_SECRET
cd ..
```

## Run in dev
- Bot (port 3001): `npm run dev:bot`
- Web (port 3000): `npm run dev:web`
- Both in parallel: `npm run dev:all`

## Notes
- Probot stays in setup mode without APP_ID/PRIVATE_KEY/WEBHOOK_SECRET; visit http://localhost:3001 for guidance.
- The Next.js warning about multiple lockfiles is informational; set `turbopack.root` in `web-app/next.config.ts` to silence it, or ignore.
