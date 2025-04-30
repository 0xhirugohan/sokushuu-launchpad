import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { type Address } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConfig } from "~/libs/wallet";
import { WalletLayout } from "./walletLayout";
import { LoginLayout } from "./loginLayout";

interface LayoutProps {
    children: ReactNode;
    initialState: State | undefined;
    isLoginRequired?: boolean;
}

const queryClient = new QueryClient();

const Layout: React.FC<LayoutProps> = ({ children, initialState, isLoginRequired }) => {
    const [address, setAddress] = useState<Address | undefined>();
    return <WagmiProvider config={walletConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
            <div className="relative min-w-40 w-full">
                <WalletLayout setAddressProp={setAddress} />
                <div className="flex items-center justify-center min-h-screen">
                    { isLoginRequired && !address && <LoginLayout /> }
                    { ((isLoginRequired && address) || !isLoginRequired) && children}
                </div>
            </div>
        </QueryClientProvider>
    </WagmiProvider>
}

export { Layout, type LayoutProps };