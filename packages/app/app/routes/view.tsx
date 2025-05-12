import { readContract, readContracts } from "@wagmi/core";
import type { State } from "wagmi";
import type { Address } from "viem";

import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { nftLauncherAbi } from "~/abi/nftLauncher";
import { getWalletStateFromCookie } from "~/libs/cookie";
import { serverWalletConfig } from "~/libs/wallet";
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
    const nftLaunchManagerAddress = context.cloudflare.env.MANAGER_CONTRACT_ADDRESS;
    const xellarAppId = context.cloudflare.env.XELLAR_APP_ID;
    const walletConnectProjectId = context.cloudflare.env.WALLETCONNECT_PROJECT_ID;

    const tokenIdLength: bigint = await readContract(serverWalletConfig, {
        abi: nftLaunchManagerAbi,
        address: nftLaunchManagerAddress as Address,
        functionName: 'getContractCurrentTokenId',
        args: [
            smartContractAddress as Address,
        ]
    });

    const length = parseInt(`${tokenIdLength}`);
    const maxContentLength = 4;
    const contracts = Array.from({
        length: length > maxContentLength ? maxContentLength : length,
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
        const uri: string = baseURI as string === 'https://launchpad-dev.sokushuu.de' ? result as string : result?.toString().replace('https://launchpad-dev.sokushuu.de', baseURI) as string;
        return { tokenId: BigInt(length - index - 1), tokenURI: uri ?? "" };
    });

    return { initialState, smartContractAddress, nftLaunchManagerAddress, tokenId, baseURI, tokenURIs, xellarAppId, walletConnectProjectId };
}

export default function View({
    loaderData,
}: Route.ComponentProps) {
    return <ViewPage
        baseURI={loaderData.baseURI}
        nftLaunchManagerAddress={loaderData.nftLaunchManagerAddress as Address}
        initialState={loaderData.initialState as State | undefined}
        smartContractAddress={loaderData.smartContractAddress as Address}
        tokenId={BigInt(loaderData.tokenId)}
        tokenURIs={loaderData.tokenURIs}
        xellarAppId={loaderData.xellarAppId}
        walletconnectProjectId={loaderData.walletConnectProjectId}
    />
}