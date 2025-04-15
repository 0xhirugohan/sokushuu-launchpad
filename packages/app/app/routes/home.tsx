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
  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    appVersion: context.cloudflare.env.APP_VERSION,
    initialState,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <LandingPage initialState={loaderData.initialState as State | undefined} />
}
