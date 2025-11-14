// Lightweight cron runner executed inside GitHub Actions.
// Purpose: run only specific, fast tasks (backups, token refresh, webhook pings)
// Keep this file small to avoid long installs or heavy runtime.

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Load .env if present (same behavior as the app)
const dotenvPath = path.resolve(__dirname, '..', 'lib', 'config.env')
if (fs.existsSync(dotenvPath)) require('dotenv').config({ path: dotenvPath })

// Minimal envs from Action secrets override local env
const env = Object.assign({}, process.env)

// Decide which fast jobs to run. This can be controlled with the RUN_SCRIPT secret
// Example: RUN_SCRIPT=backup or RUN_SCRIPT=check-updates
const runScript = env.RUN_SCRIPT || 'list-schedules'

async function main() {
  console.log('cron-runner: running', runScript)
  if (runScript === 'backup') {
    // run lib/backup.js as a node script if it exposes a runnable func
    // many library files are modules; use a small child process wrapper
    const res = spawnSync('node', ['-e', "require('./lib/backup')().catch(e=>{console.error(e);process.exit(1)})"], { stdio: 'inherit', cwd: path.resolve(__dirname, '..') })
    process.exit(res.status)
  }

  if (runScript === 'list-schedules') {
    // lightweight check: print number of scheduled messages/statuses in DB (sqlite or POSTGRES)
    try {
      const db = require('./lib/config').DATABASE
      const [result] = await db.query("SELECT count(*) as c FROM sqlite_master WHERE type='table'")
      console.log('db tables (sqlite query):', result)
    } catch (e) {
      console.log('list-schedules: could not query DB directly, falling back to noop', e.message)
    }
    process.exit(0)
  }

  console.log('No matching RUN_SCRIPT, exiting.')
}

main().catch((e) => { console.error(e); process.exit(1) })
