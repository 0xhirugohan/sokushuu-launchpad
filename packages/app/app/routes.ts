import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
    layout("./layout/layout.tsx", [
        index("routes/home.tsx"),
        route("faucet", "routes/faucet.tsx"),
        route("chain", "routes/chain.tsx"),
        route("launch", "routes/launch.tsx")
    ])
] satisfies RouteConfig;
