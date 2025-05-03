import type React from "react";
import { parseEther, type Address } from "viem";
import type { State } from "wagmi";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useConnect } from "wagmi";
import { formatEther } from "viem";

import { Layout } from "~/layout";
import { nftLauncherAbi } from "~/abi/nftLauncher";
import { Button } from "~/components/button";
import { walletConfig } from "~/libs/wallet";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";

interface ViewPageProps {
    initialState: State | undefined;
    nftLaunchManagerAddress: Address;
    smartContractAddress: Address;
    tokenId: bigint;
    baseURI: string;
}

const ViewPage: React.FC<ViewPageProps> = ({
    initialState,
    nftLaunchManagerAddress,
    smartContractAddress,
    tokenId,
    baseURI,
}) => {
    return (
        <Layout initialState={initialState}>
            <ViewPageContent
                initialState={initialState}
                nftLaunchManagerAddress={nftLaunchManagerAddress}
                smartContractAddress={smartContractAddress}
                tokenId={tokenId}
                baseURI={baseURI}
            />
        </Layout>
    );
}

const ViewPageContent: React.FC<ViewPageProps> = ({
    nftLaunchManagerAddress,
    smartContractAddress,
    tokenId,
    baseURI,
}) => {
    const { address, status: addressStatus } = useAccount();
    const { refetch } = useReadContract({
        address: smartContractAddress,
        abi: nftLauncherAbi,
        functionName: 'tokenURI',
        args: [
            tokenId as bigint
        ]
    });
    const { refetch: refetchOwnerOf } = useReadContract({
        address: smartContractAddress,
        abi: nftLauncherAbi,
        functionName: 'ownerOf',
        args: [
            tokenId as bigint
        ]
    });
    const { refetch: refetchIsTokenOnSale } = useReadContract({
        address: nftLaunchManagerAddress,
        abi: nftLaunchManagerAbi,
        functionName: 'isTokenOnSale',
        args: [
            smartContractAddress,
            tokenId,
        ]
    });
    const { refetch: refetchTokenSalePrice } = useReadContract({
        address: nftLaunchManagerAddress,
        abi: nftLaunchManagerAbi,
        functionName: 'getTokenSalePrice',
        args: [
            smartContractAddress,
            tokenId,
        ]
    });
    const [imageUrl, setImageUrl] = useState<string>();
    const [ownerAddress, setOwnerAddress] = useState<Address>();
    const [isTokenOnSale, setIsTokenOnSale] = useState<boolean>(false);
    const [tokenSalePrice, setTokenSalePrice] = useState<BigInt>();

    useEffect(() => {
        const readContract = async () => {
            const { data: tokenURI } = await refetch();
            if (tokenURI === undefined) return;

            let url = new URL(tokenURI as string);
            if (baseURI !== 'https://launchpad-dev.sokushuu.de') {
                url = new URL((tokenURI as string).replace('https://launchpad-dev.sokushuu.de', baseURI));
            }
            const result = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const json: { image: string } = await result.json();
            setImageUrl(json.image);

            const resultOwnerOf = await refetchOwnerOf();
            const ownerOfAddress = resultOwnerOf.data;
            setOwnerAddress(ownerOfAddress);
        }
        const readOnSale = async () => {
            const { data } = await refetchIsTokenOnSale();
            setIsTokenOnSale(data ?? false);
        }
        const readTokenSale = async () => {
            const { data } = await refetchTokenSalePrice();
            setTokenSalePrice(data);
        }
        readContract();
        readOnSale();
        readTokenSale();
    }, [smartContractAddress, tokenId]);

    return <div className="w-[90vw] md:w-[40vw] flex flex-col justify-center items-center gap-y-4 p-4 border-2 border-zinc-600 rounded-md">
        { imageUrl && <img 
            className="w-full max-h-[50vh] object-cover"
            src={imageUrl} /> }
        <div className="flex justify-between w-full">
            <a className="text-blue-400 underline" href={`https://pharosscan.xyz/address/${smartContractAddress}`}>{smartContractAddress.slice(0, 6)}...{smartContractAddress.slice(-6)}</a>
            <p>ID {tokenId.toString()}</p>
        </div>
        <div className="flex justify-between w-full">
            { ownerAddress && <p>Owner <a className="text-blue-400 underline" href={`https://pharosscan.xyz/address/${ownerAddress}`} >{ownerAddress.slice(0, 6)}...{ownerAddress.slice(-6)}</a></p> }
            { (tokenSalePrice && (tokenSalePrice as bigint) > BigInt(0)) ? <p>{formatEther(tokenSalePrice as bigint)} PTT</p> : <p></p> }
        </div>
        { addressStatus === 'connected' && address && !isTokenOnSale && <SellSection nftLaunchManagerAddress={nftLaunchManagerAddress} nftContractAddress={smartContractAddress} tokenId={tokenId} /> }
        { addressStatus === 'connected' && address && isTokenOnSale && ownerAddress && ownerAddress === address && <CancelSection
                nftLaunchManagerAddress={nftLaunchManagerAddress}
                nftContractAddress={smartContractAddress}
                tokenId={tokenId}
            />
        }
        { addressStatus === 'connected' && address && isTokenOnSale && ownerAddress && ownerAddress !== address && <BuySection
                nftLaunchManagerAddress={nftLaunchManagerAddress}
                nftContractAddress={smartContractAddress}
                tokenId={tokenId}
                tokenPrice={tokenSalePrice as bigint}
            />
        }
        { addressStatus === 'disconnected' && !address && isTokenOnSale && ownerAddress && ownerAddress !== address && <LoginToBuySection /> }
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
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
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
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
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
        { txHash && <p>Transaction submitted: <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p> }
    </div>
}

export { ViewPage };