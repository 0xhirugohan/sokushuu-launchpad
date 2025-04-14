import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { pharosDevnet } from "~/libs/chain";
import type { Route } from "./+types/faucet";
import { Faucet as FaucetPage } from "../faucet/faucet";
import { setUserLatestFaucetClaim } from "../faucet/kv";
import { isUserEligibleToClaimFaucet } from "~/libs/faucet";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launcpad - Faucet" },
        { name: "description", content: "Need some Pharos faucet? Afraid not, we got you covered!" }
    ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
    return {};
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
            transport: http(),
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
        console.log({ err });
        return {
            address: formData.get("address"),
            hash: null,
            message: "error occurred please try again or report",
            ok: false,
        }
    }
}

export default function Faucet({
    actionData
}: Route.ComponentProps) {
    return <FaucetPage />
}