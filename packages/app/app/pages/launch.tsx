import type React from "react";
import type { State } from "wagmi";
import type { Address } from "viem";

import { Layout } from "~/layout/layout";
import { LaunchLayout } from "~/layout/launchLayout";
import type { WalletLayoutType } from "~/types/walletLayout";

interface LaunchPageProps extends WalletLayoutType {
    initialState: State | undefined;
    nftContracts: Address[];
    managerContractAddress: Address;
}

const LaunchPage: React.FC<LaunchPageProps> = ({ initialState, nftContracts, managerContractAddress, xellarAppId, walletconnectProjectId }) => {
    return <Layout initialState={initialState} isLoginRequired={true} xellarAppId={xellarAppId} walletconnectProjectId={walletconnectProjectId}>
        <LaunchLayout
            initialState={initialState}
            nftContracts={nftContracts}
            managerContractAddress={managerContractAddress}
        />
    </Layout>
}

export { LaunchPage };