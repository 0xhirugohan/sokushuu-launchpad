import type React from "react";
import { useState, useEffect } from "react";
import type { State } from "wagmi";
import { useAccount, useReadContract } from "wagmi";
import type { Address } from "viem";

import { CreateNFTContract, PromptImageLayout } from "~/layout";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { walletConfig } from "~/libs/wallet";

interface LaunchLayoutProps {
    initialState: State | undefined;
    nftContracts: Address[];
    managerContractAddress: Address;
}

const LaunchLayout: React.FC<LaunchLayoutProps> = ({ initialState, nftContracts, managerContractAddress }) => {
    const {
        address,
    } = useAccount({ config: walletConfig });
    const {
        refetch: userOwnedContractRefetch
    } = useReadContract({
        abi: nftLaunchManagerAbi,
        address: managerContractAddress,
        functionName: 'getUserDeployedContracts',
        config: walletConfig,
        args: [address as Address]
    });
    const [userOwnedContracts, setUserOwnedContracts] = useState<readonly Address[]>();
    const [userOwnedContractsStatus, setUserOwnedContractsStatus] = useState<string>();
    const [userSelectedMode, setUserSelectedMode] = useState<'contract' | 'prompt' | 'auto'>('auto');

    const getUserOwnedContracts = async (): Promise<readonly Address[]> => {
        const {
            data,
            status,
            error
        } = await userOwnedContractRefetch();
        if (status === 'success') {
            setUserOwnedContracts(data);
            setUserOwnedContractsStatus(status);
            return data;
        } else {
            console.log({ error });
            return [];
        }
    };

    useEffect(() => {
        getUserOwnedContracts();
    }, [])

    const switchToPrompt = () => {
        setUserSelectedMode('prompt');
    }

    const switchToContract = () => {
        setUserSelectedMode('contract');
        getUserOwnedContracts();
    }

    if ((userOwnedContracts && userOwnedContracts?.length == 0) || userOwnedContractsStatus === 'error' || userSelectedMode === 'contract') return <CreateNFTContract
        isUserOwnNFTContract={(userOwnedContracts && userOwnedContracts.length > 0) ?? false}
        managerContractAddress={managerContractAddress}
        getUserOwnedContracts={getUserOwnedContracts}

        userOwnedAmount={userOwnedContracts?.length ?? 0}
        onCancel={switchToPrompt}
    />;
    else if (userOwnedContractsStatus === 'success' && userOwnedContracts && userOwnedContracts.length > 0) return <PromptImageLayout
        userAddress={address ?? '0x'}
        managerContractAddress={managerContractAddress}
        ownedNftContracts={userOwnedContracts}
        onAddContract={switchToContract}
    />
    return <div>Loading...</div>;
}

export { LaunchLayout };