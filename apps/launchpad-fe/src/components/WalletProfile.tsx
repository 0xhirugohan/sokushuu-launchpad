import { formatUnits } from 'viem'

import type React from 'react'
import type { UseBalanceReturnType } from 'wagmi'
import type { Address } from 'viem'

import { chainMetadataByChainId } from '../libs';
import CircleXIcon from '../assets/circle-x.svg';

interface WalletProfileProps {
    address: Address;
    chainId: number;
    userBalance: Pick<UseBalanceReturnType, 'data'>;

    togglePopUpOff: () => void;
    toggleChainSelectorOn: () => void;
    handleLogout: () => void;
}

const WalletProfile: React.FC<WalletProfileProps> = ({
    address,
    chainId,
    userBalance,

    togglePopUpOff,
    toggleChainSelectorOn,
    handleLogout,
}) => {
    return (
        <>
            <button onClick={togglePopUpOff} className="h-full w-full"></button>
            <div className="absolute top-4 right-4 bg-zinc-100 border-2 border-zinc-600 rounded-md p-4 w-[80vw] md:w-[20em]">
                <div className="flex mb-6 w-full border-b-2 border-zinc-600">
                    <p className="w-full text-center text-lg font-semibold">Menu</p>
                    <button
                        onClick={togglePopUpOff}
                        className="absolute top-4 right-4 cursor-pointer"
                    >
                        <img
                            src={CircleXIcon}
                            alt="close icon"
                            className="w-6 h-6"
                        />
                    </button>
                </div>
                <div className="flex flex-col gap-y-2">
                    <div className="flex justify-between gap-x-4">
                        <p>Address:</p>
                        <p className="wrap-anywhere text-right">{address}</p>
                    </div>
                    { userBalance.data && <div className="flex justify-between">
                            <p>Balance:</p>
                            <p>{formatUnits(userBalance.data?.value as bigint, userBalance.data?.decimals as number)} {userBalance.data?.symbol}</p>
                        </div>
                    }
                    <div className="flex justify-between">
                        <p>Chain:</p>
                        <div className="flex gap-x-2">
                            <img
                                className="w-6 h-6"
                                src={chainMetadataByChainId[chainId].icon}
                                alt="chain icon"
                            />
                            <p>{chainMetadataByChainId[chainId].name}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChainSelectorOn}
                        className="p-2 w-full border-2 border-zinc-600 rounded-md cursor-pointer"
                    >
                        Change Chain
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 w-full border-2 border-zinc-600 rounded-md cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}

export default WalletProfile;