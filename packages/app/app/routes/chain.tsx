import type { Route } from "./+types/home"
import { ChainPage } from "~/chain/chain";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Sokushuu Launchpad - Chain" },
        { name: "description", content: "Add Pharos Devnet to your wallet" },
    ];
}

export default function Chain() {
    return <ChainPage />
}