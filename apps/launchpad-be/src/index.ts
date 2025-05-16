import { Hono } from 'hono'
import { cors } from 'hono/cors'

import {
  pharosDevnetRPC,
  pharosDevnetFaucet,
} from './handlers'

const app = new Hono()

app.use('*', cors({
  origin: [
    // 'http://localhost:5173',
    '*.sokushuu.de'
  ]
}))

app.get('/', (c) => {
  return c.json({ message: "Yes, it's working" })
})

const rpcs = new Hono().basePath('/rpc');
rpcs.post('/pharos-devnet', pharosDevnetRPC)
app.route('/', rpcs);

const faucets = new Hono().basePath('/faucet');
faucets.post('/pharos-devnet', pharosDevnetFaucet)
app.route('/', faucets)

export default app
