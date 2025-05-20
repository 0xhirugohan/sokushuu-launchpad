import { useEffect, useState } from 'react'
import { useParams, NavLink } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
    useAccount,
    useChainId,
    useConnect,
    useReadContract,
    useWriteContract
} from 'wagmi'
import { readContracts } from '@wagmi/core'
import { parseEther, formatEther } from 'viem'

import type { Address } from 'viem'

import { Button, TokenCard } from '../components'
import {
    walletConfig,
    nftLaunchManagerAbi,
    nftLauncherAbi,
    pharosDevnet,
} from '../libs'
import XIcon from '../assets/x.svg'

const pharosDevnetNftLaunchManagerAddress = import.meta.env.VITE_PHAROS_DEVNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const pharosTestnetNftLaunchManagerAddress = import.meta.env.VITE_PHAROS_TESTNET_LAUNCH_MANAGER_PUBLIC_ADDRESS;
const baseURI = import.meta.env.VITE_BACKEND_BASE_URI;

interface TokenURI {
    tokenId: bigint;
    tokenURI: string;
}

const View = () => {
    const { smartContractAddress: smartContractAddressParam, tokenId: tokenIdParam } = useParams();
    const queryClient = useQueryClient();
    const smartContractAddress: Address = smartContractAddressParam as Address;
    const [nftLaunchManagerAddress, setNftLaunchManagerAddress] = useState<Address>();
    const tokenId: bigint = BigInt(tokenIdParam ?? 0);
    const { address, status: addressStatus } = useAccount();
    const chainId = useChainId();
    const { data: tokenURI, queryKey: tokenURIQueryKey } = useReadContract({
        address: smartContractAddress,
        abi: nftLauncherAbi,
        functionName: 'tokenURI',
        args: [
            tokenId as bigint
        ]
    });
    const { data: ownerAddress, queryKey: ownerAddressQueryKey } = useReadContract({
        address: smartContractAddress,
        abi: nftLauncherAbi,
        functionName: 'ownerOf',
        args: [
            tokenId as bigint
        ]
    });
    const { data: isTokenOnSale } = useReadContract({
        address: nftLaunchManagerAddress,
        abi: nftLaunchManagerAbi,
        functionName: 'isTokenOnSale',
        args: [
            smartContractAddress,
            tokenId,
        ]
    });
    const { data: tokenSalePrice } = useReadContract({
        address: nftLaunchManagerAddress,
        abi: nftLaunchManagerAbi,
        functionName: 'getTokenSalePrice',
        args: [
            smartContractAddress,
            tokenId,
        ]
    });
    const { data: tokenIdLength } = useReadContract({
        config: walletConfig,
        abi: nftLaunchManagerAbi,
        address: nftLaunchManagerAddress as Address,
        functionName: 'getContractCurrentTokenId',
        args: [
            smartContractAddress as Address,
        ]
    });
    const [imageUrl, setImageUrl] = useState<string>();
    const [tokenURIs, setTokenURIs] = useState<TokenURI[]>([]);

    const getTokenURIs = async () => {
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
        const handleTokenUriChange = async () => {
            if (tokenURI === undefined) return;

            let url = new URL(tokenURI as string);
            if (baseURI !== 'https://launchpad.sokushuu.de') {
                url = new URL((tokenURI as string).replace('https://launchpad.sokushuu.de', baseURI));
            }
            const result = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const json: { image: string } = await result.json();
            setImageUrl(json.image);

            await queryClient.invalidateQueries({ queryKey: ownerAddressQueryKey });
        }
        handleTokenUriChange();
    }, [tokenURI])

    useEffect(() => {
        if (chainId === pharosDevnet.id) {
            setNftLaunchManagerAddress(pharosDevnetNftLaunchManagerAddress);
            return;
        }

        setNftLaunchManagerAddress(pharosTestnetNftLaunchManagerAddress);
        queryClient.invalidateQueries({ queryKey: tokenURIQueryKey });
    }, [chainId])

    useEffect(() => {
        if (tokenIdLength && nftLaunchManagerAddress) {
            getTokenURIs();
        }
    }, [tokenIdLength, nftLaunchManagerAddress])

    if (!tokenURI) return <div className="w-full min-h-screen flex justify-between items-center text-center">
        <p className="w-full">No Token Found. Please go back to Home Screen.</p>
    </div>

    return <div className="w-full min-h-screen pt-16 px-4 flex flex-col gap-y-8">
        <div className="w-full flex flex-col gap-y-4 justify-center items-center">
            <div className="w-[90vw] md:w-[40vw] flex flex-col justify-center items-center gap-y-4 p-4 border-2 border-zinc-600 rounded-md">
                { imageUrl && <img 
                    className="w-full max-h-[50vh] object-cover"
                    src={imageUrl} /> }
                <div className="flex justify-between w-full">
                    <NavLink
                        className="text-blue-400 underline"
                        to={`/view/${smartContractAddress}`}>
                        {smartContractAddress.slice(0, 6)}...{smartContractAddress.slice(-6)}
                    </NavLink>
                    <a
                        className="text-blue-400 underline"
                        href={`https://devnet.pharosscan.xyz/token/${smartContractAddress}/instance/${tokenId.toString()}`}
                    >
                        ID {tokenId.toString()}
                    </a>
                </div>
                <div className="flex justify-between w-full">
                    { ownerAddress && <p>Owner <a className="text-blue-400 underline" href={`https://devnet.pharosscan.xyz/address/${ownerAddress}`} >{ownerAddress.slice(0, 6)}...{ownerAddress.slice(-6)}</a></p> }
                    { (tokenSalePrice && (tokenSalePrice as bigint) > BigInt(0)) ? <p>{formatEther(tokenSalePrice as bigint)} PTT</p> : <p></p> }
                </div>
                { addressStatus === 'connected' && address && !isTokenOnSale && ownerAddress && ownerAddress === address && <SellSection nftLaunchManagerAddress={nftLaunchManagerAddress as Address} nftContractAddress={smartContractAddress} tokenId={tokenId} /> }
                { addressStatus === 'connected' && address && isTokenOnSale && ownerAddress && ownerAddress === address && <CancelSection
                        nftLaunchManagerAddress={nftLaunchManagerAddress as Address}
                        nftContractAddress={smartContractAddress}
                        tokenId={tokenId}
                    />
                }
                { addressStatus === 'connected' && address && isTokenOnSale && ownerAddress && ownerAddress !== address && <BuySection
                        nftLaunchManagerAddress={nftLaunchManagerAddress as Address}
                        nftContractAddress={smartContractAddress}
                        tokenId={tokenId}
                        tokenPrice={tokenSalePrice as bigint}
                    />
                }
                { addressStatus === 'disconnected' && !address && isTokenOnSale && ownerAddress && ownerAddress !== address && <LoginToBuySection /> }
            </div>
            <a
                href={`https://twitter.com/intent/tweet?text=Look%20at%20this%20NFT%20at%20@sokushuu_de.%20Are%20you%20interested?%20&url=${baseURI}/view/${smartContractAddress}/${tokenId}`}
                target="_blank"
                className="p-2 flex gap-x-2 border-2 border-zinc-600 rounded-md"
            >
                Share on <img className="w-5 h-5" src={XIcon} />
            </a>
        </div>
        { tokenURIs.length > 1 && 
            <div className="flex flex-col gap-y-4">
                <p className="text-center">See others</p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-1 gap-x-4 gap-y-4">
                    {tokenURIs.map(token => <TokenCard token={token} smartContractAddress={smartContractAddress} baseURI={baseURI} />)}
                </div>
            </div>
        }
    </div>
}

interface SellSectionProps {
    nftLaunchManagerAddress: Address;
    nftContractAddress: Address;
    tokenId: bigint;
}

const SellSection: React.FC<SellSectionProps> = ({ nftLaunchManagerAddress, nftContractAddress, tokenId }) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const [isSellMode, setIsSellMode] = useState<boolean>(false);
    const [sellingPrice, setSellingPrice] = useState<string>("0");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>();

    const handleSellMode = () => {
        setIsSellMode(true);
    }

    const handleCancelMode = () => {
        setSellingPrice("0");
        setIsSellMode(false);
    }

    const onSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const validFormatRegex = /^(0|[1-9]\d*)(\.\d*)?$/;
        if (value === "") {
            setSellingPrice("0");
        } else if (validFormatRegex.test(value)) {
            setSellingPrice(value);
        }
    }

    const onSellSubmit = async () => {
        setIsLoading(true);
        try {
            await writeContractAsync({
                abi: nftLauncherAbi,
                address: nftContractAddress,
                functionName: 'approve',
                args: [
                    nftLaunchManagerAddress,
                    tokenId,
                ],
                gas: BigInt(100000),
            });

            const hash = await writeContractAsync({
                abi: nftLaunchManagerAbi,
                address: nftLaunchManagerAddress,
                functionName: 'listTokenToSell',
                args: [
                    nftContractAddress,
                    tokenId,
                    parseEther(sellingPrice),
                ],
            });
            setTxHash(hash);
            setIsLoading(false);
            setIsSellMode(false);
        } catch (err) {
            console.log({ err });
            setIsLoading(false);
        }
    }

    if (isSellMode) {
        return <div className="w-full flex flex-col gap-y-2">
            <div className="py-2 flex items-center border-2 border-zinc-600 rounded-md">
                <input
                    className="grow text-right h-full focus:outline-[0px] w-full"
                    type="text"
                    inputMode="decimal"
                    onScroll={() => {}}
                    placeholder="0.1"
                    value={sellingPrice}
                    onChange={onSellingPriceChange}
                />
                <p className="px-2">PTT</p>
            </div>
            <div className="flex flex-col gap-y-2 md:flex-row-reverse md:gap-x-2">
                <Button onClick={onSellSubmit} className="w-full px-4">
                    {isLoading ? 'Selling...' : 'Sell'}
                </Button>
                <Button onClick={handleCancelMode} className="w-full px-4">Cancel</Button>
            </div>
        </div>;
    }

    return <div className="w-full flex flex-col gap-y-4">
        <Button
            onClick={handleSellMode}
            className="w-full"
            disabled={!!txHash}
        >
            { !!txHash ? 'Listed to Sell' : 'Sell' }
        </Button>
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://devnet.pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
    </div>
};

interface BuySectionProps {
    nftLaunchManagerAddress: Address;
    nftContractAddress: Address;
    tokenId: bigint;
    tokenPrice: bigint;
}

const BuySection: React.FC<BuySectionProps> = ({
    nftLaunchManagerAddress,
    nftContractAddress,
    tokenId,
    tokenPrice,
}) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>();
    
    const handleBuy = async () => {
        setIsLoading(true);

        const hash = await writeContractAsync({
            abi: nftLaunchManagerAbi,
            address: nftLaunchManagerAddress,
            functionName: 'buyListedToken',
            args: [
                nftContractAddress,
                tokenId,
            ],
            value: tokenPrice,
        });       

        setTxHash(hash);
        setIsLoading(false);
    }

    return <div className="w-full flex flex-col gap-y-4">
        <Button
            onClick={handleBuy}
            className="w-full"
            disabled={isLoading || !!txHash}
        >
            { isLoading && !txHash && 'Buying...' }
            { !isLoading && !txHash && 'Buy' }
            { !isLoading && !!txHash && 'Bought' }
        </Button>
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://devnet.pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
    </div>
}

const LoginToBuySection = () => {
    const { connectAsync, connectors } = useConnect();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleConnect = async () => {
        setIsLoading(true);
        await connectAsync({ connector: connectors[0] });
        setIsLoading(false);
    }

    return <Button onClick={handleConnect} className="w-full" disabled={isLoading}>
        { isLoading ? 'Loading...' : 'Login to Buy' }
    </Button>
}

interface CancelSectionProps {
    nftLaunchManagerAddress: Address;
    nftContractAddress: Address;
    tokenId: bigint;
}

const CancelSection: React.FC<CancelSectionProps> = ({
    nftLaunchManagerAddress,
    nftContractAddress,
    tokenId,
}) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>();
    
    const handleCancel = async () => {
        setIsLoading(true);

        const hash = await writeContractAsync({
            abi: nftLaunchManagerAbi,
            address: nftLaunchManagerAddress,
            functionName: 'cancelTokenListing',
            args: [
                nftContractAddress,
                tokenId,
            ],
        });       

        setTxHash(hash);
        setIsLoading(false);
    }

    return <div className="w-full flex flex-col gap-y-4">
        <Button
            onClick={handleCancel}
            className="w-full"
            disabled={isLoading || !!txHash}
        >
            { isLoading && !txHash && 'Canceling...' }
            { !isLoading && !txHash && 'Cancel Listing' }
            { !isLoading && !!txHash && 'Canceled' }
        </Button>
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://devnet.pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
    </div>
}

export default View;