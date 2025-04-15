import { type ReactNode } from "react";
import { type State, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConfig } from "~/libs/wallet";
import { WalletLayout } from "./walletLayout";

interface LayoutProps {
    children: ReactNode;
    initialState: State | undefined;
}

const queryClient = new QueryClient();

const Layout: React.FC<LayoutProps> = ({ children, initialState }) => {
    return <WagmiProvider config={walletConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
            <div className="relative min-w-40 w-full">
                <WalletLayout />
                <div className="flex items-center justify-center min-h-screen">
                    {children}
                </div>
            </div>
        </QueryClientProvider>
    </WagmiProvider>
}

export { Layout, type LayoutProps };