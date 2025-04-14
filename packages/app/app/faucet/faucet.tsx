import { useEffect, useState, type ChangeEvent } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { createPublicClient, http, formatEther, parseEther } from "viem";

import { pharosDevnet } from "~/libs/chain";
import { Layout } from "~/layout/layout";

const Faucet = () => {
    const fetcher = useFetcher();
    const [inputAddress, setInputAddress] = useState<string>();
    const [addressBalance, setAddressBalance] = useState<bigint>();
    const [faucetBalance, setFaucetBalance] = useState<bigint>();
    const message = fetcher.data?.message;
    const txHash = fetcher.data?.hash;
    const apiOk = fetcher.data?.ok;
    const faucetAddress = "0x82e1530f26CfEFA6fBF43F4DCdE35A1692ee629c";

    const handleInputAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputAddress(event.currentTarget.value);
    }

    const isBalanceHasSufficientETH = (balanceProp: bigint) => 
        balanceProp >= BigInt(parseEther("0.1"))

    const getBalances = async () => {
        const client = createPublicClient({
            chain: pharosDevnet,
            transport: http(),
        })

        const balancePromise = client.getBalance({
            address: inputAddress as `0x${string}`,
        });
        const faucetBalancePromise = client.getBalance({
            address: faucetAddress as `0x${string}`,
        });
        const [balance, faucets] = await Promise.all([balancePromise, faucetBalancePromise]);
        setAddressBalance(balance);
        setFaucetBalance(faucets);
    }

    getBalances();

    useEffect(() => {
        if (inputAddress && /^0x[a-fA-F0-9]{40}$/.test(inputAddress)) {
            // get balance
            getBalances();
        } else {
            setAddressBalance(undefined);
        }
    }, [inputAddress]);

    useEffect(() => {
        // get balance
        const client = createPublicClient({
            chain: pharosDevnet,
            transport: http(),
        })
        const getBalance = async () => {
            const faucets = await client.getBalance({
                address: faucetAddress as `0x${string}`,
            });
            setFaucetBalance(faucets);
        }
        getBalance();
    }, []);

    return (
        <Layout>
            <fetcher.Form
                className="p-8 w-[80vw] md:w-[40vw] min-h-[80vh] border-2 border-zinc-600 flex flex-col justify-between rounded-lg"
                method="POST"
            >
                <div className="flex flex-col gap-y-8">
                    <p className="text-xl">Faucet</p>
                    <div className="flex flex-col gap-y-2">
                        <p>Faucet Address</p>
                        <input
                            name="faucet_address"
                            className="w-full p-4 border-2 border-zinc-600 rounded-lg"
                            type="text"
                            value={faucetAddress}
                            disabled
                        />
                        {faucetBalance !== undefined && <p>Balance: {formatEther(faucetBalance)} ETH</p>}
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
                        {addressBalance !== undefined && <p>Balance: {formatEther(addressBalance)} ETH</p>}
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex gap-x-4">
                        {message && <p className={!apiOk ? 'text-red-500' : ''}>{message}</p>}
                        {txHash && <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash.slice(0, 4)}...{txHash.slice(-4)}</a>}
                    </div>
                    {   addressBalance && isBalanceHasSufficientETH(addressBalance!) ? <p>You have an enough ETH</p> : 
                        <button
                            name="claim"
                            type="submit"
                            className="p-4 border-2 border-zinc-600 rounded-lg cursor-pointer hover:opacity-70"
                            disabled={fetcher.state !== "idle" || isBalanceHasSufficientETH(addressBalance!)}
                        >
                            {fetcher.state !== "idle" ? "Claiming" : "Claim"}
                        </button>
                    }
                </div>
            </fetcher.Form>
        </Layout>
    )
}

export { Faucet };