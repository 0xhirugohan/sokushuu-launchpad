"use client"

import { useEffect, useState } from "react";
import { createPublicClient, http, formatEther } from "viem";

import type { Address, EIP1193Provider } from "viem";

import { walletClient } from './client.client';
import { pharosDevnet } from "../libs/chain";

import WalletIcon from "../icons/wallet.svg";

declare global {
    interface Window {
        ethereum: EIP1193Provider;
    }
}

const publicClient = createPublicClient({
    chain: pharosDevnet,
    transport: http(),
})

/*
const walletClient = createWalletClient({
    chain: pharosDevnet,
    transport: custom(window.ethereum!),
})
*/

interface AccountWithBalance {
    address: Address;
    balance: bigint;
}

const Wallet = () => {
    const [blockNumberState, setBlockNumberState] = useState<bigint>();
    const [addressesState, setAddressesState] = useState<Address[]>([]);
    const [accountWithBalancesState, setAccountWithBalancesState] = useState<AccountWithBalance[]>([]);
    
    useEffect(() => {
        const getBlockNumber = async () => {
            const blockNumber = await publicClient.getBlockNumber();
            setBlockNumberState(blockNumber);
        };
        
        getBlockNumber();
    }, []);

    useEffect(() => {
        const getAccountBalance = async () => {
            const promises: Promise<{ address: Address, balance: bigint }>[] = Array.from(
                addressesState,
                async (address) => {
                    return {
                        address,
                        balance: await publicClient.getBalance({ address })
                    }
                }
            );
            const accountWithBalances = await Promise.all(promises);
            setAccountWithBalancesState(accountWithBalances);
        };
        getAccountBalance();
    }, [addressesState])

    const connectWallet = async () => {
        const accounts: Address[] = await walletClient.requestAddresses();
        setAddressesState(accounts);
    }

    return (
        <div className="bg-zinc-100 w-full min-h-screen">
            <div className="p-4 flex flex-col gap-y-2">
                <h1 className="text-lg">Hello Wallet</h1>
                <h1><span className="font-semibold">Block Number</span>: {blockNumberState}</h1>
                {accountWithBalancesState.length === 0 && 
                    <button onClick={connectWallet} className="w-40 flex gap-x-2 border-2 border-zinc-600 px-4 py-2 justify-center rounded-md cursor-pointer">
                        <span>Connect</span>
                        <img src={WalletIcon} />
                    </button>
                }
                {accountWithBalancesState.length > 0 && 
                    <p>Accounts: 
                        <ul>
                            {accountWithBalancesState?.map(account => <div>
                                <li>{account.address}: {formatEther(account.balance)} ETH</li>
                            </div>)}
                        </ul>
                    </p>
                }
            </div>
        </div>
    );
}

export { Wallet };