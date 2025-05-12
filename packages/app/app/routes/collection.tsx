import { readContract, readContracts } from "@wagmi/core";
import type { State } from "wagmi";
import type { Address } from "viem";

import { getWalletStateFromCookie } from "~/libs/cookie";
import type { Route } from "./+types/collection";
import { serverWalletConfig } from "~/libs/wallet";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { nftLauncherAbi } from "~/abi/nftLauncher";
import { CollectionPage } from "~/pages/collection";

export function meta({ params }: Route.MetaArgs) {
    const smartContractAddress = params.smartContractAddress;
    return [
        { title: `Sokushuu Launcpad - Contract - ${smartContractAddress}` },
        { name: "description", content: `Time to see some collection in ${smartContractAddress} ?` }
    ];
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
    const initialState = await getWalletStateFromCookie({ request });
    const smartContractAddress = params.smartContractAddress;
    const baseURI = context.cloudflare.env.APP_BASE_URI;
    const nftLaunchManagerAddress = context.cloudflare.env.MANAGER_CONTRACT_ADDRESS;
    const xellarAppId = context.cloudflare.env.XELLAR_APP_ID;
    const walletConnectProjectId = context.cloudflare.env.WALLETCONNECT_PROJECT_ID;

    const tokenId: bigint = await readContract(serverWalletConfig, {
        abi: nftLaunchManagerAbi,
        address: nftLaunchManagerAddress as Address,
        functionName: 'getContractCurrentTokenId',
        args: [
            smartContractAddress as Address,
        ]
    });

    const length = parseInt(`${tokenId}`);
    const contracts = Array.from({
        length,
    }, (_, i) => length - i - 1
    ).map((id) => {
        return {
            address: smartContractAddress as Address,
            abi: nftLauncherAbi,
            functionName: 'tokenURI',
            args: [
                id,
            ],
        };
    });
    const tokenURIResults = await readContracts(serverWalletConfig, { contracts });
    const tokenURIs = tokenURIResults.map(({ result }, index) => {
        const uri: string = baseURI as string === 'https://launchpad.sokushuu.de' ? result as string : result?.toString().replace('https://launchpad.sokushuu.de', baseURI) as string;
        return { tokenId: BigInt(length - index - 1), tokenURI: uri ?? "" };
    });

    return { initialState, baseURI, smartContractAddress, tokenURIs, xellarAppId, walletConnectProjectId };
}

export default function Collection({
    loaderData,
}: Route.ComponentProps) {
    return <CollectionPage
        smartContractAddress={loaderData.smartContractAddress as Address}
        initialState={loaderData.initialState as State | undefined}
        tokenURIs={loaderData.tokenURIs}
        baseURI={loaderData.baseURI}
        xellarAppId={loaderData.xellarAppId}
        walletconnectProjectId={loaderData.walletConnectProjectId}
    />
}