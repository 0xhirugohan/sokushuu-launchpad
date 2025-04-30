import type React from "react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import type { Address } from "viem";

import { Button } from "~/components/button";
import { nftLauncherAbi } from "~/abi/nftLauncher";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { walletConfig } from "~/libs/wallet";

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

const PromptImageLayout: React.FC<PromptImageLayoutProps> = ({userAddress, managerContractAddress, ownedNftContracts, onAddContract}) => {
    const fetcher = useFetcher();
    const { writeContractAsync } = useWriteContract({ config: walletConfig });
    const [nftCollections, setNFTCollections] = useState<NFTCollectionContract[]>();
    const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(false);
    const [selectedNftCollection, setSelectedNftCollection] = useState<Address>();
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
        console.log('fetching', { data, isFetching });

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

    const fetcherGeneratedType = fetcher.data?.generatedType;
    const fetcherGenerated = fetcher.data?.generated;
    const fetcherIsMinted: boolean = fetcher.data?.minted ?? false;

    const mintNFT = async () => {
        if (!selectedNftCollection) return;
        if (!fetcher.data?.generated) return;

        // @todo read tokenId from contract
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
        console.log({ hash });

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
        await fetcher.submit(formData, { method: "post" });
    }

    const onNFTContractSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedNftCollection(e.target.value as Address);
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
            fetcher.state === "idle" && <img
                className="border border-zinc-600 h-[40vh] w-auto"
                src={`data:${fetcherGenerated[0].mimeType};base64,${fetcherGenerated[0].data}`}
            />
        }
        <fetcher.Form
            className="flex flex-col gap-y-4"
            method="POST"
        >
            <textarea
                name="text"
                className="p-2 border-2 border-zinc-600 rounded-md"
                rows={6}
                placeholder="Describe what kind of image do you want to put in the NFT"
                disabled={fetcher.state !== "idle"}
            />
            <Button type="submit" disabled={fetcher.state !== "idle"}>
                {fetcher.state !== "idle" ? "Generating..." : "Generate"}
            </Button>
            { fetcherGeneratedType === "IMAGE" && fetcher.state === "idle" && <Button
                type="button"
                disabled={!selectedNftCollection || fetcherIsMinted}
                onClick={mintNFT}
            >
                {fetcherIsMinted ? 'Minted' : 'Mint'}
            </Button> }
        </fetcher.Form>
    </div>
}

export { PromptImageLayout };