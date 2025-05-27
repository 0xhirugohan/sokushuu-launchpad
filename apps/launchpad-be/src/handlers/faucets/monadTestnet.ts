import { Context } from 'hono'
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { KVNamespace } from '@cloudflare/workers-types';

import { monadTestnetChain } from '../../libs'

type Bindings = {
  KV: KVNamespace;
  EVM_FAUCET_PRIVATE_KEY: string;
}

const monadTestnet = async (c: Context<{ Bindings: Bindings }>) => {
    const body = await c.req.json();

    const toAddress: string | null = body.address as string;
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return c.json({
            address: toAddress,
            hash: null,
            ok: false,
            message: "Address is not valid"
        })
    }

    const KVKey = `faucet.monad.testnet.${toAddress}`;
    const recentClaim = await c.env.KV.get(KVKey, "text");
    if (recentClaim !== "") {
        const minDateToClaim = new Date(recentClaim as string);
        minDateToClaim.setDate(minDateToClaim.getDate() + 1);
        if (new Date() < minDateToClaim) {
            return c.json({
                address: toAddress,
                hash: null,
                ok: false,
                message: "You can only claim once in every 24 hours"
            })
        }
    }

    try {
        const faucetPrivateKey = c.env.EVM_FAUCET_PRIVATE_KEY;
        const account = privateKeyToAccount(faucetPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain: monadTestnetChain,
            transport: http(),
        });
        const hash = await walletClient.sendTransaction({
            account,
            to: toAddress as `0x${string}`,
            value: parseEther("0.01"),
        })

        await c.env.KV.put(KVKey, new Date().toISOString());

        return c.json({
            address: toAddress,
            hash,
            message: "success",
            ok: true,
        });
    } catch (err) {
        return c.json({
            address: toAddress,
            hash: null,
            message: "Error occurred please try again or report",
            ok: false,
        });
    }
}

export default monadTestnet;