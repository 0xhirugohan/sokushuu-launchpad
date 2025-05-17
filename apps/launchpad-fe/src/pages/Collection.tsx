import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { readContract, readContracts } from '@wagmi/core'

import type { Address } from 'viem';

import { TokenCard } from '../components'
import {
    walletConfig,
    nftLaunchManagerAbi,
    nftLauncherAbi,
} from '../libs'

interface TokenURI {
    tokenId: bigint;
    tokenURI: string;
}

const nftLaunchManagerAddress = import.meta.env.VITE_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const baseURI = import.meta.env.VITE_BACKEND_BASE_URI;

const Collection = () => {
    const { smartContractAddress: smartContractAddressParams } = useParams();
    const [tokenURIs, setTokenURIs] = useState<TokenURI[]>([]);
    const smartContractAddress: Address = smartContractAddressParams as Address;

    const getTokenURIs = async () => {
        const tokenIdLength: bigint = await readContract(walletConfig, {
            abi: nftLaunchManagerAbi,
            address: nftLaunchManagerAddress as Address,
            functionName: 'getContractCurrentTokenId',
            args: [
                smartContractAddress as Address,
            ]
        });

        const length = parseInt(`${tokenIdLength}`);
        const maxContentLength = 4;
        const contracts = Array.from({
            length: length > maxContentLength ? maxContentLength : length,
        }, (_, i) => length - i - 1
        ).map((id) => {
            return {
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
        getTokenURIs();
    }, []);

    return <div className="flex flex-col gap-y-4 min-h-screen w-full pt-16 px-4">
        <p>Contract: {smartContractAddress.slice(0, 4)}...{smartContractAddress.slice(-4)}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
            {tokenURIs.map((token: TokenURI) => <TokenCard token={token} smartContractAddress={smartContractAddress} baseURI={baseURI} />)}
        </div>
    </div>
}

export default Collection;