

# 🧪 Manual Event-Driven Test Checklist

Unviber is a **reactive system**. It sleeps until a PR is opened. This checklist validates the entire "wake-up" chain: **GitHub Webhook → Bot → DB Config → Gemini AI → PR Comment**.

## 1. 🏖️ Sandbox Environment (The Lab)

To safely simulate "Vibe Coding" errors without risking production:

- **Repo:** `https://github.com/YOUR_USERNAME/unviber-sandbox`
    
- **Rule:** Never push directly to `main`. Always create a new branch.
    

## 2. ✅ Prerequisites (System Health)

Ensure the entire pipeline is ready to react:

- [ ] **Bot Service:** Running (Heroku/Local) and listening for `pull_request` events.
    
- [ ] **Database:** Supabase is reachable (Bot needs to fetch Config/Rules).
    
- [ ] **GitHub App:** Installed on Sandbox Repo with `Pull Request: Read & Write` permissions.
    

## 3. ⚡ Trigger: Simulating "Vibe Coding"

We will intentionally commit code that fails the "Sobriety Test" (PII leaks and hardcoded secrets) to provoke the Unviber Gatekeeper.

Run this in your terminal inside the **sandbox repo**:

```bash
# 1. New Vibe Branch
git checkout -b test/vibe-coding-fail-$(date +%s)

# 2. Inject Compliance Violations (The "Dirty Work")
# Violation A: Hardcoded Secret (Security)
echo "const STRIPE_KEY = 'sk_live_51M...';" >> payments.js
# Violation B: PII Leak (GDPR/LGPD)
echo "logger.info('User Email:', user.email);" >> user_controller.js

# 3. Commit & Push
git add .
git commit -m "feat: risky vibe coding implementation"
git push origin HEAD

# 4. ACTION: Open the Pull Request (This fires the Webhook)
```

## 4. 🔍 Verification: The Reactive Chain

Once the PR is opened, verify if the architecture flow executed correctly.

### A. The Wake-Up Call (Logs)

Check your logs (Heroku CLI or Local Terminal). You should see the exact sequence described in the architecture:

1. `[Webhook]` Received `pull_request.opened`.
    
2. `[DB]` Fetched Config for Installation ID `...`.
    
3. `[GitHub]` Fetched file diffs (`payments.js`, `user_controller.js`).
    
4. `[AI]` Sent context to **Gemini 3.0**.
    
5. `[GitHub]` **Posted Review Comment.**
    

### B. The Gatekeeper (GitHub UI)

Go to the Pull Request page on GitHub.

- **Expectation:** Within seconds, a comment from **Unviber** should appear.
    
- **Content:** It must flag the `STRIPE_KEY` and the `User Email` logging.
    
- **Format:** It should offer a clear explanation or a "One Click" suggestion if applicable.


## 5. 🛠️ Troubleshooting the Flow
|**Failure Point**|**Symptom**|**Probable Cause & Fix**|
|---|---|---|
|**Webhook**|Bot never logs "Received..."|**Smee/Heroku URL mismatch.** Check App Settings > Webhook URL.|
|**Database**|Log: "Failed to fetch config"|**Supabase Connection.** Check `DATABASE_URL` in `.env`.|
|**AI Engine**|Log: "Gemini analysis failed"|**API Key/Quota.** Check `GEMINI_API_KEY`. Verify if the diff is too large.|
|**Response**|Logs say "Posted" but no comment|**Permissions.** App needs `Write` access to Pull Requests.|

