import { useState } from 'react'
import { Outlet } from 'react-router'
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { WagmiProvider, deserialize, serialize } from 'wagmi'

import { type Address } from 'viem'

import { walletConfig } from './libs'
import { WalletHeader } from './components';
import { Login } from './pages';
import XIcon from "./assets/x.svg";
import GithubIcon from "./assets/github.svg";

interface LayoutProps {
    // initialState: State | undefined;
    isLoginRequired?: boolean;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1_000 * 60 * 60 * 24 // 24 hours
        }
    }
});

const persister = createSyncStoragePersister({
    serialize,
    storage: window.localStorage,
    deserialize,
})

const Layout: React.FC<LayoutProps> = ({ isLoginRequired }) => {
    const [address, setAddress] = useState<Address | undefined>();
    return <WagmiProvider config={walletConfig}>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <div className="relative min-w-40 w-full">
                <WalletHeader setAddressProp={setAddress} />
                <div className="flex items-center justify-center min-h-screen mb-20">
                    { isLoginRequired && !address && <Login /> }
                    { ((isLoginRequired && address) || !isLoginRequired) && <Outlet />}
                </div>
                <div className="p-4 flex gap-x-4 justify-end">
                    <a
                        href="https://x.com/sokushuu_de"
                        target="_blank"
                    >
                        <img className="w-5 h-5" src={XIcon} />
                    </a>
                    <a
                        href="https://github.com/0xhirugohan/sokushuu-launchpad"
                        target="_blank"
                    >
                        <img className="w-5 h-5" src={GithubIcon} />
                    </a>
                </div>
            </div>
        </PersistQueryClientProvider>
    </WagmiProvider>
}

export { Layout, type LayoutProps };