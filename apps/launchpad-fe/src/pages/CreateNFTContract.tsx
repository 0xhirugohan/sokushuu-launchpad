import type React from 'react'
import type { Address } from 'viem'

interface CreateNFTContractProps {
    managerContractAddress: Address;
    isUserOwnNFTContract: boolean;
    userOwnedAmount: number;

    onCancel: () => void;
    getUserOwnedContracts: () => Promise<readonly Address[]>;
}

const CreateNFTContract: React.FC<CreateNFTContractProps> = () => {
    return <div>Create NFT Contract</div>
}

export default CreateNFTContract;