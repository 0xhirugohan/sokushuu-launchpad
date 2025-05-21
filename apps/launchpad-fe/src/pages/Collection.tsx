import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useChainId, useReadContract } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { fromHex, toHex } from 'viem'

import type { Address } from 'viem';

import { TokenCard } from '../components'
import {
    walletConfig,
    nftLaunchManagerAbi,
    nftLauncherAbi,
    pharosDevnet,
} from '../libs'

interface TokenURI {
    tokenId: bigint;
    tokenURI: string;
}

const pharosDevnetNftLaunchManagerAddress = import.meta.env.VITE_PHAROS_DEVNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const pharosTestnetNftLaunchManagerAddress = import.meta.env.VITE_PHAROS_TESTNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const baseURI = import.meta.env.VITE_BACKEND_BASE_URI;

const Collection = () => {
    const {
        smartContractAddress: smartContractAddressParams,
        chainIdHex: chainIdHexParam,
    } = useParams();
    const [nftLaunchManagerAddress, setNftLaunchManagerAddress] = useState<Address>();
    const [tokenURIs, setTokenURIs] = useState<TokenURI[]>([]);
    const chainId = useChainId();
    const tokenChainId: number = fromHex(
        chainIdHexParam ? chainIdHexParam as Address : toHex(chainId), 
        'number',
    );
    const smartContractAddress: Address = smartContractAddressParams as Address;
    const { data: tokenIdLength } = useReadContract({
        config: walletConfig,
        chainId: tokenChainId,
        abi: nftLaunchManagerAbi,
        address: nftLaunchManagerAddress as Address,
        functionName: 'getContractCurrentTokenId',
        args: [
            smartContractAddress as Address,
        ]
    });

    const getTokenURIs = async () => {
        const length = parseInt(`${tokenIdLength}`);
        const maxContentLength = 20;
        const contracts = Array.from({
            length: length > maxContentLength ? maxContentLength : length,
        }, (_, i) => length - i - 1
        ).map((id) => {
            return {
                chainId: tokenChainId,
                address: smartContractAddress as Address,
                abi: nftLauncherAbi,
                functionName: 'tokenURI',
                args: [
                    id,
                ],
            };
        });
        const tokenURIResults = await readContracts(walletConfig, { contracts });
        const tokenURIsResult = tokenURIResults.map(({ result }, index) => {
            const uri: string = baseURI as string === 'https://launchpad-dev.sokushuu.de' ? result as string : result?.toString().replace('https://launchpad-dev.sokushuu.de', baseURI) as string;
            return { tokenId: BigInt(length - index - 1), tokenURI: uri ?? "" };
        });

        setTokenURIs(tokenURIsResult);
    }

    useEffect(() => {
        if (tokenChainId === pharosDevnet.id) {
            setNftLaunchManagerAddress(pharosDevnetNftLaunchManagerAddress);
            return;
        }

        setNftLaunchManagerAddress(pharosTestnetNftLaunchManagerAddress);
    }, [tokenChainId]);

    useEffect(() => {
        getTokenURIs();
    }, [tokenIdLength])

    if (!tokenIdLength) return <div className="min-h-screen w-full flex items-center">
        <p className="w-full text-center">No tokens found in this contract. Please go back to home screen.</p>
    </div>

    return <div className="flex flex-col gap-y-4 min-h-screen w-full pt-16 px-4">
        <p>Contract: {smartContractAddress.slice(0, 4)}...{smartContractAddress.slice(-4)}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
            {tokenURIs.map((token: TokenURI) => <TokenCard key={token.tokenId} tokenChainId={tokenChainId} token={token} smartContractAddress={smartContractAddress} baseURI={baseURI} />)}
        </div>
    </div>
}

export default Collection;