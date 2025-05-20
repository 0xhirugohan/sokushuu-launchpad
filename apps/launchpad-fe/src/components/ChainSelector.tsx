import { useSwitchChain } from 'wagmi'

import type React from 'react'

import { chainMetadataByChainId } from '../libs';
import CircleXIcon from '../assets/circle-x.svg';

interface ChainSelectorProps {
    selectedChainId: number;

    onClose: () => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChainId, onClose }) => {
    const { chains, switchChainAsync } = useSwitchChain()
    const onChainSelected = async (chainId: number) => {
        await switchChainAsync({ chainId });
    }
    return (
        <>
            <button onClick={onClose} className="h-full w-full"></button>
            <div className="absolute top-4 right-4 bg-zinc-100 border-2 border-zinc-600 rounded-md p-4 w-[80vw] md:w-[20em]">
                <div className="flex mb-6 w-full border-b-2 border-zinc-600">
                    <p className="w-full text-center text-lg font-semibold">Change Chain</p>
                    <button
                        className="absolute top-4 right-4 cursor-pointer"
                        onClick={onClose}
                    >
                        <img
                            src={CircleXIcon}
                            alt="close icon"
                            className="w-6 h-6"
                        />
                    </button>
                </div>
                <div className="flex flex-col gap-y-2">
                    { chains.map(chain =>
                        <div className="flex justify-between gap-x-4">
                            <button
                                onClick={() => onChainSelected(chain.id)}
                                className="flex-1 flex gap-x-2 cursor-pointer border-2 border-transparent hover:border-zinc-600 rounded-md p-1"
                            >
                                <img
                                    className="w-6 h-6"
                                    src={chainMetadataByChainId[chain.id].icon}
                                    alt="chain icon"
                                />
                                <p className="">{chain.name}</p>
                            </button>
                            { selectedChainId === chain.id && <p className="my-auto">selected</p> }
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ChainSelector;