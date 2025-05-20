import { localChain, pharosDevnet, pharosTestnet, chainMetadataByChainId } from './chain'
import { walletConfig } from './wallet'

export * from './abi'

export {
    // Config
    walletConfig,

    chainMetadataByChainId,

    // Chain
    localChain,
    pharosDevnet,
    pharosTestnet,
}