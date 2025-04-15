"use client"

import { useEffect, useState } from "react";
import type React from "react";
import type { Address } from "viem";
import type { State } from "wagmi";

import { pharosDevnet } from "~/libs/chain";
import { Layout } from "~/layout/layout";
import { walletClient } from "~/wallet/client.client";

interface ChainPageProps {
    initialState: State | undefined;
}

const ChainPage: React.FC<ChainPageProps> = ({ initialState }) => {
    const [stateAddresses, setStateAddresses] = useState<Address[] | null>();

    useEffect(() => {
        const getAddresses = async () => {
            const addresses = await walletClient.getAddresses();
            setStateAddresses(addresses);
        }
        getAddresses();
    }, [])

    const handleAddChain = async () => {
        if (stateAddresses && stateAddresses.length > 0) {
            // disconnect
            setStateAddresses(null);
        } else {
            const addresses = await walletClient.requestAddresses();
            setStateAddresses(addresses);
            await walletClient.addChain({ chain: pharosDevnet })
        }
    }

    return <Layout initialState={initialState}>
        <div className="min-h-[80vh] min-w-[50vw] border-2 border-zinc-600 rounded-md p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-y-8">
                <p className="text-xl text-center">Chain Info</p>
                <div className="flex flex-col gap-y-4">
                    <div>
                        <p>RPC Public Endpoint</p>
                        <a
                            className="underline"
                            href={pharosDevnet.rpcUrls.default.http[0] as string}>
                            {pharosDevnet.rpcUrls.default.http[0]}
                        </a>
                    </div>
                    <div>
                        <p>Explorer</p>
                        <a
                            className="underline"
                            href={pharosDevnet.blockExplorers.default.url}>
                            {pharosDevnet.blockExplorers.default.url}
                        </a>
                    </div>
                    <div>
                        <p>ChainID</p>
                        <p>{pharosDevnet.id}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-y-4">
                <button
                    onClick={handleAddChain}
                    className="border-2 border-zinc-600 p-2 rounded-md cursor-pointer"
                >
                    { stateAddresses && stateAddresses.length > 0 ? "Connected" : "Add to Wallet" }
                </button>
            </div>
        </div>
    </Layout>
};

export { ChainPage }