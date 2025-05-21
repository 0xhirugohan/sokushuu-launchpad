import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useBalance, useChainId } from 'wagmi'
import { formatUnits } from 'viem'

import type { ChangeEvent } from 'react'
import type { Address } from 'viem'

import { chainMetadataByChainId, walletConfig } from '../libs'

const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_EVM_PUBLIC_KEY as `0x${string}`;

const Faucet = () => {
    const queryClient = useQueryClient();
    const [inputAddress, setInputAddress] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [txHash, setTxHash] = useState<string>();
    const [apiOk, setApiOk] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const chainId = useChainId({ config: walletConfig });
    const { data: faucetBalance, queryKey: faucetBalanceQueryKey } = useBalance({
        address: FAUCET_ADDRESS,
        config: walletConfig,
    });
    const { data: addressBalance, queryKey: addressBalanceQueryKey } = useBalance({
        address: inputAddress as Address,
        config: walletConfig,
    });

    const handleInputAddressChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setInputAddress(event.currentTarget.value);

        if (/^0x[a-fA-F0-9]{40}$/.test(event.currentTarget.value ?? '')) {
            queryClient.invalidateQueries({ queryKey: addressBalanceQueryKey });
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

        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URI}/faucet/${chainId}`, {
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
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: faucetBalanceQueryKey }),
                queryClient.invalidateQueries({ queryKey: addressBalanceQueryKey }),
            ]);
        } catch (err: any) {
            setIsSubmitting(false);
            setApiOk(false);
            setMessage('Something is wrong with the server, please try again');
        }
    }

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
                    {faucetBalance !== undefined && <p>Balance: {formatUnits(faucetBalance.value, faucetBalance.decimals)} {faucetBalance.symbol}</p>}
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
                    {addressBalance !== undefined && <p>Balance: {formatUnits(addressBalance.value, addressBalance.decimals)} {addressBalance.symbol}</p>}
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-x-4 gap-y-2">
                    {message && <p className={!apiOk ? 'text-red-500' : ''}>{message}</p>}
                    {txHash && <a className="underline" href={`${chainMetadataByChainId[chainId].blockExplorerURI}/tx/${txHash}`}>{txHash.slice(0, 4)}...{txHash.slice(-4)}</a>}
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