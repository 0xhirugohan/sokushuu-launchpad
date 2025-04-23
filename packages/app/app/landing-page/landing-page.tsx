import type React from "react";
import { NavLink } from "react-router";
import type { State } from "wagmi";

import { Layout } from "~/layout/layout";

interface LandingPageProps {
    initialState: State | undefined;
}

const LandingPage: React.FC<LandingPageProps> = ({ initialState }) => {
    return <Layout initialState={initialState}>
        <div className="p-4 min-w-40 flex flex-col gap-y-8">
            <p className="text-center text-4xl">Welcome to Sokushuu Launchpad</p>
            <p className="text-lg text-center">We are still in progress</p>

            <div className="flex flex-col gap-y-4">
                <NavLink
                    to="/launch"
                    className="text-center border-2 border-zinc-600 p-2 rounded-md"
                >
                    Launch Token
                </NavLink>
                <NavLink
                    to="/faucet"
                    className="text-center border-2 border-zinc-600 p-2 rounded-md"
                >
                    Get a faucet
                </NavLink>
                <NavLink
                    to="/chain"
                    className="text-center border-2 border-zinc-600 p-2 rounded-md"
                >
                    Add Chain
                </NavLink>
            </div>
        </div>
    </Layout>
}

export { LandingPage };