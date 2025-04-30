import type { Route } from "./+types/api";

export async function loader({ params }: Route.LoaderArgs) {
    const contractAddress = params.smartContractAddress;
    const tokenId = params.tokenId;
    return {
        image: `https://launchpad-dev-r2.sokushuu.de/images/${contractAddress}/${tokenId}.png`,
    };
}