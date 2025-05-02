import type { Route } from "../+types/api";

export async function loader({ request, params }: Route.LoaderArgs) {
    if (request.method !== 'POST') {
        return { ok: false, message: 'Invalid format' };
    }

   return { ok: true, message: '' };
}

export async function action({ request }: Route.LoaderArgs) {
    const body = await request.json()
    const rpcResult = await fetch('https://devnet.dplabs-internal.com/', {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return rpcResult;
}