import type React from "react";
import type { State } from "wagmi";
import type { Address } from "viem";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { Layout } from "~/layout";

interface TokenURI {
    tokenId: bigint;
    tokenURI: string;
}

interface CollectionPageProps {
    initialState: State | undefined;
    tokenURIs: TokenURI[];
    smartContractAddress: Address;
    baseURI: string;
}

const CollectionPage: React.FC<CollectionPageProps> = ({
    initialState,
    tokenURIs,
    smartContractAddress,
    baseURI,
}) => {
    return (
        <Layout initialState={initialState}>
            <div className="flex flex-col gap-y-4 min-h-screen w-full pt-16 px-4">
                <p>Contract: {smartContractAddress.slice(0, 4)}...{smartContractAddress.slice(-4)}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
                    {tokenURIs.map(token => <TokenCard token={token} smartContractAddress={smartContractAddress} baseURI={baseURI} />)}
                </div>
            </div>
        </Layout>
    );
}

interface TokenCardProps {
    token: TokenURI;
    smartContractAddress: Address;
    baseURI: string;
}

const TokenCard: React.FC<TokenCardProps> = ({
    token,
    smartContractAddress,
    baseURI,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageURI, setImageURI] = useState<string>();

    const getMetadata = async () => {
        setIsLoading(true);
        try {
            let url = new URL(token.tokenURI as string);
            if (baseURI !== 'https://launchpad.sokushuu.de') {
                url = new URL((token.tokenURI as string).replace('https://launchpad.sokushuu.de', baseURI));
            }

            const result = await fetch(url);
            const json: { image: string } = await result.json();
            const imageURIData = json?.image;
            setImageURI(imageURIData);
            setIsLoading(false);
        } catch (err) {
            console.log({ err });
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (imageURI === undefined && !isLoading) {
            getMetadata();
        }
    }, [token.tokenURI, imageURI, isLoading]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <NavLink
            to={`/view/${smartContractAddress}/${token.tokenId}`}
            className="p-2 border-2 border-zinc-600 rounded-md flex flex-col gap-y-2 h-fit">
            <img src={imageURI} />
        </NavLink>
    );
}

export { CollectionPage, TokenCard };