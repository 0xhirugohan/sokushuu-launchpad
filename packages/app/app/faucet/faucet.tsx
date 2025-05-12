import { useEffect, useState, type ChangeEvent } from "react";
import type React from "react";
import { useFetcher, useSubmit } from "react-router";
import type { State } from "wagmi";
import { getBalance } from "@wagmi/core";
import { createPublicClient, http, formatEther } from "viem";

import { pharosDevnet } from "~/libs/chain";
import { Layout } from "~/layout/layout";
import { walletConfig } from "~/libs/wallet";
import type { WalletLayoutType } from "~/types/walletLayout";

interface FaucetPageProps extends WalletLayoutType {
    initialState: State | undefined;
    faucet: { balance: bigint; address: `0x${string}` };
    constant: {
        MAXIMUM_ETH_BALANCE_TO_CLAIM_FAUCET: bigint;
        FAUCET_DRIP_AMOUNT_IN_ETH: bigint;
    };
}

const Faucet: React.FC<FaucetPageProps> = ({ initialState, faucet, constant, xellarAppId, walletconnectProjectId }) => {
    const submit = useSubmit();
    const fetcher = useFetcher();
    const [inputAddress, setInputAddress] = useState<string>();
    const [addressBalance, setAddressBalance] = useState<bigint>();
    const [faucetBalance, setFaucetBalance] = useState<bigint>(faucet.balance);
    const message = fetcher.data?.message;
    const txHash = fetcher.data?.hash;
    const apiOk = fetcher.data?.ok;

    const handleInputAddressChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setInputAddress(event.currentTarget.value);
        setAddressBalance(BigInt(0));

        if (/^0x[a-fA-F0-9]{40}$/.test(event.currentTarget.value ?? '')) {
            const newInputBalance = await getBalance(walletConfig, {
                address: event.currentTarget.value as `0x${string}`
            });
            setAddressBalance(newInputBalance.value);
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(inputAddress ?? '')) {
            alert("Address format is not valid");
            return;
        }

        const faucetBalancePromise = getBalance(walletConfig, {
            address: faucet.address,
        });
        const inputBalancePromise = getBalance(walletConfig, {
            address: inputAddress as `0x${string}`,
        });
        const [newFaucetBalance, newInputBalance] = await Promise.all([
            faucetBalancePromise,
            inputBalancePromise,
        ]);

        setFaucetBalance(newFaucetBalance.value);
        setAddressBalance(newInputBalance.value);

        if (newFaucetBalance.value < constant.FAUCET_DRIP_AMOUNT_IN_ETH) {
            alert("Faucet has insufficient balance");
            return;
        }

        if (newInputBalance.value >= constant.MAXIMUM_ETH_BALANCE_TO_CLAIM_FAUCET) {
            alert("You have an enough balance");
            return;
        }

        submit(event.currentTarget);
    }

    useEffect(() => {
        // get balance
        const client = createPublicClient({
            chain: pharosDevnet,
            transport: http(),
        })
        const getBalance = async () => {
            const faucets = await client.getBalance({
                address: faucet.address,
            });
            setFaucetBalance(faucets);
        }
        getBalance();
    }, []);

    return (
        <Layout initialState={initialState} xellarAppId={xellarAppId} walletconnectProjectId={walletconnectProjectId}>
            <fetcher.Form
                className="p-8 w-[80vw] md:w-[40vw] min-h-[80vh] border-2 border-zinc-600 flex flex-col justify-between rounded-lg"
                method="POST"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-y-8">
                    <p className="text-xl">Faucet</p>
                    <div className="flex flex-col gap-y-2">
                        <p>Faucet Address</p>
                        <input
                            name="faucet_address"
                            className="w-full p-4 border-2 border-zinc-600 rounded-lg"
                            type="text"
                            value={faucet.address}
                            disabled
                        />
                        {faucetBalance !== undefined && <p>Balance: {formatEther(faucetBalance)} PTT</p>}
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label>Wallet Address</label>
                        <input
                            id="wallet_address"
                            onChange={handleInputAddressChange}
                            name="address"
                            className="p-4 border-2 border-zinc-600 rounded-lg"
                            type="text"
                            placeholder="0x68FcE2692772f5B51A638D1c288C06951b91A4b1"
                            value={inputAddress}
                        />
                        {addressBalance !== undefined && <p>Balance: {formatEther(addressBalance)} PTT</p>}
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex gap-x-4">
                        {message && <p className={!apiOk ? 'text-red-500' : ''}>{message}</p>}
                        {txHash && <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash.slice(0, 4)}...{txHash.slice(-4)}</a>}
                    </div>
                    <button
                        name="claim"
                        type="submit"
                        className="p-4 border-2 border-zinc-600 rounded-lg cursor-pointer hover:opacity-70"
                        disabled={fetcher.state !== "idle"}
                    >
                        {fetcher.state !== "idle" ? "Claiming" : "Claim"}
                    </button>
                </div>
            </fetcher.Form>
        </Layout>
    )
}

export { Faucet };