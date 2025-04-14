import { NavLink } from "react-router";

import { Layout } from "~/layout/layout";

const LandingPage = () => {
    return <Layout>
        <div className="p-4 min-w-40 flex flex-col gap-y-8">
            <p className="text-center text-4xl">Welcome to Sokushuu Launchpad</p>
            <p className="text-lg text-center">We are still in progress</p>
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
    </Layout>
}

export { LandingPage };