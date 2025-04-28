import type React from "react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useReadContracts } from "wagmi";
import type { Address } from "viem";

import { Button } from "~/components/button";
import { nftLauncherAbi } from "~/abi/nftLauncher";

interface PromptImageLayoutProps {
    ownedNftContracts: readonly Address[];

    onAddContract: () => void;
}

interface NFTCollectionContract {
    address: Address;
    name: string;
}

const PromptImageLayout: React.FC<PromptImageLayoutProps> = ({ownedNftContracts, onAddContract}) => {
    const fetcher = useFetcher();
    const [nftCollections, setNFTCollections] = useState<NFTCollectionContract[]>();
    const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(false);
    const { refetch } = useReadContracts({
        contracts: ownedNftContracts.map(contract => {
            return {
                address: contract,
                abi: nftLauncherAbi,
                functionName: 'name'
            };
        })
    })

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
                    address: ownedNftContracts[index],
                    name: row.result ?? '',
                };
            }) ?? [];
            setNFTCollections(scopedNftCollections);
            setIsFetchingNFTs(false);
        }
    }

    useEffect(() => {
        if (ownedNftContracts.length !== nftCollections?.length) {
            getNFTContractDetails();
        }
    }, [ownedNftContracts]);

    const fetcherGeneratedType = fetcher.data?.generatedType;
    const fetcherGenerated = fetcher.data?.generated;

    if (isFetchingNFTs) return <div>Loading...</div>;

    return <div className="flex flex-col gap-y-8">
        { nftCollections &&
            <div className="flex flex-col gap-y-2">
                <p>Select which NFT Collection: </p>
                <div className="flex gap-x-2">
                    <select className="flex-1 p-2 border-2 border-zinc-600 rounded-md">
                        {
                            nftCollections?.map((contract) => {
                                return <option value={contract.address}>
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
            <Button disabled={fetcher.state !== "idle"}>
                {fetcher.state !== "idle" ? "Generating" : "Generate"}
            </Button>
        </fetcher.Form>
    </div>
}

export { PromptImageLayout };