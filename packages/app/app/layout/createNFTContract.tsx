import type React from "react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import type { Address } from "viem";

import { Button } from "~/components/button";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { walletConfig } from "~/libs/wallet";

interface CreateNFTContractProps {
    managerContractAddress: Address;
}

export const CreateNFTContract: React.FC<CreateNFTContractProps> = ({ managerContractAddress }) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const [collectionName, setCollectionName] = useState<string>("");
    const [collectionTicker, setCollectionTicker] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDeployContract = async () => {
        // @todo check it again once the gas is efficient to try
        setIsLoading(true);
        const hash = await writeContractAsync({
            abi: nftLaunchManagerAbi,
            address: managerContractAddress,
            functionName: 'deployNFT',
            args: [
                collectionName,
                collectionTicker,
            ],
        });
        console.log({ hash });
        setIsLoading(false);
    }

    const onNameChange = (event: ChangeEvent<HTMLInputElement>) => setCollectionName(event.currentTarget.value);
    const onTickerChange = (event: ChangeEvent<HTMLInputElement>) => setCollectionTicker(event.currentTarget.value.toUpperCase());

    return <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
            <p className="text-xl">You don't have any NFT Collection yet.</p>
            <p className="text-xl">Add new?</p>
        </div>
        <div className="flex flex-col gap-y-4">
            <label htmlFor="name">Your NFT Collection Name (32 characters):</label>
            <input
                name="name"
                onChange={onNameChange}
                type="text"
                className="border-2 border-zinc-600 rounded-md p-2"
                placeholder="Vitalik's Favorites"
                maxLength={32}
                value={collectionName}
            />
            <label htmlFor="ticker">Your NFT Ticker (4 characters):</label>
            <input
                name="ticker"
                onChange={onTickerChange}
                type="text"
                className="border-2 border-zinc-600 rounded-md p-2"
                placeholder="VTLK"
                maxLength={4}
                value={collectionTicker}
            />
            <Button
                onClick={handleDeployContract}
                disabled={collectionName === "" || collectionTicker === "" || isLoading}
            >
                { isLoading ? 'Deploying...' :  'Deploy NFT Collection' }
            </Button>
        </div>
    </div>
}