// Starts the Vite dev server, then opens it in Electron. Used by `npm run app:dev`.
import { spawn } from 'node:child_process'
import electron from 'electron'
import { createServer } from 'vite'

const server = await createServer()
await server.listen()
const url = server.resolvedUrls?.local[0]
if (!url) throw new Error('Vite dev server did not report a URL')

// Extra arguments are passed on to Electron, e.g. `npm run app:dev -- --no-sandbox`.
const child = spawn(electron, ['.', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
})
child.on('exit', async (code) => {
  await server.close()
  process.exit(code ?? 0)
})
