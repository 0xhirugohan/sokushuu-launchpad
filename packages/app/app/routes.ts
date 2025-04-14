import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("faucet", "routes/faucet.tsx"),
    route("chain", "routes/chain.tsx")
] satisfies RouteConfig;
