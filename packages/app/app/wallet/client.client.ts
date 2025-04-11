import { createWalletClient, custom } from "viem";

import { pharosDevnet } from "~/libs/chain";

const walletClient: ReturnType<typeof createWalletClient> = createWalletClient({
    chain: pharosDevnet,
    transport: custom(window.ethereum!),
})

export { walletClient }