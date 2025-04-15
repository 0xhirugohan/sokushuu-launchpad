import type React from "react";
import { NavLink } from "react-router";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useAccountEffect,
    useSwitchChain,
} from "wagmi";

import WalletIcon from "../icons/wallet.svg";
import { walletConfig } from "~/libs/wallet";

const WalletLayout: React.FC = () => {
    const { address } = useAccount({ config: walletConfig });
    const { connectors, connect } = useConnect({ config: walletConfig });
    const { disconnect } = useDisconnect({ config: walletConfig });
    const { switchChain } = useSwitchChain();

    useAccountEffect({
        onConnect(data) {
            if (data.chainId !== walletConfig.chains[0].id) {
                switchChain({ chainId: walletConfig.chains[0].id });
            }
        }
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
                Sokushuu Launchpad
            </NavLink>
            <div className="p-2 flex gap-x-2">
                {address ? <button
                        onClick={handleLogout}
                        className="p-2 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer relative group-hover:block"
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
                    </button> : <button
                        onClick={handleConnect}
                        className="p-2 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer"
                    >
                        <span>Connect Wallet</span>
                        <img src={WalletIcon} />
                    </button>
                }
            </div>
        </div>
    </>
}

export { WalletLayout };