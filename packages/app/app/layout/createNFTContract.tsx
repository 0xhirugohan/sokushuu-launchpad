import type React from "react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address, Hex } from "viem";
import { keccak256, encodePacked } from "viem";

import { Button } from "~/components/button";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { walletConfig } from "~/libs/wallet";

interface CreateNFTContractProps {
    managerContractAddress: Address;
    isUserOwnNFTContract: boolean;
    userOwnedAmount: number;

    onCancel: () => void;
    getUserOwnedContracts: () => Promise<readonly Address[]>;
}

export const CreateNFTContract: React.FC<CreateNFTContractProps> = ({
    managerContractAddress,
    isUserOwnNFTContract,
    userOwnedAmount,

    onCancel,
    getUserOwnedContracts,
}) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const account = useAccount();
    const [collectionName, setCollectionName] = useState<string>("");
    const [collectionTicker, setCollectionTicker] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDeployContract = async () => {
        if (!account.address) {
            return;
        }

        setIsLoading(true);
        try {
            const packed = encodePacked(
                ['address', 'string', 'string'],
                [account.address, collectionName, collectionTicker]
            );
            const salt: Hex = keccak256(packed);

            await writeContractAsync({
                abi: nftLaunchManagerAbi,
                address: managerContractAddress,
                functionName: 'deployNFT',
                args: [
                    collectionName,
                    collectionTicker,
                    salt,
                ],
            });

            setIsLoading(false);
            setCollectionName("");
            setCollectionTicker("");
            onCancel();
        } catch (err) {
            setIsLoading(false);
            console.log({ err });
        }
    }

    const onNameChange = (event: ChangeEvent<HTMLInputElement>) => setCollectionName(event.currentTarget.value);
    const onTickerChange = (event: ChangeEvent<HTMLInputElement>) => setCollectionTicker(event.currentTarget.value.toUpperCase());

    const isDeployDisabled = collectionName === "" || collectionTicker === "" || isLoading || !account.address;

    return <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
            { !isUserOwnNFTContract && <p className="text-xl">You don't have any NFT Collection yet.</p> }
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
                disabled={isDeployDisabled}
            >
                { isLoading ? 'Deploying...' :  'Deploy NFT Collection' }
            </Button>
            { isUserOwnNFTContract && <Button onClick={onCancel}>Cancel</Button> }
        </div>
    </div>
}