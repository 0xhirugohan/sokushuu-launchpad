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

const monadTestnet = defineChain({
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MON',
        symbol: 'MON',
    },
    rpcUrls: {
        default: {
            http: [
                'https://testnet-rpc.monad.xyz',
            ],
        },
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://testnet.monadexplorer.com/'
        }
    },
});

const eduTestnet = defineChain({
    id: 656476,
    name: 'EDU Chain Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'EDU',
        symbol: 'EDU',
    },
    rpcUrls: {
        default: {
            http: [
                'https://rpc.open-campus-codex.gelato.digital',
            ],
            webSocket: [
                'wss://ws.open-campus-codex.gelato.digital'
            ]
        },
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://edu-chain-testnet.blockscout.com/'
        }
    },
});

export {
    pharosDevnet as pharosDevnetChain,
    pharosTestnet as pharosTestnetChain,
    monadTestnet as monadTestnetChain,
    eduTestnet as eduTestnetChain,
}