import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useChainId, useReadContract } from 'wagmi'

import type { Address } from 'viem'

import { CreateNFTContract, PromptImage } from './'
import { walletConfig, nftLaunchManagerAbi, pharosDevnet } from '../libs'

const pharosDevnetManagerContractAddress = import.meta.env.VITE_PHAROS_DEVNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const pharosTestnetManagerContractAddress = import.meta.env.VITE_PHAROS_TESTNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;

const Launch = () => {
    const queryClient = useQueryClient();
    const chainId = useChainId();
    const [managerContractAddress, setManagerContractAddress] = useState<Address>();
    const {
        address,
    } = useAccount({ config: walletConfig });
    const {
        data: userOwnedContracts,
        status: userOwnedContractsStatus,
        queryKey: userOwnedContractsQueryKey,
    } = useReadContract({
        abi: nftLaunchManagerAbi,
        address: managerContractAddress,
        functionName: 'getUserDeployedContracts',
        config: walletConfig,
        args: [address as Address]
    });
    const [userSelectedMode, setUserSelectedMode] = useState<'contract' | 'prompt' | 'auto'>('auto');

    const getUserOwnedContracts = () => {
        queryClient.invalidateQueries({ queryKey: userOwnedContractsQueryKey });
    }

    useEffect(() => {
        getUserOwnedContracts();
        if (chainId === pharosDevnet.id) {
            setManagerContractAddress(pharosDevnetManagerContractAddress);
            return;
        }

        setManagerContractAddress(pharosTestnetManagerContractAddress);
    }, [chainId])

    const switchToPrompt = () => {
        setUserSelectedMode('prompt');
        getUserOwnedContracts();
    }

    const switchToContract = () => {
        setUserSelectedMode('contract');
        getUserOwnedContracts();
    }

    if ((userOwnedContracts && userOwnedContracts?.length == 0) || userOwnedContractsStatus === 'error' || userSelectedMode === 'contract') return <CreateNFTContract
        isUserOwnNFTContract={(userOwnedContracts && userOwnedContracts.length > 0) ?? false}
        managerContractAddress={managerContractAddress as Address}
        onCancel={switchToPrompt}
    />;
    else if (userOwnedContractsStatus === 'success' && userOwnedContracts && userOwnedContracts.length > 0) return <PromptImage
        userAddress={address ?? '0x'}
        managerContractAddress={managerContractAddress as Address}
        ownedNftContracts={userOwnedContracts}
        onAddContract={switchToContract}
    />
    return <div>Loading...</div>;
}

export default Launch;