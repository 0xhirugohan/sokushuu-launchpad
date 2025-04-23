import type React from "react";
import type { State } from "wagmi";
import type { Address } from "viem";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Layout } from "~/layout/layout";
import { CreateNFTContract } from "~/layout/createNFTContract";
import { Button } from "~/components/button";

interface LandingPageProps {
    initialState: State | undefined;
    nftContracts: Address[];
}

const LaunchPage: React.FC<LandingPageProps> = ({ initialState, nftContracts }) => {
    const fetcher = useFetcher();
    // check if user has NFT collection
    // apparently its hard to get onchain approach on this,
    // so we are going to have offchain approach
    const [userOwnedContracts, setUserOwnedContracts] = useState(nftContracts);

    const fetcherText = fetcher.data?.message;
    const fetcherGeneratedType = fetcher.data?.generatedType;
    const fetcherGenerated = fetcher.data?.generated;

    return <Layout initialState={initialState}>
        {
            userOwnedContracts.length != 0 ? <CreateNFTContract /> : <div className="flex flex-col gap-y-8">
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
    </Layout>
}

export { LaunchPage };