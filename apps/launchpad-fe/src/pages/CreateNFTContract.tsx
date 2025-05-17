import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { keccak256, encodePacked } from 'viem'

import type React from 'react'
import type { ChangeEvent } from 'react'
import type { Address, Hex } from 'viem'

import { Button } from '../components'
import {
    walletConfig,
    nftLaunchManagerAbi,
} from '../libs'

interface CreateNFTContractProps {
    isUserOwnNFTContract: boolean;
    managerContractAddress: Address;

    onCancel: () => void;
    getUserOwnedContracts: () => Promise<readonly Address[]>;
}

const CreateNFTContract: React.FC<CreateNFTContractProps> = ({
    isUserOwnNFTContract,
    managerContractAddress,
    onCancel
}) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const account = useAccount();
    const [collectionName, setCollectionName] = useState<string>("");
    const [collectionTicker, setCollectionTicker] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string>();

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

            const hash = await writeContractAsync({
                abi: nftLaunchManagerAbi,
                address: managerContractAddress,
                functionName: 'deployNFT',
                args: [
                    collectionName,
                    collectionTicker,
                    salt,
                ],
            });
            setTxHash(hash);

            setIsLoading(false);
            setCollectionName("");
            setCollectionTicker("");
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
            { txHash && <div className="flex flex-col gap-y-4">
                    <p>Transaction submitted: <a className="underline" href={`https://pharosscan.xyz/tx/${txHash}`}>{txHash?.slice(0, 6)}...{txHash?.slice(-6)}</a></p>
                    <p>Please refresh the page to update get new tx status</p>
                </div>    
            }
        </div>
    </div>
}

export default CreateNFTContract;