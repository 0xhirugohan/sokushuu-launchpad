import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'

import type { Address } from 'viem'

import { CreateNFTContract, PromptImage } from './'
import { walletConfig, nftLaunchManagerAbi } from '../libs'

const managerContractAddress = import.meta.env.VITE_LAUNCH_MANAGER_PUBLIC_ADDRESS;

const Launch = () => {
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
        onCancel={switchToPrompt}
    />;
    else if (userOwnedContractsStatus === 'success' && userOwnedContracts && userOwnedContracts.length > 0) return <PromptImage
        userAddress={address ?? '0x'}
        managerContractAddress={managerContractAddress}
        ownedNftContracts={userOwnedContracts}
        onAddContract={switchToContract}
    />
    return <div>Loading...</div>;
}

export default Launch;