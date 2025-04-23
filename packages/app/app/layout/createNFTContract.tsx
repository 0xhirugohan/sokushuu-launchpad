import type React from "react";

import { Button } from "~/components/button";

interface CreateNFTContractProps {}

export const CreateNFTContract: React.FC<CreateNFTContractProps> = () => {
    return <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
            <p className="text-xl">You don't have any NFT Collection yet.</p>
            <p className="text-xl">Add new?</p>
        </div>
        <Button>
            Deploy NFT Collection
        </Button>
    </div>
}