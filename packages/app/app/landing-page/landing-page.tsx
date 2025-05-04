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
            <p className="text-center text-4xl">Welcome to <br /> Sokushuu Launchpad</p>

            <p className="text-center">Craft your own personalized NFT Token today</p>

            <div className="flex flex-col gap-y-4">
                <NavLink
                    to="/launch"
                    className="text-center border-2 border-zinc-600 p-2 rounded-md"
                >
                    Launch Token
                </NavLink>
            </div>
        </div>
    </Layout>
}

export { LandingPage };