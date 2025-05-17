import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useWriteContract, useReadContracts, useReadContract } from 'wagmi'

import type React from 'react'
import type { Address } from 'viem'

import { Button } from '../components'
import { walletConfig, nftLaunchManagerAbi, nftLauncherAbi } from '../libs'

interface PromptImageLayoutProps {
    userAddress: Address;
    managerContractAddress: Address;
    ownedNftContracts: readonly Address[];

    onAddContract: () => void;
}

interface NFTCollectionContract {
    address: Address;
    name: string;
}

interface GeneratedImageResponse {
    data: string;
    mimeType: string;
}

const PromptImage: React.FC<PromptImageLayoutProps> = ({
    userAddress,
    managerContractAddress,
    ownedNftContracts,

    onAddContract,
}) => {
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const navigate = useNavigate();
    const [nftCollections, setNFTCollections] = useState<NFTCollectionContract[]>();
    const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(false);
    const [selectedNftCollection, setSelectedNftCollection] = useState<Address>();
    const [imagePrompt, setImagePrompt] = useState<string>();

    const [fetcherGeneratedType, setFetcherGeneratedType] = useState<string>();
    const [fetcherGenerated, setFetcherGenerated] = useState<GeneratedImageResponse[]>();
    const [fetcherIsMinted, setFetcherIsMinted] = useState<boolean>(false);
    const [isFetcherLoading, setIsFetcherLoading] = useState<boolean>(false);

    const { refetch } = useReadContracts({
        contracts: ownedNftContracts.map(contract => {
            return {
                address: contract,
                abi: nftLauncherAbi,
                functionName: 'name'
            };
        })
    })
    const { refetch: refetchTokenId } = useReadContract({
        address: managerContractAddress,
        abi: nftLaunchManagerAbi,
        functionName: 'getContractCurrentTokenId',
        args: [
            selectedNftCollection ?? '0x',
        ]
    });

    // get NFT details
    const getNFTContractDetails = async () => {
        if (isFetchingNFTs) return;
        if (nftCollections?.length === ownedNftContracts.length) return;

        setIsFetchingNFTs(true);
        const { data, isFetching } = await refetch();

        if (!isFetching) {
            const scopedNftCollections: NFTCollectionContract[] = data?.map((row, index) => {
                return {
                    address: ownedNftContracts[index] ?? '0x',
                    name: row.result as string ?? '',
                };
            }) ?? [];
            setNFTCollections(scopedNftCollections);
            setSelectedNftCollection(scopedNftCollections[0].address);
            setIsFetchingNFTs(false);
        }
    }

    const handleImageGenerationSubmit = async () => {
        if (!imagePrompt) {
            alert('prompt should not be empty!')
            return
        }

        setIsFetcherLoading(true);
        
        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URI}/llm/generate-image`, {
                method: 'POST',
                body: JSON.stringify({ prompt: imagePrompt }),
            })
            const resultJson = await result.json();

            if (!resultJson.ok) {
                alert(resultJson.message);
                setIsFetcherLoading(false);
                return;
            }

            setFetcherGenerated(resultJson.generated);
            setFetcherGeneratedType(resultJson.generatedType);
            setIsFetcherLoading(false);
        } catch (err) {
            setIsFetcherLoading(false);
        }
    }

    const mintNFT = async () => {
        if (!selectedNftCollection) return;
        if (!fetcherGenerated) return;

        setIsFetcherLoading(true);

        const readTokenId = await refetchTokenId();
        const tokenId: BigInt = readTokenId.data ?? BigInt(0);

        const hash = await writeContractAsync({
            abi: nftLaunchManagerAbi,
            address: managerContractAddress,
            functionName: 'mintContractTo',
            args: [
                selectedNftCollection,
                userAddress,
                tokenId as bigint,
            ],
            gas: BigInt(200000),
        });

        const formData = new FormData();
        formData.append(
            "image",
            fetcherGenerated[0].data,
        );
        formData.append(
            "image_mimetype",
            fetcherGenerated[0].mimeType,
        );
        formData.append(
            "image_data",
            fetcherGenerated[0].data,
        );
        formData.append(
            "nft_contract_address",
            selectedNftCollection,
        );
        formData.append(
            "nft_token_id",
            tokenId.toString(),
        );
        formData.append("hash", hash);

        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URI}/user/upload-image`, {
                method: 'POST',
                body: formData,   
            })
            const resultJson = await result.json();

            setIsFetcherLoading(false);

            if (!resultJson.ok) {
                alert(resultJson.message);
                return;
            }

            navigate(`/view/${selectedNftCollection}/${tokenId}`);
        } catch (err) {
            setIsFetcherLoading(false);
        }
    }

    const onNFTContractSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedNftCollection(e.target.value as Address);
    }

    const onImagePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setImagePrompt(e.target.value)
    }

    useEffect(() => {
        if (ownedNftContracts.length !== nftCollections?.length) {
            getNFTContractDetails();
        }
    }, [ownedNftContracts]);

    if (isFetchingNFTs) return <div>Loading...</div>;

    return <div className="flex flex-col gap-y-8">
        { nftCollections &&
            <div className="flex flex-col gap-y-2">
                <p>Select which NFT Collection: </p>
                <div className="flex gap-x-2">
                    <select
                        onChange={onNFTContractSelectChange}
                        className="flex-1 p-2 border-2 border-zinc-600 rounded-md"
                    >
                        {
                            nftCollections?.map((contract) => {
                                return <option
                                    key={contract.address}
                                    value={contract.address}
                                >
                                    {contract.name}
                                </option>
                            })
                        }
                    </select>
                    <Button onClick={onAddContract}>
                        Add
                    </Button>
                </div>
            </div>
        }
        {
            fetcherGeneratedType === "IMAGE" &&
            !isFetcherLoading && fetcherGenerated && fetcherGenerated.length > 0 && <img
                className="border border-zinc-600 h-[40vh] w-auto"
                src={`data:${fetcherGenerated[0].mimeType};base64,${fetcherGenerated[0].data}`}
            />
        }
        <div
            className="flex flex-col gap-y-4"
        >
            <textarea
                name="text"
                className="p-2 border-2 border-zinc-600 rounded-md"
                rows={6}
                placeholder="Describe what kind of image do you want to put in the NFT"
                disabled={isFetcherLoading}
                onChange={onImagePromptChange}
                value={imagePrompt}
            />
            <Button onClick={handleImageGenerationSubmit} disabled={isFetcherLoading}>
                {isFetcherLoading ? "Generating..." : "Generate"}
            </Button>
            { fetcherGeneratedType === "IMAGE" && !isFetcherLoading && <Button
                type="button"
                disabled={!selectedNftCollection || fetcherIsMinted}
                onClick={mintNFT}
            >
                {fetcherIsMinted ? 'Minted' : 'Mint'}
            </Button> }
        </div>
    </div>
}

export default PromptImage;