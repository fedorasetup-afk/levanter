This repository includes a GitHub Actions workflow to run scheduled (cron) tasks without deploying the full app.

How it works
- A workflow lives in `.github/workflows/cron.yml` and runs on pushes and a schedule (default daily at 00:30 UTC).
- The workflow checks out the repo, installs Node (v20) and dependencies, then runs `node scripts/cron-runner.js`.
- `scripts/cron-runner.js` is a tiny entry that performs only fast, low-resource tasks. Use the `RUN_SCRIPT` secret to control the exact job.

Config / secrets
- Add repository secrets in Settings → Secrets:
  - `DATABASE_URL` — optional; used if your cron task needs DB access
  - `SESSION_ID` — optional
  - `HEROKU_API_KEY` — optional (only if used)
  - `RUN_SCRIPT` — required to choose the task (e.g. `backup`, `list-schedules`, `check-updates`)

Recommendations to avoid wasting resources
- Keep scheduled tasks short (under a few minutes). Actions usage is billed — avoid long-running, background processes.
- Run only the precise scripts needed (use `RUN_SCRIPT`) instead of starting the whole bot.
- If you need long-running processes, prefer a dedicated host (VPS, Koyeb, Render) with an "always-on" plan.

Next steps
- Tell me which exact tasks you want the Action to run (backup DB, refresh tokens, ping a webhook, etc.) and I will wire `scripts/cron-runner.js` to call them safely.
