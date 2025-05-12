import { type State } from "wagmi";

import type { Route } from "./+types/home";
import { LandingPage } from "~/landing-page/landing-page";
import { getWalletStateFromCookie } from "~/libs/cookie";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sokushuu Launchpad" },
    { name: "description", content: "Welcome to Sokushuu Launchpad!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const initialState = await getWalletStateFromCookie({ request });
  const xellarAppId = context.cloudflare.env.XELLAR_APP_ID;
  const walletConnectProjectId = context.cloudflare.env.WALLETCONNECT_PROJECT_ID;
  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    appVersion: context.cloudflare.env.APP_VERSION,
    initialState,
    xellarAppId,
    walletConnectProjectId,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <LandingPage initialState={loaderData.initialState as State | undefined} xellarAppId={loaderData.xellarAppId} walletconnectProjectId={loaderData.walletConnectProjectId} />
}
