import { defineChain } from 'viem'

import type { Chain } from 'viem'

const pharosDevnetRpcURI: string = import.meta.env.VITE_PHAROS_DEVNET_RPC_URI;

const pharosDevnet = {
    id: 50002,
    name: 'PharosDevnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Pharos Test Token',
        symbol: 'PTT',
    },
    rpcUrls: {
        default: {
            http: [
                // 'https://devnet.dplabs-internal.com',
                // 'http://localhost:5173/api/rpc',
                // 'https://launchpad-dev.sokushuu.de/api/rpc',
                // 'https://launchpad.sokushuu.de/api/rpc',
                pharosDevnetRpcURI,
                'https://devnet.dplabs-internal.com',
            ],
            webSocket: ['wss://devnet.dplabs-internal.com']
        },
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://devnet.pharosscan.xyz/'
        }
    },
} as const satisfies Chain;

const localChain = defineChain({
    id: 31337,
    name: 'LocalChain',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
    },
});

export { pharosDevnet, localChain };