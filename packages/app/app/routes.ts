import { type RouteConfig, route, layout, index, prefix } from "@react-router/dev/routes";

export default [
    layout("./layout/layout.tsx", [
        index("routes/home.tsx"),
        route("faucet", "routes/faucet.tsx"),
        route("chain", "routes/chain.tsx"),
        route("launch", "routes/launch.tsx"),
        route("view/:smartContractAddress/:tokenId", "routes/view.tsx"),
    ]),
    ...prefix("api", [
        route("nft/:smartContractAddress/:tokenId", "routes/api.tsx"),
        route("rpc", "routes/api/rpc.tsx")
    ]),
] satisfies RouteConfig;
