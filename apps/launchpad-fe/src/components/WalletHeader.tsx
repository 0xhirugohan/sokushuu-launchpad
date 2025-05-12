import type React from 'react';
import { useEffect } from 'react';
import { NavLink } from 'react-router';
import {
    useAccount,
    useConnect,
    useDisconnect,
    useAccountEffect,
    useSwitchChain,
} from 'wagmi';
import { type Address } from 'viem';

import { walletConfig } from '../libs/wallet';
import WalletIcon from '../assets/wallet.svg';
import FaucetIcon from '../assets/faucet.svg';
import FileblockIcon from '../assets/fileblock.svg';
import SokushuuImage from '../assets/sokushuu.png';

interface WalletLayoutProps {
    setAddressProp: (address: Address | undefined) => void;
}

const WalletLayout: React.FC<WalletLayoutProps> = ({ setAddressProp }) => {
    const { address, status } = useAccount({ config: walletConfig });
    const { connectors, connect } = useConnect({ config: walletConfig });
    const { disconnect } = useDisconnect({ config: walletConfig });
    const { switchChain } = useSwitchChain();
    
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

    return <>
        <div className="absolute top-0 inset-x-0 flex justify-between">
            <NavLink
                to="/"
                className="p-2 flex items-center justify-center"
            >
                <img src={SokushuuImage} className="w-12 h-12 bg-transparent" />
                <span>Sokushuu Launchpad</span>
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
                        onClick={handleLogout}
                        className="p-2 px-4 flex-3 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer relative group-hover:block flex justify-center"
                    >
                        <span>{address.slice(0, 4)}...{address.slice(-4)}</span>
                        <img src={WalletIcon} />
                        {/*
                        <button
                            onClick={handleLogout}
                            className="hidden in-[button:hover]:block absolute top-12 inset-x-0 p-2 border-2 border-zinc-600 rounded-md cursor-pointer"
                        >
                            logout
                        </button>
                        */}
                    </button>}
                {!address && status === 'disconnected' && <button
                        onClick={handleConnect}
                        className="p-2 px-4 flex-3 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer flex justify-center"
                    >
                        <span>Connect</span>
                        <img src={WalletIcon} />
                    </button>
                }
            </div>
        </div>
    </>
}

export default WalletLayout;