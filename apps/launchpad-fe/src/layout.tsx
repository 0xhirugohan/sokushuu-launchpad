import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'
import { type Address } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router'

import { walletConfig } from './libs'
import { WalletHeader } from './components';
import { Login } from './pages';
import XIcon from "./assets/x.svg";
import GithubIcon from "./assets/github.svg";

interface LayoutProps {
    // children: ReactNode;
    // initialState: State | undefined;
    isLoginRequired?: boolean;
}

const queryClient = new QueryClient();

const Layout: React.FC<LayoutProps> = ({ isLoginRequired }) => {
    const [address, setAddress] = useState<Address | undefined>();
    const initialState = undefined; // FIXME
    return <WagmiProvider config={walletConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
            <div className="relative min-w-40 w-full">
                <WalletHeader setAddressProp={setAddress} />
                <div className="flex items-center justify-center min-h-screen mb-20">
                    { isLoginRequired && !address && <Login /> }
                    { ((isLoginRequired && address) || !isLoginRequired) && <Outlet />}
                </div>
                <div className="p-4 flex gap-x-4 justify-end fixed bottom-0 left-0 right-0 bg-zinc-100 opacity-95">
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
        </QueryClientProvider>
    </WagmiProvider>
}

export { Layout, type LayoutProps };