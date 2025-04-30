import type React from "react";
import type { State } from "wagmi";
import type { Address } from "viem";

import { Layout } from "~/layout/layout";
import { LaunchLayout } from "~/layout/launchLayout";

interface LaunchPageProps {
    initialState: State | undefined;
    nftContracts: Address[];
    managerContractAddress: Address;
}

const LaunchPage: React.FC<LaunchPageProps> = ({ initialState, nftContracts, managerContractAddress }) => {
    return <Layout initialState={initialState} isLoginRequired={true}>
        <LaunchLayout
            initialState={initialState}
            nftContracts={nftContracts}
            managerContractAddress={managerContractAddress}
        />
    </Layout>
}

export { LaunchPage };