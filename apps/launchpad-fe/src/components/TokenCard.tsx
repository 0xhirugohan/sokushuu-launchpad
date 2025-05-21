import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { toHex } from 'viem'

import type React from 'react'
import type { Address } from 'viem'

interface TokenURI {
    tokenId: bigint;
    tokenURI: string;
}

interface TokenCardProps {
    token: TokenURI;
    smartContractAddress: Address;
    baseURI: string;
    tokenChainId: number;
}

const TokenCard: React.FC<TokenCardProps> = ({
    token,
    smartContractAddress,
    baseURI,
    tokenChainId,
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
            to={`/view/${smartContractAddress}/${token.tokenId}/${toHex(tokenChainId)}`}
            className="p-2 border-2 border-zinc-600 rounded-md flex flex-col gap-y-2 h-fit">
            <img src={imageURI} />
        </NavLink>
    );
}

export default TokenCard;