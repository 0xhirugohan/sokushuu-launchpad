import { NavLink } from "react-router";

const LandingPage = () => {
    return <div className="min-w-40 bg-zinc-100 w-full min-h-screen flex items-center justify-center">
        <div className="p-4 min-w-40 flex flex-col gap-y-8">
            <p className="text-center text-4xl">Welcome to Sokushuu Launchpad</p>
            <p className="text-lg text-center">We are still in progress</p>
            <NavLink
                to="/faucet"
                className="text-center border-2 border-zinc-600 p-2 rounded-md"
            >
                Get a faucet
            </NavLink>
        </div>
    </div>
}

export { LandingPage };