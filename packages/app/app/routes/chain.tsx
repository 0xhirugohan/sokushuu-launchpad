import { type State } from "wagmi";

import type { Route } from "./+types/home"
import { ChainPage } from "~/chain/chain";
import { getWalletStateFromCookie } from "~/libs/cookie";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launchpad - Chain" },
        { name: "description", content: "Add Pharos Devnet to your wallet" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const initialState = await getWalletStateFromCookie({ request });
    return { initialState };
}

export default function Chain({ loaderData }: Route.ComponentProps) {
    return <ChainPage initialState={loaderData.initialState as State | undefined} />
}