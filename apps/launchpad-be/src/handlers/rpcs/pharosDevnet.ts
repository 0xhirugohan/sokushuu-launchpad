import { Context } from 'hono'

const pharosDevnet = async (c: Context) => {
    try {
        const body = await c.req.json();
        const rpcResult = await fetch(c.env.PHAROS_DEVNET_RPC_URI, {
            method: 'POST',
            body: JSON.stringify(body),
        })
        const json: any = await rpcResult.json();
        return c.json({ ...json });
    } catch (err) {
        c.status(500);
        return c.json({ ok: false, message: 'There is something wrong with the RPC. Please retry or refresh.' })
    }
}

export default pharosDevnet;