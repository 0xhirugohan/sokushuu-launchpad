import { defineChain } from 'viem'

const pharosDevnet = defineChain({
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
});

const pharosTestnet = defineChain({
    id: 688688,
    name: 'Pharos Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Pharos Test Token',
        symbol: 'PTT',
    },
    rpcUrls: {
        default: {
            http: [
                'https://testnet.dplabs-internal.com',
            ],
            webSocket: ['wss://testnet.dplabs-internal.com']
        },
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://testnet.pharosscan.xyz/'
        }
    },
});

export {
    pharosDevnet as pharosDevnetChain,
    pharosTestnet as pharosTestnetChain,
}