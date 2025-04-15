import { cookieToInitialState, type State } from "wagmi";

import type { Route } from "../+types/root"
import { walletConfig } from "./wallet";

const getWalletStateFromCookie = async ({ request }: Pick<Route.LoaderArgs, 'request'> ): Promise<State | undefined> => {
    const cookie = await request.headers.get('cookie');
    const initialState: State | undefined = cookieToInitialState(
        walletConfig,
        cookie,
    );
    return initialState;
}

export { getWalletStateFromCookie }