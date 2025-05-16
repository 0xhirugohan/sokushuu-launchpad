import { Context } from 'hono'
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { pharosDevnetChain } from '../../libs'

const pharosDevnet = async (c: Context) => {
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

    /*
    const isUserEligible = await isUserEligibleToClaimFaucet(context, toAddress);
    if (!isUserEligible) {
        return {
            address: formData.get("address"),
            hash: null,
            message: "You can only claim once in every 24 hours",
            ok: false,
        }
    }
    */

    try {
        const faucetPrivateKey = c.env.EVM_FAUCET_PRIVATE_KEY;
        const account = privateKeyToAccount(faucetPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain: pharosDevnetChain,
            transport: http(c.env.PHAROS_DEVNET_RPC_URI),
        });
        const hash = await walletClient.sendTransaction({
            account,
            to: toAddress as `0x${string}`,
            value: parseEther("0.01"),
        })

        // await setUserLatestFaucetClaim(context, toAddress);

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

export default pharosDevnet;