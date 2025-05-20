import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { KVNamespace } from '@cloudflare/workers-types'

import {
  pharosDevnetRPC,
  pharosTestnetRPC,
  pharosDevnetFaucet,
  pharosTestnetFaucet,
  generateImage,
  uploadImage,
  getNFTImage,
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
rpcs.post('/pharos-testnet', pharosTestnetRPC)
app.route('/', rpcs);

const faucets = new Hono<{ Bindings: Bindings }>().basePath('/faucet');
faucets.post('/50002', pharosDevnetFaucet)
faucets.post('/688688', pharosTestnetFaucet)
app.route('/', faucets)

const llms = new Hono<{ Bindings: Bindings }>().basePath('/llm');
llms.post('/generate-image', generateImage)
app.route('/', llms)

const users = new Hono().basePath('/user');
users.post('/upload-image', uploadImage)
app.route('/', users)

app.get('/api/nft/:smartContractAddress/:tokenId', getNFTImage)

export default app
