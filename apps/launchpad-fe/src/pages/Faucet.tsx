import { useEffect, useState } from 'react'
import { getBalance } from '@wagmi/core'
import { createPublicClient, http, formatEther } from 'viem'

import type { ChangeEvent } from 'react'

import { pharosDevnet, walletConfig } from '../libs'

const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_EVM_PUBLIC_KEY as `0x${string}`;

const Faucet = () => {
    const [inputAddress, setInputAddress] = useState<string>();
    const [addressBalance, setAddressBalance] = useState<bigint>();
    const [faucetBalance, setFaucetBalance] = useState<bigint>(BigInt(0));
    const [message, setMessage] = useState<string>();
    const [txHash, setTxHash] = useState<string>();
    const [apiOk, setApiOk] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    const handleSubmit = async () => {
        setMessage(undefined);
        setTxHash(undefined);
        setApiOk(true);

        if (!/^0x[a-fA-F0-9]{40}$/.test(inputAddress ?? '')) {
            setMessage("Address format is not valid");
            return;
        }

        setIsSubmitting(true);

        const faucetBalancePromise = getBalance(walletConfig, {
            address: FAUCET_ADDRESS,
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

        try {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URI}/faucet/pharos-devnet`, {
            method: 'POST',
            body: JSON.stringify({
                address: inputAddress
            })
        })
        const resultBody = await result.json();

        if (!resultBody.ok || !resultBody.hash) {
            setIsSubmitting(false);
            setApiOk(false);
            setMessage(resultBody.message);
            return;
        }

        setIsSubmitting(false);
        setTxHash(resultBody.hash);
        } catch (err: any) {
            setIsSubmitting(false);
            setApiOk(false);
            setMessage('Something is wrong with the server, please try again');
        }
    }

    useEffect(() => {
        // get balance
        const client = createPublicClient({
            chain: pharosDevnet,
            transport: http(),
        })
        const getBalance = async () => {
            const faucets = await client.getBalance({
                address: FAUCET_ADDRESS,
            });
            setFaucetBalance(faucets);
        }
        getBalance();
    }, []);

    return (
        <div
            className="p-8 w-[80vw] md:w-[40vw] min-h-[80vh] border-2 border-zinc-600 flex flex-col justify-between rounded-lg"
        >
            <div className="flex flex-col gap-y-8">
                <p className="text-xl">Faucet</p>
                <div className="flex flex-col gap-y-2">
                    <p>Faucet Address</p>
                    <input
                        name="faucet_address"
                        className="w-full p-4 border-2 border-zinc-600 rounded-lg"
                        type="text"
                        value={FAUCET_ADDRESS}
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
                <div className="flex flex-col gap-x-4 gap-y-2">
                    {message && <p className={!apiOk ? 'text-red-500' : ''}>{message}</p>}
                    {txHash && <a className="underline" href={`${pharosDevnet.blockExplorers.default.url}/tx/${txHash}`}>{txHash.slice(0, 4)}...{txHash.slice(-4)}</a>}
                </div>
                <button
                    name="claim"
                    onClick={handleSubmit}
                    className="p-4 border-2 border-zinc-600 rounded-lg cursor-pointer hover:opacity-70"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Claiming" : "Claim"}
                </button>
            </div>
        </div>
    )
}

export default Faucet;