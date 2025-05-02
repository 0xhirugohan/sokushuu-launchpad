import type { State } from "wagmi";
import type { Address } from "viem";

import { getWalletStateFromCookie } from "~/libs/cookie";
import type { Route } from "./+types/view";
import { ViewPage } from "../pages/view";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launcpad - View" },
        { name: "description", content: "Curious to see the token right away?" }
    ];
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
    const initialState = await getWalletStateFromCookie({ request });
    const smartContractAddress = params.smartContractAddress;
    const tokenId = params.tokenId;
    const baseURI = context.cloudflare.env.APP_BASE_URI;
    return { initialState, smartContractAddress, tokenId, baseURI };
}

export default function View({
    loaderData,
}: Route.ComponentProps) {
    return <ViewPage
        baseURI={loaderData.baseURI}
        initialState={loaderData.initialState as State | undefined}
        smartContractAddress={loaderData.smartContractAddress as Address}
        tokenId={BigInt(loaderData.tokenId)}
    />
}