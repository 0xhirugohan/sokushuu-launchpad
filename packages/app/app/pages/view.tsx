import type React from "react";
import type { Address } from "viem";
import type { State } from "wagmi";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

import { Layout } from "~/layout";
import { nftLauncherAbi } from "~/abi/nftLauncher";

interface ViewPageProps {
    initialState: State | undefined;
    smartContractAddress: Address;
    tokenId: BigInt;
}

const ViewPage: React.FC<ViewPageProps> = ({
    initialState,
    smartContractAddress,
    tokenId,
}) => {
    return (
        <Layout initialState={initialState}>
            <ViewPageContent
                initialState={initialState}
                smartContractAddress={smartContractAddress}
                tokenId={tokenId}
            />
        </Layout>
    );
}

const ViewPageContent: React.FC<ViewPageProps> = ({
    smartContractAddress,
    tokenId,
}) => {
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
    const [imageUrl, setImageUrl] = useState<string>();
    const [ownerAddress, setOwnerAddress] = useState<Address>();

    useEffect(() => {
        const readContract = async () => {
            const { data: tokenURI } = await refetch();
            // const url = new URL((tokenURI as string).replace('https://launchpad-dev.sokushuu.de', 'http://localhost:5173'));
            const url = new URL(tokenURI as string);
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
        readContract();
    }, [smartContractAddress, tokenId]);

    return <div className="flex flex-col justify-center items-center gap-y-4">
        { imageUrl && <img 
            className="h-[50vh]"
            src={imageUrl} /> }
        <p>NFT Contract: <a className="text-blue-400 underline" href={`https://pharosscan.xyz/address/${smartContractAddress}`}>{smartContractAddress.slice(0, 6)}...{smartContractAddress.slice(-6)}</a></p>
        <p>Token ID: {tokenId.toString()}</p>
        { ownerAddress && <p>Owner: <a className="text-blue-400 underline" href={`https://pharosscan.xyz/address/${ownerAddress}`} >{ownerAddress.slice(0, 6)}...{ownerAddress.slice(-6)}</a></p> }
    </div>
}

export { ViewPage };