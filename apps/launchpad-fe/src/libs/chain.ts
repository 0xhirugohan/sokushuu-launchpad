import { defineChain } from 'viem'

import type { Chain } from 'viem'

import PharosChainIcon from '../assets/chain-paros.svg'

const pharosDevnetRpcURI: string = import.meta.env.VITE_PHAROS_DEVNET_RPC_URI;
const pharosTestnetRpcURI: string = import.meta.env.VITE_PHAROS_TESTNET_RPC_URI;

const pharosDevnet = {
    id: 50002,
    name: 'Pharos Devnet',
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

const pharosTestnet = {
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
                pharosTestnetRpcURI,
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

interface ChainMetadata {
    id: number;
    name: string;
    icon: string;
}

const chainMetadataByChainId: Record<number, ChainMetadata> = {
    [50002]: {
        id: 50002,
        name: 'Pharos Devnet',
        icon: PharosChainIcon
    },
    [688688]: {
        id: 688688,
        name: 'Pharos Testnet',
        icon: PharosChainIcon
    }
}

export {
    pharosDevnet,
    pharosTestnet,
    localChain,
    chainMetadataByChainId,
};