import type { AppLoadContext } from "react-router"
import { getUserLatestFaucetClaim } from "~/faucet/kv"

const isUserEligibleToClaimFaucet = async (context: AppLoadContext, address: string) => {
    const latestClaim = await getUserLatestFaucetClaim(context, address);
    if (latestClaim === "") return true;

    const minDateToClaim = new Date(latestClaim);
    minDateToClaim.setDate(minDateToClaim.getDate() + 1);
    return new Date() >= minDateToClaim;
}

export { isUserEligibleToClaimFaucet }