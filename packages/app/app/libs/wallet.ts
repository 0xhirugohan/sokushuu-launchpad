import {
    createConfig,
    http,
    cookieStorage,
    createStorage,
} from 'wagmi';
import type { Config } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { pharosDevnet, localChain } from './chain';

const config: Config = createConfig({
    chains: [pharosDevnet],
    // chains: [localChain],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    connectors: [injected()],
    transports: {
        [pharosDevnet.id]: http(pharosDevnet.rpcUrls.default.http[0])
        // [localChain.id]: http(localChain.rpcUrls.default.http[0])
    },
})


export { config as walletConfig }