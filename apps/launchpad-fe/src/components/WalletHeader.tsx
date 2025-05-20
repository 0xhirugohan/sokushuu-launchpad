import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import {
    useAccount,
    useBalance,
    useChainId,
    useConnect,
    useDisconnect,
    useAccountEffect,
    useSwitchChain,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query'

import type React from 'react'
import type { Address } from 'viem'

import ChainSelector from './ChainSelector'
import WalletProfile from './WalletProfile'

import { walletConfig } from '../libs';
import WalletIcon from '../assets/wallet.svg';
import FaucetIcon from '../assets/faucet.svg';
import FileblockIcon from '../assets/fileblock.svg';
import SokushuuImage from '../assets/sokushuu.png';

interface WalletHeaderProps {
    setAddressProp: (address: Address | undefined) => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ setAddressProp }) => {
    const queryClient = useQueryClient();
    const { address, status } = useAccount({ config: walletConfig });
    const { data: userBalance, queryKey: userBalanceQueryKey } = useBalance({ address, config: walletConfig });
    const chainId = useChainId({ config: walletConfig });
    const { connectors, connect } = useConnect({ config: walletConfig });
    const { disconnect } = useDisconnect({ config: walletConfig });
    const { switchChain } = useSwitchChain();
    const [isPopUpShown, setIsPopUpShown] = useState<boolean>(false);
    const [isChainSelectorPopUpShown, setIsChainSelectorPopUpShown] = useState<boolean>(false);

    useEffect(() => {
        if (status === 'connected') {
            setAddressProp(address);
        } else {
            setAddressProp(undefined);
        }
    }, [address, status])

    useAccountEffect({
        onConnect(data) {
            if (data.chainId !== walletConfig.chains[0].id) {
                switchChain({ chainId: walletConfig.chains[0].id });
            }

            setAddressProp(data.address);
        },
        onDisconnect() {
            setAddressProp(undefined);
        },
    })

    const handleLogout = async () => {
        disconnect();
    }

    const handleConnect = async () => {
       connect({ connector: connectors[0] });
    }

    const togglePopUpOn = () => {
        queryClient.invalidateQueries({ queryKey: userBalanceQueryKey });
        setIsPopUpShown(true);
    }
    const togglePopUpOff = () => setIsPopUpShown(false);
    const toggleChainSelectorPopUpOn = () => {
        togglePopUpOff();
        setIsChainSelectorPopUpShown(true);
    }
    const toggleChainSelectorPopUpOff = () => setIsChainSelectorPopUpShown(false);

    return <>
        <div className="absolute top-0 inset-x-0 flex justify-between">
            <NavLink
                to="/"
                className="p-2 flex items-center justify-center"
            >
                <img src={SokushuuImage} className="w-12 h-12 bg-transparent" />
                <span className="hidden md:block">Sokushuu Launchpad</span>
            </NavLink>
            <div className="p-2 flex gap-x-2">
                <div className="flex-2 flex items-center gap-x-2">
                    <NavLink
                        to="/faucet"
                        className="hover:opacity-80 hover:bg-zinc-200 md:p-2 rounded-md"
                    >
                        <img className="w-5 h-5" src={FaucetIcon} />
                    </NavLink>
                    <NavLink
                        to="/chain"
                        className="hover:opacity-80 hover:bg-zinc-200 md:p-2 rounded-md"
                    >
                        <img className="w-5 h-5" src={FileblockIcon} />
                    </NavLink>
                </div>
                {status === 'connecting' || status === 'reconnecting' && <div className="flex-3 p-2 px-4 border-2 border-zinc-600 rounded-md flex gap-x-2">
                    <span>Loading...</span>
                    <img src={WalletIcon} />
                </div>}
                {address && status === 'connected' && <button
                        onClick={togglePopUpOn}
                        className="p-2 px-4 flex-3 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer relative group-hover:block flex justify-center"
                    >
                        <span>{address.slice(0, 4)}...{address.slice(-4)}</span>
                        <img src={WalletIcon} />
                        
                    </button>}
                {!address && status === 'disconnected' && <button
                        onClick={handleConnect}
                        className="p-2 px-4 flex-3 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer flex justify-center"
                    >
                        <span>Connect</span>
                        <img src={WalletIcon} />
                    </button>
                }
                { isPopUpShown && <div className="absolute inset-0 h-full w-full">
                        <WalletProfile
                            address={address as Address}
                            chainId={chainId}
                            userBalance={{ data: userBalance }}
                            togglePopUpOff={togglePopUpOff}
                            toggleChainSelectorOn={toggleChainSelectorPopUpOn}
                            handleLogout={handleLogout}
                        />
                    </div>
                }
                { isChainSelectorPopUpShown && <div className="absolute inset-0 h-full w-full">
                        <ChainSelector
                            selectedChainId={chainId}
                            onClose={toggleChainSelectorPopUpOff}
                        />
                    </div>
                }
            </div>
        </div>
    </>
}

export default WalletHeader;