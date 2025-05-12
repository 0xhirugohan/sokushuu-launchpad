import { type State } from "wagmi";

import type { Route } from "./+types/chain"
import { ChainPage } from "~/chain/chain";
import { getWalletStateFromCookie } from "~/libs/cookie";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launchpad - Chain" },
        { name: "description", content: "Add Pharos Devnet to your wallet" },
    ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
    const initialState = await getWalletStateFromCookie({ request });
    const xellarAppId = context.cloudflare.env.XELLAR_APP_ID;
    const walletconnectProjectId = context.cloudflare.env.WALLETCONNECT_PROJECT_ID;
    return { initialState, xellarAppId, walletconnectProjectId };
}

export default function Chain({ loaderData }: Route.ComponentProps) {
    return <ChainPage
        initialState={loaderData.initialState as State | undefined}
        xellarAppId={loaderData.xellarAppId}
        walletconnectProjectId={loaderData.walletconnectProjectId}
    />
}