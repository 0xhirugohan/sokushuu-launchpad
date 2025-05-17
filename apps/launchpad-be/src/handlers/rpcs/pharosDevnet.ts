import { Context } from 'hono'

const pharosDevnet = async (c: Context) => {
    const body = await c.req.json();
    const rpcResult = await fetch(c.env.PHAROS_DEVNET_RPC_URI, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const json: any = await rpcResult.json();
    return c.json({ ...json });
}

export default pharosDevnet;