import type React from "react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import WalletIcon from "../icons/wallet.svg";
import { walletClient } from "~/wallet/client.client";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [addressesState, setAddressesState] = useState<string[] | null>(null);

    useEffect(() => {
        const getAddress = async () => {
            const addresses = await walletClient.getAddresses();
            setAddressesState(addresses);
        }
        getAddress();
    }, []);

    const handleLogout = () => {
        setAddressesState(null);
    }

    const handleConnect = async () => {
        const addresses = await walletClient.requestAddresses();
        setAddressesState(addresses);
    }

    return <div className="relative min-w-40 w-full">
        <div className="absolute top-0 inset-x-0 flex justify-between">
            <NavLink
                to="/"
                className="p-2 flex items-center justify-center"
            >
                Sokushuu Launchpad
            </NavLink>
            <div className="p-2 flex gap-x-2">
                {addressesState && addressesState.length > 0 ? <button
                        className="p-2 border-2 border-zinc-600 rounded-md flex gap-x-2 cursor-pointer relative group-hover:block"
                    >
                        <span>{addressesState[0].slice(0, 4)}...{addressesState[0].slice(-4)}</span>
                        <img src={WalletIcon} />
                        <button
                            onClick={handleLogout}
                            className="hidden in-[button:hover]:block absolute top-12 inset-x-0 p-2 border-2 border-zinc-600 rounded-md cursor-pointer"
                        >
                            logout
                        </button>
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
        <div className="flex items-center justify-center min-h-screen">
            {children}
        </div>
    </div>
}

export { Layout };