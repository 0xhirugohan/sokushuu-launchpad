import type React from "react";
import type { State } from "wagmi";
import {
    useAccount,
    useConnect,
    useDisconnect,
} from "wagmi";

import { pharosDevnet } from "~/libs/chain";
import { Layout } from "~/layout/layout";
import { walletConfig } from "~/libs/wallet";

interface ChainPageProps {
    initialState: State | undefined;
}

const ChainPage: React.FC<ChainPageProps> = ({ initialState }) => {
    return <Layout initialState={initialState}>
        <ChainContent />
    </Layout>
};

const ChainContent = () => {
    const { address } = useAccount({ config: walletConfig });
    const { connectors, connect } = useConnect({ config: walletConfig });
    const { disconnect } = useDisconnect({ config: walletConfig });

    const handleAddChain = async () => {
        if (address) {
            // disconnect
            disconnect();
        } else {
            connect({ connector: connectors[0] });
        }
    }

    return <div className="min-h-[80vh] min-w-[50vw] border-2 border-zinc-600 rounded-md p-4 flex flex-col justify-between">
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
                { address ? "Connected" : "Add to Wallet" }
            </button>
        </div>
    </div>
}

export { ChainPage }