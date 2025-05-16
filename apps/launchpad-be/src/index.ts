import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { KVNamespace } from '@cloudflare/workers-types'

import {
  pharosDevnetRPC,
  pharosDevnetFaucet,
} from './handlers'

type Bindings = {
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: [
    // 'http://localhost:5173',
    '*.sokushuu.de'
  ]
}))

app.get('/', (c) => {
  return c.json({ message: "Yes, it's working" })
})

const rpcs = new Hono<{ Bindings: Bindings }>().basePath('/rpc');
rpcs.post('/pharos-devnet', pharosDevnetRPC)
app.route('/', rpcs);

const faucets = new Hono<{ Bindings: Bindings }>().basePath('/faucet');
faucets.post('/pharos-devnet', pharosDevnetFaucet)
app.route('/', faucets)

export default app
