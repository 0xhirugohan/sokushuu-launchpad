import { defineChain } from "viem";

const pharosDevnet = defineChain({
    id: 50002,
    name: 'PharosDevnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://devnet.dplabs-internal.com'],
            webSocket: ['https://grafana.dplabs-internal.com/']
        },
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://pharosscan.xyz/'
        }
    },
});

export { pharosDevnet };