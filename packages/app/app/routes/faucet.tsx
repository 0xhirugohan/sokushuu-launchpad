import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { State } from "wagmi";
import { getBalance } from "@wagmi/core";

import { pharosDevnet } from "~/libs/chain";
import type { Route } from "./+types/faucet";
import { Faucet as FaucetPage } from "../faucet/faucet";
import { setUserLatestFaucetClaim } from "../faucet/kv";
import { isUserEligibleToClaimFaucet } from "~/libs/faucet";
import { getWalletStateFromCookie } from "~/libs/cookie";
import { serverWalletConfig } from "~/libs/wallet";

const MAXIMUM_ETH_BALANCE_TO_CLAIM_FAUCET = parseEther('1');
const FAUCET_DRIP_AMOUNT_IN_ETH = parseEther('0.01');

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launcpad - Faucet" },
        { name: "description", content: "Need some Pharos faucet? Afraid not, we got you covered!" }
    ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
    const faucetAccount = privateKeyToAccount(context.cloudflare.env.FAUCET_PRIVATE_KEY as `0x${string}`);
    const faucetWalletAddress = faucetAccount.address;
    const faucetBalance = await getBalance(serverWalletConfig, {
        address: faucetWalletAddress,
    });
    const initialState = await getWalletStateFromCookie({ request });
    return {
        initialState,
        faucet: {
            balance: faucetBalance.value,
            address: faucetWalletAddress
        },
        constant: {
            MAXIMUM_ETH_BALANCE_TO_CLAIM_FAUCET,
            FAUCET_DRIP_AMOUNT_IN_ETH,
        },
    };
}

export async function action({
    context,
    params,
    request
}: Route.ActionArgs) {
    const formData = await request.formData();
    const toAddress: string | null = formData.get("address") as string;
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return {
            ok: false,
            message: "Address is not valid"
        }
    }
    const isUserEligible = await isUserEligibleToClaimFaucet(context, toAddress);
    if (!isUserEligible) {
        return {
            address: formData.get("address"),
            hash: null,
            message: "You can only claim once in every 24 hours",
            ok: false,
        }
    }

    try {
        const faucetPrivateKey = context.cloudflare.env.FAUCET_PRIVATE_KEY;
        const account = privateKeyToAccount(faucetPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain: pharosDevnet,
            transport: http(pharosDevnet.rpcUrls.default.http[1]),
        });
        const hash = await walletClient.sendTransaction({
            account,
            to: toAddress as `0x${string}`,
            value: parseEther("0.01"),
        })
        await setUserLatestFaucetClaim(context, toAddress);
        return {
            address: formData.get("address"),
            hash,
            message: "success",
            ok: true,
        };
    } catch (err) {
        return {
            address: formData.get("address"),
            hash: null,
            message: "error occurred please try again or report",
            ok: false,
        }
    }
}

export default function Faucet({
    loaderData,
}: Route.ComponentProps) {
    return <FaucetPage
        initialState={loaderData.initialState as State | undefined}
        faucet={loaderData.faucet}
        constant={loaderData.constant}
    />
}