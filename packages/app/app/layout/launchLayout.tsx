import type React from "react";
import type { State } from "wagmi";
import { useAccount, useReadContract } from "wagmi";
import type { Address } from "viem";
import { useFetcher } from "react-router";

import { CreateNFTContract } from "~/layout/createNFTContract";
import { Button } from "~/components/button";
import { nftLaunchManagerAbi } from "~/abi/nftLaunchManager";
import { walletConfig } from "~/libs/wallet";

interface LaunchLayoutProps {
    initialState: State | undefined;
    nftContracts: Address[];
    managerContractAddress: Address;
}

const LaunchLayout: React.FC<LaunchLayoutProps> = ({ initialState, nftContracts, managerContractAddress }) => {
    const {
        address,
        status: addressStatus,
    } = useAccount({ config: walletConfig });
    const {
        data: userOwnedContracts,
        status: userOwnedContractsStatus,
        error: userOwnedContractError,
        refetch: userOwnedContractRefetch
    } = useReadContract({
        abi: nftLaunchManagerAbi,
        address: managerContractAddress,
        functionName: 'getUserDeployedContracts',
        config: walletConfig,
        args: [address as Address]
    });
    console.log({ userOwnedContracts, userOwnedContractsStatus, userOwnedContractError });
    const fetcher = useFetcher();
    // check if user has NFT collection
    // apparently its hard to get onchain approach on this,
    // so we are going to have offchain approach
    // const [userOwnedContracts, setUserOwnedContracts] = useState(nftContracts);

    const fetcherText = fetcher.data?.message;
    const fetcherGeneratedType = fetcher.data?.generatedType;
    const fetcherGenerated = fetcher.data?.generated;

    if (userOwnedContractsStatus !== 'success' && addressStatus !== 'connecting' && address === undefined) return <div>Loading</div>

    if (userOwnedContracts && userOwnedContracts?.length == 0) return <CreateNFTContract managerContractAddress={managerContractAddress} />;

    return <div className="flex flex-col gap-y-8">
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

export { LaunchLayout };