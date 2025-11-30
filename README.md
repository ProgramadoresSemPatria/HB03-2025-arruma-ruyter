# Arruma-Ruyter

> 📦 Monorepo containing a GitHub security bot (built with Probot) and a companion Next.js web dashboard.

## Overview

This repository houses two related components:

- **Bot** (in `bot/`): A GitHub App built with [Probot]. Monitors repositories, enforces security rules, and automates issue/pr checks.  
- **Web App** (in `web-app/`): A Next.js dashboard for configuration.

Use them together to add a powerful, flexible security-automation layer to your GitHub org or projects.

---

## 🔧 Features

- Automatic repository monitoring through the GitHub App.  
- Configurable security/permissions rules via web dashboard.  
- Real-time alerts, logs, and dashboards for security events.  
- Seamless integration between bot and web-app.  
- Easy development and deployment with a monorepo setup.

---

## Quick Start (Local Development)

### Prerequisites

- Node.js v18 or newer  
- A GitHub App configured with **APP_ID**, **PRIVATE_KEY**, and **WEBHOOK_SECRET** (see `bot/.env.example`)  

### Setup

1. Install shared dependencies at the repo root:
    ```bash
    npm install
    ```
2. Install each package’s dependencies:
    ```bash
    npm install --prefix bot
    npm install --prefix web-app
    ```
3. Configure the bot environment:
    ```bash
    cd bot
    cp .env.example .env       # On Windows: copy .env.example .env
    # Then set APP_ID, PRIVATE_KEY (PEM), WEBHOOK_SECRET
    cd ..
    ```

### Run Locally

- Start the bot (Dev mode):  
  ```bash
  npm run dev:bot     # runs bot on port 3001
  ```
- Start the web dashboard:  
  ```bash
  npm run dev:web     # runs web-app on port 3000
  ```
- Run both concurrently:  
  ```bash
  npm run dev:all
  ```

> Visiting `http://localhost:3001` will launch the Probot setup flow if the bot isn't configured yet.

---

## Deployment

- The web dashboard is deployed at **https://unvibe-bot.vercel.app/**  
- For production deployment: ensure environment variables are properly set (same as .env configuration for the bot), then deploy each part through your preferred infrastructure.  
- Next.js warnings about multiple lockfiles can be ignored or fixed by setting `turbopack.root` in `web-app/next.config.ts`.

---

## Configuration & Environment Variables

| Var Name            | Description                                                    |
|---------------------|----------------------------------------------------------------|
| `APP_ID`            | GitHub App ID                                                  |
| `PRIVATE_KEY`       | PEM-formatted private key for the GitHub App                  |
| `WEBHOOK_SECRET`    | Webhook secret used to validate GitHub events                 |

---

## Project Structure

```
/
├── bot/           # Probot-based GitHub App (security bot logic)
│   ├── src/       
│   └── .env*      
├── web-app/       # Next.js dashboard
│   ├── app/     
│   └── config/    
├── package.json   
└── README.md      
```

---

## Contributing

1. Fork repository.  
2. Create a branch: `feature/...` or `fix/...`.  
3. Work inside `bot/` or `web-app/` depending on feature.  
4. Submit PR with clear context.

---

## License

Add your license here.

---

[Probot]: https://github.com/probot/probot  
[Next.js]: https://nextjs.org  
