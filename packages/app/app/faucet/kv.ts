import type { AppLoadContext } from "react-router";

const getUserLatestFaucetClaim = async (context: AppLoadContext, address: string): Promise<string> => {
    const keyValue = await context.cloudflare.env.SOKUSHUU_LAUNCHPAD_DEV.get(address);
    return keyValue || "";
}

const setUserLatestFaucetClaim = async (context: AppLoadContext, address: string): Promise<boolean> => {
    try {
        await context.cloudflare.env.SOKUSHUU_LAUNCHPAD_DEV.put(address, new Date().toISOString());
        return true;
    } catch (err) {
        return false;
    }
}

export {
    getUserLatestFaucetClaim,
    setUserLatestFaucetClaim,
}